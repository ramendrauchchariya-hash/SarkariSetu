import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Admin — Settings' };

export default function AdminSettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Configure platform settings, preferences and integrations. Admin functionality coming soon."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  );
}
