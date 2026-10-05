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

type Tracked = {
  id: string;
  tracking_status: string;
  notes: string | null;
  admit_card: { title: string; slug: string; exam_date: string | null; release_date: string | null; status: string; organization: { name: string } | null } | null;
};

export default function DashboardAdmitCardsPage() {
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [items, setItems] = useState<Tracked[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { id: user.id, email: user.email } : null);
      if (!user) { setLoading(false); return; }
      const { data } = await (supabase as any).from('admit_card_tracking')
        .select('id,tracking_status,notes,admit_card:admit_cards(title,slug,exam_date,release_date,status,organization:organizations(name))')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      const normalized = ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
        const raw = row.admit_card as Tracked['admit_card'] | Tracked['admit_card'][] | null;
        return { ...row, admit_card: Array.isArray(raw) ? raw[0] ?? null : raw } as unknown as Tracked;
      }).filter((row) => row.admit_card);
      setItems(normalized);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <SiteShell><div className="container-page flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div></SiteShell>;
  if (!user) return <SiteShell><div className="container-page py-12"><Card className="mx-auto max-w-2xl"><CardContent className="p-8 text-center"><UserCircle className="mx-auto h-12 w-12 text-muted-foreground" /><h1 className="mt-4 font-display text-2xl font-bold">Track Your Admit Cards</h1><p className="mt-2 text-sm text-muted-foreground">Sign in to manage the admit cards you are following.</p><Button asChild className="mt-6"><Link href="/auth/login?redirectTo=%2Fdashboard%2Fadmit-cards">Sign In</Link></Button></CardContent></Card></div></SiteShell>;

  return <SiteShell><div className="container-page py-8 sm:py-10">
    <div className="mb-6"><p className="text-sm font-medium text-primary">My Dashboard</p><h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Tracked Admit Cards</h1><p className="mt-2 text-sm text-muted-foreground">Keep your admit card status and exam dates in one place.</p></div>
    <div className="space-y-3">{items.map((item) => { const card = item.admit_card!; return <Card key={item.id}><CardContent className="p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><Link href={'/admit-cards/' + card.slug} className="font-semibold hover:text-primary">{card.title}</Link><p className="mt-1 text-sm text-muted-foreground">{card.organization?.name ?? 'Organization not specified'}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="secondary">{item.tracking_status.replace(/-/g, ' ')}</Badge>{card.release_date && <Badge variant="outline">Released {formatDate(card.release_date)}</Badge>}{card.exam_date && <Badge variant="outline">Exam {formatDate(card.exam_date)}</Badge>}</div>{item.notes && <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>}</div><Button asChild variant="outline"><Link href={'/admit-cards/' + card.slug}>View Details <ChevronRight className="ml-1 h-4 w-4" /></Link></Button></div></CardContent></Card> })}{items.length === 0 && <Card><CardContent className="p-8 text-center"><CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold">No tracked admit cards yet</p><p className="mt-1 text-sm text-muted-foreground">Open an admit card and choose Track Admit Card.</p><Button asChild className="mt-4"><Link href="/admit-cards">Browse Admit Cards</Link></Button></CardContent></Card>}</div>
  </div></SiteShell>;
}