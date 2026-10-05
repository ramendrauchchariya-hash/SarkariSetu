import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Building2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { formatDate, resultTypeConfig } from '@/lib/format';
import type { ResultListing, ResultType } from '@/lib/types';
import { cn } from '@/lib/utils';

const resultTypeIcons: Record<ResultType, string> = {
  'exam-result': 'FileCheck2',
  'merit-list': 'ListOrdered',
  cutoff: 'Scissors',
  scorecard: 'FileBarChart',
  'final-result': 'Trophy',
};

interface ResultCardProps {
  result: ResultListing;
  className?: string;
}

export function ResultCard({ result, className }: ResultCardProps) {
  const iconName = resultTypeIcons[result.resultType] ?? 'FileCheck2';
  const Icon = (Icons[iconName as keyof typeof Icons] ??
    Icons.FileCheck2) as Icons.LucideIcon;
  const typeConfig = resultTypeConfig[result.resultType];

  return (
    <Link href={`/results/${result.id}`} className="block">
      <Card
        className={cn(
          'group flex items-center gap-3 p-3.5 transition-all hover:shadow-card-hover',
          className
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
              {typeConfig.label}
            </span>
          </div>
          <h3 className="mt-1 truncate text-sm font-semibold leading-tight group-hover:text-primary">
            {result.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{result.organization}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Released: {result.resultDate ? formatDate(result.resultDate) : 'Not specified'}
          </p>
          {result.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {result.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={result.status} />
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </Card>
    </Link>
  );
}
