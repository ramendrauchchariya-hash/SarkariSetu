import Link from 'next/link';
import { Bell, ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Notifications — SarkariSetu', description: 'Latest published government recruitment and exam notifications.' };

export default async function NotificationsPage() {
  const { data } = await supabaseAdmin.from('notifications')
    .select('id,title,message,notification_type,related_recruitment_id,created_at,recruitment:recruitments(title,slug,official_notification_url)')
    .not('related_recruitment_id', 'is', null)
    .order('created_at', { ascending: false });

  const notifications = (data ?? []).map((row) => {
    const recruitment = Array.isArray(row.recruitment) ? row.recruitment[0] : row.recruitment;
    return { ...row, recruitment };
  }).filter((row) => row.recruitment);

  return <SiteShell><div className="container-page py-8 sm:py-10">
    <p className="text-sm font-medium text-primary">Updates</p>
    <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Latest recruitment and examination updates available through SarkariSetu.</p>
    <div className="mt-6 space-y-3">
      {notifications.map((item) => <Card key={item.id}><CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Bell className="h-5 w-5" /></div>
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{item.title}</h2>{item.notification_type && <Badge variant="secondary">{item.notification_type}</Badge>}</div>
              <p className="mt-1 text-sm text-muted-foreground">{item.message || item.recruitment.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">Published {formatDate(item.created_at)}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2"><Button asChild variant="outline" size="sm"><Link href={`/jobs/${item.recruitment.slug}`}>Details <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link></Button>{item.recruitment.official_notification_url && <Button asChild size="sm"><a href={item.recruitment.official_notification_url} target="_blank" rel="noreferrer">Official Notice</a></Button>}</div>
        </div>
      </CardContent></Card>)}
      {notifications.length === 0 && <Card><CardContent className="p-10 text-center"><Bell className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold">No notifications yet</p><p className="mt-1 text-sm text-muted-foreground">New verified updates will appear here.</p></CardContent></Card>}
    </div>
    <p className="mt-6 text-xs text-muted-foreground">SarkariSetu is not a government website. Verify every notice on the official organization website before applying or relying on an update.</p>
  </div></SiteShell>;
}
