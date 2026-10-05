import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdmissionDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabaseAdmin.from('recruitments')
    .select('id,title,slug,description,department,application_start,application_end,posted_date,official_application_url,official_notification_url,official_website_url,organization:organizations(name),recruitment_categories(category:categories(name)),important_dates(date_type,date_value,label,description)')
    .eq('slug', slug).eq('is_published', true).eq('is_archived', false).ilike('job_type', '%admission%').maybeSingle();
  if (!data) notFound();
  const org = Array.isArray(data.organization) ? data.organization[0] : data.organization;
  const categories = (data.recruitment_categories ?? []).map((item) => {
    const category = Array.isArray(item.category) ? item.category[0] : item.category;
    return category?.name;
  }).filter(Boolean);
  const dates = [...(data.important_dates ?? [])].sort((a,b) => a.date_value.localeCompare(b.date_value));
  return <SiteShell><div className="container-page py-8 sm:py-10">
    <Button asChild variant="ghost" size="sm"><Link href="/admissions"><ChevronLeft className="mr-1 h-4 w-4" />Back to Admissions</Link></Button>
    <Card className="mt-4"><CardHeader><div className="flex flex-wrap gap-2">{categories.map((c)=><Badge key={c} variant="secondary">{c}</Badge>)}</div><p className="mt-2 text-sm text-muted-foreground">{org?.name ?? 'Institution not specified'}</p><CardTitle className="mt-1 text-2xl">{data.title}</CardTitle></CardHeader>
    <CardContent className="space-y-6">
      {data.description && <div><h2 className="font-semibold">About this admission</h2><p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{data.description}</p></div>}
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">Application Starts</p><p className="mt-1 font-semibold">{data.application_start ? formatDate(data.application_start) : 'Not specified'}</p></div><div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">Application Deadline</p><p className="mt-1 font-semibold">{data.application_end ? formatDate(data.application_end) : 'Not specified'}</p></div></div>
      {dates.length > 0 && <div><h2 className="font-semibold">Important Dates</h2><div className="mt-3 space-y-2">{dates.map((d)=><div key={d.date_type+d.date_value} className="flex items-start justify-between gap-4 rounded-lg bg-muted/40 p-3 text-sm"><div><p className="font-medium">{d.label || d.date_type}</p>{d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}</div><span className="shrink-0 font-semibold">{formatDate(d.date_value)}</span></div>)}</div></div>}
      <div className="flex flex-wrap gap-2">{data.official_application_url && <Button asChild><a href={data.official_application_url} target="_blank" rel="noreferrer">Official Application</a></Button>}{data.official_notification_url && <Button asChild variant="outline"><a href={data.official_notification_url} target="_blank" rel="noreferrer">Official Notification</a></Button>}{data.official_website_url && <Button asChild variant="outline"><a href={data.official_website_url} target="_blank" rel="noreferrer">Official Website</a></Button>}</div>
      <p className="text-xs text-muted-foreground">SarkariSetu is not a government website. Verify eligibility, dates and application instructions on the official authority website.</p>
    </CardContent></Card>
  </div></SiteShell>;
}