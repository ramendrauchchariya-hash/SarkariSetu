'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/site/empty-state';
import { formatDate } from '@/lib/format';

type Row = {
  id: string;
  recruitment_id: string;
  application_status: string;
  application_date: string | null;
  application_number: string | null;
  notes: string | null;
  recruitment: {
    slug: string;
    title: string;
    application_end: string | null;
    official_application_url: string | null;
    organization: { name: string } | null;
  } | null;
};

const labels: Record<string, string> = {
  interested: 'Interested',
  applied: 'Applied',
  'exam-appeared': 'Exam Appeared',
  shortlisted: 'Shortlisted',
  selected: 'Selected',
  rejected: 'Rejected',
};

export default function ApplicationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('application_tracker')
      .select('id, recruitment_id, application_status, application_date, application_number, notes, recruitment:recruitments(slug, title, application_end, official_application_url, organization:organizations(name))')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    const { error } = await supabase.from('application_tracker').delete().eq('id', id);
    if (!error) setRows((current) => current.filter((row) => row.id !== id));
  }

  if (loading) {
    return <SiteShell><div className="container-page py-16"><div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div></div></SiteShell>;
  }

  return (
    <SiteShell>
      <div className="container-page py-8 sm:py-10">
        <div className="mb-7">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">My Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track application progress, registration numbers and your notes in one place.</p>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No applications tracked yet"
            description="Open any job and use Track Application to add it to your personal tracker."
          />
        ) : (
          <div className="grid gap-4">
            {rows.map((row) => {
              const job = row.recruitment;
              if (!job) return null;
              return (
                <Card key={row.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">{job.organization?.name ?? 'Organization'}</p>
                        <h2 className="mt-1 text-lg font-bold">{job.title}</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{labels[row.application_status] ?? row.application_status}</Badge>
                          {row.application_date && <span className="text-xs text-muted-foreground">Applied: {formatDate(row.application_date)}</span>}
                          {job.application_end && <span className="text-xs text-muted-foreground">Deadline: {formatDate(job.application_end)}</span>}
                        </div>
                        {row.application_number && <p className="mt-3 text-sm"><span className="text-muted-foreground">Application No.:</span> <span className="font-semibold">{row.application_number}</span></p>}
                        {row.notes && <p className="mt-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{row.notes}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Button asChild variant="outline">
                          <Link href={'/jobs/' + job.slug}>View Job</Link>
                        </Button>
                        {job.official_application_url && (
                          <Button asChild>
                            <a href={job.official_application_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Apply Officially</a>
                          </Button>
                        )}
                        <Button variant="ghost" onClick={() => remove(row.id)}><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </SiteShell>
  );
}