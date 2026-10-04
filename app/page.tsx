import { SiteShell } from '@/components/site/site-shell';
import { HeroSection } from '@/components/site/hero-section';
import { CategoriesSection } from '@/components/site/categories-section';
import { DepartmentsSection } from '@/components/site/departments-section';
import { LatestJobsSection } from '@/components/site/latest-jobs-section';
import { ClosingSoonSection } from '@/components/site/closing-soon-section';
import { ResultsSection } from '@/components/site/results-section';
import { AdmitCardsSection } from '@/components/site/admit-cards-section';
import { UpcomingExamsSection } from '@/components/site/upcoming-exams-section';
import { ToolsSection } from '@/components/site/tools-section';
import { RecommendationTeaserSection } from '@/components/site/recommendation-teaser-section';
import { TrustSection } from '@/components/site/trust-section';
import { GuidesSection } from '@/components/site/guides-section';

import {
  serverGetLatestRecruitments,
  serverGetClosingSoon,
  serverGetPublishedResults,
  serverGetPublishedAdmitCards,
  serverGetCategories,
  serverGetRecruitmentCountByCategory,
  serverGetHomepageBrowseOptions,
  serverGetHomepageStats,
} from '@/lib/data-server';
import { recruitmentToJobListing, dbResultToResultListing, dbAdmitCardToAdmitCardListing } from '@/lib/data-mappers';
import { examTools, guides, categoryIconMap } from '@/lib/static-content';
import type { Category, Department, ExamListing, JobListing, ResultListing, AdmitCardListing } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getHomepageData() {
  const [latestRecruitments, closingSoonRecruitments, results, admitCards, categories, categoryCounts, browseOptions, homepageStats] = await Promise.all([
    serverGetLatestRecruitments(6),
    serverGetClosingSoon(6),
    serverGetPublishedResults(5),
    serverGetPublishedAdmitCards(4),
    serverGetCategories(),
    serverGetRecruitmentCountByCategory(),
    serverGetHomepageBrowseOptions(),
    serverGetHomepageStats(),
  ]);

  const latestJobs: JobListing[] = latestRecruitments.map(recruitmentToJobListing);
  const closingSoonJobs: JobListing[] = closingSoonRecruitments.map(recruitmentToJobListing);
  const latestResults: ResultListing[] = results.map(dbResultToResultListing);
  const admitCardsList: AdmitCardListing[] = admitCards.map(dbAdmitCardToAdmitCardListing);

  const categoryList: Category[] = categories.map((c) => ({
    slug: c.slug as Category['slug'],
    label: c.name,
    icon: categoryIconMap[c.slug] ?? 'GraduationCap',
    count: categoryCounts.get(c.slug) ?? 0,
    description: c.description ?? undefined,
  }));

  const departmentIcons: Record<string, string> = {
    ssc: 'FileText',
    railway: 'TrainFront',
    banking: 'Landmark',
    'banking-financial-services': 'Landmark',
    upsc: 'Briefcase',
    engineering: 'Cog',
    defence: 'Shield',
    teaching: 'GraduationCap',
    police: 'ShieldCheck',
    psu: 'Factory',
    'psu-mining': 'Factory',
    'state-government': 'Building2',
  };

  const departments: Department[] = browseOptions.departments.map((d) => ({
    ...d,
    icon: departmentIcons[d.slug] ?? 'Building2',
  }));

  const organizations: Department[] = browseOptions.organizations.map((o) => ({
    ...o,
    icon: 'Building2',
  }));

  const upcomingExams: ExamListing[] = [];

  return {
    latestJobs,
    closingSoonJobs,
    latestResults,
    admitCardsList,
    categoryList,
    departments,
    organizations,
    upcomingExams,
    homepageStats,
  };
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <SiteShell>
      <HeroSection latestJobs={data.latestJobs} stats={data.homepageStats} />
      <CategoriesSection categories={data.categoryList} />
      <DepartmentsSection departments={data.departments} organizations={data.organizations} />
      <LatestJobsSection jobs={data.latestJobs} />
      <ClosingSoonSection jobs={data.closingSoonJobs} />
      <ResultsSection results={data.latestResults} />
      <AdmitCardsSection admitCards={data.admitCardsList} />
      <UpcomingExamsSection exams={data.upcomingExams} />
      <ToolsSection tools={examTools} />
      <RecommendationTeaserSection />
      <GuidesSection guides={guides} />
      <TrustSection />
    </SiteShell>
  );
}
