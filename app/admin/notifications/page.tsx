import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Admin — Notifications' };

export default function AdminNotificationsPage() {
  return (
    <ComingSoon
      title="Manage Notifications"
      description="Send broadcast notifications and alerts to users. Admin functionality coming soon."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  );
}
