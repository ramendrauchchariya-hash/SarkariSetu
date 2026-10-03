import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'My Applications' };

export default function ApplicationsPage() {
  return (
    <ComingSoon
      title="My Applications"
      description="Track the status of jobs you have applied to. Coming soon."
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  );
}
