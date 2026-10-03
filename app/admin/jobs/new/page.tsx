import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { JobEditorClient } from '@/components/admin/job-editor-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Create New Job — Admin' };

export default async function CreateJobPage() {
  await requireAdmin();

  // Fetch reference data
  const [{ data: organizations }, { data: categories }, { data: states }] = await Promise.all([
    supabaseAdmin.from('organizations').select('id, name').eq('is_active', true).order('name'),
    supabaseAdmin.from('categories').select('id, name, slug').eq('is_active', true).order('name'),
    supabaseAdmin.from('states').select('id, name').eq('is_active', true).order('name'),
  ]);

  return (
    <AdminShell
      title="Create New Job"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Jobs', href: '/admin/jobs' }, { label: 'New' }]}
      actions={
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/admin/jobs">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      }
    >
      <JobEditorClient
        mode="create"
        organizations={organizations ?? []}
        categories={categories ?? []}
        states={states ?? []}
      />
    </AdminShell>
  );
}
