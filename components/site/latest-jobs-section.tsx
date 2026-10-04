import { JobCard } from './job-card';
import { SectionHeading } from './section-heading';
import type { JobListing } from '@/lib/types';

interface LatestJobsSectionProps {
  jobs: JobListing[];
}

export function LatestJobsSection({ jobs }: LatestJobsSectionProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="py-12 sm:py-14">
      <div className="container-page">
        <SectionHeading
          title="Latest Government Jobs"
          description="Newly posted government job openings across India"
          viewAllHref="/jobs"
          viewAllLabel="View All Jobs"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
