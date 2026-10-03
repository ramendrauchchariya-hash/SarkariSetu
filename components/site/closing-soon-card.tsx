import Link from 'next/link';
import { Building2, CalendarClock, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, daysUntil, formatPosts } from '@/lib/format';
import type { JobListing } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ClosingSoonCardProps {
  job: JobListing;
  className?: string;
}

export function ClosingSoonCard({ job, className }: ClosingSoonCardProps) {
  const daysLeft = daysUntil(job.applicationDeadline);
  const urgent = daysLeft <= 3;

  return (
    <Card
      className={cn(
        'group flex h-full flex-col border-warning/30 p-4 transition-all hover:shadow-card-hover',
        className
      )}
    >
      {/* Days remaining badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold',
            urgent ? 'bg-warning/20 text-warning' : 'bg-warning/10 text-warning'
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {daysLeft <= 0 ? 'Last day' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
        </span>
      </div>

      <Link href={`/jobs/${job.id}`} className="min-w-0 flex-1">
        <h3 className="font-semibold leading-tight group-hover:text-primary line-clamp-2">
          {job.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.organization}</span>
        </p>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            Deadline: <span className="font-medium text-foreground/80">{formatDate(job.applicationDeadline)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.location}</span>
          </p>
          <p className="text-muted-foreground">
            Qualification:{' '}
            <span className="font-medium text-foreground/80">{job.qualification}</span>
          </p>
          <p className="text-muted-foreground">
            Vacancies:{' '}
            <span className="font-medium text-foreground/80">{formatPosts(job.posts)}</span>
          </p>
        </div>
      </Link>

      <Button asChild size="sm" className="mt-4 w-full gap-1.5">
        <Link href={`/jobs/${job.id}`}>
          Apply Now
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </Card>
  );
}
