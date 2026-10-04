import { ResultCard } from './result-card';
import { SectionHeading } from './section-heading';
import type { ResultListing } from '@/lib/types';

interface ResultsSectionProps {
  results: ResultListing[];
}

export function ResultsSection({ results }: ResultsSectionProps) {
  if (results.length === 0) return null;

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
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      </div>
    </section>
  );
}
