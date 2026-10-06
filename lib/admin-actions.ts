'use server';

/**
 * Server actions for the Jobs CMS.
 * All actions verify admin authorization before performing any operation.
 * Uses the service role client (server-side only) for database writes.
 */

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from './supabase-server';
import { requireAdmin } from './admin-auth';
import { logAudit } from './audit';
import { slugify, isSlugUnique } from './slug';
import type { Post, Vacancy, ImportantDate, EligibilityRule, ApplicationFee, SelectionProcessStep, ExamPatternSubject, DocumentRequired, HowToApplyStep, Faq } from './database-types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JobFormData {
  title: string;
  slug: string;
  organization_id: string;
  description: string;
  department: string;
  location_type: string;
  job_type: string;
  application_start: string;
  application_end: string;
  exam_date: string;
  posted_date: string;
  verification_status: string;
  official_notification_url: string;
  official_application_url: string;
  official_website_url: string;
  status_override: string;
  is_published: boolean;
  category_ids: string[];
  posts: PostFormItem[];
  vacancies: VacancyFormItem[];
  important_dates: ImportantDateFormItem[];
  eligibility_rules: EligibilityFormItem[];
  application_fees: FeeFormItem[];
  selection_process: SelectionStepFormItem[];
  exam_patterns: ExamPatternFormItem[];
  documents_required: DocumentFormItem[];
  how_to_apply: HowToApplyFormItem[];
  faqs: FaqFormItem[];
}

export interface PostFormItem {
  id?: string;
  title: string;
  qualification: string;
  discipline: string;
  age_min: string;
  age_max: string;
  age_cutoff_date: string;
  age_relaxation: string;
  experience: string;
  nationality_requirement: string;
  pay_level: string;
  salary_min: string;
  salary_max: string;
  job_type: string;
}

export interface VacancyFormItem {
  post_index: number;
  state_id: string;
  category_name: string;
  vacancy_count: string;
}

export interface ImportantDateFormItem {
  id?: string;
  date_type: string;
  date_value: string;
  label: string;
  description: string;
}

export interface EligibilityFormItem {
  id?: string;
  post_index: number;
  rule_type: string;
  rule_value: string;
  description: string;
}

export interface FeeFormItem {
  id?: string;
  category: string;
  amount: string;
  payment_method: string;
  notes: string;
}

export interface SelectionStepFormItem {
  id?: string;
  step_number: number;
  title: string;
  description: string;
}

export interface ExamPatternFormItem {
  id?: string;
  stage_number: number;
  stage_name: string;
  paper_number: number;
  paper_name: string;
  post_id: string;
  section_name: string;
  session_name: string;
  session_number: number | null;
  module_name: string;
  module_number: number | null;
  weightage: string;
  is_qualifying: boolean;
  subject: string;
  questions: string;
  marks: string;
  duration_minutes: string;
  negative_marking: string;
  mode: string;
}

export interface DocumentFormItem {
  id?: string;
  document_name: string;
  description: string;
  is_required: boolean;
}

export interface HowToApplyFormItem {
  id?: string;
  step_number: number;
  title: string;
  description: string;
}

export interface FaqFormItem {
  id?: string;
  question: string;
  answer: string;
  display_order: number;
}

// ─── Create Job ──────────────────────────────────────────────────────────────

export async function createJob(data: JobFormData): Promise<{ success: boolean; error?: string; id?: string }> {
  const admin = await requireAdmin();

  const slug = slugify(data.slug);
  const unique = await isSlugUnique(slug);
  if (!unique) {
    return { success: false, error: 'A job with this slug already exists. Please choose a different slug.' };
  }

  const recruitmentRow = {
    title: data.title.trim(),
    slug,
    organization_id: data.organization_id || null,
    description: data.description.trim() || null,
    department: data.department || null,
    location_type: data.location_type || 'all-india',
    job_type: data.job_type || 'permanent',
    application_start: data.application_start || null,
    application_end: data.application_end || null,
    exam_date: data.exam_date || null,
    posted_date: data.posted_date || null,
    verification_status: data.verification_status || 'unverified',
    official_notification_url: data.official_notification_url || null,
    official_application_url: data.official_application_url || null,
    official_website_url: data.official_website_url || null,
    status_override: data.status_override || null,
    is_published: false, // Always create as draft
    is_archived: false,
  };

  const { data: created, error } = await supabaseAdmin
    .from('recruitments')
    .insert(recruitmentRow)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const recruitmentId = created.id;

  // Save child records
  await saveChildRecords(recruitmentId, data);

  // Save category associations
  if (data.category_ids.length > 0) {
    await supabaseAdmin.from('recruitment_categories').insert(
      data.category_ids.map((catId) => ({
        recruitment_id: recruitmentId,
        category_id: catId,
      }))
    );
  }

  await logAudit({
    userId: admin.id,
    action: 'create',
    entityType: 'recruitment',
    entityId: recruitmentId,
    newData: created as Record<string, unknown>,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/admin');
  revalidatePath('/jobs');

  return { success: true, id: recruitmentId };
}

// ─── Update Job ──────────────────────────────────────────────────────────────

export async function updateJob(id: string, data: JobFormData): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const slug = slugify(data.slug);
  const unique = await isSlugUnique(slug, id);
  if (!unique) {
    return { success: false, error: 'A job with this slug already exists. Please choose a different slug.' };
  }

  // Fetch old data for audit
  const { data: oldData } = await supabaseAdmin
    .from('recruitments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  const updateRow = {
    title: data.title.trim(),
    slug,
    organization_id: data.organization_id || null,
    description: data.description.trim() || null,
    department: data.department || null,
    location_type: data.location_type || 'all-india',
    job_type: data.job_type || 'permanent',
    application_start: data.application_start || null,
    application_end: data.application_end || null,
    exam_date: data.exam_date || null,
    posted_date: data.posted_date || null,
    verification_status: data.verification_status || 'unverified',
    official_notification_url: data.official_notification_url || null,
    official_application_url: data.official_application_url || null,
    official_website_url: data.official_website_url || null,
    status_override: data.status_override || null,
    last_updated: new Date().toISOString(),
  };

  const { data: updated, error } = await supabaseAdmin
    .from('recruitments')
    .update(updateRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Replace category associations
  await supabaseAdmin.from('recruitment_categories').delete().eq('recruitment_id', id);
  if (data.category_ids.length > 0) {
    await supabaseAdmin.from('recruitment_categories').insert(
      data.category_ids.map((catId) => ({
        recruitment_id: id,
        category_id: catId,
      }))
    );
  }

  // Replace child records
  await replaceChildRecords(id, data);

  await logAudit({
    userId: admin.id,
    action: 'update',
    entityType: 'recruitment',
    entityId: id,
    oldData: oldData as Record<string, unknown> | null,
    newData: updated as Record<string, unknown>,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/admin');
  revalidatePath(`/jobs/${slug}`);
  revalidatePath('/jobs');

  return { success: true };
}

// ─── Publish / Unpublish ─────────────────────────────────────────────────────

export async function publishJob(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  // Fetch the job to validate
  const { data: job } = await supabaseAdmin
    .from('recruitments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!job) {
    return { success: false, error: 'Job not found.' };
  }

  if (job.verification_status === 'unverified') {
    return { success: false, error: 'Job must be at least "Pending Review" before publishing. Please update the verification status.' };
  }

  if (!job.application_start || !job.application_end) {
    return { success: false, error: 'Application start and end dates are required to publish.' };
  }

  if (!job.description) {
    return { success: false, error: 'Description is required to publish.' };
  }

  const { data: posts, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq('recruitment_id', id);

  if (postsError || !posts?.length) {
    return { success: false, error: 'At least one job post is required before publishing.' };
  }

  const postIds = posts.map((post) => post.id);
  const { count: vacancyCount, error: vacanciesError } = await supabaseAdmin
    .from('vacancies')
    .select('id', { count: 'exact', head: true })
    .in('post_id', postIds);

  if (vacanciesError || !vacancyCount) {
    return { success: false, error: 'At least one vacancy record is required before publishing.' };
  }

  const { data: updated, error } = await supabaseAdmin
    .from('recruitments')
    .update({ is_published: true, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAudit({
    userId: admin.id,
    action: 'publish',
    entityType: 'recruitment',
    entityId: id,
    oldData: job as Record<string, unknown>,
    newData: updated as Record<string, unknown>,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/admin');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${job.slug}`);

  return { success: true };
}

export async function unpublishJob(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const { data: oldData } = await supabaseAdmin
    .from('recruitments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!oldData) {
    return { success: false, error: 'Job not found.' };
  }

  const { data: updated, error } = await supabaseAdmin
    .from('recruitments')
    .update({ is_published: false, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAudit({
    userId: admin.id,
    action: 'unpublish',
    entityType: 'recruitment',
    entityId: id,
    oldData: oldData as Record<string, unknown>,
    newData: updated as Record<string, unknown>,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/admin');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${oldData.slug}`);

  return { success: true };
}

// ─── Archive / Unarchive ────────────────────────────────────────────────────

export async function archiveJob(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const { data: oldData } = await supabaseAdmin
    .from('recruitments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!oldData) {
    return { success: false, error: 'Job not found.' };
  }

  const { data: updated, error } = await supabaseAdmin
    .from('recruitments')
    .update({ is_archived: true, is_published: false, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAudit({
    userId: admin.id,
    action: 'archive',
    entityType: 'recruitment',
    entityId: id,
    oldData: oldData as Record<string, unknown>,
    newData: updated as Record<string, unknown>,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/admin');
  revalidatePath('/jobs');

  return { success: true };
}

export async function unarchiveJob(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const { data: oldData } = await supabaseAdmin
    .from('recruitments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!oldData) {
    return { success: false, error: 'Job not found.' };
  }

  const { data: updated, error } = await supabaseAdmin
    .from('recruitments')
    .update({ is_archived: false, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAudit({
    userId: admin.id,
    action: 'unarchive',
    entityType: 'recruitment',
    entityId: id,
    oldData: oldData as Record<string, unknown>,
    newData: updated as Record<string, unknown>,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/admin');

  return { success: true };
}

// ─── Verify ──────────────────────────────────────────────────────────────────

export async function verifyJob(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  if (!['unverified', 'pending', 'verified'].includes(status)) {
    return { success: false, error: 'Invalid verification status.' };
  }

  const { data: oldData } = await supabaseAdmin
    .from('recruitments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!oldData) {
    return { success: false, error: 'Job not found.' };
  }

  const updateRow: Record<string, unknown> = {
    verification_status: status,
    last_updated: new Date().toISOString(),
  };

  if (status === 'verified') {
    updateRow.last_verified = new Date().toISOString();
  }

  const { data: updated, error } = await supabaseAdmin
    .from('recruitments')
    .update(updateRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAudit({
    userId: admin.id,
    action: `verify:${status}`,
    entityType: 'recruitment',
    entityId: id,
    oldData: oldData as Record<string, unknown>,
    newData: updated as Record<string, unknown>,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/admin');
  revalidatePath(`/jobs/${oldData.slug}`);

  return { success: true };
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export async function duplicateJob(id: string): Promise<{ success: boolean; error?: string; newId?: string }> {
  const admin = await requireAdmin();

  // Fetch the recruitment
  const { data: source } = await supabaseAdmin
    .from('recruitments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!source) {
    return { success: false, error: 'Job not found.' };
  }

  // Generate unique slug
  let baseSlug = `${source.slug}-copy`;
  let suffix = 1;
  let unique = await isSlugUnique(baseSlug);
  while (!unique) {
    suffix++;
    baseSlug = `${source.slug}-copy-${suffix}`;
    unique = await isSlugUnique(baseSlug);
  }

  // Create the duplicate as a draft
  const newRow: Record<string, unknown> = {
    title: `${source.title} (Copy)`,
    slug: baseSlug,
    organization_id: source.organization_id,
    description: source.description,
    department: source.department,
    location_type: source.location_type,
    job_type: source.job_type,
    application_start: source.application_start,
    application_end: source.application_end,
    exam_date: source.exam_date,
    posted_date: null,
    verification_status: 'unverified',
    official_notification_url: source.official_notification_url,
    official_application_url: source.official_application_url,
    official_website_url: source.official_website_url,
    status_override: source.status_override,
    is_published: false,
    is_archived: false,
    last_verified: null,
  };

  const { data: created, error } = await supabaseAdmin
    .from('recruitments')
    .insert(newRow)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const newId = created.id;

  // Copy categories
  const { data: categories } = await supabaseAdmin
    .from('recruitment_categories')
    .select('category_id')
    .eq('recruitment_id', id);

  if (categories && categories.length > 0) {
    await supabaseAdmin.from('recruitment_categories').insert(
      categories.map((c) => ({
        recruitment_id: newId,
        category_id: c.category_id,
      }))
    );
  }

  // Copy child tables
  await copyChildTable('posts', id, newId, 'recruitment_id');
  await copyChildTable('important_dates', id, newId, 'recruitment_id');
  await copyChildTable('eligibility_rules', id, newId, 'recruitment_id');
  await copyChildTable('application_fees', id, newId, 'recruitment_id');
  await copyChildTable('selection_process', id, newId, 'recruitment_id');
  await copyChildTable('exam_patterns', id, newId, 'recruitment_id');
  await copyChildTable('documents_required', id, newId, 'recruitment_id');
  await copyChildTable('how_to_apply', id, newId, 'recruitment_id');
  await copyChildTable('faqs', id, newId, 'recruitment_id');

  // Vacancies need special handling (linked to posts)
  // We need to map old post IDs to new post IDs
  const { data: oldPosts } = await supabaseAdmin
    .from('posts')
    .select('id, title')
    .eq('recruitment_id', id);

  const { data: newPosts } = await supabaseAdmin
    .from('posts')
    .select('id, title')
    .eq('recruitment_id', newId);

  if (oldPosts && newPosts) {
    for (const oldPost of oldPosts) {
      const matchingNewPost = newPosts.find((np) => np.title === oldPost.title);
      if (matchingNewPost) {
        const { data: oldVacancies } = await supabaseAdmin
          .from('vacancies')
          .select('*')
          .eq('post_id', oldPost.id);

        if (oldVacancies && oldVacancies.length > 0) {
          await supabaseAdmin.from('vacancies').insert(
            oldVacancies.map((v) => ({
              post_id: matchingNewPost.id,
              state_id: v.state_id,
              category_name: v.category_name,
              vacancy_count: v.vacancy_count,
            }))
          );
        }
      }
    }
  }

  await logAudit({
    userId: admin.id,
    action: 'duplicate',
    entityType: 'recruitment',
    entityId: newId,
    oldData: { source_id: id } as Record<string, unknown>,
    newData: created as Record<string, unknown>,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/admin');

  return { success: true, newId };
}

// ─── Helper: Save child records for new recruitment ──────────────────────────

async function saveChildRecords(recruitmentId: string, data: JobFormData): Promise<void> {
  // Posts
  const postIdMap: string[] = [];
  for (const post of data.posts) {
    if (!post.title?.trim()) continue;
    const { data: created } = await supabaseAdmin.from('posts').insert({
      recruitment_id: recruitmentId,
      title: post.title.trim(),
      qualification: post.qualification || null,
      discipline: post.discipline || null,
      age_min: post.age_min ? parseInt(post.age_min, 10) : null,
      age_max: post.age_max ? parseInt(post.age_max, 10) : null,
      age_cutoff_date: post.age_cutoff_date || null,
      age_relaxation: post.age_relaxation || null,
      experience: post.experience || null,
      nationality_requirement: post.nationality_requirement || null,
      pay_level: post.pay_level || null,
      salary_min: post.salary_min ? parseInt(post.salary_min, 10) : null,
      salary_max: post.salary_max ? parseInt(post.salary_max, 10) : null,
      job_type: post.job_type || null,
    }).select().single();
    if (created) postIdMap.push(created.id);
  }

  // Vacancies (linked to posts by index)
  for (const v of data.vacancies) {
    if (!v.vacancy_count) continue;

    const vacancyCount = parseInt(v.vacancy_count, 10);
    if (!Number.isFinite(vacancyCount) || vacancyCount < 0) continue;

    // "All Posts" is a UI convenience option. The database requires a
    // post_id, so create the same vacancy breakdown for every post.
    const postIndexes = v.post_index === -1
      ? postIdMap.map((_, index) => index)
      : [v.post_index];

    for (const postIndex of postIndexes) {
      const postId = postIdMap[postIndex];
      if (!postId) continue;

      await supabaseAdmin.from('vacancies').insert({
        post_id: postId,
        state_id: v.state_id || null,
        category_name: v.category_name || 'All Categories',
        vacancy_count: vacancyCount,
      });
    }
  }

  // Important dates
  for (const d of data.important_dates) {
    if (!d.date_type || !d.date_value) continue;
    await supabaseAdmin.from('important_dates').insert({
      recruitment_id: recruitmentId,
      date_type: d.date_type,
      date_value: d.date_value,
      label: d.label || null,
      description: d.description || null,
    });
  }

  // Eligibility rules
  for (const e of data.eligibility_rules) {
    if (!e.rule_type || !e.rule_value) continue;
    const postId = postIdMap[e.post_index];
    await supabaseAdmin.from('eligibility_rules').insert({
      recruitment_id: recruitmentId,
      post_id: postId || null,
      rule_type: e.rule_type,
      rule_value: e.rule_value,
      description: e.description || null,
    });
  }

  // Application fees
  for (const f of data.application_fees) {
    if (!f.category || !f.amount) continue;
    await supabaseAdmin.from('application_fees').insert({
      recruitment_id: recruitmentId,
      category: f.category,
      amount: f.amount,
      payment_method: f.payment_method || null,
      notes: f.notes || null,
    });
  }

  // Selection process
  for (const s of data.selection_process) {
    if (!s.title?.trim()) continue;
    await supabaseAdmin.from('selection_process').insert({
      recruitment_id: recruitmentId,
      step_number: s.step_number,
      title: s.title,
      description: s.description || null,
    });
  }

  // Exam patterns
  for (const e of data.exam_patterns) {
    if (!e.subject?.trim()) continue;
    await supabaseAdmin.from('exam_patterns').insert({
      recruitment_id: recruitmentId,
      stage_number: e.stage_number || 1,
      stage_name: e.stage_name || `Tier ${e.stage_number || 1}`,
      paper_number: e.paper_number || 1,
      paper_name: e.paper_name || `Paper ${e.paper_number || 1}`,
      section_name: e.section_name || null,
      session_name: e.session_name || null,
      session_number: e.session_number || null,
      module_name: e.module_name || null,
      module_number: e.module_number || null,
      weightage: e.weightage || null,
      is_qualifying: Boolean(e.is_qualifying),
      post_id: e.post_id?.startsWith('post-')
        ? (postIdMap[parseInt(e.post_id.slice(5), 10)] ?? null)
        : (e.post_id || null),
      subject: e.subject,
      questions: e.questions ? parseInt(e.questions, 10) : null,
      marks: e.marks ? parseInt(e.marks, 10) : null,
      duration_minutes: e.duration_minutes ? parseInt(e.duration_minutes, 10) : null,
      negative_marking: e.negative_marking || null,
      mode: e.mode || null,
    });
  }

  // Documents required
  for (const d of data.documents_required) {
    if (!d.document_name?.trim()) continue;
    await supabaseAdmin.from('documents_required').insert({
      recruitment_id: recruitmentId,
      document_name: d.document_name,
      description: d.description || null,
      is_required: d.is_required,
    });
  }

  // How to apply
  for (const h of data.how_to_apply) {
    if (!h.title?.trim()) continue;
    await supabaseAdmin.from('how_to_apply').insert({
      recruitment_id: recruitmentId,
      step_number: h.step_number,
      title: h.title,
      description: h.description || null,
    });
  }

  // FAQs
  for (const f of data.faqs) {
    if (!f.question?.trim() || !f.answer?.trim()) continue;
    await supabaseAdmin.from('faqs').insert({
      recruitment_id: recruitmentId,
      question: f.question,
      answer: f.answer,
      display_order: f.display_order,
    });
  }
}

// ─── Helper: Replace child records for existing recruitment ──────────────────

async function replaceChildRecords(recruitmentId: string, data: JobFormData): Promise<void> {
  // Delete existing child records
  await supabaseAdmin.from('vacancies').delete().in('post_id',
    (await supabaseAdmin.from('posts').select('id').eq('recruitment_id', recruitmentId)).data?.map((p: { id: string }) => p.id) ?? []
  );
  await supabaseAdmin.from('posts').delete().eq('recruitment_id', recruitmentId);
  await supabaseAdmin.from('important_dates').delete().eq('recruitment_id', recruitmentId);
  await supabaseAdmin.from('eligibility_rules').delete().eq('recruitment_id', recruitmentId);
  await supabaseAdmin.from('application_fees').delete().eq('recruitment_id', recruitmentId);
  await supabaseAdmin.from('selection_process').delete().eq('recruitment_id', recruitmentId);
  await supabaseAdmin.from('exam_patterns').delete().eq('recruitment_id', recruitmentId);
  await supabaseAdmin.from('documents_required').delete().eq('recruitment_id', recruitmentId);
  await supabaseAdmin.from('how_to_apply').delete().eq('recruitment_id', recruitmentId);
  await supabaseAdmin.from('faqs').delete().eq('recruitment_id', recruitmentId);

  // Re-save
  await saveChildRecords(recruitmentId, data);
}

// ─── Helper: Copy a child table ──────────────────────────────────────────────

async function copyChildTable(table: string, sourceId: string, newId: string, fkColumn: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from(table)
    .select('*')
    .eq(fkColumn, sourceId);

  if (!data || data.length === 0) return;

  // Remove id and timestamps, replace FK
  const rows = data.map((row: Record<string, unknown>) => {
    const { id: _id, created_at: _created, updated_at: _updated, [fkColumn]: _fk, ...rest } = row;
    return { ...rest, [fkColumn]: newId };
  });

  await supabaseAdmin.from(table).insert(rows);
}


// ─── Results CMS ─────────────────────────────────────────────────────────────

export interface ResultFormData {
  title: string;
  slug: string;
  organization_id: string;
  recruitment_id: string;
  result_type: string;
  result_date: string;
  description: string;
  official_result_url: string;
  official_website_url: string;
}

export async function createResult(data: ResultFormData): Promise<{ success: boolean; error?: string; id?: string }> {
  const admin = await requireAdmin();
  const slug = slugify(data.slug);
  const unique = await isResultSlugUnique(slug);
  if (!unique) return { success: false, error: 'A result with this slug already exists.' };
  const { data: created, error } = await supabaseAdmin.from('results').insert({
    title: data.title.trim(), slug, organization_id: data.organization_id || null,
    recruitment_id: data.recruitment_id || null, result_type: data.result_type || 'result',
    result_date: data.result_date || null, description: data.description.trim() || null,
    official_result_url: data.official_result_url || null, official_website_url: data.official_website_url || null,
    is_published: false,
  }).select().single();
  if (error) return { success: false, error: error.message };
  await logAudit({ userId: admin.id, action: 'create', entityType: 'result', entityId: created.id, newData: created as Record<string, unknown> });
  revalidatePath('/admin/results'); revalidatePath('/results');
  return { success: true, id: created.id };
}

export async function updateResult(id: string, data: ResultFormData): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  const slug = slugify(data.slug);
  if (!(await isResultSlugUnique(slug, id))) return { success: false, error: 'A result with this slug already exists.' };
  const { data: oldData } = await supabaseAdmin.from('results').select('*').eq('id', id).maybeSingle();
  if (!oldData) return { success: false, error: 'Result not found.' };
  const { data: updated, error } = await supabaseAdmin.from('results').update({
    title: data.title.trim(), slug, organization_id: data.organization_id || null,
    recruitment_id: data.recruitment_id || null, result_type: data.result_type || 'result',
    result_date: data.result_date || null, description: data.description.trim() || null,
    official_result_url: data.official_result_url || null, official_website_url: data.official_website_url || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };
  await logAudit({ userId: admin.id, action: 'update', entityType: 'result', entityId: id, oldData: oldData as Record<string, unknown>, newData: updated as Record<string, unknown> });
  revalidatePath('/admin/results'); revalidatePath('/results'); revalidatePath('/results/'+slug);
  return { success: true };
}

export async function publishResult(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  const { data: oldData } = await supabaseAdmin.from('results').select('*').eq('id', id).maybeSingle();
  if (!oldData) return { success: false, error: 'Result not found.' };
  if (!oldData.official_result_url) return { success: false, error: 'Official result URL is required before publishing.' };
  const { data: updated, error } = await supabaseAdmin.from('results').update({ is_published: true, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };
  await logAudit({ userId: admin.id, action: 'publish', entityType: 'result', entityId: id, oldData: oldData as Record<string, unknown>, newData: updated as Record<string, unknown> });
  revalidatePath('/admin/results'); revalidatePath('/results');
  return { success: true };
}

export async function unpublishResult(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  const { data: oldData } = await supabaseAdmin.from('results').select('*').eq('id', id).maybeSingle();
  if (!oldData) return { success: false, error: 'Result not found.' };
  const { data: updated, error } = await supabaseAdmin.from('results').update({ is_published: false, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };
  await logAudit({ userId: admin.id, action: 'unpublish', entityType: 'result', entityId: id, oldData: oldData as Record<string, unknown>, newData: updated as Record<string, unknown> });
  revalidatePath('/admin/results'); revalidatePath('/results');
  return { success: true };
}

export async function archiveResult(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  const { data: oldData } = await supabaseAdmin.from('results').select('*').eq('id', id).maybeSingle();
  if (!oldData) return { success: false, error: 'Result not found.' };
  const { data: updated, error } = await supabaseAdmin.from('results').update({ is_published: false, archived_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };
  await logAudit({ userId: admin.id, action: 'archive', entityType: 'result', entityId: id, oldData: oldData as Record<string, unknown>, newData: updated as Record<string, unknown> });
  revalidatePath('/admin/results'); revalidatePath('/results');
  return { success: true };
}

async function isResultSlugUnique(slug: string, excludeId?: string) {
  let q = supabaseAdmin.from('results').select('id').eq('slug', slug);
  if (excludeId) q = q.neq('id', excludeId);
  const { data } = await q.limit(1);
  return !data?.length;
}


export interface AdmitCardFormData {
  title: string;
  slug: string;
  organization_id: string;
  recruitment_id: string;
  exam_date: string;
  release_date: string;
  status: string;
  description: string;
  official_url: string;
}

export async function createAdmitCard(data: AdmitCardFormData): Promise<{ success: boolean; error?: string; id?: string }> {
  const admin = await requireAdmin();
  const slug = slugify(data.slug);
  if (!(await isAdmitCardSlugUnique(slug))) return { success: false, error: 'An admit card with this slug already exists.' };
  const { data: created, error } = await supabaseAdmin.from('admit_cards').insert({
    title: data.title.trim(), slug, organization_id: data.organization_id || null,
    recruitment_id: data.recruitment_id || null, exam_date: data.exam_date || null,
    release_date: data.release_date || null, status: data.status || 'available',
    description: data.description.trim() || null, official_url: data.official_url || null,
    is_published: false
  }).select().single();
  if (error) return { success: false, error: error.message };
  await logAudit({userId:admin.id,action:'create',entityType:'admit_card',entityId:created.id,newData:created as Record<string,unknown>});
  revalidatePath('/admin/admit-cards'); revalidatePath('/admit-cards');
  return {success:true,id:created.id};
}

export async function updateAdmitCard(id:string,data:AdmitCardFormData):Promise<{success:boolean;error?:string}>{
  const admin=await requireAdmin(); const slug=slugify(data.slug);
  if(!(await isAdmitCardSlugUnique(slug,id)))return{success:false,error:'An admit card with this slug already exists.'};
  const {data:oldData}=await supabaseAdmin.from('admit_cards').select('*').eq('id',id).maybeSingle();
  if(!oldData)return{success:false,error:'Admit card not found.'};
  const {data:updated,error}=await supabaseAdmin.from('admit_cards').update({
    title:data.title.trim(),slug,organization_id:data.organization_id||null,recruitment_id:data.recruitment_id||null,
    exam_date:data.exam_date||null,release_date:data.release_date||null,status:data.status||'available',
    description:data.description.trim()||null,official_url:data.official_url||null,updated_at:new Date().toISOString()
  }).eq('id',id).select().single();
  if(error)return{success:false,error:error.message};
  await logAudit({userId:admin.id,action:'update',entityType:'admit_card',entityId:id,oldData:oldData as Record<string,unknown>,newData:updated as Record<string,unknown>});
  revalidatePath('/admin/admit-cards');revalidatePath('/admit-cards');revalidatePath('/admit-cards/'+slug);
  return{success:true};
}

export async function publishAdmitCard(id:string):Promise<{success:boolean;error?:string}>{
  const admin=await requireAdmin();const {data:oldData}=await supabaseAdmin.from('admit_cards').select('*').eq('id',id).maybeSingle();
  if(!oldData)return{success:false,error:'Admit card not found.'};
  if(!oldData.official_url)return{success:false,error:'Official admit card URL is required before publishing.'};
  const {data:updated,error}=await supabaseAdmin.from('admit_cards').update({is_published:true,updated_at:new Date().toISOString()}).eq('id',id).select().single();
  if(error)return{success:false,error:error.message};
  await logAudit({userId:admin.id,action:'publish',entityType:'admit_card',entityId:id,oldData:oldData as Record<string,unknown>,newData:updated as Record<string,unknown>});
  revalidatePath('/admin/admit-cards');revalidatePath('/admit-cards');return{success:true};
}

export async function unpublishAdmitCard(id:string):Promise<{success:boolean;error?:string}>{
  const admin=await requireAdmin();const {data:oldData}=await supabaseAdmin.from('admit_cards').select('*').eq('id',id).maybeSingle();
  if(!oldData)return{success:false,error:'Admit card not found.'};
  const {data:updated,error}=await supabaseAdmin.from('admit_cards').update({is_published:false,updated_at:new Date().toISOString()}).eq('id',id).select().single();
  if(error)return{success:false,error:error.message};
  await logAudit({userId:admin.id,action:'unpublish',entityType:'admit_card',entityId:id,oldData:oldData as Record<string,unknown>,newData:updated as Record<string,unknown>});
  revalidatePath('/admin/admit-cards');revalidatePath('/admit-cards');return{success:true};
}

export async function archiveAdmitCard(id:string):Promise<{success:boolean;error?:string}>{
  const admin=await requireAdmin();const {data:oldData}=await supabaseAdmin.from('admit_cards').select('*').eq('id',id).maybeSingle();
  if(!oldData)return{success:false,error:'Admit card not found.'};
  const {data:updated,error}=await supabaseAdmin.from('admit_cards').update({is_published:false,archived_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',id).select().single();
  if(error)return{success:false,error:error.message};
  await logAudit({userId:admin.id,action:'archive',entityType:'admit_card',entityId:id,oldData:oldData as Record<string,unknown>,newData:updated as Record<string,unknown>});
  revalidatePath('/admin/admit-cards');revalidatePath('/admit-cards');return{success:true};
}

async function isAdmitCardSlugUnique(slug:string,excludeId?:string){
 let q=supabaseAdmin.from('admit_cards').select('id').eq('slug',slug);
 if(excludeId)q=q.neq('id',excludeId);
 const {data}=await q.limit(1);return !data?.length;
}


export interface NotificationFormData { title:string; message:string; notification_type:string; related_recruitment_id:string; audience:'all'|'job_alert_subscribers'; }

export async function sendAdminNotification(data:NotificationFormData):Promise<{success:boolean;error?:string;count?:number}>{
 const admin=await requireAdmin();
 if(!data.title.trim())return{success:false,error:'Notification title is required.'};
 let userIds:string[]=[];
 if(data.audience==='all'){
  const {data:users,error}=await supabaseAdmin.from('profiles').select('user_id').not('user_id','is',null);
  if(error)return{success:false,error:error.message}; userIds=(users??[]).map((u:{user_id:string})=>u.user_id);
 }else{
  const {data:subs,error}=await supabaseAdmin.from('notification_subscriptions').select('user_id');
  if(error)return{success:false,error:error.message}; userIds=Array.from(new Set((subs??[]).map((u:{user_id:string})=>u.user_id)));
 }
 if(!userIds.length)return{success:false,error:'No eligible users found.'};
 const rows=userIds.map(user_id=>({user_id,title:data.title.trim(),message:data.message.trim()||null,notification_type:data.notification_type||'announcement',related_recruitment_id:data.related_recruitment_id||null,is_read:false}));
 const {error}=await supabaseAdmin.from('notifications').insert(rows);
 if(error)return{success:false,error:error.message};
 await logAudit({userId:admin.id,action:'create',entityType:'notification_broadcast',entityId:admin.id,newData:{audience:data.audience,title:data.title,count:userIds.length}});
 revalidatePath('/admin/notifications');revalidatePath('/dashboard/notification-center');
 return{success:true,count:userIds.length};
}

export interface OrganizationFormData { name:string; slug:string; short_name:string; organization_type:string; description:string; official_website_url:string; logo_url:string; is_active:boolean; }
export async function createOrganization(data:OrganizationFormData){const admin=await requireAdmin();const slug=slugify(data.slug);const {data:exists}=await supabaseAdmin.from('organizations').select('id').eq('slug',slug).limit(1);if(exists?.length)return{success:false,error:'An organization with this slug already exists.'};const{data:created,error}=await supabaseAdmin.from('organizations').insert({...data,name:data.name.trim(),slug,short_name:data.short_name.trim()||null,organization_type:data.organization_type.trim()||null,description:data.description.trim()||null,official_website_url:data.official_website_url||null,logo_url:data.logo_url||null}).select().single();if(error)return{success:false,error:error.message};await logAudit({userId:admin.id,action:'create',entityType:'organization',entityId:created.id,newData:created as Record<string,unknown>});revalidatePath('/admin/organizations');return{success:true,id:created.id};}
export async function updateOrganization(id:string,data:OrganizationFormData){const admin=await requireAdmin();const slug=slugify(data.slug);const{data:exists}=await supabaseAdmin.from('organizations').select('id').eq('slug',slug).neq('id',id).limit(1);if(exists?.length)return{success:false,error:'An organization with this slug already exists.'};const{data:oldData}=await supabaseAdmin.from('organizations').select('*').eq('id',id).maybeSingle();if(!oldData)return{success:false,error:'Organization not found.'};const{data:updated,error}=await supabaseAdmin.from('organizations').update({...data,name:data.name.trim(),slug,short_name:data.short_name.trim()||null,organization_type:data.organization_type.trim()||null,description:data.description.trim()||null,official_website_url:data.official_website_url||null,logo_url:data.logo_url||null,updated_at:new Date().toISOString()}).eq('id',id).select().single();if(error)return{success:false,error:error.message};await logAudit({userId:admin.id,action:'update',entityType:'organization',entityId:id,oldData:oldData as Record<string,unknown>,newData:updated as Record<string,unknown>});revalidatePath('/admin/organizations');revalidatePath('/jobs');return{success:true};}

export interface CategoryFormData { name:string; slug:string; description:string; is_active:boolean; }
export async function createCategory(data:CategoryFormData){const admin=await requireAdmin();const slug=slugify(data.slug);const{data:exists}=await supabaseAdmin.from('categories').select('id').eq('slug',slug).limit(1);if(exists?.length)return{success:false,error:'A category with this slug already exists.'};const{data:created,error}=await supabaseAdmin.from('categories').insert({name:data.name.trim(),slug,description:data.description.trim()||null,is_active:data.is_active}).select().single();if(error)return{success:false,error:error.message};await logAudit({userId:admin.id,action:'create',entityType:'category',entityId:created.id,newData:created as Record<string,unknown>});revalidatePath('/admin/categories');revalidatePath('/jobs');return{success:true,id:created.id};}
export async function updateCategory(id:string,data:CategoryFormData){const admin=await requireAdmin();const slug=slugify(data.slug);const{data:exists}=await supabaseAdmin.from('categories').select('id').eq('slug',slug).neq('id',id).limit(1);if(exists?.length)return{success:false,error:'A category with this slug already exists.'};const{data:oldData}=await supabaseAdmin.from('categories').select('*').eq('id',id).maybeSingle();if(!oldData)return{success:false,error:'Category not found.'};const{data:updated,error}=await supabaseAdmin.from('categories').update({name:data.name.trim(),slug,description:data.description.trim()||null,is_active:data.is_active,updated_at:new Date().toISOString()}).eq('id',id).select().single();if(error)return{success:false,error:error.message};await logAudit({userId:admin.id,action:'update',entityType:'category',entityId:id,oldData:oldData as Record<string,unknown>,newData:updated as Record<string,unknown>});revalidatePath('/admin/categories');revalidatePath('/jobs');return{success:true};}

export interface StateFormData { name:string; slug:string; is_active:boolean; }
export async function createState(data:StateFormData){const admin=await requireAdmin();const slug=slugify(data.slug);const{data:exists}=await supabaseAdmin.from('states').select('id').eq('slug',slug).limit(1);if(exists?.length)return{success:false,error:'A state with this slug already exists.'};const{data:created,error}=await supabaseAdmin.from('states').insert({name:data.name.trim(),slug,is_active:data.is_active}).select().single();if(error)return{success:false,error:error.message};await logAudit({userId:admin.id,action:'create',entityType:'state',entityId:created.id,newData:created as Record<string,unknown>});revalidatePath('/admin/states');revalidatePath('/jobs');return{success:true,id:created.id};}
export async function updateState(id:string,data:StateFormData){const admin=await requireAdmin();const slug=slugify(data.slug);const{data:exists}=await supabaseAdmin.from('states').select('id').eq('slug',slug).neq('id',id).limit(1);if(exists?.length)return{success:false,error:'A state with this slug already exists.'};const{data:oldData}=await supabaseAdmin.from('states').select('*').eq('id',id).maybeSingle();if(!oldData)return{success:false,error:'State not found.'};const{data:updated,error}=await supabaseAdmin.from('states').update({name:data.name.trim(),slug,is_active:data.is_active}).eq('id',id).select().single();if(error)return{success:false,error:error.message};await logAudit({userId:admin.id,action:'update',entityType:'state',entityId:id,oldData:oldData as Record<string,unknown>,newData:updated as Record<string,unknown>});revalidatePath('/admin/states');revalidatePath('/jobs');return{success:true};}

export interface UserRoleFormData { user_id:string; role:'user'|'admin'; }
export async function updateUserRole(data:UserRoleFormData):Promise<{success:boolean;error?:string}>{
  const admin=await requireAdmin();
  if(data.user_id===admin.id)return{success:false,error:'You cannot change your own admin role.'};
  const{data:profile}=await supabaseAdmin.from('profiles').select('id,user_id,role').eq('user_id',data.user_id).maybeSingle();
  if(!profile)return{success:false,error:'User profile not found.'};
  const{error:authError}=await supabaseAdmin.auth.admin.updateUserById(data.user_id,{app_metadata:{role:data.role}});
  if(authError)return{success:false,error:authError.message};
  const{error}=await supabaseAdmin.from('profiles').update({role:data.role,updated_at:new Date().toISOString()}).eq('user_id',data.user_id);
  if(error)return{success:false,error:error.message};
  await logAudit({userId:admin.id,action:'update_role',entityType:'user',entityId:data.user_id,oldData:{role:profile.role},newData:{role:data.role}});
  revalidatePath('/admin/users');return{success:true};
}
export interface SiteSettingFormData { key:string; value:string; description:string; }
export async function upsertSiteSetting(data:SiteSettingFormData):Promise<{success:boolean;error?:string}>{
  const admin=await requireAdmin();const key=data.key.trim().toLowerCase().replace(/\\s+/g,'_');
  if(!key)return{success:false,error:'Setting key is required.'};
  const{data:oldData}=await supabaseAdmin.from('site_settings').select('*').eq('key',key).maybeSingle();
  const{data:updated,error}=await supabaseAdmin.from('site_settings').upsert({key,value:data.value,description:data.description.trim()||null,updated_at:new Date().toISOString()},{onConflict:'key'}).select().single();
  if(error)return{success:false,error:error.message};
  await logAudit({userId:admin.id,action:oldData?'update':'create',entityType:'site_setting',entityId:updated.id,oldData:oldData as Record<string,unknown>|null,newData:updated as Record<string,unknown>});
  revalidatePath('/admin/settings');return{success:true};
}
