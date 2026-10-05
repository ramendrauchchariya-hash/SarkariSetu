'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronRight, Loader2, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

type TrackedExam = { id: string; tracking_status: string; notes: string | null; recruitment: { title: string; slug: string; exam_date: string | null; application_end: string | null; organization: { name: string } | null } | null };

export default function DashboardExamsPage() {
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [items, setItems] = useState<TrackedExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { id: user.id, email: user.email } : null);
      if (!user) return setLoading(false);
      const { data } = await supabase.from('exam_tracking')
        .select('id,tracking_status,notes,recruitment:recruitments(title,slug,exam_date,application_end,organization:organizations(name))')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      const normalized = ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => {
        const raw = row.recruitment as TrackedExam['recruitment'] | TrackedExam['recruitment'][] | null;
        return { ...row, recruitment: Array.isArray(raw) ? raw[0] ?? null : raw } as unknown as TrackedExam;
      }).filter((row) => row.recruitment);
      setItems(normalized); setLoading(false);
    }
    load();
  }, []);

  if (loading) return <SiteShell><div className="container-page flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div></SiteShell>;
  if (!user) return <SiteShell><div className="container-page py-12"><Card className="mx-auto max-w-2xl"><CardContent className="p-8 text-center">
    <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" /><h1 className="mt-4 font-display text-2xl font-bold">Track Your Exams</h1>
    <p className="mt-2 text-sm text-muted-foreground">Sign in to see the government exams you are following.</p>
    <Button asChild className="mt-6"><Link href="/auth/login?redirectTo=%2Fdashboard%2Fexams">Sign In</Link></Button>
  </CardContent></Card></div></SiteShell>;

  return <SiteShell><div className="container-page py-8 sm:py-10">
    <div className="mb-6"><p className="text-sm font-medium text-primary">My Dashboard</p><h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Tracked Exams</h1>
      <p className="mt-2 text-sm text-muted-foreground">Keep important exam dates and your tracking status in one place.</p></div>
    <div className="space-y-3">
      {items.map((item) => { const exam = item.recruitment!; return <Card key={item.id}><CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0">
          <Link href={`/jobs/${exam.slug}`} className="font-semibold hover:text-primary">{exam.title}</Link>
          <p className="mt-1 text-sm text-muted-foreground">{exam.organization?.name ?? 'Organization not specified'}</p>
          <div className="mt-2 flex flex-wrap gap-2"><Badge variant="secondary">{item.tracking_status.replace(/-/g, ' ')}</Badge><Badge variant="outline">Exam: {exam.exam_date ? formatDate(exam.exam_date) : 'Not announced'}</Badge>{exam.application_end && <Badge variant="outline">Apply by {formatDate(exam.application_end)}</Badge>}</div>
          {item.notes && <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>}
        </div><Button asChild variant="outline"><Link href={`/jobs/${exam.slug}`}>View Details <ChevronRight className="ml-1 h-4 w-4" /></Link></Button></div>
      </CardContent></Card> })}
      {items.length === 0 && <Card><CardContent className="p-8 text-center"><CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold">No tracked exams yet</p><p className="mt-1 text-sm text-muted-foreground">Open an exam or job page and choose Track Exam.</p><Button asChild className="mt-4"><Link href="/exams">Browse Exams</Link></Button></CardContent></Card>}
    </div>
  </div></SiteShell>;
}
