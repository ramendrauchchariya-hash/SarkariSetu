import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { JobEditorClient } from '@/components/admin/job-editor-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Edit Job — Admin' };

export default async function EditJobPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const [{ data: organizations }, { data: categories }, { data: states }, { data: recruitment }] = await Promise.all([
    supabaseAdmin.from('organizations').select('id, name').eq('is_active', true).order('name'),
    supabaseAdmin.from('categories').select('id, name, slug').eq('is_active', true).order('name'),
    supabaseAdmin.from('states').select('id, name').eq('is_active', true).order('name'),
    supabaseAdmin
      .from('recruitments')
      .select(`
        *,
        recruitment_categories (category_id)
      `)
      .eq('id', params.id)
      .maybeSingle(),
  ]);

  if (!recruitment) {
    return (
      <AdminShell
        title="Job Not Found"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Jobs', href: '/admin/jobs' }, { label: 'Edit' }]}
      >
        <p className="text-sm text-muted-foreground">The job you are looking for could not be found. It may have been deleted.</p>
        <Button asChild variant="outline" size="sm" className="mt-4 gap-2">
          <Link href="/admin/jobs">Back to Jobs</Link>
        </Button>
      </AdminShell>
    );
  }

  // Fetch child records
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('created_at');

  // Fetch vacancies for each post
  const postsWithVacancies = await Promise.all(
    (posts ?? []).map(async (post) => {
      const { data: vacancies } = await supabaseAdmin
        .from('vacancies')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at');
      return { ...post, vacancies: vacancies ?? [] };
    })
  );

  const { data: importantDates } = await supabaseAdmin
    .from('important_dates')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('created_at');

  const { data: eligibilityRules } = await supabaseAdmin
    .from('eligibility_rules')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('created_at');

  const { data: applicationFees } = await supabaseAdmin
    .from('application_fees')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('created_at');

  const { data: selectionProcess } = await supabaseAdmin
    .from('selection_process')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('step_number');

  const { data: examPatterns } = await supabaseAdmin
    .from('exam_patterns')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('created_at');

  const { data: documentsRequired } = await supabaseAdmin
    .from('documents_required')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('created_at');

  const { data: howToApply } = await supabaseAdmin
    .from('how_to_apply')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('step_number');

  const { data: faqs } = await supabaseAdmin
    .from('faqs')
    .select('*')
    .eq('recruitment_id', params.id)
    .order('display_order');

  return (
    <AdminShell
      title="Edit Job"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Jobs', href: '/admin/jobs' }, { label: 'Edit' }]}
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
        mode="edit"
        jobId={params.id}
        recruitment={recruitment}
        posts={postsWithVacancies}
        importantDates={importantDates ?? []}
        eligibilityRules={eligibilityRules ?? []}
        applicationFees={applicationFees ?? []}
        selectionProcess={selectionProcess ?? []}
        examPatterns={examPatterns ?? []}
        documentsRequired={documentsRequired ?? []}
        howToApply={howToApply ?? []}
        faqs={faqs ?? []}
        organizations={organizations ?? []}
        categories={categories ?? []}
        states={states ?? []}
      />
    </AdminShell>
  );
}
