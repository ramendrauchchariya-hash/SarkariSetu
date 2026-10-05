import Link from 'next/link';
import { CalendarDays, ChevronRight, GraduationCap } from 'lucide-react';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Government Exams — SarkariSetu',
  description: 'Browse upcoming government examinations and track the exams you care about.',
};

export default async function ExamsPage() {
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
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Exam Center</p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Government Exams</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Browse published exams with announced dates. Track an exam from its recruitment page to keep it in your dashboard.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/exams/calendar"><CalendarDays className="h-4 w-4" /> Exam Calendar</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <Card key={exam.id} className="transition-shadow hover:shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base leading-snug">{exam.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{exam.organizationName}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">Exam scheduled</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Exam Date</p>
                    <p className="mt-1 font-semibold">{formatDate(exam.exam_date)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Application Deadline</p>
                    <p className="mt-1 font-semibold">{exam.application_end ? formatDate(exam.application_end) : 'Not specified'}</p>
                  </div>
                </div>
                <Button asChild variant="link" className="mt-3 h-auto px-0">
                  <Link href={`/jobs/${exam.slug}`}>View Exam Details <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {exams.length === 0 && (
          <Card className="mt-6"><CardContent className="p-8 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">No announced exam dates yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Check the Jobs section for published recruitments and upcoming dates.</p>
          </CardContent></Card>
        )}
      </div>
    </SiteShell>
  );
}
