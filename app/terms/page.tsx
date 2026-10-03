import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'Terms of Use' };

export default function TermsPage() {
  return (
    <SiteShell>
      <div className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight">Terms of Use</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              By using SarkariSetu, you agree to these terms. SarkariSetu is an
              independent platform and is not affiliated with any government
              body.
            </p>
            <p>
              Information provided on this platform is for reference only.
              Always verify details on official government portals before
              applying. We are not responsible for decisions made based solely
              on information presented here.
            </p>
            <p>
              Full terms of use will be published here before account
              registration goes live.
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
