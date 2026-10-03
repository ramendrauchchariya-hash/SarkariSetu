'use client';

import {
  Building2,
  Users,
  Wallet,
  Briefcase,
  CalendarClock,
  CalendarDays,
  Clock,
  FileText,
  ExternalLink,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Globe,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { formatDate } from '@/lib/format';
import { computeRecruitmentStatus } from '@/lib/recruitment-status';
import { jobStatusConfig, verificationStatusConfig } from '@/lib/admin-config';
import { jobTypeLabel } from '@/lib/job-filters';

interface Props {
  recruitment: Record<string, unknown>;
  posts: Array<Record<string, unknown> & { vacancies?: Array<Record<string, unknown>> }>;
  importantDates: Array<Record<string, unknown>>;
  applicationFees: Array<Record<string, unknown>>;
  selectionProcess: Array<Record<string, unknown>>;
  examPatterns: Array<Record<string, unknown>>;
  documentsRequired: Array<Record<string, unknown>>;
  howToApply: Array<Record<string, unknown>>;
  faqs: Array<Record<string, unknown>>;
  categories: Array<{ categories: { id: string; name: string; slug: string } }>;
}

export function AdminJobPreview({
  recruitment,
  posts,
  importantDates,
  applicationFees,
  selectionProcess,
  examPatterns,
  documentsRequired,
  howToApply,
  faqs,
  categories,
}: Props) {
  const status = computeRecruitmentStatus({
    application_start: recruitment.application_start as string | null,
    application_end: recruitment.application_end as string | null,
    status_override: recruitment.status_override as import('@/lib/database-types').RecruitmentStatus | null,
  });
  const sConfig = jobStatusConfig[status] ?? jobStatusConfig.open;
  const vConfig = verificationStatusConfig[recruitment.verification_status as string] ?? verificationStatusConfig.unverified;
  const orgName = (recruitment.organizations as { name: string } | null)?.name ?? '—';
  const totalVacancies = posts.reduce((sum, p) => {
    const v = (p.vacancies ?? []).reduce((s, v) => s + (v.vacancy_count as number || 0), 0);
    return sum + v;
  }, 0);

  const officialLinks: { label: string; url: string; type: string }[] = [];
  if (recruitment.official_notification_url) {
    officialLinks.push({ label: 'Official Notification', url: recruitment.official_notification_url as string, type: 'notification' });
  }
  if (recruitment.official_application_url) {
    officialLinks.push({ label: 'Official Application Portal', url: recruitment.official_application_url as string, type: 'application' });
  }
  if (recruitment.official_website_url) {
    officialLinks.push({ label: 'Official Website', url: recruitment.official_website_url as string, type: 'website' });
  }

  return (
    <div className="space-y-6">
      {/* Job header */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              {orgName}
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight">
              {recruitment.title as string}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {jobTypeLabel[recruitment.job_type as keyof typeof jobTypeLabel] ?? String(recruitment.job_type)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {recruitment.location_type === 'all-india' ? 'All India' : 'State Specific'}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={sConfig.variant as 'success' | 'warning' | 'destructive' | 'info'}>{sConfig.label}</Badge>
            <Badge variant={vConfig.variant as 'success' | 'warning' | 'destructive'}>{vConfig.label}</Badge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            Apply by {recruitment.application_end ? formatDate(recruitment.application_end as string) : 'Not specified'}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Posted {recruitment.posted_date ? formatDate(recruitment.posted_date as string) : 'Not set'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Updated {formatDate(recruitment.updated_at as string)}
          </span>
        </div>
      </div>

      {/* Description */}
      {recruitment.description != null ? (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">About This Recruitment</h2>
          <p className="text-sm leading-relaxed text-foreground/90">{recruitment.description as string}</p>
        </div>
      ) : null}

      {/* Quick overview */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Quick Overview</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewItem icon={Building2} label="Organization" value={orgName} />
          <OverviewItem icon={Briefcase} label="Job Type" value={jobTypeLabel[recruitment.job_type as keyof typeof jobTypeLabel] ?? recruitment.job_type as string} />
          <OverviewItem icon={Users} label="Total Vacancies" value={totalVacancies > 0 ? totalVacancies.toLocaleString('en-IN') : 'Not specified'} />
          <OverviewItem icon={CalendarClock} label="Application Deadline" value={recruitment.application_end ? formatDate(recruitment.application_end as string) : 'Not specified'} />
          {categories.length > 0 && (
            <OverviewItem icon={GraduationCap} label="Categories" value={categories.map((c) => c.categories.name).join(', ')} />
          )}
        </div>
      </div>

      {/* Important dates */}
      {importantDates.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Important Dates</h2>
          <div className="divide-y">
            {importantDates.map((d) => (
              <div key={d.id as string} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  {(d.label as string) || (d.date_type as string)}
                </span>
                <span className="text-sm font-semibold">{formatDate(d.date_value as string)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts & Vacancies */}
      {posts.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Posts & Vacancies</h2>
          {posts.map((post, i) => (
            <div key={i} className="mb-4 last:mb-0 rounded-lg border p-4">
              <h3 className="font-semibold">{post.title as string}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                {post.qualification != null && <div><span className="text-muted-foreground">Qualification:</span> {String(post.qualification)}</div>}
                {post.age_min != null && post.age_max != null && (
                  <div><span className="text-muted-foreground">Age:</span> {post.age_min as number}–{post.age_max as number} years</div>
                )}
                {post.pay_level != null && <div><span className="text-muted-foreground">Pay Level:</span> {String(post.pay_level)}</div>}
                {post.salary_min != null && post.salary_max != null && (
                  <div><span className="text-muted-foreground">Salary:</span> ₹{(post.salary_min as number).toLocaleString('en-IN')} – ₹{(post.salary_max as number).toLocaleString('en-IN')}</div>
                )}
              </div>
              {post.age_relaxation != null && <p className="mt-2 text-sm text-muted-foreground">Age Relaxation: {String(post.age_relaxation)}</p>}
              {(post.vacancies ?? []).length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">Category</th>
                        <th className="py-2 pr-4 font-medium">State</th>
                        <th className="py-2 text-right font-medium">Vacancies</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(post.vacancies ?? []).map((v, vi) => (
                        <tr key={vi}>
                          <td className="py-2 pr-4">{v.category_name as string}</td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {(v.states as { name: string } | null)?.name ?? 'All India'}
                          </td>
                          <td className="py-2 text-right font-semibold">{(v.vacancy_count as number).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Application fees */}
      {applicationFees.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Application Fee</h2>
          <div className="divide-y">
            {applicationFees.map((f) => (
              <div key={f.id as string} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm font-medium">{f.category as string}</span>
                <span className="text-sm font-semibold">{f.amount as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection process */}
      {selectionProcess.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Selection Process</h2>
          <ol className="space-y-3">
            {selectionProcess.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {s.step_number as number}
                </span>
                <div>
                  <span className="text-sm font-medium">{s.title as string}</span>
                  {s.description != null && <p className="text-sm text-muted-foreground">{String(s.description)}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Exam pattern */}
      {examPatterns.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Exam Pattern</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-3 py-2 font-semibold">Subject</th>
                  <th className="px-3 py-2 text-center font-semibold">Questions</th>
                  <th className="px-3 py-2 text-center font-semibold">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {examPatterns.map((e, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2.5 font-medium">{e.subject as string}</td>
                    <td className="px-3 py-2.5 text-center">{e.questions as number ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center">{e.marks as number ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents required */}
      {documentsRequired.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Documents Required</h2>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {documentsRequired.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{d.document_name as string}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* How to apply */}
      {howToApply.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">How to Apply</h2>
          <ol className="space-y-3">
            {howToApply.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {h.step_number as number}
                </span>
                <span className="pt-0.5 text-sm">{h.title as string}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Official links */}
      {officialLinks.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Official Links</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {officialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-start gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {link.type === 'notification' ? <FileText className="h-4 w-4" /> : link.type === 'application' ? <ExternalLink className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                </span>
                <span className="text-sm font-semibold">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                  {f.question as string}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.answer as string}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Verification bar */}
      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex flex-col items-start gap-2 text-xs sm:flex-row sm:items-center sm:gap-4">
          <span className="flex items-center gap-1.5 font-medium text-success">
            <ShieldCheck className="h-4 w-4" />
            Verification: {vConfig.label}
          </span>
          <span className="text-muted-foreground">
            Last verified: {recruitment.last_verified ? formatDate(recruitment.last_verified as string) : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
}

function OverviewItem({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

// Inline import for MapPin since we used it in the component
import { MapPin } from 'lucide-react';
