import { ShieldCheck, FileSearch, FileWarning, CheckCircle2, ExternalLink } from 'lucide-react';

const principles = [
  {
    icon: FileSearch,
    title: 'Organized for Convenience',
    description:
      'Recruitment information from across sources is brought together in one clean, searchable platform.',
  },
  {
    icon: FileWarning,
    title: 'Official Notifications Are Authoritative',
    description:
      'Always rely on the original government notification as the authoritative source for any detail.',
  },
  {
    icon: CheckCircle2,
    title: 'Verify Before You Apply',
    description:
      'Check eligibility, important dates, application fees and other details from the official notification before applying.',
  },
  {
    icon: ExternalLink,
    title: 'Official Links Are Clearly Marked',
    description:
      'Wherever we link to an official application or portal, it is clearly identified as an external official source.',
  },
];

export function TrustSection() {
  return (
    <section className="border-y bg-muted/20 py-14 sm:py-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-success shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Independent &amp; Transparent
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            SarkariSetu is an independent information platform
          </h2>
          <p className="mt-3 text-muted-foreground">
            We are not a government website. We do not represent any government
            department, and we never claim to. Our role is to make reliable
            information easy to find.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <principle.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{principle.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
          <p className="text-sm text-foreground/80">
            <strong className="font-semibold">Disclaimer:</strong> SarkariSetu
            is an independent information platform and is{' '}
            <strong className="font-semibold">not affiliated with</strong> any
            government body. Always verify details on official portals before
            applying.
          </p>
        </div>
      </div>
    </section>
  );
}
