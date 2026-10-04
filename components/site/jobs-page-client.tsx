'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, Search } from 'lucide-react';

import { JobListingCard } from '@/components/site/job-listing-card';
import { JobFiltersSidebar, type JobFilterState } from '@/components/site/job-filters-sidebar';
import { FilterChips } from '@/components/site/filter-chips';
import { SortDropdown } from '@/components/site/sort-dropdown';
import { Pagination } from '@/components/site/pagination';
import { EmptyState } from '@/components/site/empty-state';
import { JobSkeletonList } from '@/components/site/job-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';

import {
  buildActiveFilterChips,
  filtersToSearchParams,
  searchParamsToFilters,
  EMPTY_FILTERS,
} from '@/lib/job-filter-logic';
import type { SortOption } from '@/lib/job-filters';
import type { JobPosting } from '@/lib/types';
import { JOBS_PER_PAGE } from '@/lib/job-filters';

interface JobsPageClientProps {
  jobs: JobPosting[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function JobsPageClient({ jobs, total, totalPages, currentPage }: JobsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initial = useMemo(
    () => searchParamsToFilters(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const [filters, setFilters] = useState<JobFilterState>(initial.filters);
  const [search, setSearch] = useState(initial.search);
  const [sort, setSort] = useState<SortOption>(initial.sort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Keep local controls synchronized with browser back/forward navigation.
  useEffect(() => {
    const next = searchParamsToFilters(new URLSearchParams(searchParams.toString()));
    setFilters(next.filters);
    setSearch(next.search);
    setSort(next.sort);
  }, [searchParams]);

  // Update the URL when the user changes filters/search/sort.
  useEffect(() => {
    const params = filtersToSearchParams(filters, search, sort, currentPage);
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    const currentQuery = searchParams.toString();
    if (queryString !== currentQuery) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, search, sort, currentPage, pathname, router, searchParams]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).reduce((sum, arr) => sum + arr.length, 0),
    [filters]
  );

  const activeChips = useMemo(() => buildActiveFilterChips(filters), [filters]);

  const toggleFilter = useCallback((group: keyof JobFilterState, value: string) => {
    setFilters((prev) => {
      const current = prev[group];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [group]: updated };
    });
  }, []);

  const removeFilter = useCallback((group: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group as keyof JobFilterState].filter((v) => v !== value),
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSearch('');
  }, []);

  const handlePageChange = (page: number) => {
    const params = filtersToSearchParams(filters, search, sort, page);
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newUrl);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startIdx = total === 0 ? 0 : (currentPage - 1) * JOBS_PER_PAGE;
  const endIdx = Math.min(startIdx + jobs.length, total);

  return (
    <>
      {/* Page header */}
      <section className="border-b bg-muted/20">
        <div className="container-page py-8 sm:py-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Government Jobs
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Explore the latest government job opportunities across India.
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="flex h-2 w-2 rounded-full bg-success animate-pulse-soft" />
              {total.toLocaleString('en-IN')} opportunities
            </p>
          </div>
        </div>
      </section>

      <div className="container-page py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
            <JobFiltersSidebar
              filters={filters}
              onToggle={toggleFilter}
              onClear={clearAllFilters}
            />
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Search bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const params = filtersToSearchParams(filters, search, sort, 1);
                router.replace(`${pathname}?${params.toString()}`);
              }}
              className="flex w-full items-center gap-2 rounded-xl border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              role="search"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by job title, organization or keyword…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-0 pl-9 shadow-none focus-visible:ring-0"
                  aria-label="Search government jobs"
                />
              </div>
              <Button type="submit" size="sm" className="shrink-0">
                Search
              </Button>
            </form>

            {/* Mobile filters button */}
            <div className="mt-3 flex items-center gap-2 lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[360px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <JobFiltersSidebar
                      filters={filters}
                      onToggle={toggleFilter}
                      onClear={clearAllFilters}
                      variant="sheet"
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="ml-auto">
                <SortDropdown
                  value={sort}
                  onChange={(v) => {
                    setSort(v);
                    const params = filtersToSearchParams(filters, search, v, currentPage);
                    router.replace(`${pathname}?${params.toString()}`);
                  }}
                />
              </div>
            </div>

            {/* Active filter chips */}
            <div className="mt-3">
              <FilterChips
                filters={activeChips}
                onRemove={removeFilter}
                onClearAll={clearAllFilters}
              />
            </div>

            {/* Result summary + sort (desktop) */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {total > 0 ? (
                  <>Showing <span className="font-semibold text-foreground">{startIdx + 1}–{endIdx}</span> of <span className="font-semibold text-foreground">{total.toLocaleString('en-IN')}</span> jobs</>
                ) : (
                  <>No jobs match your search</>
                )}
              </p>
              <div className="hidden lg:block">
                <SortDropdown
                  value={sort}
                  onChange={(v) => {
                    setSort(v);
                    const params = filtersToSearchParams(filters, search, v, currentPage);
                    router.replace(`${pathname}?${params.toString()}`);
                  }}
                />
              </div>
            </div>

            {/* Job list / empty */}
            <div className="mt-4">
              {jobs.length === 0 ? (
                <EmptyState
                  onClearFilters={clearAllFilters}
                  onBrowseAll={clearAllFilters}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {jobs.map((job) => (
                    <JobListingCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
