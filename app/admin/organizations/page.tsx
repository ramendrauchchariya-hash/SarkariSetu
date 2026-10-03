import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Admin — Organizations' };

export default function AdminOrganizationsPage() {
  return (
    <ComingSoon
      title="Manage Organizations"
      description="Add and edit recruiting organizations and departments. Admin functionality coming soon."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  );
}
