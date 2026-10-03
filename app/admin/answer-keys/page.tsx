import { ComingSoon } from '@/components/site/coming-soon';

export const metadata = { title: 'Admin — Answer Keys' };

export default function AdminAnswerKeysPage() {
  return (
    <ComingSoon
      title="Manage Answer Keys"
      description="Publish provisional and final answer keys. Admin functionality coming soon."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  );
}
