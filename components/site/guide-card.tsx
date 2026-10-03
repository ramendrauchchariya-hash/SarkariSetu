import Link from 'next/link';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import type { GuideArticle } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GuideCardProps {
  guide: GuideArticle;
  className?: string;
}

export function GuideCard({ guide, className }: GuideCardProps) {
  return (
    <Link href={`/guides/${guide.id}`} className="block">
      <Card
        className={cn(
          'group flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
          className
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
          <BookOpen className="h-5 w-5" />
        </span>

        <span className="mt-3 inline-block w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {guide.category}
        </span>

        <h3 className="mt-2 font-semibold leading-tight group-hover:text-primary line-clamp-2">
          {guide.title}
        </h3>

        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
          {guide.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {guide.readTime}
          </span>
          <span className="flex items-center gap-1 font-semibold text-secondary transition-transform group-hover:translate-x-0.5">
            Read
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
