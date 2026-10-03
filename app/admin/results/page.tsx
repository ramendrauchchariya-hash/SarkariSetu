import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Admin — Results' };

export default function AdminResultsPage() {
  return (
    <ComingSoon
      title="Manage Results"
      description="Publish and manage exam results. Admin functionality coming soon."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  );
}
