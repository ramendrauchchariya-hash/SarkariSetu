import Link from 'next/link';
import { ChevronRight, GraduationCap } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admissions — SarkariSetu', description: 'Browse published admission opportunities and official application links.' };

export default async function AdmissionsPage() {
  const { data } = await supabaseAdmin.from('recruitments')
    .select('id,title,slug,description,department,application_start,application_end,posted_date,official_application_url,official_notification_url,organization:organizations(name),recruitment_categories(category:categories(name))')
    .eq('is_published', true).eq('is_archived', false)
    .ilike('job_type', '%admission%')
    .order('posted_date', { ascending: false });
  const admissions = (data ?? []).map((row) => {
    const org = Array.isArray(row.organization) ? row.organization[0] : row.organization;
    const categories = (row.recruitment_categories ?? []).map((item) => {
      const category = Array.isArray(item.category) ? item.category[0] : item.category;
      return category?.name;
    }).filter(Boolean);
    return { ...row, organizationName: org?.name ?? 'Institution not specified', categories };
  });
  return <SiteShell><div className="container-page py-8 sm:py-10">
    <p className="text-sm font-medium text-primary">Education Center</p><h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Admissions</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Browse published admission opportunities and continue to the official institution or authority website.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {admissions.map((item) => <Card key={item.id}><CardHeader><div className="flex items-start gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><GraduationCap className="h-5 w-5" /></div><div className="min-w-0"><CardTitle className="text-base leading-snug">{item.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{item.organizationName}</p></div></div></CardHeader><CardContent>
        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Application Starts</p><p className="mt-1 font-semibold">{item.application_start ? formatDate(item.application_start) : 'Not specified'}</p></div><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Application Deadline</p><p className="mt-1 font-semibold">{item.application_end ? formatDate(item.application_end) : 'Not specified'}</p></div></div>
        {item.categories.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{item.categories.map((category) => <Badge key={category} variant="secondary">{category}</Badge>)}</div>}
        <div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={`/admissions/${item.slug}`}>Details <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>{item.official_application_url && <Button asChild><a href={item.official_application_url} target="_blank" rel="noreferrer">Official Application</a></Button>}</div>
      </CardContent></Card>)}
    </div>
    {admissions.length === 0 && <Card className="mt-6"><CardContent className="p-10 text-center"><GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold">No published admissions yet</p><p className="mt-1 text-sm text-muted-foreground">Admission opportunities will appear here after they are added and verified.</p></CardContent></Card>}
    <p className="mt-6 text-xs text-muted-foreground">SarkariSetu is not a government website. Verify admission dates, eligibility and application instructions on the official authority website.</p>
  </div></SiteShell>;
}