import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JobDetailsView } from '@/components/site/job-details-view';
import { serverGetRecruitmentBySlug, serverGetRelatedRecruitments } from '@/lib/data-server';
import { recruitmentDetailToJobDetails, recruitmentToJobPosting } from '@/lib/data-mappers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recruitment = await serverGetRecruitmentBySlug(params.slug);

  if (!recruitment) {
    return {
      title: 'Job Not Found — SarkariSetu',
      description: 'The recruitment you are looking for could not be found.',
    };
  }

  return {
    title: `${recruitment.title} — Government Job Details | SarkariSetu`,
    description: `Check eligibility, vacancies, important dates, salary, application fee, selection process and official links for ${recruitment.title}.`,
    alternates: {
      canonical: `/jobs/${recruitment.slug}`,
    },
    openGraph: {
      title: `${recruitment.title} — SarkariSetu`,
      description: `Check eligibility, vacancies, important dates, salary, application fee, selection process and official links for ${recruitment.title}.`,
    },
  };
}

export default async function JobDetailsPage({ params }: PageProps) {
  const recruitment = await serverGetRecruitmentBySlug(params.slug);

  if (!recruitment) {
    notFound();
  }

  const job = recruitmentDetailToJobDetails(recruitment);

  const relatedRecruitments = await serverGetRelatedRecruitments(recruitment, 4);
  const relatedJobs = relatedRecruitments.map(recruitmentToJobPosting);

  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: recruitment.title,
    description: recruitment.description ?? ('Government job opportunity: ' + recruitment.title),
    datePosted: recruitment.posted_date ?? recruitment.created_at,
    ...(recruitment.application_end ? { validThrough: recruitment.application_end } : {}),
    employmentType:
      recruitment.job_type === 'permanent' ? 'FULL_TIME' :
      recruitment.job_type === 'contract' ? 'CONTRACTOR' :
      recruitment.job_type === 'internship' ? 'INTERN' :
      'TEMPORARY',
    hiringOrganization: {
      '@type': 'Organization',
      name: recruitment.organization?.name ?? 'Government Organization',
      ...(recruitment.official_website_url || recruitment.organization?.official_website_url
        ? { sameAs: recruitment.official_website_url ?? recruitment.organization?.official_website_url }
        : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
    },
    ...(job.salaryMax > 0 ? {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryMin || job.salaryMax,
          maxValue: job.salaryMax,
          unitText: 'MONTH',
        },
      },
    } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }} />
      <JobDetailsView job={job} relatedJobs={relatedJobs} />
    </>
  );
}
