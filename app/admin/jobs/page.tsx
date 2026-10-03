import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminJobsListClient, type AdminJob } from '@/components/admin/admin-jobs-list-client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Manage Jobs — Admin' };

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    page?: string;
    sort?: string;
    status?: string;
    verification?: string;
    organization?: string;
  };
}) {
  await requireAdmin();

  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const sort = searchParams.sort || 'updated_desc';
  const search = searchParams.q || '';
  const statusFilter = searchParams.status || '';
  const verificationFilter = searchParams.verification || '';
  const orgFilter = searchParams.organization || '';

  // Build query with filters
  let query = supabaseAdmin
    .from('recruitments')
    .select(`
      id,
      title,
      slug,
      is_published,
      is_archived,
      verification_status,
      department,
      application_end,
      application_start,
      status_override,
      updated_at,
      organization_id,
      organizations:organization_id (id, name)
    `, { count: 'exact' });

  // Search
  if (search) {
    query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  // Status filter
  if (statusFilter === 'draft') {
    query = query.eq('is_published', false).eq('is_archived', false);
  } else if (statusFilter === 'published') {
    query = query.eq('is_published', true).eq('is_archived', false);
  } else if (statusFilter === 'archived') {
    query = query.eq('is_archived', true);
  }

  // Verification filter
  if (verificationFilter && ['unverified', 'pending', 'verified'].includes(verificationFilter)) {
    query = query.eq('verification_status', verificationFilter);
  }

  // Organization filter
  if (orgFilter) {
    query = query.eq('organization_id', orgFilter);
  }

  // Sort
  switch (sort) {
    case 'title_asc':
      query = query.order('title', { ascending: true });
      break;
    case 'title_desc':
      query = query.order('title', { ascending: false });
      break;
    case 'deadline_asc':
      query = query.order('application_end', { ascending: true, nullsFirst: false });
      break;
    case 'deadline_desc':
      query = query.order('application_end', { ascending: false, nullsFirst: true });
      break;
    case 'updated_asc':
      query = query.order('updated_at', { ascending: true });
      break;
    case 'updated_desc':
    default:
      query = query.order('updated_at', { ascending: false });
      break;
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data: jobs, count, error } = await query;

  // Get organizations for filter dropdown
  const { data: organizations } = await supabaseAdmin
    .from('organizations')
    .select('id, name')
    .order('name')
    .eq('is_active', true);

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <AdminShell
      title="Manage Jobs"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Jobs' }]}
      actions={
        <Button asChild size="sm" className="gap-2">
          <Link href="/admin/jobs/new">
            <Plus className="h-4 w-4" />
            Add New
          </Link>
        </Button>
      }
    >
      <AdminJobsListClient
        jobs={(jobs ?? []) as unknown as AdminJob[]}
        totalCount={count ?? 0}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        search={search}
        sort={sort}
        statusFilter={statusFilter}
        verificationFilter={verificationFilter}
        orgFilter={orgFilter}
        organizations={organizations ?? []}
        error={error?.message}
      />
    </AdminShell>
  );
}
