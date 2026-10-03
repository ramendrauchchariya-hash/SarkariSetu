'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterGroup } from './filter-group';
import {
  qualificationOptions,
  departmentOptions,
  stateOptions,
  jobStatusOptions,
  jobTypeOptions,
  salaryRanges,
} from '@/lib/job-filters';

export interface JobFilterState {
  qualifications: string[];
  departments: string[];
  states: string[];
  statuses: string[];
  jobTypes: string[];
  salaryRanges: string[];
}

interface JobFiltersSidebarProps {
  filters: JobFilterState;
  onToggle: (group: keyof JobFilterState, value: string) => void;
  onClear: () => void;
  variant?: 'sidebar' | 'sheet';
}

export function JobFiltersSidebar({
  filters,
  onToggle,
  onClear,
  variant = 'sidebar',
}: JobFiltersSidebarProps) {
  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

  const content = (
    <div className="space-y-0">
      <div className="flex items-center justify-between pb-3">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 gap-1.5 px-2 text-xs text-primary hover:text-primary/80"
          >
            <RotateCcw className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <FilterGroup
        title="Qualification"
        options={qualificationOptions}
        selectedValues={filters.qualifications}
        onToggle={(v) => onToggle('qualifications', v)}
      />
      <FilterGroup
        title="Department"
        options={departmentOptions}
        selectedValues={filters.departments}
        onToggle={(v) => onToggle('departments', v)}
      />
      <FilterGroup
        title="State / Location"
        options={stateOptions}
        selectedValues={filters.states}
        onToggle={(v) => onToggle('states', v)}
        defaultOpen={false}
      />
      <FilterGroup
        title="Job Status"
        options={jobStatusOptions}
        selectedValues={filters.statuses}
        onToggle={(v) => onToggle('statuses', v)}
      />
      <FilterGroup
        title="Job Type"
        options={jobTypeOptions}
        selectedValues={filters.jobTypes}
        onToggle={(v) => onToggle('jobTypes', v)}
      />
      <FilterGroup
        title="Salary Range"
        options={salaryRanges}
        selectedValues={filters.salaryRanges}
        onToggle={(v) => onToggle('salaryRanges', v)}
      />
    </div>
  );

  if (variant === 'sheet') {
    return <div className="px-1 pb-6">{content}</div>;
  }

  return (
    <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <ScrollArea className="h-[calc(100vh-8rem)] pr-3">
        {content}
      </ScrollArea>
    </div>
  );
}
