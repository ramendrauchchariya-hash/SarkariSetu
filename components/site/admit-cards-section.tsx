import { AdmitCardCard } from './admit-card-card';
import { SectionHeading } from './section-heading';
import { admitCards } from '@/lib/mock-data';

export function AdmitCardsSection() {
  return (
    <section className="border-y bg-muted/20 py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Latest Admit Cards"
          description="Download hall tickets and admit cards for upcoming examinations"
          viewAllHref="/admit-cards"
          viewAllLabel="View All Admit Cards"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {admitCards.map((ac) => (
            <AdmitCardCard key={ac.id} admitCard={ac} />
          ))}
        </div>
      </div>
    </section>
  );
}
