import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import type { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
  className?: string;
  variant?: 'compact' | 'detailed';
}

export function CategoryCard({ category, className, variant = 'compact' }: CategoryCardProps) {
  const Icon = (Icons[category.icon as keyof typeof Icons] ??
    Icons.Folder) as Icons.LucideIcon;

  if (variant === 'detailed') {
    return (
      <Link
        href={`/jobs?category=${category.slug}`}
        className={cn(
          'group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover',
          className
        )}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-semibold leading-tight">{category.label}</span>
          {category.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
        <span className="shrink-0 text-xs font-semibold text-primary">
          {formatCount(category.count)}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/jobs?category=${category.slug}`}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover',
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-sm font-semibold leading-tight">
        {category.label}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatCount(category.count)} jobs
      </span>
    </Link>
  );
}
