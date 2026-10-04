/**
 * Server-side jobs listing with database-side filtering, sorting and pagination.
 */

import { supabaseAdmin } from './supabase-server';
import { computeRecruitmentStatus } from './recruitment-status';
import type { RecruitmentWithOrg, RecruitmentStatus } from './database-types';
import type { JobPosting, JobStatus } from './types';
import type { SortOption } from './job-filters';
import { recruitmentToJobPosting } from './data-mappers';

const RECRUITMENT_SELECT = `
  *,
  organization:organizations(id, name, slug, short_name, official_website_url),
  categories:recruitment_categories(category:categories(id, name, slug))
`;

function mapCategories(r: Record<string, unknown>): { id: string; name: string; slug: string }[] {
  const cats = (r.categories ?? []) as Array<{ category: { id: string; name: string; slug: string } }>;
  return cats.map((rc) => rc.category).filter(Boolean);
}

function toRecruitmentWithOrg(r: Record<string, unknown>): RecruitmentWithOrg {
  return {
    ...(r as unknown as RecruitmentWithOrg),
    organization: (r.organization ?? null) as RecruitmentWithOrg['organization'],
    categories: mapCategories(r),
  };
}

const SORT_MAP: Record<SortOption, { column: string; ascending: boolean }> = {
  latest: { column: 'posted_date', ascending: false },
  'deadline-soonest': { column: 'application_end', ascending: true },
  'deadline-latest': { column: 'application_end', ascending: false },
  'most-vacancies': { column: 'posted_date', ascending: false },
  'org-az': { column: 'title', ascending: true },
  'title-az': { column: 'title', ascending: true },
};

export interface JobsQueryOptions {
  page: number;
  pageSize: number;
  search?: string;
  departments?: string[];
  statuses?: string[];
  jobTypes?: string[];
  qualifications?: string[];
  sort: SortOption;
}

export async function serverGetJobsListing(
  options: JobsQueryOptions
): Promise<{ jobs: JobPosting[]; total: number; totalPages: number }> {
  const { page, pageSize, search, departments, statuses, jobTypes, qualifications, sort } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('recruitments')
    .select(RECRUITMENT_SELECT, { count: 'exact' })
    .eq('is_published', true)
    .eq('is_archived', false);

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (departments && departments.length > 0) {
    query = query.in('department', departments);
  }

  if (jobTypes && jobTypes.length > 0) {
    query = query.in('job_type', jobTypes);
  }

  if (qualifications && qualifications.length > 0) {
    const orParts = qualifications.map((q) => `categories.category.slug.eq.${q}`);
    query = query.or(orParts.join(','));
  }

  const sortConfig = SORT_MAP[sort] ?? SORT_MAP.latest;
  query = query.order(sortConfig.column, { ascending: sortConfig.ascending, nullsFirst: false });

  if (sort === 'most-vacancies') {
    query = query.order('posted_date', { ascending: false, nullsFirst: false });
  }

  query = query.range(from, to);

  const { data, count } = await query;

  if (!data) return { jobs: [], total: 0, totalPages: 0 };

  let recruitments = data.map(toRecruitmentWithOrg);

  if (statuses && statuses.length > 0) {
    recruitments = recruitments.filter((r) => {
      const status = computeRecruitmentStatus(r) as JobStatus;
      return statuses.includes(status);
    });
  }

  const total = count ?? recruitments.length;
  const totalPages = Math.ceil(total / pageSize);

  const jobs = recruitments.map(recruitmentToJobPosting);

  return { jobs, total, totalPages };
}
