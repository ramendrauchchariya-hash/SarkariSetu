import { ClosingSoonCard } from './closing-soon-card';
import { SectionHeading } from './section-heading';
import { closingSoonJobs } from '@/lib/mock-data';

export function ClosingSoonSection() {
  return (
    <section className="border-y bg-warning/[0.03] py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Applications Closing Soon"
          description="Don't miss out — these deadlines are approaching fast"
          viewAllHref="/jobs?status=closing-soon"
          viewAllLabel="View All Closing Soon"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {closingSoonJobs.slice(0, 6).map((job) => (
            <ClosingSoonCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
