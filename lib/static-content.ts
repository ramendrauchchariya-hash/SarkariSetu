/**
 * Static site configuration that is not recruitment data.
 *
 * Recruitment, result, admit-card and answer-key listings must come from
 * verified database records. Empty arrays are intentional until real content
 * is added through the admin dashboard.
 */

import type { ExamTool, GuideArticle, Department, Category } from './types';

export const examTools: ExamTool[] = [
  {
    slug: 'age-calculator',
    title: 'Age Calculator',
    description: 'Calculate your exact age as on a specific date for eligibility checks.',
    icon: 'CalendarDays',
  },
  {
    slug: 'cgpa-to-percentage',
    title: 'CGPA to Percentage',
    description: 'Convert your CGPA to percentage for application forms.',
    icon: 'Calculator',
  },
  {
    slug: 'percentage-calculator',
    title: 'Percentage Calculator',
    description: 'Quickly compute percentages for marks and results.',
    icon: 'Percent',
  },
  {
    slug: 'fee-calculator',
    title: 'Fee Calculator',
    description: 'Calculate application fees based on category and number of posts.',
    icon: 'Wallet',
  },
];

export const guides: GuideArticle[] = [];

export const departments: Department[] = [
  { slug: 'ssc', label: 'SSC', icon: 'FileText', count: 0 },
  { slug: 'railway', label: 'Railway', icon: 'TrainFront', count: 0 },
  { slug: 'banking', label: 'Banking', icon: 'Landmark', count: 0 },
  { slug: 'upsc', label: 'UPSC', icon: 'Briefcase', count: 0 },
  { slug: 'defence', label: 'Defence', icon: 'Shield', count: 0 },
  { slug: 'teaching', label: 'Teaching', icon: 'GraduationCap', count: 0 },
  { slug: 'police', label: 'Police', icon: 'ShieldCheck', count: 0 },
  { slug: 'psu', label: 'PSU', icon: 'Factory', count: 0 },
  { slug: 'state-government', label: 'State Govt', icon: 'Building2', count: 0 },
];

export const categoryIconMap: Record<string, string> = {
  '10th-pass': 'School',
  '12th-pass': 'GraduationCap',
  iti: 'Wrench',
  diploma: 'ScrollText',
  graduate: 'BookOpen',
  engineering: 'Cog',
  'post-graduate': 'BookMarked',
};
