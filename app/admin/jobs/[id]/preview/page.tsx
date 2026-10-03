import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminJobPreview } from '@/components/admin/admin-job-preview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Preview Job — Admin' };

export default async function PreviewJobPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const { data: recruitment } = await supabaseAdmin
    .from('recruitments')
    .select(`
      *,
      organizations:organization_id (id, name, short_name, official_website_url)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (!recruitment) {
    return (
      <AdminShell
        title="Job Not Found"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Jobs', href: '/admin/jobs' }, { label: 'Preview' }]}
      >
        <p className="text-sm text-muted-foreground">This job could not be found.</p>
        <Button asChild variant="outline" size="sm" className="mt-4 gap-2">
          <Link href="/admin/jobs">Back to Jobs</Link>
        </Button>
      </AdminShell>
    );
  }

  // Fetch all child records
  const [
    { data: posts },
    { data: importantDates },
    { data: applicationFees },
    { data: selectionProcess },
    { data: examPatterns },
    { data: documentsRequired },
    { data: howToApply },
    { data: faqs },
    { data: categories },
  ] = await Promise.all([
    supabaseAdmin.from('posts').select('*').eq('recruitment_id', params.id).order('created_at'),
    supabaseAdmin.from('important_dates').select('*').eq('recruitment_id', params.id).order('created_at'),
    supabaseAdmin.from('application_fees').select('*').eq('recruitment_id', params.id).order('created_at'),
    supabaseAdmin.from('selection_process').select('*').eq('recruitment_id', params.id).order('step_number'),
    supabaseAdmin.from('exam_patterns').select('*').eq('recruitment_id', params.id).order('created_at'),
    supabaseAdmin.from('documents_required').select('*').eq('recruitment_id', params.id).order('created_at'),
    supabaseAdmin.from('how_to_apply').select('*').eq('recruitment_id', params.id).order('step_number'),
    supabaseAdmin.from('faqs').select('*').eq('recruitment_id', params.id).order('display_order'),
    supabaseAdmin
      .from('recruitment_categories')
      .select('categories:category_id (id, name, slug)')
      .eq('recruitment_id', params.id),
  ]);

  // Fetch vacancies for posts
  const postsWithVacancies = await Promise.all(
    (posts ?? []).map(async (post) => {
      const { data: vacancies } = await supabaseAdmin
        .from('vacancies')
        .select(`
          *,
          states:state_id (id, name)
        `)
        .eq('post_id', post.id)
        .order('created_at');
      return { ...post, vacancies: vacancies ?? [] };
    })
  );

  return (
    <AdminShell
      title="Preview"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Jobs', href: '/admin/jobs' },
        { label: 'Preview' },
      ]}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href={`/admin/jobs/${params.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      }
    >
      {/* Preview banner */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
        <Eye className="h-5 w-5 text-warning" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Private Preview — Admin Only</p>
          <p className="text-xs text-muted-foreground">
            This is how the job will appear on the public site once published.
            {recruitment.is_published ? ' (Currently Published)' : ' (Currently Draft — not visible publicly)'}
          </p>
        </div>
        <Badge variant={recruitment.is_published ? 'success' : 'secondary'}>
          {recruitment.is_published ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <AdminJobPreview
        recruitment={recruitment}
        posts={postsWithVacancies}
        importantDates={importantDates ?? []}
        applicationFees={applicationFees ?? []}
        selectionProcess={selectionProcess ?? []}
        examPatterns={examPatterns ?? []}
        documentsRequired={documentsRequired ?? []}
        howToApply={howToApply ?? []}
        faqs={faqs ?? []}
        categories={(categories ?? []) as unknown as Array<{ categories: { id: string; name: string; slug: string } }>}
      />
    </AdminShell>
  );
}
