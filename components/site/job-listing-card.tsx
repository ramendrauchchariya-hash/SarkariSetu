import Link from 'next/link';
import { Building2, MapPin, Users, CalendarClock, Wallet, Briefcase, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookmarkButton } from './bookmark-button';
import { formatDate, daysUntil, formatPosts } from '@/lib/format';
import { jobStatusLabel, jobStatusVariant, jobTypeLabel } from '@/lib/job-filters';
import type { JobPosting } from '@/lib/types';
import { cn } from '@/lib/utils';

interface JobListingCardProps {
  job: JobPosting;
  className?: string;
}

function formatSalary(min: number, max: number): string {
  const fmt = (n: number) => n >= 100000
    ? `\u20b9 ${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
    : `\u20b9 ${n.toLocaleString('en-IN')}`;
  return `${fmt(min)} \u2013 ${fmt(max)}`;
}

export function JobListingCard({ job, className }: JobListingCardProps) {
  const daysLeft = daysUntil(job.applicationEnd);
  const isClosed = job.status === 'closed';
  const isClosingSoon = job.status === 'closing-soon';

  return (
    <Card
      className={cn(
        'group flex h-full flex-col p-4 transition-all hover:shadow-card-hover sm:p-5',
        className
      )}
    >
      {/* Header: org + title + bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.organization}</span>
          </p>
          <Link href={`/jobs/${job.slug}`}>
            <h3 className="mt-1 font-semibold leading-tight text-foreground group-hover:text-primary line-clamp-2">
              {job.title}
            </h3>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={jobStatusVariant[job.status]}>
            {jobStatusLabel[job.status]}
          </Badge>
          <BookmarkButton jobId={job.id} size="sm" />
        </div>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
          {jobTypeLabel[job.jobType]}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {job.discipline}
        </span>
      </div>

      {/* Details grid */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.location}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>{formatPosts(job.vacancies)} vacancies</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate font-medium text-foreground/70">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.qualification.replace(/-/g, ' ')}</span>
        </span>
      </div>

      {/* Deadline */}
      <div className="mt-3 border-t pt-3">
        {isClosed ? (
          <p className="text-xs font-semibold text-destructive">
            Application closed
          </p>
        ) : (
          <p className={cn(
            'flex items-center gap-1.5 text-xs',
            isClosingSoon ? 'font-semibold text-warning' : 'text-muted-foreground'
          )}>
            <CalendarClock className="h-3.5 w-3.5" />
            Apply by {formatDate(job.applicationEnd)}
            {daysLeft >= 0 && (
              <span className={cn(isClosingSoon && 'text-warning')}>
                {' '}&middot; {daysLeft === 0 ? 'last day' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
          <Link href={`/jobs/${job.slug}`}>
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
        {job.status !== 'closed' && job.status !== 'upcoming' && (
          <Button asChild size="sm" className="flex-1">
            <Link href={`/jobs/${job.slug}?action=apply`}>Apply</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
