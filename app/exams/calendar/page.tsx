import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Exam Calendar — SarkariSetu',
  description: 'Upcoming government exam dates from published SarkariSetu recruitment records.',
};

export default async function ExamCalendarPage() {
  const { data } = await supabaseAdmin
    .from('recruitments')
    .select('id,title,slug,exam_date,application_end,organization:organizations(name)')
    .eq('is_published', true)
    .eq('is_archived', false)
    .not('exam_date', 'is', null)
    .order('exam_date', { ascending: true });

  const exams = (data ?? []).map((row) => {
    const org = Array.isArray(row.organization) ? row.organization[0] : row.organization;
    return { ...row, organizationName: org?.name ?? 'Organization not specified' };
  });

  return (
    <SiteShell>
      <div className="container-page py-8 sm:py-10">
        <div className="mb-6 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon"><Link href="/exams" aria-label="Back to exams"><ChevronLeft className="h-5 w-5" /></Link></Button>
          <div><p className="text-sm font-medium text-primary">Exam Center</p><h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Exam Calendar</h1></div>
        </div>
        <Card><CardContent className="p-0">
          <div className="divide-y">
            {exams.map((exam) => (
              <div key={exam.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><CalendarDays className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <Link href={`/jobs/${exam.slug}`} className="font-semibold hover:text-primary">{exam.title}</Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">{exam.organizationName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="secondary">Exam: {formatDate(exam.exam_date)}</Badge>
                  {exam.application_end && <Badge variant="outline">Apply by {formatDate(exam.application_end)}</Badge>}
                  <Button asChild variant="outline" size="sm"><Link href={`/jobs/${exam.slug}`}>Details <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
                </div>
              </div>
            ))}
          </div>
          {exams.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No published exam dates are available.</div>}
        </CardContent></Card>
        <p className="mt-4 text-xs text-muted-foreground">Dates shown here come from published recruitment records. Always verify the final schedule on the official notification.</p>
      </div>
    </SiteShell>
  );
}
