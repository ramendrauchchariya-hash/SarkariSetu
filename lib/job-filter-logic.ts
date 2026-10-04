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
import type { JobFilterState } from '@/components/site/job-filters-sidebar';

export const EMPTY_FILTERS: JobFilterState = {
  qualifications: [],
  departments: [],
  states: [],
  statuses: [],
  jobTypes: [],
  salaryRanges: [],
};

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

export { JOBS_PER_PAGE };
