import { SiteShell } from '@/components/site/site-shell';
import { ShieldCheck, Target, Eye, Heart } from 'lucide-react';

export const metadata = { title: 'About Us' };

const values = [
  { icon: Target, title: 'Our Mission', text: 'Make government job discovery fast, reliable and accessible to every Indian job seeker.' },
  { icon: ShieldCheck, title: 'Independence', text: 'We are an independent platform — not affiliated with any government body. We never claim otherwise.' },
  { icon: Eye, title: 'Transparency', text: 'Clear status badges, honest disclaimers and no clickbait. You always know what you are looking at.' },
  { icon: Heart, title: 'User-First', text: 'Built mobile-first for India. Every feature is designed around how job seekers actually search.' },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <div className="container-page py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            About SarkariSetu
          </h1>
          <p className="mt-4 text-muted-foreground">
            SarkariSetu — meaning &ldquo;government bridge&rdquo; — is an
            independent information platform that helps Indian job seekers
            discover government jobs, exams, results, admit cards, answer keys
            and admissions in one clean, modern place.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border bg-card p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <v.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-semibold">{v.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-warning/30 bg-warning/5 p-5 text-center">
          <p className="text-sm text-foreground/80">
            <strong className="font-semibold">Important:</strong> SarkariSetu
            is not a government website. We do not use government logos or
            imply affiliation. Always verify details on official portals before
            applying.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
