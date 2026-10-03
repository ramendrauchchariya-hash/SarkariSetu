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

export default function HomePage() {
  return (
    <SiteShell>
      <HeroSection />
      <CategoriesSection />
      <DepartmentsSection />
      <LatestJobsSection />
      <ClosingSoonSection />
      <ResultsSection />
      <AdmitCardsSection />
      <UpcomingExamsSection />
      <ToolsSection />
      <RecommendationTeaserSection />
      <GuidesSection />
      <TrustSection />
    </SiteShell>
  );
}
