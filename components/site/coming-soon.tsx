import { Construction } from 'lucide-react';
import { SiteShell } from '@/components/site/site-shell';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoon({
  title,
  description,
  backHref = '/',
  backLabel = 'Back to Home',
}: ComingSoonProps) {
  return (
    <SiteShell>
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Construction className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">{description}</p>
        <Button asChild className="mt-6">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </SiteShell>
  );
}
