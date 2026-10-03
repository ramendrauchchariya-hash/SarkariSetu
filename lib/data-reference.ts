/**
 * Data-access layer for reference data: organizations, categories, states.
 */

import { supabase } from './supabase-client';
import type { Organization, Category, State } from './database-types';

export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error || !data) return [];
  return data;
}

export async function getOrganizationsByType(type: string): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('is_active', true)
    .eq('organization_type', type)
    .order('name');

  if (error || !data) return [];
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error || !data) return [];
  return data;
}

export async function getStates(): Promise<State[]> {
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error || !data) return [];
  return data;
}
