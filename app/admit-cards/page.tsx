import Link from 'next/link';
import { CalendarDays, ChevronRight, FileCheck2 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admit Cards — SarkariSetu', description: 'Find published government exam admit cards and official download links.' };

export default async function AdmitCardsPage() {
  const { data } = await supabaseAdmin.from('admit_cards')
    .select('id,title,slug,exam_date,release_date,status,official_url,description,organization:organizations(name)')
    .eq('is_published', true).is('archived_at', null).order('release_date', { ascending: false });
  const cards = (data ?? []).map((row) => {
    const org = Array.isArray(row.organization) ? row.organization[0] : row.organization;
    return { ...row, organizationName: org?.name ?? 'Organization not specified' };
  });
  return <SiteShell><div className="container-page py-8 sm:py-10">
    <p className="text-sm font-medium text-primary">Exam Center</p><h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Admit Cards</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Find published admit cards and continue to the official download page.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {cards.map((card) => <Card key={card.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base leading-snug">{card.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{card.organizationName}</p></div><Badge variant="secondary">{card.status}</Badge></div></CardHeader><CardContent>
        <div className="grid gap-2 text-sm sm:grid-cols-2"><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Release Date</p><p className="mt-1 font-semibold">{card.release_date ? formatDate(card.release_date) : 'Not specified'}</p></div><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Exam Date</p><p className="mt-1 font-semibold">{card.exam_date ? formatDate(card.exam_date) : 'Not specified'}</p></div></div>
        {card.description && <p className="mt-3 text-sm text-muted-foreground">{card.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2">{card.official_url && <Button asChild><a href={card.official_url} target="_blank" rel="noreferrer">Official Download</a></Button>}<Button asChild variant="outline"><Link href={`/admit-cards/${card.slug}`}>View Details <ChevronRight className="ml-1 h-4 w-4" /></Link></Button></div>
      </CardContent></Card>)}
    </div>
    {cards.length === 0 && <Card className="mt-6"><CardContent className="p-10 text-center"><FileCheck2 className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold">No published admit cards yet</p><p className="mt-1 text-sm text-muted-foreground">New admit cards will appear here after they are published and verified.</p></CardContent></Card>}
    <div className="mt-6 flex items-center gap-2 rounded-lg border p-3 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4 shrink-0" />Always verify the admit card and exam schedule on the official organization website.</div>
  </div></SiteShell>;
}
