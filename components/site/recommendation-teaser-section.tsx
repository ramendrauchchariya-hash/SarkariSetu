import Link from 'next/link';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecommendationTeaserSection() {
  return (
    <section className="py-14 sm:py-16">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-8 sm:p-12">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-secondary/8 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized Matching
            </span>

            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Stop Searching. Start Matching.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Tell us your qualification, age and preferred departments to
              discover opportunities that may match your profile.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/register">
                  Create My Profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/jobs">
                  <Compass className="h-4 w-4" />
                  Explore Jobs
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              It is free to create a profile. No spam, just relevant job alerts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
