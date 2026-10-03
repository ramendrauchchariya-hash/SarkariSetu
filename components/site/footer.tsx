import Link from 'next/link';
import { ShieldCheck, Mail, Heart } from 'lucide-react';
import { Logo } from './logo';
import { PUBLIC_NAV } from '@/lib/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const infoLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

export function Footer() {
  const year = new Date().getFullYear();

  const navLinks = PUBLIC_NAV.filter((item) => item.href !== '/');

  return (
    <footer className="border-t bg-muted/30">
      {/* Trust strip */}
      <div className="border-b bg-card">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-3 text-center sm:flex-row sm:text-left">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Independently verified information — SarkariSetu is not a government website.
          </p>
          <p className="text-xs text-muted-foreground">
            Data shown is for demonstration. Always verify on official portals.
          </p>
        </div>
      </div>

      <div className="container-page py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand + newsletter */}
          <div className="space-y-4">
            <Logo />
            <p className="font-display text-sm font-semibold tracking-wide text-foreground">
              Find. Check. Apply. Track.
            </p>
            <p className="text-sm text-muted-foreground">
              Your bridge to government jobs and exams. Discover opportunities,
              check results, apply on time, and track your applications — all
              in one place.
            </p>
            <form className="space-y-2" aria-label="Newsletter subscription">
              <label
                htmlFor="newsletter-email"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Get job alerts in your inbox
              </label>
              <div className="flex gap-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="your@email.com"
                  className="text-sm"
                  aria-label="Email address"
                />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </div>
            </form>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
              Information
            </h3>
            <ul className="space-y-2.5">
              {infoLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:hello@sarkarisetu.in"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5" />
                  hello@sarkarisetu.in
                </a>
              </li>
            </ul>
          </div>

          {/* Important notice */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
              Important
            </h3>
            <div className="space-y-3 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>
                  SarkariSetu is an independent information platform and is{' '}
                  <strong className="font-semibold text-foreground">
                    not a government website
                  </strong>
                  .
                </span>
              </p>
              <p>
                We are not affiliated with any government agency. Always verify
                details on official portals before applying.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {year} SarkariSetu. An independent platform. Not affiliated
            with any government agency.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Built with <Heart className="h-3 w-3 fill-primary text-primary" /> for Indian job seekers
          </p>
        </div>
      </div>
    </footer>
  );
}
