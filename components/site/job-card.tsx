import Link from 'next/link';
import { Building2, MapPin, Users, CalendarClock, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { BookmarkButton } from './bookmark-button';
import { formatDate, daysUntil, formatPosts } from '@/lib/format';
import type { JobListing } from '@/lib/types';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: JobListing;
  className?: string;
  showBookmark?: boolean;
}

export function JobCard({ job, className, showBookmark = true }: JobCardProps) {
  const daysLeft = daysUntil(job.applicationDeadline);
  const closingSoon = job.status === 'active' && daysLeft <= 7 && daysLeft >= 0;

  return (
    <Card
      className={cn(
        'group flex h-full flex-col p-4 transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/jobs/${job.id}`} className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight text-foreground group-hover:text-primary line-clamp-2">
            {job.title}
          </h3>
        </Link>
        {showBookmark && <BookmarkButton jobId={job.id} size="sm" className="shrink-0" />}
      </div>

      <Link href={`/jobs/${job.id}`} className="mt-1.5 block">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.organization}</span>
        </p>
      </Link>

      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge status={job.status} />
        {closingSoon && (
          <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
            {daysLeft} day{daysLeft === 1 ? '' : 's'} left
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.location}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>{formatPosts(job.posts)} posts</span>
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{formatDate(job.applicationDeadline)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate font-medium text-foreground/70">{job.salary}</span>
        </span>
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-muted-foreground">
          Qualification:{' '}
          <span className="font-medium text-foreground/80">
            {job.qualification}
          </span>
        </p>
      </div>
    </Card>
  );
}
