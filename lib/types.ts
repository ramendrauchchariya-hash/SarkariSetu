export type ListingStatus = 'active' | 'closing-soon' | 'closed' | 'upcoming' | 'result-out' | 'admit-card-available';

export type JobStatus = 'upcoming' | 'open' | 'closing-soon' | 'closed';

export type JobType = 'permanent' | 'contract' | 'apprenticeship' | 'internship';

export type ResultType = 'exam-result' | 'merit-list' | 'cutoff' | 'scorecard' | 'final-result';

export type CategorySlug =
  | '10th-pass' | '12th-pass' | 'iti' | 'diploma' | 'graduate' | 'engineering'
  | 'post-graduate' | 'ssc' | 'railway' | 'banking' | 'defence' | 'teaching'
  | 'police' | 'state-government';

export interface Category { slug: CategorySlug; label: string; icon: string; count: number; description?: string; }
export interface Department { slug: string; label: string; icon: string; count: number; }

export interface JobListing {
  id: string; title: string; organization: string; category: CategorySlug; location: string;
  status: ListingStatus; posts: number; salary: string; applicationDeadline: string;
  postedDate: string; qualification: string; officialApplicationUrl?: string | null;
}
export interface ExamListing { id: string; name: string; organization: string; category: CategorySlug; examDate: string; applicationDeadline: string; applicationStatus: ListingStatus; posts: number; }
export interface ResultListing {
  id: string; title: string; organization: string; resultType: ResultType; status: ListingStatus;
  resultDate: string; description?: string | null; officialResultUrl?: string | null; officialWebsiteUrl?: string | null;
}
export interface AdmitCardListing {
  id: string; title: string; organization: string; examName: string; status: ListingStatus;
  examDate: string; releaseDate: string; description?: string | null; officialUrl?: string | null; downloadAvailable: boolean;
}
export interface AnswerKeyListing { id: string; title: string; organization: string; status: ListingStatus; releasedDate: string; }
export interface AdmissionListing { id: string; institution: string; course: string; status: ListingStatus; applicationDeadline: string; }
export interface ExamTool { slug: string; title: string; description: string; icon: string; href?: string; }
export interface GuideArticle { id: string; title: string; excerpt: string; category: string; readTime: string; publishedDate: string; }
export interface NavItem { label: string; href: string; description?: string; }

export interface JobPosting {
  id: string; slug: string; title: string; organization: string; department: string;
  qualification: string; discipline: string; state: string; location: string; jobType: JobType;
  vacancies: number; salaryMin: number; salaryMax: number; applicationStart: string;
  applicationEnd: string; examDate: string | null; status: JobStatus; postedDate: string; description: string;
}
export interface VacancyBreakdown { post: string; category: string; state: string; count: number; }
export interface ApplicationFee { category: string; fee: string; }
export interface ExamPatternSubject { subject: string; questions: number; marks: number; }
export interface ExamPattern { subjects: ExamPatternSubject[]; totalQuestions: number; totalMarks: number; duration: string; negativeMarking: string | null; mode: string; }
export interface ImportantDate { label: string; date: string | null; }
export interface FaqItem { question: string; answer: string; }
export interface OfficialLink { label: string; url: string; type: 'notification' | 'application' | 'website'; }
export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export interface JobDetails extends JobPosting {
  ageMin: number; ageMax: number; ageCutoffDate: string; ageRelaxation: string; nationality: string;
  experience: string; otherRequirements: string; payLevel: string; allowances: string | null;
  correctionEndDate: string | null; cityIntimationDate: string | null; admitCardDate: string | null;
  resultDate: string | null; notificationReleasedDate: string | null; lastUpdated: string;
  lastVerified: string; verificationStatus: VerificationStatus; vacancyBreakdown: VacancyBreakdown[];
  applicationFees: ApplicationFee[]; feePaymentMethod: string | null; selectionProcess: string[];
  examPattern: ExamPattern | null; documentsRequired: string[]; howToApply: string[];
  officialLinks: OfficialLink[]; faqs: FaqItem[];
}
