/**
 * Server-side Supabase client.
 *
 * Uses the service role key which bypasses Row Level Security.
 * This client must ONLY be used in server-side code (API routes,
 * server components, server actions) — never in browser code.
 *
 * Lazy initialization: the client is created on first access, not at
 * import time, so that Next.js build's page-data collection phase
 * (which runs without env vars) does not crash.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

      if (!supabaseUrl) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Check your .env file.');
      }

      if (!supabaseServiceKey) {
        throw new Error(
          'Missing SUPABASE_SERVICE_ROLE_KEY. This key is required for server-side ' +
            'database access and must not be exposed to the browser.'
        );
      }

      _client = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_client as any)[prop];
  },
});
