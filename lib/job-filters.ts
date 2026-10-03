import type { JobStatus, JobType } from './types';

export interface FilterOption {
  value: string;
  label: string;
}

export const qualificationOptions: FilterOption[] = [
  { value: '10th-pass', label: '10th Pass' },
  { value: '12th-pass', label: '12th Pass' },
  { value: 'iti', label: 'ITI' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'b-tech', label: 'B.Tech' },
  { value: 'b-e', label: 'B.E.' },
  { value: 'post-graduate', label: 'Post Graduate' },
];

export const departmentOptions: FilterOption[] = [
  { value: 'ssc', label: 'SSC' },
  { value: 'railway', label: 'Railway' },
  { value: 'banking', label: 'Banking' },
  { value: 'upsc', label: 'UPSC' },
  { value: 'defence', label: 'Defence' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'police', label: 'Police' },
  { value: 'psu', label: 'PSU' },
  { value: 'state-government', label: 'State Government' },
];

export const stateOptions: FilterOption[] = [
  { value: 'all-india', label: 'All India' },
  { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal-pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya-pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west-bengal', label: 'West Bengal' },
];

export const jobStatusOptions: FilterOption[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'open', label: 'Open' },
  { value: 'closing-soon', label: 'Closing Soon' },
  { value: 'closed', label: 'Closed' },
];

export const jobTypeOptions: FilterOption[] = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'internship', label: 'Internship' },
];

export interface SalaryRange {
  value: string;
  label: string;
  min: number;
  max: number;
}

export const salaryRanges: SalaryRange[] = [
  { value: 'below-25000', label: 'Below ₹25,000', min: 0, max: 25000 },
  { value: '25000-50000', label: '₹25,000 – ₹50,000', min: 25000, max: 50000 },
  { value: '50000-75000', label: '₹50,000 – ₹75,000', min: 50000, max: 75000 },
  { value: '75000-100000', label: '₹75,000 – ₹1,00,000', min: 75000, max: 100000 },
  { value: '100000-plus', label: '₹1,00,000+', min: 100000, max: Infinity },
];

export const jobStatusLabel: Record<JobStatus, string> = {
  upcoming: 'Upcoming',
  open: 'Open',
  'closing-soon': 'Closing Soon',
  closed: 'Closed',
};

export const jobStatusVariant: Record<JobStatus, 'success' | 'warning' | 'destructive' | 'info'> = {
  open: 'success',
  'closing-soon': 'warning',
  closed: 'destructive',
  upcoming: 'info',
};

export const jobTypeLabel: Record<JobType, string> = {
  permanent: 'Permanent',
  contract: 'Contract',
  apprenticeship: 'Apprenticeship',
  internship: 'Internship',
};

export type SortOption = 'latest' | 'deadline-soonest' | 'deadline-latest' | 'most-vacancies' | 'org-az' | 'title-az';

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'Latest Posted' },
  { value: 'deadline-soonest', label: 'Deadline: Soonest' },
  { value: 'deadline-latest', label: 'Deadline: Latest' },
  { value: 'most-vacancies', label: 'Most Vacancies' },
  { value: 'org-az', label: 'Organization A–Z' },
  { value: 'title-az', label: 'Job Title A–Z' },
];

export const JOBS_PER_PAGE = 10;
