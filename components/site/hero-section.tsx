import { TrendingUp, FileCheck2, Download, Bookmark, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

const stats = [
  { label: 'Active Jobs', value: '12,400+', icon: TrendingUp },
  { label: 'Results Out', value: '860', icon: FileCheck2 },
  { label: 'Admit Cards', value: '210', icon: Download },
  { label: 'Job Seekers', value: '5.2L+', icon: Bookmark },
];

const popularSearches = ['SSC', 'Railway', 'Banking', 'Defence', 'Teaching', 'Graduate Jobs'];

const visualCards = [
  { org: 'Indian Railways', title: 'Assistant Loco Pilot', badge: 'Active', badgeColor: 'bg-success/15 text-success' },
  { org: 'Staff Selection Commission', title: 'CGL Tier-II', badge: 'Exam Soon', badgeColor: 'bg-info/15 text-info' },
  { org: 'National Banking Services', title: 'Probationary Officer', badge: 'Result Out', badgeColor: 'bg-success/15 text-success' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-hero-pattern">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="container-page py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: heading + search */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-success animate-pulse-soft" />
              Live updates every hour
            </span>

            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Find Government Opportunities That Match You
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Discover government jobs, exams, results and admit cards — all
              organized in one simple platform.
            </p>

            {/* Search box */}
            <form
              action="/jobs"
              method="GET"
              className="mx-auto mt-7 flex w-full max-w-xl items-center gap-2 rounded-xl border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 lg:mx-0"
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
              <Button type="submit" size="lg" className="shrink-0">
                Search
              </Button>
            </form>

            {/* Popular searches */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs lg:justify-start">
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

          {/* Right: visual element (desktop only) */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />

              <div className="relative space-y-3 rounded-2xl border bg-card/80 p-5 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">Trending Now</p>
                  <span className="text-xs text-muted-foreground">{formatDate('2026-09-07')}</span>
                </div>
                {visualCards.map((card) => (
                  <div
                    key={card.title}
                    className="flex items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-primary/20"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileCheck2 className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{card.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{card.org}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                ))}
                <a
                  href="/jobs"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  Explore all opportunities
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-4 text-center shadow-sm"
            >
              <stat.icon className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-2 font-display text-xl font-bold sm:text-2xl">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
