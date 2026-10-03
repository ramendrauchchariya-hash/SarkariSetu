import { ResultCard } from './result-card';
import { SectionHeading } from './section-heading';
import { latestResults } from '@/lib/mock-data';

export function ResultsSection() {
  return (
    <section className="py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Latest Results"
          description="Recently announced exam results, merit lists, cutoffs and scorecards"
          viewAllHref="/results"
          viewAllLabel="View All Results"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {latestResults.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      </div>
    </section>
  );
}
