'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  jobId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function BookmarkButton({ jobId, className, size = 'md' }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      const { data } = await supabase.from('saved_jobs').select('id').eq('user_id', user.id).eq('recruitment_id', jobId).maybeSingle();
      if (active) setSaved(Boolean(data));
    }
    load();
    return () => { active = false; };
  }, [jobId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname);
      return;
    }
    if (saved) {
      const { error } = await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('recruitment_id', jobId);
      if (!error) setSaved(false);
    } else {
      const { error } = await supabase.from('saved_jobs').insert({ user_id: user.id, recruitment_id: jobId });
      if (!error) setSaved(true);
    }
    setBusy(false);
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-4.5 w-4.5';

  return (
    <button type="button" onClick={handleClick} disabled={busy}
      aria-label={saved ? 'Remove from saved jobs' : 'Save this job'} aria-pressed={saved} data-job-id={jobId}
      className={cn('inline-flex items-center justify-center rounded-md border transition-colors disabled:cursor-wait disabled:opacity-70',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        saved ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary', className)}>
      {busy ? <Loader2 className={cn(iconSize, 'animate-spin')} /> : <Bookmark className={cn(iconSize, saved && 'fill-primary')} />}
    </button>
  );
}