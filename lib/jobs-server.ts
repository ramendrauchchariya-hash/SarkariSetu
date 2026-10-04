/**
 * Server-side jobs listing.
 *
 * Public job data is read from Supabase. Filtering, sorting and pagination
 * happen after the relevant recruitment/post/vacancy data has been loaded so
 * every filter (including computed status, state and salary) produces correct
 * totals and page boundaries.
 */
import { supabaseAdmin } from './supabase-server';
import { computeRecruitmentStatus } from './recruitment-status';
import type { RecruitmentWithOrg } from './database-types';
import type { JobPosting, JobStatus } from './types';
import type { SortOption } from './job-filters';
import { recruitmentWithVacanciesToJobPosting } from './data-mappers';
import { salaryRanges } from './job-filters';

const RECRUITMENT_SELECT = `
  *,
  organization:organizations(id, name, slug, short_name, official_website_url),
  categories:recruitment_categories(category:categories(id, name, slug)),
  posts:posts(
    *,
    vacancies:vacancies(
      *,
      state:states(id, name, slug)
    )
  )
`;

type DbPost = {
  id: string;
  title: string;
  qualification: string | null;
  discipline: string | null;
  salary_min: number | null;
  salary_max: number | null;
  vacancies?: Array<{
    id: string;
    vacancy_count: number;
    state_id: string | null;
    state?: { id: string; name: string; slug: string } | null;
  }>;
};

type DbRecruitment = Record<string, unknown> & {
  organization?: { id: string; name: string; slug: string; short_name: string | null; official_website_url: string | null } | null;
  categories?: Array<{ category: { id: string; name: string; slug: string } | null }>;
  posts?: DbPost[];
};

function toRecruitmentWithOrg(r: DbRecruitment): RecruitmentWithOrg {
  const cats = (r.categories ?? []) as Array<{
    category: { id: string; name: string; slug: string } | null;
  }>;

  return {
    ...(r as unknown as RecruitmentWithOrg),
    organization: (r.organization ?? null) as RecruitmentWithOrg['organization'],
    categories: cats.map((x) => x.category).filter(Boolean) as RecruitmentWithOrg['categories'],
  };
}

function slugifyDepartment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function departmentMatches(value: string | null, selected: string[]): boolean {
  if (!value) return false;
  const actual = slugifyDepartment(value);
  return selected.some((candidate) => {
    if (candidate === actual) return true;
    if (candidate === 'banking' && actual.startsWith('banking-')) return true;
    if (candidate === 'psu' && actual.startsWith('psu-')) return true;
    return false;
  });
}

function escapeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function getAggregate(r: DbRecruitment) {
  const posts = r.posts ?? [];
  const vacancies = posts.flatMap((p) => p.vacancies ?? []);
  const totalVacancies = vacancies.reduce((sum, v) => sum + (v.vacancy_count || 0), 0);

  const salaries = posts
    .flatMap((p) => [p.salary_min, p.salary_max])
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

  const salaryMin = posts
    .map((p) => p.salary_min)
    .filter((v): v is number => typeof v === 'number')
    .reduce((min, v) => Math.min(min, v), salaries.length ? Math.min(...salaries) : 0);

  const salaryMax = posts
    .map((p) => p.salary_max)
    .filter((v): v is number => typeof v === 'number')
    .reduce((max, v) => Math.max(max, v), salaries.length ? Math.max(...salaries) : 0);

  const stateSlugs = new Set<string>();
  const stateNames = new Set<string>();
  vacancies.forEach((v) => {
    if (v.state?.slug) stateSlugs.add(v.state.slug);
    if (v.state?.name) stateNames.add(v.state.name);
  });

  if (r.location_type === 'all-india' || stateSlugs.size === 0) {
    stateSlugs.add('all-india');
    stateNames.add('All India');
  }

  return {
    posts,
    totalVacancies,
    salaryMin,
    salaryMax,
    stateSlugs,
    stateNames,
  };
}

export interface JobsQueryOptions {
  page: number;
  pageSize: number;
  search?: string;
  departments?: string[];
  statuses?: string[];
  jobTypes?: string[];
  qualifications?: string[];
  states?: string[];
  salaryRanges?: string[];
  sort: SortOption;
}

export async function serverGetJobsListing(
  options: JobsQueryOptions
): Promise<{ jobs: JobPosting[]; total: number; totalPages: number }> {
  const {
    page,
    pageSize,
    search,
    departments = [],
    statuses = [],
    jobTypes = [],
    qualifications = [],
    states = [],
    salaryRanges: selectedSalaryRanges = [],
    sort,
  } = options;

  const { data, error } = await supabaseAdmin
    .from('recruitments')
    .select(RECRUITMENT_SELECT)
    .eq('is_published', true)
    .eq('is_archived', false);

  if (error || !data) {
    console.error('Failed to load published jobs:', error);
    return { jobs: [], total: 0, totalPages: 0 };
  }

  const q = escapeSearch(search ?? '');
  const salaryConfigs = salaryRanges.filter((r) => selectedSalaryRanges.includes(r.value));

  let rows = (data as unknown as DbRecruitment[]).map((raw) => {
    const recruitment = toRecruitmentWithOrg(raw);
    const aggregate = getAggregate(raw);
    const job = recruitmentWithVacanciesToJobPosting(
      recruitment,
      aggregate.totalVacancies,
      aggregate.salaryMin,
      aggregate.salaryMax
    );

    const firstState = aggregate.stateSlugs.values().next().value as string | undefined;
    const firstStateName = aggregate.stateNames.values().next().value as string | undefined;

    return {
      recruitment,
      job: {
        ...job,
        state: firstState ?? job.state,
        location: firstStateName ?? job.location,
      },
      aggregate,
    };
  });

  rows = rows.filter(({ recruitment, job, aggregate }) => {
    const categoryText = recruitment.categories.map((c) => `${c.name} ${c.slug}`).join(' ');
    const postText = aggregate.posts
      .map((p) => `${p.title} ${p.qualification ?? ''} ${p.discipline ?? ''}`)
      .join(' ');

    if (q) {
      const haystack = [
        recruitment.title,
        recruitment.description ?? '',
        recruitment.department ?? '',
        recruitment.organization?.name ?? '',
        categoryText,
        postText,
      ].join(' ').toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    if (departments.length && !departmentMatches(recruitment.department, departments)) return false;
    if (jobTypes.length && !jobTypes.includes(recruitment.job_type ?? '')) return false;

    if (qualifications.length) {
      const qualificationValues = new Set<string>();
      recruitment.categories.forEach((c) => qualificationValues.add(c.slug));
      aggregate.posts.forEach((p) => {
        if (p.qualification) qualificationValues.add(p.qualification);
      });
      if (!qualifications.some((value) => qualificationValues.has(value))) return false;
    }

    if (states.length && !states.some((state) => aggregate.stateSlugs.has(state))) return false;

    if (salaryConfigs.length) {
      const matches = salaryConfigs.some((range) => {
        const max = Number.isFinite(range.max) ? range.max : Number.MAX_SAFE_INTEGER;
        return aggregate.salaryMax >= range.min && aggregate.salaryMin <= max;
      });
      if (!matches) return false;
    }

    if (statuses.length) {
      const status = computeRecruitmentStatus(recruitment) as JobStatus;
      if (!statuses.includes(status)) return false;
    }

    return true;
  });

  rows.sort((a, b) => {
    switch (sort) {
      case 'deadline-soonest':
        return (a.job.applicationEnd || '9999-12-31').localeCompare(b.job.applicationEnd || '9999-12-31');
      case 'deadline-latest':
        return (b.job.applicationEnd || '').localeCompare(a.job.applicationEnd || '');
      case 'most-vacancies':
        return b.aggregate.totalVacancies - a.aggregate.totalVacancies;
      case 'org-az':
        return a.job.organization.localeCompare(b.job.organization);
      case 'title-az':
        return a.job.title.localeCompare(b.job.title);
      case 'latest':
      default:
        return String(b.job.postedDate).localeCompare(String(a.job.postedDate));
    }
  });

  const total = rows.length;
  const totalPages = Math.ceil(total / pageSize);
  const safePage = Math.min(Math.max(1, page), Math.max(totalPages, 1));
  const start = (safePage - 1) * pageSize;
  const jobs = rows.slice(start, start + pageSize).map((row) => row.job);

  return { jobs, total, totalPages };
}
