import Link from 'next/link';
import { ChevronRight, ExternalLink, FileCheck2 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Results — SarkariSetu', description: 'Find published government exam results, merit lists, cutoffs and scorecards.' };

export default async function ResultsPage() {
  const { data } = await supabaseAdmin.from('results').select('id,title,slug,result_type,result_date,description,official_result_url,official_website_url,organization:organizations(name)').eq('is_published', true).is('archived_at', null).order('result_date', { ascending: false, nullsFirst: false });
  const results = (data ?? []).map((row) => {
    const org = Array.isArray(row.organization) ? row.organization[0] : row.organization;
    return { ...row, organizationName: org?.name ?? 'Organization not specified' };
  });
  return <SiteShell><div className="container-page py-8 sm:py-10">
    <p className="text-sm font-medium text-primary">Exam Center</p><h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Results</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Find published exam results and continue to the official result portal.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {results.map((result) => <Card key={result.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base leading-snug">{result.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{result.organizationName}</p></div><Badge variant="secondary">{result.result_type.replace(/-/g, ' ')}</Badge></div></CardHeader><CardContent>
        <div className="rounded-lg bg-muted/40 p-3 text-sm"><p className="text-xs text-muted-foreground">Result Date</p><p className="mt-1 font-semibold">{result.result_date ? formatDate(result.result_date) : 'Not specified'}</p></div>
        {result.description && <p className="mt-3 text-sm text-muted-foreground">{result.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2">{result.official_result_url && <Button asChild><a href={result.official_result_url} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Official Result</a></Button>}<Button asChild variant="outline"><Link href={`/results/${result.slug}`}>Details <ChevronRight className="ml-1 h-4 w-4" /></Link></Button></div>
      </CardContent></Card>)}
    </div>
    {results.length === 0 && <Card className="mt-6"><CardContent className="p-10 text-center"><FileCheck2 className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold">No published results yet</p><p className="mt-1 text-sm text-muted-foreground">Published results will appear here after verification.</p></CardContent></Card>}
  </div></SiteShell>;
}