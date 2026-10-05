'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/site/status-badge';
import { formatDate, formatPosts } from '@/lib/format';
import type { JobStatus } from '@/lib/types';

type SavedJob = {
  id: string; recruitment_id: string; created_at: string;
  recruitment: { id: string; slug: string; title: string; department: string | null;
    application_end: string | null; official_application_url: string | null;
    status_override: string | null; is_published: boolean; is_archived: boolean;
    organization: { name: string } | null;
    posts: { vacancies: { vacancy_count: number }[] }[];
  } | null;
};

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase.from('saved_jobs')
      .select('id, recruitment_id, created_at, recruitment:recruitments(id, slug, title, department, application_end, official_application_url, status_override, is_published, is_archived, organization:organizations(name), posts:posts(vacancies:vacancies(vacancy_count)))')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    if (!error) setJobs((data ?? []) as unknown as SavedJob[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    const { error } = await supabase.from('saved_jobs').delete().eq('id', id);
    if (!error) setJobs((items) => items.filter((job) => job.id !== id));
  }

  return (
    <main className="container-page py-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">My Account</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Keep interesting government opportunities in one place and remove them whenever you are done.</p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved jobs…</div>
      ) : jobs.length === 0 ? (
        <Card><CardContent className="py-14 text-center">
          <Bookmark className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No saved jobs yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Tap the bookmark icon on any job to save it here for quick access.</p>
          <Button asChild className="mt-5"><Link href="/jobs">Browse Jobs</Link></Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((item) => {
            const job = item.recruitment;
            if (!job || !job.is_published || job.is_archived) return null;
            const vacancies = job.posts.flatMap((post) => post.vacancies ?? []).reduce((sum, vacancy) => sum + vacancy.vacancy_count, 0);
            const deadline = job.application_end;
            const status = (job.status_override ?? (deadline && new Date(deadline) < new Date() ? 'closed' : 'active')) as JobStatus;
            return (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={'/jobs/' + job.slug} className="text-lg font-semibold hover:text-primary">{job.title}</Link>
                      <p className="mt-1 text-sm text-muted-foreground">{job.organization?.name ?? 'Government Organization'}</p>
                      {job.department && <p className="mt-1 text-xs text-muted-foreground">{job.department}</p>}
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>Deadline: <strong className="text-foreground">{formatDate(deadline)}</strong></span>
                    <span>Vacancies: <strong className="text-foreground">{formatPosts(vacancies)}</strong></span>
                    <span>Saved: <strong className="text-foreground">{formatDate(item.created_at)}</strong></span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild><Link href={'/jobs/' + job.slug}>View Job</Link></Button>
                    {job.official_application_url && <Button asChild variant="outline"><a href={job.official_application_url} target="_blank" rel="noopener noreferrer">Apply Officially <ExternalLink className="ml-2 h-4 w-4" /></a></Button>}
                    <Button variant="ghost" onClick={() => remove(item.id)}><Trash2 className="mr-2 h-4 w-4" /> Remove</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}