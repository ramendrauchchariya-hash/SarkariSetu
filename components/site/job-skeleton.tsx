import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface JobSkeletonProps {
  className?: string;
}

export function JobSkeleton({ className }: JobSkeletonProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-4 h-px bg-muted" />
      <div className="mt-3 h-3.5 w-3/4 animate-pulse rounded bg-muted" />
    </Card>
  );
}

export function JobSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobSkeleton key={i} />
      ))}
    </div>
  );
}
