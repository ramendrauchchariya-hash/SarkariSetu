import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const popularSearches = ['SSC', 'Railway', 'Banking', 'Defence', 'Teaching', 'Graduate Jobs'];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-hero-pattern">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="container-page py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            Government opportunities in one place
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Find Government Opportunities That Match You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Discover government jobs, exams, results and admit cards — organized in one simple platform.
          </p>
          <form action="/jobs" method="GET" className="mx-auto mt-7 flex w-full max-w-2xl items-center gap-2 rounded-xl border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" role="search">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" name="q" placeholder="Search jobs, exams, organizations…" className="h-11 w-full border-0 bg-transparent pl-9 text-sm outline-none placeholder:text-muted-foreground" aria-label="Search SarkariSetu" />
            </div>
            <Button type="submit" size="lg" className="shrink-0">Search</Button>
          </form>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground">Popular:</span>
            {popularSearches.map((tag) => (
              <a key={tag} href={`/jobs?q=${tag.toLowerCase().replace(/\s+/g, '-')}`} className="rounded-full border bg-card px-3 py-1 font-medium text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary">
                {tag}
              </a>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl rounded-xl border border-dashed bg-card/70 px-4 py-3 text-sm text-muted-foreground">
            New listings will appear here as they are added and published through the admin dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
