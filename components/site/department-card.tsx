import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import type { Department } from '@/lib/types';

interface DepartmentCardProps {
  department: Department;
  className?: string;
}

export function DepartmentCard({ department, className }: DepartmentCardProps) {
  const Icon = (Icons[department.icon as keyof typeof Icons] ??
    Icons.Building2) as Icons.LucideIcon;

  return (
    <Link
      href={`/jobs?department=${department.slug}`}
      className={cn(
        'group flex flex-col items-center gap-2.5 rounded-xl border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover',
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold leading-tight">
        {department.label}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatCount(department.count)} openings
      </span>
    </Link>
  );
}
