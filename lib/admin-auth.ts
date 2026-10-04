/**
 * Server-side admin authorization.
 * Admin sessions are stored in an HttpOnly cookie created only after
 * Supabase Auth has verified the access token and admin role.
 */
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_COOKIE = 'sarkarisetu-admin-token';

async function getSessionUser() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function getAdminUser() {
  const user = await getSessionUser();
  if (!user || user.app_metadata?.role !== 'admin') return null;
  return user;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  return user;
}

export async function checkAdmin() {
  return getAdminUser();
}
