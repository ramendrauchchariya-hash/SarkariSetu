import { Suspense } from 'react';
import type { Metadata } from 'next';
import { JobsPageClient } from '@/components/site/jobs-page-client';
import { JobSkeletonList } from '@/components/site/job-skeleton';
import { SiteShell } from '@/components/site/site-shell';

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

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <div className="container-page py-8">
            <div className="mb-6">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
            </div>
            <JobSkeletonList count={5} />
          </div>
        </SiteShell>
      }
    >
      <JobsPageClient />
    </Suspense>
  );
}
