import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Admin — Categories' };

export default function AdminCategoriesPage() {
  return (
    <ComingSoon
      title="Manage Categories"
      description="Configure job categories and qualifications. Admin functionality coming soon."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  );
}
