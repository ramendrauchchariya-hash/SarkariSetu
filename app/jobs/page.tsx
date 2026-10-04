import { Suspense } from 'react';
import type { Metadata } from 'next';
import { JobsPageClient } from '@/components/site/jobs-page-client';
import { JobSkeletonList } from '@/components/site/job-skeleton';
import { SiteShell } from '@/components/site/site-shell';
import { serverGetJobsListing } from '@/lib/jobs-server';
import type { SortOption } from '@/lib/job-filters';
import { JOBS_PER_PAGE } from '@/lib/job-filters';

export const metadata: Metadata = {
  title: 'Government Jobs — SarkariSetu',
  description:
    'Find the latest government jobs across India by qualification, department, state and application status.',
  openGraph: {
    title: 'Government Jobs — SarkariSetu',
    description:
      'Find the latest government jobs across India by qualification, department, state and application status.',
  },
};

interface PageProps {
  searchParams: {
    q?: string;
    page?: string;
    sort?: string;
    department?: string;
    status?: string;
    jobType?: string;
    qualification?: string;
  };
}

export default async function JobsPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page ?? '1', 10) || 1;
  const sort = (searchParams.sort as SortOption) ?? 'latest';
  const search = searchParams.q ?? '';
  const departments = searchParams.department ? searchParams.department.split(',').filter(Boolean) : [];
  const statuses = searchParams.status ? searchParams.status.split(',').filter(Boolean) : [];
  const jobTypes = searchParams.jobType ? searchParams.jobType.split(',').filter(Boolean) : [];
  const qualifications = searchParams.qualification ? searchParams.qualification.split(',').filter(Boolean) : [];

  const { jobs, total, totalPages } = await serverGetJobsListing({
    page,
    pageSize: JOBS_PER_PAGE,
    search,
    departments,
    statuses,
    jobTypes,
    qualifications,
    sort,
  });

  return (
    <SiteShell>
      <JobsPageClient
        jobs={jobs}
        total={total}
        totalPages={totalPages}
        currentPage={page}
      />
    </SiteShell>
  );
}
