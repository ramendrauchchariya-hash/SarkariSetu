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
    const postId = postIdMap[v.post_index];
    if (!postId) continue;
    await supabaseAdmin.from('vacancies').insert({
      post_id: postId,
      state_id: v.state_id || null,
      category_name: v.category_name,
      vacancy_count: parseInt(v.vacancy_count, 10),
    });
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
