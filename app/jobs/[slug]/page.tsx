import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JobDetailsView, JobNotFoundView } from '@/components/site/job-details-view';
import { getJobDetailsBySlug, jobDetailsData } from '@/lib/job-details-data';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = getJobDetailsBySlug(params.slug);

  if (!job) {
    return {
      title: 'Job Not Found — SarkariSetu',
      description: 'The recruitment you are looking for could not be found.',
    };
  }

  return {
    title: `${job.title} — Government Job Details | SarkariSetu`,
    description: `Check eligibility, vacancies, important dates, salary, application fee, selection process and official links for ${job.title}.`,
    alternates: {
      canonical: `/jobs/${job.slug}`,
    },
    openGraph: {
      title: `${job.title} — SarkariSetu`,
      description: `Check eligibility, vacancies, important dates, salary, application fee, selection process and official links for ${job.title}.`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(jobDetailsData).map((slug) => ({ slug }));
}

export default function JobDetailsPage({ params }: PageProps) {
  const job = getJobDetailsBySlug(params.slug);

  if (!job) {
    return <JobNotFoundView />;
  }

  return <JobDetailsView job={job} />;
}
