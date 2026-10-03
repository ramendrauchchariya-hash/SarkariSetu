import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <ComingSoon
      title="Your Dashboard"
      description="Track saved jobs, applications and personalised notifications. Sign in functionality coming soon."
    />
  );
}
