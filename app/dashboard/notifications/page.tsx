import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <ComingSoon
      title="Notifications"
      description="Get alerts about new jobs, results, admit cards and deadlines. Coming soon."
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  );
}
