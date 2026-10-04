/**
 * Mappers that convert Supabase database rows into the UI-facing types
 * defined in lib/types.ts. This lets us use the existing components
 * without redesigning them.
 */

import type {
  RecruitmentWithOrg,
  Post,
  Vacancy,
  ApplicationFee,
  SelectionProcessStep,
  ExamPatternSubject,
  DocumentRequired,
  HowToApplyStep,
  Faq,
  Result,
  AdmitCard,
} from './database-types';
import type { RecruitmentDetail } from './data-recruitments';
import type {
  JobPosting,
  JobListing,
  JobDetails,
  JobStatus,
  JobType,
  VacancyBreakdown,
  ApplicationFee as UIApplicationFee,
  ExamPattern,
  ExamPatternSubject as UIExamPatternSubject,
  OfficialLink,
  FaqItem,
  ResultListing,
  AdmitCardListing,
  ListingStatus,
} from './types';
import { computeRecruitmentStatus } from './recruitment-status';
import { formatDate } from './format';

const jobTypeMap: Record<string, JobType> = {
  permanent: 'permanent',
  contract: 'contract',
  apprenticeship: 'apprenticeship',
  internship: 'internship',
};

function mapJobType(t: string | null): JobType {
  return jobTypeMap[t ?? 'permanent'] ?? 'permanent';
}

const resultTypeLabelMap: Record<string, string> = {
  result: 'Exam Result',
  'merit-list': 'Merit List',
  cutoff: 'Cutoff',
  scorecard: 'Scorecard',
  'final-result': 'Final Result',
};

export function recruitmentToJobPosting(r: RecruitmentWithOrg): JobPosting {
  const status = computeRecruitmentStatus(r);
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    organization: r.organization?.name ?? 'Unknown Organization',
    department: r.department ?? r.organization?.slug ?? 'general',
    qualification: r.categories[0]?.slug ?? 'graduate',
    discipline: r.categories.map((c) => c.name).join(', ') || 'Various',
    state: r.location_type === 'state-specific' ? 'State Specific' : 'all-india',
    location: r.location_type === 'state-specific' ? 'State Specific' : 'All India',
    jobType: mapJobType(r.job_type),
    vacancies: 0,
    salaryMin: 0,
    salaryMax: 0,
    applicationStart: r.application_start ?? '',
    applicationEnd: r.application_end ?? '',
    examDate: r.exam_date,
    status: status as JobStatus,
    postedDate: r.posted_date ?? r.created_at,
    description: r.description ?? '',
  };
}

export function recruitmentWithVacanciesToJobPosting(
  r: RecruitmentWithOrg,
  totalVacancies: number,
  salaryMin: number,
  salaryMax: number
): JobPosting {
  const base = recruitmentToJobPosting(r);
  return {
    ...base,
    vacancies: totalVacancies,
    salaryMin,
    salaryMax,
  };
}

export function recruitmentToJobListing(r: RecruitmentWithOrg): JobListing {
  const status = computeRecruitmentStatus(r);
  const listingStatus: ListingStatus =
    status === 'open' ? 'active' :
    status === 'closing-soon' ? 'closing-soon' :
    status === 'closed' ? 'closed' :
    'upcoming';
  return {
    id: r.slug,
    title: r.title,
    organization: r.organization?.name ?? 'Unknown Organization',
    category: (r.categories[0]?.slug ?? 'graduate') as import('./types').CategorySlug,
    location: r.location_type === 'state-specific' ? 'State Specific' : 'All India',
    status: listingStatus,
    posts: 0,
    salary: '—',
    applicationDeadline: r.application_end ?? '',
    postedDate: r.posted_date ?? r.created_at,
    qualification: r.categories.map((c) => c.name).join(', ') || 'Various',
  };
}

export function recruitmentDetailToJobDetails(
  r: RecruitmentDetail
): JobDetails {
  const status = computeRecruitmentStatus(r) as JobStatus;
  const posts = r.posts;
  const vacancies = r.vacancies;

  const vacancyBreakdown: VacancyBreakdown[] = vacancies.map((v: Vacancy) => {
    const post = posts.find((p: Post) => p.id === v.post_id);
    return {
      post: post?.title ?? 'Unknown Post',
      category: v.category_name,
      state: 'All India',
      count: v.vacancy_count,
    };
  });

  const totalVacancies = vacancyBreakdown.reduce((sum, v) => sum + v.count, 0);

  const firstPost = posts[0];
  const salaryMin = firstPost?.salary_min ?? 0;
  const salaryMax = firstPost?.salary_max ?? 0;

  const applicationFees: UIApplicationFee[] = r.application_fees.map((f: ApplicationFee) => ({
    category: f.category,
    fee: f.amount,
  }));

  const selectionProcess: string[] = r.selection_process
    .sort((a: SelectionProcessStep, b: SelectionProcessStep) => a.step_number - b.step_number)
    .map((s: SelectionProcessStep) => s.title);

  const examPatternSubjects: UIExamPatternSubject[] = r.exam_patterns.map((e: ExamPatternSubject) => ({
    subject: e.subject,
    questions: e.questions ?? 0,
    marks: e.marks ?? 0,
  }));

  const examPattern: ExamPattern | null = examPatternSubjects.length > 0 ? {
    subjects: examPatternSubjects,
    totalQuestions: examPatternSubjects.reduce((s, sub) => s + sub.questions, 0),
    totalMarks: examPatternSubjects.reduce((s, sub) => s + sub.marks, 0),
    duration: r.exam_patterns[0]?.duration_minutes
      ? `${r.exam_patterns[0].duration_minutes} min`
      : '—',
    negativeMarking: r.exam_patterns[0]?.negative_marking ?? null,
    mode: r.exam_patterns[0]?.mode ?? '—',
  } : null;

  const documentsRequired: string[] = r.documents_required.map((d: DocumentRequired) => d.document_name);

  const howToApply: string[] = r.how_to_apply
    .sort((a: HowToApplyStep, b: HowToApplyStep) => a.step_number - b.step_number)
    .map((s: HowToApplyStep) => s.title);

  const faqs: FaqItem[] = r.faqs
    .sort((a: Faq, b: Faq) => a.display_order - b.display_order)
    .map((f: Faq) => ({
      question: f.question,
      answer: f.answer,
    }));

  const officialLinks: OfficialLink[] = [
    r.official_notification_url ? { label: 'Official Notification', url: r.official_notification_url, type: 'notification' as const } : null,
    r.official_application_url ? { label: 'Apply Online', url: r.official_application_url, type: 'application' as const } : null,
    r.official_website_url ?? r.organization?.official_website_url
      ? { label: 'Official Website', url: (r.official_website_url ?? r.organization!.official_website_url)!, type: 'website' as const }
      : null,
  ].filter((l): l is OfficialLink => l !== null);

  const verificationStatusMap = {
    verified: 'verified' as const,
    pending: 'pending' as const,
    unverified: 'unverified' as const,
  };

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    organization: r.organization?.name ?? 'Unknown Organization',
    department: r.department ?? r.organization?.slug ?? 'general',
    qualification: r.categories[0]?.slug ?? 'graduate',
    discipline: firstPost?.discipline ?? r.categories.map((c) => c.name).join(', '),
    state: r.location_type === 'state-specific' ? 'State Specific' : 'all-india',
    location: r.location_type === 'state-specific' ? 'State Specific' : 'All India',
    jobType: mapJobType(r.job_type),
    vacancies: totalVacancies,
    salaryMin,
    salaryMax,
    applicationStart: r.application_start ?? '',
    applicationEnd: r.application_end ?? '',
    examDate: r.exam_date,
    status,
    postedDate: r.posted_date ?? r.created_at,
    description: r.description ?? '',
    ageMin: firstPost?.age_min ?? 18,
    ageMax: firstPost?.age_max ?? 40,
    ageCutoffDate: firstPost?.age_cutoff_date ?? '',
    ageRelaxation: firstPost?.age_relaxation ?? 'As per government rules',
    nationality: firstPost?.nationality_requirement ?? 'Indian',
    experience: firstPost?.experience ?? 'Freshers and experienced candidates can apply',
    otherRequirements: '',
    payLevel: firstPost?.pay_level ?? '—',
    allowances: null,
    correctionEndDate: null,
    cityIntimationDate: null,
    admitCardDate: null,
    resultDate: null,
    notificationReleasedDate: r.posted_date ?? null,
    lastUpdated: r.updated_at,
    lastVerified: r.last_verified ?? '',
    verificationStatus: verificationStatusMap[r.verification_status],
    vacancyBreakdown,
    applicationFees,
    feePaymentMethod: r.application_fees[0]?.payment_method ?? null,
    selectionProcess,
    examPattern,
    documentsRequired,
    howToApply,
    officialLinks,
    faqs,
  };
}

export function dbResultToResultListing(
  r: Result & { organization_name: string | null }
): ResultListing {
  return {
    id: r.slug,
    title: r.title,
    organization: r.organization_name ?? 'Unknown',
    resultType: r.result_type === 'result' ? 'exam-result' : r.result_type,
    status: 'result-out',
    resultDate: r.result_date ?? r.updated_at,
  };
}

export function dbAdmitCardToAdmitCardListing(
  r: AdmitCard & { organization_name: string | null }
): AdmitCardListing {
  return {
    id: r.slug,
    title: r.title,
    organization: r.organization_name ?? 'Unknown',
    examName: r.title,
    status: r.status === 'available' ? 'admit-card-available' : 'upcoming',
    examDate: r.exam_date ?? '',
    downloadAvailable: r.status === 'available',
  };
}
