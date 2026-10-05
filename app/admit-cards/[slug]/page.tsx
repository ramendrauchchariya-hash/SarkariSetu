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

export default async function AdmitCardDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabaseAdmin.from('admit_cards')
    .select('id,title,slug,exam_date,release_date,status,official_url,description,organization:organizations(name)')
    .eq('slug', slug).eq('is_published', true).is('archived_at', null).maybeSingle();
  if (!data) notFound();
  const org = Array.isArray(data.organization) ? data.organization[0] : data.organization;
  return <SiteShell><div className="container-page py-8 sm:py-10">
    <Button asChild variant="ghost" size="sm"><Link href="/admit-cards"><ChevronLeft className="mr-1 h-4 w-4" />Back to Admit Cards</Link></Button>
    <Card className="mt-4"><CardHeader><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{data.status}</Badge><span className="text-sm text-muted-foreground">{org?.name ?? 'Organization not specified'}</span></div><CardTitle className="mt-2 text-2xl">{data.title}</CardTitle></CardHeader>
      <CardContent className="space-y-5"><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">Release Date</p><p className="mt-1 font-semibold">{data.release_date ? formatDate(data.release_date) : 'Not specified'}</p></div><div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">Exam Date</p><p className="mt-1 font-semibold">{data.exam_date ? formatDate(data.exam_date) : 'Not specified'}</p></div></div>
      {data.description && <div><h2 className="font-semibold">Details</h2><p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{data.description}</p></div>}
      {data.official_url && <Button asChild><a href={data.official_url} target="_blank" rel="noreferrer">Open Official Admit Card</a></Button>}
      <p className="text-xs text-muted-foreground">SarkariSetu is not a government website. Verify the admit card and exam details on the official organization website before proceeding.</p>
    </CardContent></Card>
  </div></SiteShell>;
}
