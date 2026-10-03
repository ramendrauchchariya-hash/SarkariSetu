import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Admin — Admit Cards' };

export default function AdminAdmitCardsPage() {
  return (
    <ComingSoon
      title="Manage Admit Cards"
      description="Upload and manage admit card links. Admin functionality coming soon."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  );
}
