import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveFilter {
  group: string;
  value: string;
  label: string;
}

interface FilterChipsProps {
  filters: ActiveFilter[];
  onRemove: (group: string, value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter) => (
        <span
          key={`${filter.group}-${filter.value}`}
          className="inline-flex items-center gap-1.5 rounded-full border bg-card py-1 pl-3 pr-1.5 text-xs font-medium shadow-sm"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => onRemove(filter.group, filter.value)}
            aria-label={`Remove filter ${filter.label}`}
            className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Clear All
      </button>
    </div>
  );
}
