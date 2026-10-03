import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Admin — Users' };

export default function AdminUsersPage() {
  return (
    <ComingSoon
      title="Manage Users"
      description="View and manage registered users and their roles. Admin functionality coming soon."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  );
}
