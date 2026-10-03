/**
 * Server-side admin authorization.
 *
 * Uses raw_app_meta_data (set by the service role, user-immutable) to
 * determine if the authenticated user is an admin. This is checked
 * server-side on every admin route — never trusted from the client.
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Get the current user's session from the cookie-based Supabase auth.
 * Returns null if not authenticated.
 */
async function getSessionUser() {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Restore the session from cookies
  const authCookie = allCookies.find(
    (c) =>
      c.name.startsWith('sb-') &&
      c.name.endsWith('-auth-token')
  );

  if (!authCookie) return null;

  // Use getUser to verify the JWT is valid
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Check if the current request is from an authenticated admin.
 * Returns the user object if admin, null otherwise.
 */
export async function getAdminUser() {
  const user = await getSessionUser();
  if (!user) return null;

  // Check app_metadata.role — this is set server-side and user-immutable
  const role = user.app_metadata?.role;
  if (role !== 'admin') return null;

  return user;
}

/**
 * Require admin access. If the user is not an authenticated admin,
 * redirect to /admin/login.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/login');
  }
  return user;
}

/**
 * Check admin status without redirecting.
 * Useful for layout components that need conditional rendering.
 */
export async function checkAdmin() {
  return await getAdminUser();
}
