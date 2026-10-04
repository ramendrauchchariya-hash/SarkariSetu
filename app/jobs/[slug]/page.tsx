import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JobDetailsView } from '@/components/site/job-details-view';
import { serverGetRecruitmentBySlug, serverGetRelatedRecruitments, serverGetAllPublishedSlugs } from '@/lib/data-server';
import { recruitmentDetailToJobDetails, recruitmentToJobPosting } from '@/lib/data-mappers';

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

export async function generateStaticParams() {
  try {
    const slugs = await serverGetAllPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function JobDetailsPage({ params }: PageProps) {
  const recruitment = await serverGetRecruitmentBySlug(params.slug);

  if (!recruitment) {
    notFound();
  }

  const job = recruitmentDetailToJobDetails(recruitment);

  const relatedRecruitments = await serverGetRelatedRecruitments(recruitment, 4);
  const relatedJobs = relatedRecruitments.map(recruitmentToJobPosting);

  return <JobDetailsView job={job} relatedJobs={relatedJobs} />;
}
