'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  jobId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function BookmarkButton({ jobId, className, size = 'md' }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => !prev);
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-4.5 w-4.5';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved jobs' : 'Save this job'}
      aria-pressed={saved}
      data-job-id={jobId}
      className={cn(
        'inline-flex items-center justify-center rounded-md border transition-colors',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        saved
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary',
        className
      )}
    >
      <Bookmark className={cn(iconSize, saved && 'fill-primary')} />
    </button>
  );
}
