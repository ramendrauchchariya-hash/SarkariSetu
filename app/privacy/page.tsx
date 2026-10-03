import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <SiteShell>
      <div className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              SarkariSetu is an independent information platform. This privacy
              policy describes how we handle any data you share with us.
            </p>
            <p>
              We do not sell your personal data. Any information you provide
              (such as email for job alerts) is used solely to deliver our
              services and improve your experience.
            </p>
            <p>
              Full privacy policy details will be published here before account
              registration goes live.
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
