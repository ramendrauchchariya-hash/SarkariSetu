'use client';

import Link from 'next/link';
import {
  Building2,
  MapPin,
  Users,
  Wallet,
  Briefcase,
  CalendarClock,
  CalendarDays,
  Clock,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  GraduationCap,
  ChevronRight,
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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { SiteShell } from '@/components/site/site-shell';
import { DetailSection } from '@/components/site/detail-section';
import { InfoCard } from '@/components/site/info-card';
import { RecruitmentTimeline, type TimelineStep } from '@/components/site/recruitment-timeline';
import { SaveJobButton } from '@/components/site/save-job-button';
import { ApplicationTracker } from '@/components/site/application-tracker';
import { ExamTracker } from '@/components/site/exam-tracker';
import { ShareButton } from '@/components/site/share-button';
import { JobListingCard } from '@/components/site/job-listing-card';
import { EmptyState } from '@/components/site/empty-state';

import { formatDate, daysUntil, formatPosts } from '@/lib/format';
import {
  jobStatusLabel,
  jobStatusVariant,
  jobTypeLabel,
} from '@/lib/job-filters';
import type { JobDetails, JobPosting, OfficialLink } from '@/lib/types';
import { cn } from '@/lib/utils';

interface JobDetailsViewProps {
  job: JobDetails;
  relatedJobs?: JobPosting[];
}

function formatSalary(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 100000
      ? `\u20b9 ${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
      : `\u20b9 ${n.toLocaleString('en-IN')}`;
  return `${fmt(min)} \u2013 ${fmt(max)}`;
}

function getOfficialLinkIcon(type: OfficialLink['type']) {
  if (type === 'notification') return <FileText className="h-4 w-4" />;
  if (type === 'application') return <ExternalLink className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
}

export function JobDetailsView({ job, relatedJobs: relatedJobsProp = [] }: JobDetailsViewProps) {
  const daysLeft = daysUntil(job.applicationEnd);
  const isClosed = job.status === 'closed';
  const isClosingSoon = job.status === 'closing-soon';
  const canApply = job.status === 'open' || job.status === 'closing-soon';
  const applicationLink = job.officialLinks.find((link) => link.type === 'application')?.url;

  // Build timeline steps
  const timelineSteps: TimelineStep[] = [
    { label: 'Notification Released', date: job.notificationReleasedDate },
    { label: 'Application Opens', date: job.applicationStart },
    { label: 'Application Closes', date: job.applicationEnd },
    { label: 'Admit Card', date: job.admitCardDate },
    { label: 'Examination', date: job.examDate },
    { label: 'Result', date: job.resultDate },
  ];

  // Determine current timeline stage
  const now = new Date().getTime();
  let currentStepIndex = 0;
  for (let i = timelineSteps.length - 1; i >= 0; i--) {
    const stepDate = timelineSteps[i].date;
    if (stepDate && new Date(stepDate).getTime() <= now) {
      currentStepIndex = i;
      break;
    }
  }
  // If all future, current is 0 (notification)
  const firstRealDate = timelineSteps[0].date;
  if (firstRealDate && new Date(firstRealDate).getTime() > now) {
    currentStepIndex = 0;
  }

  // Important dates (only show those that exist)
  const importantDates = [
    { label: 'Notification Released', date: job.notificationReleasedDate },
    { label: 'Application Starts', date: job.applicationStart },
    { label: 'Application Ends', date: job.applicationEnd },
    { label: 'Correction Window Closes', date: job.correctionEndDate },
    { label: 'City Intimation', date: job.cityIntimationDate },
    { label: 'Admit Card', date: job.admitCardDate },
    { label: 'Exam Date', date: job.examDate },
    { label: 'Result', date: job.resultDate },
  ].filter((d) => d.date !== null || ['Exam Date', 'Result'].includes(d.label));

  const relatedJobs = relatedJobsProp.slice(0, 4);

  const quickOverview = [
    { icon: Building2, label: 'Organization', value: job.organization },
    { icon: Briefcase, label: 'Post', value: job.title },
    { icon: Users, label: 'Vacancies', value: formatPosts(job.vacancies) },
    { icon: GraduationCap, label: 'Qualification', value: job.qualification.replace(/-/g, ' ') },
    { icon: FileText, label: 'Job Type', value: jobTypeLabel[job.jobType] },
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Wallet, label: 'Salary', value: formatSalary(job.salaryMin, job.salaryMax) },
    { icon: CalendarClock, label: 'Application Deadline', value: formatDate(job.applicationEnd) },
  ];

  const totalVacancies = job.vacancyBreakdown.reduce((sum, v) => sum + v.count, 0);

  return (
    <SiteShell>
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/20">
        <div className="container-page py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/jobs">Jobs</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[200px] sm:max-w-none">
                  {job.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Job header */}
      <section className="border-b">
        <div className="container-page py-6 sm:py-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  {job.organization}
                </p>
                <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  {job.title}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {jobTypeLabel[job.jobType]}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                </p>
              </div>
              <Badge
                variant={jobStatusVariant[job.status]}
                className="shrink-0 text-sm"
              >
                {jobStatusLabel[job.status]}
              </Badge>
            </div>

            {/* Status info row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                Apply by {formatDate(job.applicationEnd)}
                {!isClosed && daysLeft >= 0 && (
                  <span className={cn('font-semibold', isClosingSoon ? 'text-warning' : 'text-muted-foreground')}>
                    ({daysLeft === 0 ? 'last day' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`})
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Posted {formatDate(job.postedDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Updated {formatDate(job.lastUpdated)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {canApply && applicationLink ? (
                <Button asChild size="lg" className="gap-2">
                  <a href={applicationLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Apply Now
                  </a>
                </Button>
              ) : (
                <Button size="lg" disabled className="gap-2">
                  <Clock className="h-4 w-4" />
                  {job.status === 'upcoming' ? 'Not Open Yet' : 'Application Closed'}
                </Button>
              )}
              <SaveJobButton jobId={job.id} size="lg" />
              <ShareButton title={job.title} />
              <ApplicationTracker jobId={job.id} jobTitle={job.title} />
              {job.examDate && <ExamTracker recruitmentId={job.id} examTitle={job.title} />}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b bg-muted/20">
        <div className="container-page py-3">
          <div className="flex flex-col items-start gap-2 text-xs sm:flex-row sm:items-center sm:gap-4">
            <span className="flex items-center gap-1.5 font-medium text-success">
              <ShieldCheck className="h-4 w-4" />
              Information verified against available official recruitment source.
            </span>
            <span className="text-muted-foreground">
              Last verified: {formatDate(job.lastVerified)}
            </span>
            <span className="text-muted-foreground">
              Last updated: {formatDate(job.lastUpdated)}
            </span>
          </div>
        </div>
      </section>

      {/* Main content: two-column layout */}
      <div className="container-page py-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Main content column (~70%) */}
          <div className="min-w-0 flex-1 space-y-8">
            {/* Description */}
            <DetailSection title="About This Recruitment" id="about">
              <InfoCard>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {job.description}
                </p>
              </InfoCard>
            </DetailSection>

            {/* Quick overview */}
            <DetailSection title="Quick Overview" id="overview">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {quickOverview.map((item) => (
                  <InfoCard key={item.label} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="truncate text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  </InfoCard>
                ))}
              </div>
            </DetailSection>

            {/* Important dates */}
            <DetailSection title="Important Dates" id="dates">
              <InfoCard>
                <div className="divide-y">
                  {importantDates.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {item.label}
                      </span>
                      {item.date ? (
                        <span className="text-sm font-semibold text-foreground">
                          {formatDate(item.date)}
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          Not announced
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </InfoCard>
            </DetailSection>

            {/* Recruitment timeline */}
            <DetailSection
              title="Recruitment Timeline"
              description="Visual progress of the recruitment process"
              id="timeline"
            >
              <InfoCard>
                <RecruitmentTimeline steps={timelineSteps} currentStepIndex={currentStepIndex} />
              </InfoCard>
            </DetailSection>

            {/* Vacancy details */}
            {job.vacancyBreakdown.length > 0 && (
              <DetailSection title="Vacancy Details" id="vacancies">
                <InfoCard className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-4 py-3 text-left font-semibold">Post</th>
                          <th className="px-4 py-3 text-left font-semibold">Category</th>
                          <th className="px-4 py-3 text-left font-semibold">State</th>
                          <th className="px-4 py-3 text-right font-semibold">Vacancies</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {job.vacancyBreakdown.map((v, i) => (
                          <tr key={i} className="transition-colors hover:bg-muted/20">
                            <td className="px-4 py-2.5 font-medium">{v.post}</td>
                            <td className="px-4 py-2.5">
                              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                                {v.category}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">{v.state}</td>
                            <td className="px-4 py-2.5 text-right font-semibold">{formatPosts(v.count)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 bg-muted/30 font-bold">
                          <td colSpan={3} className="px-4 py-3">Total Vacancies</td>
                          <td className="px-4 py-3 text-right">{formatPosts(totalVacancies)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </InfoCard>
              </DetailSection>
            )}

            {/* Eligibility */}
            <DetailSection title="Eligibility Criteria" id="eligibility">
              <InfoCard className="space-y-4">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Educational Qualification
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.discipline} ({job.qualification.replace(/-/g, ' ')})
                  </p>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Users className="h-4 w-4 text-primary" />
                    Age Limit
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.ageMin}–{job.ageMax} years as on {formatDate(job.ageCutoffDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Age Relaxation</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{job.ageRelaxation}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Nationality</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{job.nationality}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Experience</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{job.experience}</p>
                </div>
                {job.otherRequirements && (
                  <div>
                    <h3 className="text-sm font-semibold">Other Requirements</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{job.otherRequirements}</p>
                  </div>
                )}
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="flex items-start gap-2 text-xs text-foreground/80">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    Eligibility information is provided for convenience. Always verify your eligibility from the official recruitment notification before applying.
                  </p>
                </div>
              </InfoCard>
            </DetailSection>

            {/* Salary */}
            <DetailSection title="Salary & Pay Scale" id="salary">
              <InfoCard className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4 text-primary" />
                    Pay Level
                  </span>
                  <span className="text-sm font-semibold">{job.payLevel}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">Pay Range</span>
                  <span className="text-sm font-semibold">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
                {job.allowances && (
                  <div className="border-t pt-3">
                    <span className="text-sm text-muted-foreground">Allowances</span>
                    <p className="mt-1 text-sm text-foreground/80">{job.allowances}</p>
                  </div>
                )}
              </InfoCard>
            </DetailSection>

            {/* Application fee */}
            <DetailSection title="Application Fee" id="fees">
              <InfoCard className="space-y-3">
                <div className="divide-y">
                  {job.applicationFees.map((fee, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <span className="text-sm font-medium">{fee.category}</span>
                      <span className="text-sm font-semibold text-foreground">{fee.fee}</span>
                    </div>
                  ))}
                </div>
                {job.feePaymentMethod && (
                  <div className="border-t pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Payment Method
                    </span>
                    <p className="mt-1 text-sm text-foreground/80">{job.feePaymentMethod}</p>
                  </div>
                )}
              </InfoCard>
            </DetailSection>

            {/* Selection process */}
            <DetailSection title="Selection Process" id="selection">
              <InfoCard>
                <ol className="space-y-3">
                  {job.selectionProcess.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-sm font-medium">{step}</span>
                    </li>
                  ))}
                </ol>
              </InfoCard>
            </DetailSection>

            {/* Exam pattern */}
            {job.examPattern && (
              <DetailSection title="Exam Pattern" id="exam-pattern">
                <div className="space-y-4">
                  {Object.entries(
                    job.examPattern.subjects.reduce((groups, subject) => {
                      const key = `${subject.stageNumber}::${subject.stageName}::${subject.paperNumber}::${subject.paperName}::${subject.postName ?? ''}`;
                      (groups[key] ??= []).push(subject);
                      return groups;
                    }, {} as Record<string, typeof job.examPattern.subjects>)
                  ).map(([key, subjects]) => {
                    const first = subjects[0];
                    const questions = subjects.reduce((sum, s) => sum + s.questions, 0);
                    const marks = subjects.reduce((sum, s) => sum + s.marks, 0);
                    return (
                      <InfoCard key={key} className="overflow-hidden">
                        <div className="border-b bg-muted/20 px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{first.stageName}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium">{first.paperName}</span>
                            {first.postName && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">Post: {first.postName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/30">
                                <th className="px-3 py-2 text-left font-semibold">Subject</th>
                                <th className="px-3 py-2 text-center font-semibold">Questions</th>
                                <th className="px-3 py-2 text-center font-semibold">Marks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {subjects.map((s, i) => (
                                <tr key={i}>
                                  <td className="px-3 py-2.5 font-medium">{s.subject}</td>
                                  <td className="px-3 py-2.5 text-center">{s.questions}</td>
                                  <td className="px-3 py-2.5 text-center">{s.marks}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 bg-muted/30 font-bold">
                                <td className="px-3 py-2.5">Total</td>
                                <td className="px-3 py-2.5 text-center">{questions}</td>
                                <td className="px-3 py-2.5 text-center">{marks}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        <div className="grid grid-cols-1 gap-3 border-t px-4 py-3 text-sm sm:grid-cols-3">
                          <div><span className="text-xs text-muted-foreground">Duration</span><p className="font-semibold">{first.duration}</p></div>
                          <div><span className="text-xs text-muted-foreground">Mode</span><p className="font-semibold">{first.mode}</p></div>
                          <div><span className="text-xs text-muted-foreground">Negative Marking</span><p className="font-semibold">{first.negativeMarking ?? 'None'}</p></div>
                        </div>
                      </InfoCard>
                    );
                  })}
                </div>
              </DetailSection>
            )}
            {/* Documents required */}
            <DetailSection title="Documents Required" id="documents">
              <InfoCard>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {job.documentsRequired.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  Document requirements can vary. Verify the official notification before applying.
                </p>
              </InfoCard>
            </DetailSection>

            {/* How to apply */}
            <DetailSection title="How to Apply" id="how-to-apply">
              <InfoCard>
                <ol className="space-y-3">
                  {job.howToApply.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-sm text-foreground/90">{step}</span>
                    </li>
                  ))}
                </ol>
              </InfoCard>
            </DetailSection>

            {/* Official links */}
            <DetailSection title="Official Links" id="official-links">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {job.officialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url.startsWith('[') ? undefined : link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} (opens in new tab)`}
                    className={cn(
                      'group flex flex-col items-start gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
                      link.url.startsWith('[') && 'pointer-events-none opacity-60'
                    )}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {getOfficialLinkIcon(link.type)}
                    </span>
                    <span className="text-sm font-semibold">{link.label}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
                      Open official link
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                ))}
              </div>
            </DetailSection>

            {/* Disclaimer */}
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <p className="text-sm text-foreground/80">
                <strong className="font-semibold">Disclaimer:</strong> SarkariSetu is an
                independent information platform and is not affiliated with any government
                organization. Recruitment information is provided for convenience. Always
                verify eligibility, dates, fees, vacancies and other requirements from the
                official recruitment notification before applying.
              </p>
            </div>

            {/* FAQ */}
            {job.faqs.length > 0 && (
              <DetailSection title="Frequently Asked Questions" id="faq">
                <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
                  {job.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </DetailSection>
            )}
          </div>

          {/* Sidebar column (~30%) */}
          <aside className="space-y-4 lg:w-80 lg:shrink-0">
            {/* Sticky apply card */}
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Apply / Save card */}
              <Card className="p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={jobStatusVariant[job.status]}>
                      {jobStatusLabel[job.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatPosts(job.vacancies)} vacancies
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Application Deadline</p>
                    <p className={cn(
                      'text-sm font-bold',
                      isClosingSoon ? 'text-warning' : 'text-foreground'
                    )}>
                      {formatDate(job.applicationEnd)}
                      {!isClosed && daysLeft >= 0 && (
                        <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                          ({daysLeft === 0 ? 'last day' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`})
                        </span>
                      )}
                    </p>
                  </div>
                  {canApply && applicationLink ? (
                    <Button asChild className="w-full gap-2">
                      <a href={applicationLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Apply Now
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      {job.status === 'upcoming' ? 'Not Open Yet' : 'Application Closed'}
                    </Button>
                  )}
                  <SaveJobButton jobId={job.id} className="w-full" />
                  <ShareButton title={job.title} className="w-full" />
                  <ApplicationTracker jobId={job.id} jobTitle={job.title} />
                </div>
              </Card>

              {/* Important dates summary */}
              <Card className="p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Key Dates
                </h3>
                <div className="space-y-2">
                  {importantDates.slice(0, 5).map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      {item.date ? (
                        <span className="font-semibold text-foreground">{formatDate(item.date)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  ))}
                </div>
                <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
                  <Link href="#dates">View all dates</Link>
                </Button>
              </Card>

              {/* Official links sidebar */}
              <Card className="p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Official Links
                </h3>
                <div className="space-y-2">
                  {job.officialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url.startsWith('[') ? undefined : link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:text-primary',
                        link.url.startsWith('[') && 'pointer-events-none opacity-60'
                      )}
                    >
                      {getOfficialLinkIcon(link.type)}
                      {link.label}
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </aside>
        </div>

        {/* Related jobs */}
        {relatedJobs.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  Similar Government Jobs
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Other opportunities you may be interested in
                </p>
              </div>
              <Link
                href="/jobs"
                className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                View All Jobs
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedJobs.map((relatedJob) => (
                <JobListingCard key={relatedJob.id} job={relatedJob} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile apply bar */}
      {canApply && applicationLink && (
        <div className="sticky bottom-0 z-30 border-t bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">
                {job.status === 'closing-soon' ? (
                  <span className="font-semibold text-warning">
                    {daysLeft === 0 ? 'Last day to apply!' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
                  </span>
                ) : (
                  `Apply by ${formatDate(job.applicationEnd)}`
                )}
              </p>
            </div>
            <SaveJobButton jobId={job.id} size="sm" />
            <Button asChild size="sm" className="gap-2">
              <a href={applicationLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Apply Now
              </a>
            </Button>
          </div>
        </div>
      )}
    </SiteShell>
  );
}

export function JobNotFoundView() {
  return (
    <SiteShell>
      <div className="container-page py-20">
        <EmptyState
          title="Job not found"
          description="The recruitment you're looking for may have been removed or the link may be incorrect."
        />
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/jobs">Browse All Jobs</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
