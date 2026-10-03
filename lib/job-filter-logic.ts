import { jobPostings } from './jobs-data';
import {
  qualificationOptions,
  departmentOptions,
  stateOptions,
  jobStatusOptions,
  jobTypeOptions,
  salaryRanges as salaryRangeConfigs,
  JOBS_PER_PAGE,
  type SortOption,
} from './job-filters';
import type { JobPosting } from './types';
import type { JobFilterState } from '@/components/site/job-filters-sidebar';

export const EMPTY_FILTERS: JobFilterState = {
  qualifications: [],
  departments: [],
  states: [],
  statuses: [],
  jobTypes: [],
  salaryRanges: [],
};

/**
 * Filters and sorts job postings based on the given filter state, search query, and sort option.
 * Returns a paginated slice plus the total count for pagination UI.
 *
 * This function is structured to mirror what a future Supabase query would do:
 * - search → full-text search / ILIKE
 * - filter arrays → IN clauses
 * - salary ranges → BETWEEN
 * - sort → ORDER BY
 * - pagination → LIMIT/OFFSET
 */
export function filterAndSortJobs(
  allJobs: JobPosting[],
  filters: JobFilterState,
  search: string,
  sort: SortOption,
  page: number
): { jobs: JobPosting[]; total: number; totalPages: number } {
  let result = [...allJobs];

  // Search across title, organization, qualification, department, location
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((job) =>
      job.title.toLowerCase().includes(q) ||
      job.organization.toLowerCase().includes(q) ||
      job.qualification.toLowerCase().includes(q) ||
      job.department.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.discipline.toLowerCase().includes(q)
    );
  }

  // Qualification filter
  if (filters.qualifications.length > 0) {
    result = result.filter((job) =>
      filters.qualifications.includes(job.qualification)
    );
  }

  // Department filter
  if (filters.departments.length > 0) {
    result = result.filter((job) =>
      filters.departments.includes(job.department)
    );
  }

  // State filter
  if (filters.states.length > 0) {
    result = result.filter((job) => filters.states.includes(job.state));
  }

  // Status filter
  if (filters.statuses.length > 0) {
    result = result.filter((job) => filters.statuses.includes(job.status));
  }

  // Job type filter
  if (filters.jobTypes.length > 0) {
    result = result.filter((job) => filters.jobTypes.includes(job.jobType));
  }

  // Salary range filter
  if (filters.salaryRanges.length > 0) {
    const ranges = salaryRangeConfigs.filter((r) =>
      filters.salaryRanges.includes(r.value)
    );
    result = result.filter((job) =>
      ranges.some(
        (range) =>
          job.salaryMax >= range.min && job.salaryMin <= range.max
      )
    );
  }

  // Sort
  switch (sort) {
    case 'latest':
      result.sort((a, b) => b.postedDate.localeCompare(a.postedDate));
      break;
    case 'deadline-soonest':
      result.sort((a, b) => a.applicationEnd.localeCompare(b.applicationEnd));
      break;
    case 'deadline-latest':
      result.sort((a, b) => b.applicationEnd.localeCompare(a.applicationEnd));
      break;
    case 'most-vacancies':
      result.sort((a, b) => b.vacancies - a.vacancies);
      break;
    case 'org-az':
      result.sort((a, b) => a.organization.localeCompare(b.organization));
      break;
    case 'title-az':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  const total = result.length;
  const totalPages = Math.ceil(total / JOBS_PER_PAGE);
  const safePage = Math.min(Math.max(1, page), totalPages || 1);
  const start = (safePage - 1) * JOBS_PER_PAGE;
  const paginated = result.slice(start, start + JOBS_PER_PAGE);

  return { jobs: paginated, total, totalPages };
}

/**
 * Builds a list of active filter chips for display.
 */
export function buildActiveFilterChips(
  filters: JobFilterState
): { group: string; value: string; label: string }[] {
  const chips: { group: string; value: string; label: string }[] = [];

  const findLabel = (
    options: { value: string; label: string }[],
    value: string
  ) => options.find((o) => o.value === value)?.label ?? value;

  filters.qualifications.forEach((v) =>
    chips.push({ group: 'qualifications', value: v, label: findLabel(qualificationOptions, v) })
  );
  filters.departments.forEach((v) =>
    chips.push({ group: 'departments', value: v, label: findLabel(departmentOptions, v) })
  );
  filters.states.forEach((v) =>
    chips.push({ group: 'states', value: v, label: findLabel(stateOptions, v) })
  );
  filters.statuses.forEach((v) =>
    chips.push({ group: 'statuses', value: v, label: findLabel(jobStatusOptions, v) })
  );
  filters.jobTypes.forEach((v) =>
    chips.push({ group: 'jobTypes', value: v, label: findLabel(jobTypeOptions, v) })
  );
  filters.salaryRanges.forEach((v) =>
    chips.push({ group: 'salaryRanges', value: v, label: findLabel(salaryRangeConfigs, v) })
  );

  return chips;
}

/**
 * Serializes filter state + search + sort + page into URL search params.
 */
export function filtersToSearchParams(
  filters: JobFilterState,
  search: string,
  sort: SortOption,
  page: number
): URLSearchParams {
  const params = new URLSearchParams();

  if (search.trim()) params.set('q', search.trim());
  if (filters.qualifications.length) params.set('qualification', filters.qualifications.join(','));
  if (filters.departments.length) params.set('department', filters.departments.join(','));
  if (filters.states.length) params.set('state', filters.states.join(','));
  if (filters.statuses.length) params.set('status', filters.statuses.join(','));
  if (filters.jobTypes.length) params.set('jobType', filters.jobTypes.join(','));
  if (filters.salaryRanges.length) params.set('salary', filters.salaryRanges.join(','));
  if (sort !== 'latest') params.set('sort', sort);
  if (page > 1) params.set('page', String(page));

  return params;
}

/**
 * Parses URL search params into filter state + search + sort + page.
 */
export function searchParamsToFilters(
  params: URLSearchParams
): { filters: JobFilterState; search: string; sort: SortOption; page: number } {
  const parseArray = (val: string | null) =>
    val ? val.split(',').filter(Boolean) : [];

  return {
    filters: {
      qualifications: parseArray(params.get('qualification')),
      departments: parseArray(params.get('department')),
      states: parseArray(params.get('state')),
      statuses: parseArray(params.get('status')),
      jobTypes: parseArray(params.get('jobType')),
      salaryRanges: parseArray(params.get('salary')),
    },
    search: params.get('q') ?? '',
    sort: (params.get('sort') as SortOption) ?? 'latest',
    page: parseInt(params.get('page') ?? '1', 10) || 1,
  };
}

export { jobPostings, JOBS_PER_PAGE };
