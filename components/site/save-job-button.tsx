'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SaveJobButtonProps {
  jobId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'outline' | 'default';
}

export function SaveJobButton({
  jobId,
  className,
  size = 'default',
  variant = 'outline',
}: SaveJobButtonProps) {
  const [saved, setSaved] = useState(false);

  const handleClick = () => {
    setSaved((prev) => !prev);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved jobs' : 'Save this job'}
      aria-pressed={saved}
      data-job-id={jobId}
      size={size}
      variant={saved ? 'default' : variant}
      className={cn(saved && 'gap-2', className)}
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Save Job
        </>
      )}
    </Button>
  );
}
