/**
 * Server-side data access for public pages.
 *
 * Uses the admin client (service role) for server components so that
 * data is available during SSR without auth context. Only published,
 * non-archived data is returned.
 */

import { supabaseAdmin } from './supabase-server';
import type {
  RecruitmentWithOrg,
  RecruitmentStatus,
  Result,
  AdmitCard,
  Organization,
  Category,
} from './database-types';
import type { RecruitmentDetail } from './data-recruitments';
import { computeRecruitmentStatus } from './recruitment-status';
import type {
  Post,
  Vacancy,
  ImportantDate,
  ApplicationFee,
  SelectionProcessStep,
  ExamPatternSubject,
  DocumentRequired,
  HowToApplyStep,
  Faq,
} from './database-types';

const RECRUITMENT_SELECT = `
  *,
  organization:organizations(
    id, name, slug, short_name, official_website_url
  ),
  categories:recruitment_categories(
    category:categories(id, name, slug)
  )
`;

function mapCategories(r: Record<string, unknown>): { id: string; name: string; slug: string }[] {
  const cats = (r.categories ?? []) as Array<{ category: { id: string; name: string; slug: string } }>;
  return cats.map((rc) => rc.category).filter(Boolean);
}

function toRecruitmentWithOrg(r: Record<string, unknown>): RecruitmentWithOrg {
  return {
    ...(r as unknown as RecruitmentWithOrg),
    organization: (r.organization ?? null) as RecruitmentWithOrg['organization'],
    categories: mapCategories(r),
  };
}

export async function serverGetPublishedRecruitments(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  status?: RecruitmentStatus;
}): Promise<{ data: RecruitmentWithOrg[]; total: number }> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('recruitments')
    .select(RECRUITMENT_SELECT, { count: 'exact' })
    .eq('is_published', true)
    .eq('is_archived', false)
    .order('posted_date', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }
  if (options?.department) {
    query = query.eq('department', options.department);
  }

  const { data, count } = await query;

  if (!data) return { data: [], total: 0 };
  return { data: data.map(toRecruitmentWithOrg), total: count ?? 0 };
}

export async function serverGetRecruitmentBySlug(slug: string): Promise<RecruitmentDetail | null> {
  const { data: recruitment, error } = await supabaseAdmin
    .from('recruitments')
    .select(RECRUITMENT_SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .eq('is_archived', false)
    .maybeSingle();

  if (error || !recruitment) return null;

  const r = recruitment as Record<string, unknown>;
  const recruitmentId = r.id as string;

  const [postsResult, feesResult, datesResult, selectionResult, examPatternResult, documentsResult, howToApplyResult, faqsResult] = await Promise.all([
    supabaseAdmin.from('posts').select('*').eq('recruitment_id', recruitmentId),
    supabaseAdmin.from('application_fees').select('*').eq('recruitment_id', recruitmentId),
    supabaseAdmin.from('important_dates').select('*').eq('recruitment_id', recruitmentId).order('date_value'),
    supabaseAdmin.from('selection_process').select('*').eq('recruitment_id', recruitmentId).order('step_number'),
    supabaseAdmin.from('exam_patterns').select('*').eq('recruitment_id', recruitmentId),
    supabaseAdmin.from('documents_required').select('*').eq('recruitment_id', recruitmentId),
    supabaseAdmin.from('how_to_apply').select('*').eq('recruitment_id', recruitmentId).order('step_number'),
    supabaseAdmin.from('faqs').select('*').eq('recruitment_id', recruitmentId).order('display_order'),
  ]);

  const postIds = (postsResult.data ?? []).map((p) => p.id);
  let vacancies: Vacancy[] = [];
  if (postIds.length > 0) {
    const { data: vacancyData } = await supabaseAdmin
      .from('vacancies')
      .select('*')
      .in('post_id', postIds);
    vacancies = (vacancyData ?? []) as Vacancy[];
  }

  const base = toRecruitmentWithOrg(r);
  return {
    ...base,
    posts: (postsResult.data ?? []) as Post[],
    vacancies,
    important_dates: (datesResult.data ?? []) as ImportantDate[],
    application_fees: (feesResult.data ?? []) as ApplicationFee[],
    selection_process: (selectionResult.data ?? []) as SelectionProcessStep[],
    exam_patterns: (examPatternResult.data ?? []) as ExamPatternSubject[],
    documents_required: (documentsResult.data ?? []) as DocumentRequired[],
    how_to_apply: (howToApplyResult.data ?? []) as HowToApplyStep[],
    faqs: (faqsResult.data ?? []) as Faq[],
    computed_status: computeRecruitmentStatus(base),
  };
}

export async function serverGetRelatedRecruitments(
  recruitment: Pick<RecruitmentWithOrg, 'id' | 'organization_id' | 'department'>,
  limit = 4
): Promise<RecruitmentWithOrg[]> {
  let query = supabaseAdmin
    .from('recruitments')
    .select(RECRUITMENT_SELECT)
    .eq('is_published', true)
    .eq('is_archived', false)
    .neq('id', recruitment.id)
    .order('posted_date', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (recruitment.organization_id) {
    query = query.eq('organization_id', recruitment.organization_id);
  } else if (recruitment.department) {
    query = query.eq('department', recruitment.department);
  }

  const { data } = await query;
  if (!data) return [];
  return data.map(toRecruitmentWithOrg);
}

export async function serverGetAllPublishedSlugs(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('recruitments')
    .select('slug')
    .eq('is_published', true)
    .eq('is_archived', false);

  if (error || !data) return [];
  return data.map((r) => r.slug);
}

export async function serverGetClosingSoon(limit = 6): Promise<RecruitmentWithOrg[]> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const { data } = await supabaseAdmin
    .from('recruitments')
    .select(RECRUITMENT_SELECT)
    .eq('is_published', true)
    .eq('is_archived', false)
    .gte('application_end', today)
    .order('application_end', { ascending: true })
    .limit(limit);

  if (!data) return [];
  return data.map(toRecruitmentWithOrg);
}

export async function serverGetLatestRecruitments(limit = 6): Promise<RecruitmentWithOrg[]> {
  const { data } = await supabaseAdmin
    .from('recruitments')
    .select(RECRUITMENT_SELECT)
    .eq('is_published', true)
    .eq('is_archived', false)
    .order('posted_date', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (!data) return [];
  return data.map(toRecruitmentWithOrg);
}

export async function serverGetPublishedResults(limit = 5): Promise<(Result & { organization_name: string | null })[]> {
  const { data } = await supabaseAdmin
    .from('results')
    .select(`*, organization:organizations(name)`)
    .eq('is_published', true)
    .order('result_date', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (!data) return [];
  return data.map((r) => ({
    ...(r as Result),
    organization_name: (r.organization as { name: string } | null)?.name ?? null,
  }));
}

export async function serverGetPublishedAdmitCards(limit = 4): Promise<(AdmitCard & { organization_name: string | null })[]> {
  const { data } = await supabaseAdmin
    .from('admit_cards')
    .select(`*, organization:organizations(name)`)
    .eq('is_published', true)
    .order('exam_date', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (!data) return [];
  return data.map((r) => ({
    ...(r as AdmitCard),
    organization_name: (r.organization as { name: string } | null)?.name ?? null,
  }));
}

export async function serverGetCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return (data ?? []) as Category[];
}

export async function serverGetOrganizations(): Promise<Organization[]> {
  const { data } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return (data ?? []) as Organization[];
}

export async function serverGetRecruitmentCountByCategory(): Promise<Map<string, number>> {
  const { data } = await supabaseAdmin
    .from('recruitments')
    .select(`
      id,
      is_published,
      is_archived,
      categories:recruitment_categories(category:categories(slug))
    `)
    .eq('is_published', true)
    .eq('is_archived', false);

  const map = new Map<string, number>();
  if (!data) return map;
  for (const r of data) {
    const cats = (r.categories ?? []) as unknown as Array<{ category: { slug: string } }>;
    for (const rc of cats) {
      const slug = rc.category?.slug;
      if (slug) {
        map.set(slug, (map.get(slug) ?? 0) + 1);
      }
    }
  }
  return map;
}

export async function serverGetTotalVacancies(r: RecruitmentWithOrg): Promise<{ total: number; salaryMin: number; salaryMax: number }> {
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('id, salary_min, salary_max')
    .eq('recruitment_id', r.id);

  if (!posts || posts.length === 0) {
    return { total: 0, salaryMin: 0, salaryMax: 0 };
  }

  const postIds = posts.map((p) => p.id);
  const { data: vacancies } = await supabaseAdmin
    .from('vacancies')
    .select('vacancy_count')
    .in('post_id', postIds);

  const total = (vacancies ?? []).reduce((sum, v) => sum + (v.vacancy_count ?? 0), 0);
  const salaryMin = Math.min(...posts.map((p) => p.salary_min ?? Infinity));
  const salaryMax = Math.max(...posts.map((p) => p.salary_max ?? 0));

  return {
    total,
    salaryMin: salaryMin === Infinity ? 0 : salaryMin,
    salaryMax,
  };
}
