import Link from 'next/link';
import { Building2, CalendarClock, CalendarRange, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { formatDate, daysUntil, formatPosts } from '@/lib/format';
import type { ExamListing } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExamCardProps {
  exam: ExamListing;
  className?: string;
}

export function ExamCard({ exam, className }: ExamCardProps) {
  const daysLeft = daysUntil(exam.examDate);

  return (
    <Link href={`/exams/${exam.id}`} className="block">
      <Card
        className={cn(
          'group h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight group-hover:text-primary line-clamp-2">
            {exam.name}
          </h3>
          <StatusBadge status={exam.applicationStatus} className="shrink-0" />
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{exam.organization}</span>
        </p>

        <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(exam.examDate)}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {formatPosts(exam.posts)} posts
          </span>
        </div>

        {daysLeft >= 0 && (
          <p className="mt-2 text-xs font-semibold text-info">
            Exam in {daysLeft} day{daysLeft === 1 ? '' : 's'}
          </p>
        )}
      </Card>
    </Link>
  );
}

interface ExamTimelineItemProps {
  exam: ExamListing;
  className?: string;
}

export function ExamTimelineItem({ exam, className }: ExamTimelineItemProps) {
  const daysLeft = daysUntil(exam.examDate);

  return (
    <Link href={`/exams/${exam.id}`} className={cn('block', className)}>
      <div className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-card-hover">
        {/* Date block */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/5 py-2 text-center">
          <span className="text-lg font-bold leading-none text-primary">
            {new Date(exam.examDate).getDate()}
          </span>
          <span className="mt-0.5 text-xs font-medium uppercase text-muted-foreground">
            {new Date(exam.examDate).toLocaleDateString('en-IN', { month: 'short' })}
          </span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight group-hover:text-primary">
            {exam.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{exam.organization}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              Exam: {formatDate(exam.examDate)}
            </span>
            <span className="flex items-center gap-1">
              <CalendarRange className="h-3 w-3" />
              Apply by: {formatDate(exam.applicationDeadline)}
            </span>
          </div>
        </div>

        {/* Status + countdown */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={exam.applicationStatus} />
          {daysLeft >= 0 && (
            <span className="text-xs font-semibold text-info">
              {daysLeft} day{daysLeft === 1 ? '' : 's'} to go
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
