/**
 * Database types for the SarkariSetu platform.
 *
 * These types mirror the Supabase schema and are designed so that the
 * existing mock data can later be replaced with Supabase queries without
 * changing the UI components. When the schema evolves, regenerate via
 * `supabase gen types` and merge the changes here.
 */

export type JobType = 'permanent' | 'contract' | 'apprenticeship' | 'internship';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type RecruitmentStatus = 'upcoming' | 'open' | 'closing-soon' | 'closed';

export type ResultType = 'result' | 'merit-list' | 'cutoff' | 'scorecard' | 'final-result';

export type AdmitCardStatus = 'available' | 'expected-soon' | 'not-released';

export type ApplicationTrackerStatus =
  | 'interested'
  | 'applied'
  | 'exam-scheduled'
  | 'exam-completed'
  | 'result-awaited'
  | 'selected'
  | 'not-selected';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  organization_type: string | null;
  description: string | null;
  official_website_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface State {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface Recruitment {
  id: string;
  title: string;
  slug: string;
  organization_id: string | null;
  description: string | null;
  department: string | null;
  location_type: string | null;
  job_type: string | null;
  application_start: string | null;
  application_end: string | null;
  exam_date: string | null;
  posted_date: string | null;
  last_updated: string;
  last_verified: string | null;
  verification_status: VerificationStatus;
  official_notification_url: string | null;
  official_application_url: string | null;
  official_website_url: string | null;
  status_override: RecruitmentStatus | null;
  is_published: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecruitmentWithOrg extends Recruitment {
  organization: Pick<Organization, 'id' | 'name' | 'slug' | 'short_name' | 'official_website_url'> | null;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
}

export interface Post {
  id: string;
  recruitment_id: string;
  title: string;
  qualification: string | null;
  discipline: string | null;
  age_min: number | null;
  age_max: number | null;
  age_cutoff_date: string | null;
  age_relaxation: string | null;
  experience: string | null;
  nationality_requirement: string | null;
  pay_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  job_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vacancy {
  id: string;
  post_id: string;
  state_id: string | null;
  category_name: string;
  vacancy_count: number;
  created_at: string;
  updated_at: string;
}

export interface ImportantDate {
  id: string;
  recruitment_id: string;
  date_type: string;
  date_value: string;
  label: string | null;
  description: string | null;
  created_at: string;
}

export interface EligibilityRule {
  id: string;
  recruitment_id: string;
  post_id: string | null;
  rule_type: string;
  rule_value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationFee {
  id: string;
  recruitment_id: string;
  category: string;
  amount: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SelectionProcessStep {
  id: string;
  recruitment_id: string;
  step_number: number;
  title: string;
  description: string | null;
  created_at: string;
}

export interface ExamPatternSubject {
  id: string;
  recruitment_id: string;
  subject: string;
  questions: number | null;
  marks: number | null;
  duration_minutes: number | null;
  negative_marking: string | null;
  mode: string | null;
  created_at: string;
}

export interface DocumentRequired {
  id: string;
  recruitment_id: string;
  document_name: string;
  description: string | null;
  is_required: boolean;
  created_at: string;
}

export interface HowToApplyStep {
  id: string;
  recruitment_id: string;
  step_number: number;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Faq {
  id: string;
  recruitment_id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: string;
  title: string;
  slug: string;
  organization_id: string | null;
  recruitment_id: string | null;
  result_type: ResultType;
  result_date: string | null;
  description: string | null;
  official_result_url: string | null;
  official_website_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdmitCard {
  id: string;
  title: string;
  slug: string;
  organization_id: string | null;
  recruitment_id: string | null;
  exam_date: string | null;
  release_date: string | null;
  status: AdmitCardStatus;
  official_url: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnswerKey {
  id: string;
  title: string;
  slug: string;
  organization_id: string | null;
  recruitment_id: string | null;
  release_date: string | null;
  objection_start: string | null;
  objection_end: string | null;
  official_url: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  date_of_birth: string | null;
  qualification: string | null;
  discipline: string | null;
  graduation_year: number | null;
  state: string | null;
  preferred_departments: string[];
  preferred_locations: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  recruitment_id: string;
  created_at: string;
}

export interface ApplicationTrackerEntry {
  id: string;
  user_id: string;
  recruitment_id: string;
  application_status: ApplicationTrackerStatus;
  application_date: string | null;
  application_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSubscription {
  id: string;
  user_id: string;
  category: string | null;
  department: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  notification_type: string | null;
  related_recruitment_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  updated_at: string;
}
