import { Search, ArrowUpRight, FileCheck2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JobListing } from '@/lib/types';

const popularSearches = ['SSC', 'Railway', 'Banking', 'Defence', 'Teaching', 'Graduate Jobs'];

interface HeroSectionProps {
  latestJobs: JobListing[];
  stats: {
    activeJobs: number;
    results: number;
    admitCards: number;
    users: number;
  };
}

function formatCount(value: number): string {
  return value.toLocaleString('en-IN');
}

function statusLabel(status: JobListing['status']): string {
  if (status === 'active') return 'Active';
  if (status === 'closing-soon') return 'Closing Soon';
  if (status === 'closed') return 'Closed';
  if (status === 'result-out') return 'Result Out';
  if (status === 'admit-card-available') return 'Admit Card';
  return 'Upcoming';
}

export function HeroSection({ latestJobs, stats }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b bg-hero-pattern">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="container-page py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              Live information from published listings
            </span>

            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Find Government Opportunities That Match You
            </h1>

            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Discover government jobs, exams, results and admit cards — organized in one simple platform.
            </p>

            <form
              action="/jobs"
              method="GET"
              className="mt-7 flex w-full max-w-2xl items-center gap-2 rounded-xl border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              role="search"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search jobs, exams, organizations…"
                  className="h-11 w-full border-0 bg-transparent pl-9 text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="Search SarkariSetu"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0">Search</Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Popular:</span>
              {popularSearches.map((tag) => (
                <a
                  key={tag}
                  href={`/jobs?q=${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  className="rounded-full border bg-card px-3 py-1 font-medium text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between px-1">
              <span className="font-semibold text-muted-foreground">Latest Published</span>
              <span className="text-xs text-muted-foreground">Live database</span>
            </div>

            {latestJobs.length > 0 ? (
              <div className="mt-3 space-y-2">
                {latestJobs.slice(0, 3).map((job) => (
                  <a
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-primary/30"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileCheck2 className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{job.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{job.organization}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-primary">{statusLabel(job.status)}</span>
                  </a>
                ))}
                <a href="/jobs" className="flex items-center justify-center gap-2 rounded-xl bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10">
                  Explore all opportunities <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm font-medium">No published opportunities yet</p>
                <p className="mt-1 text-xs text-muted-foreground">New jobs will appear here after they are published from the admin dashboard.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: ArrowUpRight, value: stats.activeJobs, label: 'Published Jobs' },
            { icon: FileCheck2, value: stats.results, label: 'Results' },
            { icon: Download, value: stats.admitCards, label: 'Admit Cards' },
            { icon: Bookmark, value: stats.users, label: 'Job Seekers' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4 text-center shadow-sm">
              <stat.icon className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-2 text-xl font-bold tracking-tight">{formatCount(stat.value)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
