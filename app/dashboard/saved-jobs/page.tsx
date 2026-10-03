import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Saved Jobs' };

export default function SavedJobsPage() {
  return (
    <ComingSoon
      title="Saved Jobs"
      description="Jobs you bookmark will appear here for quick access. Coming soon."
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  );
}
