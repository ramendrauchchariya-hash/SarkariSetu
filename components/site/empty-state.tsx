import { SearchX, RotateCcw, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  onBrowseAll?: () => void;
}

export function EmptyState({
  title = 'No jobs found',
  description = 'Try removing a filter or changing your search to find more opportunities.',
  onClearFilters,
  onBrowseAll,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <SearchX className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {onClearFilters && (
          <Button onClick={onClearFilters} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
        {onBrowseAll && (
          <Button onClick={onBrowseAll} size="sm" className="gap-2">
            <Compass className="h-4 w-4" />
            Browse All Jobs
          </Button>
        )}
      </div>
    </div>
  );
}
