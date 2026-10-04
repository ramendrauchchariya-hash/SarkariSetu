/**
 * Static site content that is not stored in the database.
 *
 * These are site-config constants (tools, guides, department icons)
 * — not mock data. They represent fixed UI configuration rather than
 * database-backed listings.
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
    slug: 'rank-predictor',
    title: 'Rank Predictor',
    description: 'Estimate your rank based on expected marks.',
    icon: 'TrendingUp',
  },
  {
    slug: 'cut-off-analyser',
    title: 'Cut-off Analyser',
    description: 'Compare your score with previous years cut-off marks.',
    icon: 'BarChart3',
  },
  {
    slug: 'fee-calculator',
    title: 'Fee Calculator',
    description: 'Calculate application fees based on category and number of posts.',
    icon: 'Wallet',
  },
];

export const guides: GuideArticle[] = [
  {
    id: 'how-to-fill-ssc-cgl-form',
    title: 'How to Fill SSC CGL Application Form: Step-by-Step Guide',
    excerpt: 'A complete walkthrough of the SSC CGL application process, from registration to fee payment.',
    category: 'Application Guide',
    readTime: '8 min read',
    publishedDate: '2026-01-15',
  },
  {
    id: 'rrb-group-d-preparation-tips',
    title: 'RRB Group D Preparation Tips and Strategy',
    excerpt: 'Effective study plan and topic-wise tips to crack the RRB Group D exam.',
    category: 'Exam Preparation',
    readTime: '6 min read',
    publishedDate: '2026-01-20',
  },
  {
    id: 'upsc-cse-eligibility-guide',
    title: 'UPSC Civil Services Eligibility Guide',
    excerpt: 'Understand age limits, educational qualifications, and attempt limits for UPSC CSE.',
    category: 'Eligibility',
    readTime: '5 min read',
    publishedDate: '2026-02-01',
  },
  {
    id: 'document-checklist-govt-jobs',
    title: 'Document Checklist for Government Job Applications',
    excerpt: 'All the documents you need to keep ready before applying for any government job.',
    category: 'General',
    readTime: '4 min read',
    publishedDate: '2026-02-10',
  },
];

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
