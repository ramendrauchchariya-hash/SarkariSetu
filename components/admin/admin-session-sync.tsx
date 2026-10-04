'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

export function AdminSessionSync() {
  useEffect(() => {
    const sync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch('/api/admin/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token }),
          credentials: 'same-origin',
        });
      }
    };

    void sync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        void fetch('/api/admin/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token }),
          credentials: 'same-origin',
        });
      } else if (event === 'SIGNED_OUT') {
        void fetch('/api/admin/session', {
          method: 'DELETE',
          credentials: 'same-origin',
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
