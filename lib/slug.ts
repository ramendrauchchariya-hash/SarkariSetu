/**
 * Slug generation and validation utilities.
 */

/**
 * Convert a title into a URL-safe slug.
 * "SSC CGL Recruitment 2026" → "ssc-cgl-recruitment-2026"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if a slug is unique, excluding the current recruitment's own slug.
 */
export async function isSlugUnique(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const { supabaseAdmin } = await import('./supabase-server');
  let query = supabaseAdmin
    .from('recruitments')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Slug uniqueness check error:', error.message);
    return false;
  }

  return data === null;
}
