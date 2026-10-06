import Link from 'next/link';
import { Building2, CalendarDays, Download, ChevronRight, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { formatDate } from '@/lib/format';
import type { AdmitCardListing } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AdmitCardCardProps {
  admitCard: AdmitCardListing;
  className?: string;
}

export function AdmitCardCard({ admitCard, className }: AdmitCardCardProps) {
  return (
    <Card
      className={cn(
        'group flex items-center gap-3 p-3.5 transition-all hover:shadow-card-hover',
        className
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
        <FileText className="h-5 w-5" />
      </span>
      <Link href={`/admit-cards/${admitCard.id}`} className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold leading-tight group-hover:text-primary">
          {admitCard.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{admitCard.organization}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" />
          Exam: {admitCard.examDate ? formatDate(admitCard.examDate) : 'Not specified'}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Released: {admitCard.releaseDate ? formatDate(admitCard.releaseDate) : 'Not specified'}
        </p>
        {admitCard.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {admitCard.description}
          </p>
        )}
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusBadge status={admitCard.status} />
        {admitCard.downloadAvailable ? (
          <Button asChild size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs">
            <Link href={admitCard.officialUrl || `/admit-cards/${admitCard.id}`}>
              <Download className="h-3 w-3" />
              View
            </Link>
          </Button>
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </Card>
  );
}
