/**
 * Data-access layer for results, admit cards, and answer keys.
 */

import { supabase } from './supabase-client';
import type { Result, AdmitCard, AnswerKey } from './database-types';

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export async function getPublishedResults(options?: {
  page?: number;
  pageSize?: number;
  organizationId?: string;
}): Promise<{ data: (Result & { organization_name: string | null })[]; total: number }> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('results')
    .select(
      `
        *,
        organization:organizations(name)
      `,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .order('result_date', { ascending: false })
    .range(from, to);

  if (options?.organizationId) {
    query = query.eq('organization_id', options.organizationId);
  }

  const { data, error, count } = await query;

  if (error || !data) return { data: [], total: 0 };

  return {
    data: data.map((r) => ({
      ...r,
      organization_name: r.organization?.name ?? null,
    })),
    total: count ?? 0,
  };
}

export async function getResultBySlug(slug: string): Promise<Result | null> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

// ---------------------------------------------------------------------------
// Admit Cards
// ---------------------------------------------------------------------------

export async function getPublishedAdmitCards(options?: {
  page?: number;
  pageSize?: number;
  organizationId?: string;
}): Promise<{ data: (AdmitCard & { organization_name: string | null })[]; total: number }> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('admit_cards')
    .select(
      `
        *,
        organization:organizations(name)
      `,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .order('exam_date', { ascending: false })
    .range(from, to);

  if (options?.organizationId) {
    query = query.eq('organization_id', options.organizationId);
  }

  const { data, error, count } = await query;

  if (error || !data) return { data: [], total: 0 };

  return {
    data: data.map((r) => ({
      ...r,
      organization_name: r.organization?.name ?? null,
    })),
    total: count ?? 0,
  };
}

export async function getAdmitCardBySlug(slug: string): Promise<AdmitCard | null> {
  const { data, error } = await supabase
    .from('admit_cards')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

// ---------------------------------------------------------------------------
// Answer Keys
// ---------------------------------------------------------------------------

export async function getPublishedAnswerKeys(options?: {
  page?: number;
  pageSize?: number;
  organizationId?: string;
}): Promise<{ data: (AnswerKey & { organization_name: string | null })[]; total: number }> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('answer_keys')
    .select(
      `
        *,
        organization:organizations(name)
      `,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .order('release_date', { ascending: false })
    .range(from, to);

  if (options?.organizationId) {
    query = query.eq('organization_id', options.organizationId);
  }

  const { data, error, count } = await query;

  if (error || !data) return { data: [], total: 0 };

  return {
    data: data.map((r) => ({
      ...r,
      organization_name: r.organization?.name ?? null,
    })),
    total: count ?? 0,
  };
}

export async function getAnswerKeyBySlug(slug: string): Promise<AnswerKey | null> {
  const { data, error } = await supabase
    .from('answer_keys')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
