/**
 * Data-access layer for recruitments.
 *
 * All Supabase queries for recruitment data go through this module.
 * UI components import from here — they never write Supabase queries directly.
 *
 * The functions use the browser client (anon key) by default, which is
 * subject to Row Level Security. Only published recruitments are returned
 * to public users.
 */

import { supabase } from './supabase-client';
import type {
  Recruitment,
  RecruitmentWithOrg,
  Post,
  Vacancy,
  ImportantDate,
  ApplicationFee,
  SelectionProcessStep,
  ExamPatternSubject,
  DocumentRequired,
  HowToApplyStep,
  Faq,
  RecruitmentStatus,
} from './database-types';
import { computeRecruitmentStatus } from './recruitment-status';

export interface RecruitmentDetail extends RecruitmentWithOrg {
  posts: Post[];
  vacancies: Vacancy[];
  important_dates: ImportantDate[];
  application_fees: ApplicationFee[];
  selection_process: SelectionProcessStep[];
  exam_patterns: ExamPatternSubject[];
  documents_required: DocumentRequired[];
  how_to_apply: HowToApplyStep[];
  faqs: Faq[];
  computed_status: RecruitmentStatus;
}

/**
 * Fetch a single published recruitment by slug, with all related detail data.
 * Returns null if the slug doesn't exist or the recruitment is unpublished.
 *
 * Designed to replace the current getJobDetailsBySlug() mock function.
 */
export async function getRecruitmentBySlug(slug: string): Promise<RecruitmentDetail | null> {
  const { data: recruitment, error } = await supabase
    .from('recruitments')
    .select(
      `
        *,
        organization:organizations(
          id,
          name,
          slug,
          short_name,
          official_website_url
        ),
        categories:recruitment_categories(
          category:categories(
            id,
            name,
            slug
          )
        )
      `
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !recruitment) {
    return null;
  }

  const recruitmentId = recruitment.id;

  const [
    postsResult,
    feesResult,
    datesResult,
    selectionResult,
    examPatternResult,
    documentsResult,
    howToApplyResult,
    faqsResult,
  ] = await Promise.all([
    supabase.from('posts').select('*').eq('recruitment_id', recruitmentId),
    supabase.from('application_fees').select('*').eq('recruitment_id', recruitmentId),
    supabase.from('important_dates').select('*').eq('recruitment_id', recruitmentId).order('date_value'),
    supabase
      .from('selection_process')
      .select('*')
      .eq('recruitment_id', recruitmentId)
      .order('step_number'),
    supabase.from('exam_patterns').select('*').eq('recruitment_id', recruitmentId),
    supabase.from('documents_required').select('*').eq('recruitment_id', recruitmentId),
    supabase
      .from('how_to_apply')
      .select('*')
      .eq('recruitment_id', recruitmentId)
      .order('step_number'),
    supabase
      .from('faqs')
      .select('*')
      .eq('recruitment_id', recruitmentId)
      .order('display_order'),
  ]);

  const postIds = (postsResult.data ?? []).map((p) => p.id);
  let vacancies: Vacancy[] = [];
  if (postIds.length > 0) {
    const { data: vacancyData } = await supabase
      .from('vacancies')
      .select('*')
      .in('post_id', postIds);
    vacancies = vacancyData ?? [];
  }

  const categories = (recruitment.categories ?? []).map(
    (rc: { category: Pick<import('./database-types').Category, 'id' | 'name' | 'slug'> }) => rc.category
  ).filter(Boolean);

  return {
    ...recruitment,
    organization: recruitment.organization,
    categories,
    posts: postsResult.data ?? [],
    vacancies,
    important_dates: datesResult.data ?? [],
    application_fees: feesResult.data ?? [],
    selection_process: selectionResult.data ?? [],
    exam_patterns: examPatternResult.data ?? [],
    documents_required: documentsResult.data ?? [],
    how_to_apply: howToApplyResult.data ?? [],
    faqs: faqsResult.data ?? [],
    computed_status: computeRecruitmentStatus(recruitment),
  };
}

/**
 * Fetch a paginated list of published recruitments.
 * Returns recruitments with their organization and categories.
 */
export async function getPublishedRecruitments(options?: {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  status?: RecruitmentStatus;
}): Promise<{ data: RecruitmentWithOrg[]; total: number }> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('recruitments')
    .select(
      `
        *,
        organization:organizations(
          id,
          name,
          slug,
          short_name,
          official_website_url
        ),
        categories:recruitment_categories(
          category:categories(
            id,
            name,
            slug
          )
        )
      `,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .order('posted_date', { ascending: false })
    .range(from, to);

  if (options?.organizationId) {
    query = query.eq('organization_id', options.organizationId);
  }

  const { data, error, count } = await query;

  if (error || !data) {
    return { data: [], total: 0 };
  }

  const mapped: RecruitmentWithOrg[] = data.map((r) => ({
    ...r,
    organization: r.organization,
    categories: (r.categories ?? [])
      .map((rc: { category: Pick<import('./database-types').Category, 'id' | 'name' | 'slug'> }) => rc.category)
      .filter(Boolean),
  }));

  return { data: mapped, total: count ?? 0 };
}

/**
 * Get related recruitments by matching organization or categories.
 */
export async function getRelatedRecruitments(
  recruitment: Pick<Recruitment, 'id' | 'organization_id' | 'department'>,
  limit = 4
): Promise<RecruitmentWithOrg[]> {
  let query = supabase
    .from('recruitments')
    .select(
      `
        *,
        organization:organizations(
          id,
          name,
          slug,
          short_name,
          official_website_url
        ),
        categories:recruitment_categories(
          category:categories(
            id,
            name,
            slug
          )
        )
      `
    )
    .eq('is_published', true)
    .neq('id', recruitment.id)
    .order('posted_date', { ascending: false })
    .limit(limit);

  if (recruitment.organization_id) {
    query = query.eq('organization_id', recruitment.organization_id);
  } else if (recruitment.department) {
    query = query.eq('department', recruitment.department);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((r) => ({
    ...r,
    organization: r.organization,
    categories: (r.categories ?? [])
      .map((rc: { category: Pick<import('./database-types').Category, 'id' | 'name' | 'slug'> }) => rc.category)
      .filter(Boolean),
  }));
}

/**
 * Get all published recruitment slugs (for sitemap / generateStaticParams).
 */
export async function getAllPublishedSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('recruitments')
    .select('slug')
    .eq('is_published', true);

  if (error || !data) {
    return [];
  }

  return data.map((r) => r.slug);
}
