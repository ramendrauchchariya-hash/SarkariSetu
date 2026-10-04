import { GuideCard } from './guide-card';
import { SectionHeading } from './section-heading';
import type { GuideArticle } from '@/lib/types';

interface GuidesSectionProps {
  guides: GuideArticle[];
}

export function GuidesSection({ guides }: GuidesSectionProps) {
  if (guides.length === 0) return null;

  return (
    <section className="py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Helpful Guides"
          description="Practical articles to help you navigate government job applications and exam preparation"
          viewAllHref="/guides"
          viewAllLabel="View All Guides"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  );
}
