import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ResultDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabaseAdmin.from('results').select('id,title,slug,result_type,result_date,description,official_result_url,official_website_url,organization:organizations(name)').eq('slug', slug).eq('is_published', true).is('archived_at', null).maybeSingle();
  if (!data) notFound();
  const org = Array.isArray(data.organization) ? data.organization[0] : data.organization;
  return <SiteShell><div className="container-page py-8 sm:py-10">
    <Button asChild variant="ghost" size="sm"><Link href="/results"><ChevronLeft className="mr-1 h-4 w-4" />Back to Results</Link></Button>
    <Card className="mt-4"><CardHeader><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{data.result_type.replace(/-/g, ' ')}</Badge><span className="text-sm text-muted-foreground">{org?.name ?? 'Organization not specified'}</span></div><CardTitle className="mt-2 text-2xl">{data.title}</CardTitle></CardHeader>
    <CardContent className="space-y-5"><div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">Result Date</p><p className="mt-1 font-semibold">{data.result_date ? formatDate(data.result_date) : 'Not specified'}</p></div>
    {data.description && <div><h2 className="font-semibold">Details</h2><p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{data.description}</p></div>}
    <div className="flex flex-wrap gap-2">{data.official_result_url && <Button asChild><a href={data.official_result_url} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Open Official Result</a></Button>}{data.official_website_url && <Button asChild variant="outline"><a href={data.official_website_url} target="_blank" rel="noreferrer">Official Website</a></Button>}</div>
    <p className="text-xs text-muted-foreground">SarkariSetu is not a government website. Verify result details on the official organization website before relying on them.</p>
    </CardContent></Card>
  </div></SiteShell>;
}