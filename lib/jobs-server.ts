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

function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
}

function slugifyDepartment(value: string): string {
  return normalizeText(value).replace(/ /g, '-');
}

function normalizeQualification(value: string): string {
  return normalizeText(value);
}

const QUALIFICATION_ALIASES: Record<string, string[]> = {
  '10th-pass': ['10th', '10th pass', 'matric', 'matriculation', 'high school'],
  '12th-pass': ['12th', '12th pass', 'intermediate', 'higher secondary', 'senior secondary'],
  iti: ['iti', 'industrial training institute'],
  diploma: ['diploma', 'polytechnic'],
  graduate: ['graduate', 'graduation', 'bachelor', 'bachelors', 'degree', 'graduated'],
  'b-tech': ['b tech', 'btech', 'bachelor of technology'],
  'b-e': ['b e', 'be', 'bachelor of engineering'],
  'post-graduate': ['post graduate', 'postgraduate', 'master', 'masters', 'm tech', 'mtech', 'mba', 'mca', 'pg'],
};

function qualificationMatches(value: string | null, selected: string[]): boolean {
  const normalized = normalizeQualification(value);
  if (!normalized) return false;

  return selected.some((candidate) => {
    const wanted = normalizeQualification(candidate);
    const aliases = QUALIFICATION_ALIASES[candidate] ?? [wanted];

    if (wanted === 'graduate') {
      // Graduate should not accidentally exclude ordinary bachelor's-degree wording.
      return aliases.some((alias) => normalized.includes(alias)) && !normalized.includes('post graduate');
    }

    if (wanted === 'post-graduate') {
      return aliases.some((alias) => normalized.includes(alias));
    }

    return aliases.some((alias) => normalized === alias || normalized.includes(alias));
  });
}

function departmentMatches(
  department: string | null,
  organization: { slug: string; name: string } | null,
  categories: Array<{ name: string; slug: string }>,
  selected: string[]
): boolean {
  const text = normalizeText([
    department ?? '',
    organization?.slug ?? '',
    organization?.name ?? '',
    ...categories.flatMap((c) => [c.name, c.slug]),
  ].join(' '));

  return selected.some((candidate) => {
    const wanted = normalizeText(candidate);

    if (wanted === 'ssc') return text.includes('staff selection commission') || text.includes(' ssc ');
    if (wanted === 'upsc') return text.includes('union public service commission') || text.includes(' upsc ');
    if (wanted === 'banking') return /bank|banking|insurance|ibps|financial/.test(text);
    if (wanted === 'railway') return /railway|railways|rrb|rpf/.test(text);
    if (wanted === 'defence') return /defence|defense|armed forces|army|navy|air force|ssb|paramilitary/.test(text);
    if (wanted === 'teaching') return /teaching|education|teacher|school|college|university|lecturer|professor/.test(text);
    if (wanted === 'police') return /police|constable|sub inspector|si |paramilitary/.test(text);
    if (wanted === 'psu') return /psu|public sector|undertaking/.test(text);
    if (wanted === 'state government') return /state government|state govt|public service commission|psc/.test(text);

    return text.includes(wanted);
  });
}

function searchMatches(
  query: string,
  recruitment: DbRecruitment,
  aggregate: ReturnType<typeof getAggregate>
): boolean {
  const terms = normalizeText(query).split(' ').filter(Boolean);
  if (!terms.length) return true;

  const categoryText = (recruitment.categories ?? [])
    .map((c) => `${c.name} ${c.slug}`)
    .join(' ');
  const postText = aggregate.posts
    .map((p) => `${p.title} ${p.qualification ?? ''} ${p.discipline ?? ''} ${p.vacancies?.map((v) => v.category_name ?? '').join(' ') ?? ''}`)
    .join(' ');

  const haystack = normalizeText([
    recruitment.title,
    recruitment.description ?? '',
    recruitment.department ?? '',
    recruitment.organization?.name ?? '',
    recruitment.organization?.short_name ?? '',
    categoryText,
    postText,
  ].join(' '));

  return terms.every((term) => haystack.includes(term));
}

function getAggregate(r: DbRecruitment) {
  const posts = r.posts ?? [];
  const vacancies = posts.flatMap((p) => p.vacancies ?? []);
  const totalVacancies = vacancies.reduce((sum, v) => sum + (Number(v.vacancy_count) || 0), 0);

  const salaryPairs = posts
    .map((p) => ({
      min: typeof p.salary_min === 'number' && Number.isFinite(p.salary_min) ? p.salary_min : null,
      max: typeof p.salary_max === 'number' && Number.isFinite(p.salary_max) ? p.salary_max : null,
    }))
    .filter((p) => p.min !== null || p.max !== null);

  const salaryMin = salaryPairs.length
    ? Math.min(...salaryPairs.map((p) => p.min ?? p.max ?? 0))
    : 0;
  const salaryMax = salaryPairs.length
    ? Math.max(...salaryPairs.map((p) => p.max ?? p.min ?? 0))
    : 0;

  const stateSlugs = new Set<string>();
  const stateNames = new Set<string>();

  vacancies.forEach((v) => {
    if (v.state?.slug) stateSlugs.add(v.state.slug);
    if (v.state?.name) stateNames.add(v.state.name);
  });

  // Only all-India recruitments get the all-india state filter.
  if (r.location_type === 'all-india') {
    stateSlugs.add('all-india');
    stateNames.add('All India');
  }

  return { posts, totalVacancies, salaryMin, salaryMax, stateSlugs, stateNames };
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

  const q = normalizeText(search ?? '');
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
    if (q && !searchMatches(q, recruitment, aggregate)) return false;

    if (
      departments.length &&
      !departmentMatches(
        recruitment.department,
        recruitment.organization,
        recruitment.categories,
        departments
      )
    ) {
      return false;
    }

    if (jobTypes.length) {
      const recruitmentType = recruitment.job_type ?? '';
      const postTypes = aggregate.posts.map((post) => post.job_type ?? '');
      if (!jobTypes.some((type) => type === recruitmentType || postTypes.includes(type))) {
        return false;
      }
    }

    if (qualifications.length) {
      const categoryMatches = recruitment.categories.some((category) =>
        qualificationMatches(`${category.name} ${category.slug}`, qualifications)
      );
      const postMatches = aggregate.posts.some((post) =>
        qualificationMatches(post.qualification, qualifications)
      );

      if (!categoryMatches && !postMatches) return false;
    }

    if (states.length && !states.some((state) => aggregate.stateSlugs.has(state))) {
      return false;
    }

    if (salaryConfigs.length) {
      const matches = salaryConfigs.some((range) => {
        const max = Number.isFinite(range.max) ? range.max : Number.MAX_SAFE_INTEGER;
        const startingSalary = aggregate.salaryMin || aggregate.salaryMax;
        return startingSalary >= range.min && startingSalary <= max;
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
    let result = 0;

    switch (sort) {
      case 'deadline-soonest':
        result = (a.job.applicationEnd || '9999-12-31').localeCompare(b.job.applicationEnd || '9999-12-31');
        break;
      case 'deadline-latest':
        result = (b.job.applicationEnd || '').localeCompare(a.job.applicationEnd || '');
        break;
      case 'most-vacancies':
        result = b.aggregate.totalVacancies - a.aggregate.totalVacancies;
        break;
      case 'org-az':
        result = a.job.organization.localeCompare(b.job.organization);
        break;
      case 'title-az':
        result = a.job.title.localeCompare(b.job.title);
        break;
      case 'latest':
      default:
        result = String(b.job.postedDate || '').localeCompare(String(a.job.postedDate || ''));
        break;
    }

    // Stable tie-breakers are essential for correct pagination.
    if (result !== 0) return result;
    const titleTie = a.job.title.localeCompare(b.job.title);
    if (titleTie !== 0) return titleTie;
    return a.job.id.localeCompare(b.job.id);
  });

  const total = rows.length;
  const totalPages = Math.ceil(total / pageSize);
  const safePage = Math.min(Math.max(1, page), Math.max(totalPages, 1));
  const start = (safePage - 1) * pageSize;
  const jobs = rows.slice(start, start + pageSize).map((row) => row.job);

  return { jobs, total, totalPages };
}
