import { JobCard } from './job-card';
import { SectionHeading } from './section-heading';
import { latestJobs } from '@/lib/mock-data';

export function LatestJobsSection() {
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
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
