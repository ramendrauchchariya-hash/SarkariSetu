import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'Disclaimer' };

export default function DisclaimerPage() {
  return (
    <SiteShell>
      <div className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight">Disclaimer</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              SarkariSetu is an independent information platform. We are{' '}
              <strong className="text-foreground">not affiliated with</strong>,
              endorsed by, or representative of any government department,
              ministry, or agency.
            </p>
            <p>
              We do not use government logos or emblems. All branding, design
              and content on this site are original to SarkariSetu.
            </p>
            <p>
              The information published here — including job listings, exam
              dates, results and admit cards — is compiled from publicly
              available sources for the convenience of job seekers. We
              strive for accuracy but cannot guarantee completeness or
              timeliness.
            </p>
            <p>
              <strong className="text-foreground">
                Always verify details on the relevant official government
                portal before taking any action.
              </strong>
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
