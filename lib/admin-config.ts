/**
 * Shared configuration for admin UI components.
 * Badge variants and labels for statuses used across the admin panel.
 */

import type { VerificationStatus, RecruitmentStatus } from './database-types';

export const verificationStatusConfig: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'default' | 'secondary' | 'outline' }
> = {
  unverified: { label: 'Unverified', variant: 'destructive' },
  pending: { label: 'Pending Review', variant: 'warning' },
  verified: { label: 'Verified', variant: 'success' },
};

export const jobStatusConfig: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'default' | 'secondary' | 'outline' }
> = {
  upcoming: { label: 'Upcoming', variant: 'info' },
  open: { label: 'Open', variant: 'success' },
  'closing-soon': { label: 'Closing Soon', variant: 'warning' },
  closed: { label: 'Closed', variant: 'destructive' },
};

export const publishStateConfig: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'default' | 'secondary' | 'outline' }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'success' },
  archived: { label: 'Archived', variant: 'outline' },
};

export const jobTypeOptions = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'internship', label: 'Internship' },
];

export const locationTypeOptions = [
  { value: 'all-india', label: 'All India' },
  { value: 'state-specific', label: 'State Specific' },
];

export const verificationStatusOptions = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'verified', label: 'Verified' },
];

export const statusOverrideOptions = [
  { value: '', label: 'No override (automatic)' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'open', label: 'Open' },
  { value: 'closing-soon', label: 'Closing Soon' },
  { value: 'closed', label: 'Closed' },
];

export const dateTypeOptions = [
  { value: 'notification', label: 'Notification Released' },
  { value: 'application_start', label: 'Application Start' },
  { value: 'application_end', label: 'Application End' },
  { value: 'correction_end', label: 'Correction Window End' },
  { value: 'city_intimation', label: 'City Intimation' },
  { value: 'admit_card', label: 'Admit Card' },
  { value: 'exam_date', label: 'Exam Date' },
  { value: 'result', label: 'Result' },
  { value: 'other', label: 'Other' },
];

export const eligibilityRuleTypeOptions = [
  { value: 'education', label: 'Education' },
  { value: 'age', label: 'Age' },
  { value: 'experience', label: 'Experience' },
  { value: 'nationality', label: 'Nationality' },
  { value: 'physical', label: 'Physical Standards' },
  { value: 'other', label: 'Other' },
];

export const examModeOptions = [
  { value: 'Computer Based Test (Online)', label: 'Computer Based Test (Online)' },
  { value: 'Pen and Paper (Offline)', label: 'Pen and Paper (Offline)' },
  { value: 'Interview', label: 'Interview' },
  { value: '', label: '—' },
];

export const vacancyCategoryOptions = [
  'UR', 'OBC', 'SC', 'ST', 'EWS', 'PwBD', 'Ex-Servicemen',
];
