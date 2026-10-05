'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Loader2, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

type Notification = { id:string; title:string; message:string|null; notification_type:string|null; related_recruitment_id:string|null; is_read:boolean; created_at:string };

export default function NotificationCenterPage() {
  const [user,setUser]=useState(false); const [items,setItems]=useState<Notification[]>([]); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false);

  async function load() {
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setUser(false);setLoading(false);return;}
    setUser(true);
    const {data}=await supabase.from('notifications').select('id,title,message,notification_type,related_recruitment_id,is_read,created_at').eq('user_id',user.id).order('created_at',{ascending:false});
    setItems((data??[]) as Notification[]); setLoading(false);
  }
  useEffect(()=>{load()},[]);

  async function markRead(id:string){await supabase.from('notifications').update({is_read:true}).eq('id',id);setItems(x=>x.map(n=>n.id===id?{...n,is_read:true}:n));}
  async function markAllRead(){const unread=items.filter(n=>!n.is_read).map(n=>n.id);if(!unread.length)return;setBusy(true);await supabase.from('notifications').update({is_read:true}).in('id',unread);setItems(x=>x.map(n=>({...n,is_read:true})));setBusy(false);}

  if(loading)return <SiteShell><div className="container-page flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div></SiteShell>;
  if(!user)return <SiteShell><div className="container-page py-12"><Card className="mx-auto max-w-2xl"><CardContent className="p-8 text-center"><UserCircle className="mx-auto h-12 w-12 text-muted-foreground"/><h1 className="mt-4 font-display text-2xl font-bold">Your Notifications</h1><p className="mt-2 text-sm text-muted-foreground">Sign in to view notifications linked to your account.</p><Button asChild className="mt-6"><Link href="/auth/login?redirectTo=%2Fdashboard%2Fnotification-center">Sign In</Link></Button></CardContent></Card></div></SiteShell>;

  const unread=items.filter(n=>!n.is_read).length;
  return <SiteShell><div className="container-page py-8 sm:py-10">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">My Account</p><h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1><p className="mt-2 text-sm text-muted-foreground">Important updates and reminders for your SarkariSetu account.</p></div>{unread>0&&<Button variant="outline" onClick={markAllRead} disabled={busy}><CheckCheck className="mr-2 h-4 w-4"/>Mark all as read</Button>}</div>
    <div className="space-y-3">{items.map(n=><Card key={n.id} className={!n.is_read?'border-primary/30 bg-primary/[0.02]':''}><CardContent className="p-4"><div className="flex gap-3"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Bell className="h-4 w-4"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{n.title}</h2>{!n.is_read&&<Badge>New</Badge>}</div>{n.message&&<p className="mt-1 text-sm text-muted-foreground">{n.message}</p>}<p className="mt-2 text-xs text-muted-foreground">{formatDate(n.created_at)}</p>{!n.is_read&&<Button variant="link" className="mt-1 h-auto px-0" onClick={()=>markRead(n.id)}>Mark as read</Button>}{n.related_recruitment_id&&<Button asChild variant="link" className="mt-1 ml-4 h-auto px-0"><Link href={'/jobs/'+n.related_recruitment_id}>View related job</Link></Button>}</div></div></CardContent></Card>)}{items.length===0&&<Card><CardContent className="p-10 text-center"><Bell className="mx-auto h-10 w-10 text-muted-foreground"/><p className="mt-3 font-semibold">No notifications yet</p><p className="mt-1 text-sm text-muted-foreground">Important account updates will appear here.</p></CardContent></Card>}</div>
  </div></SiteShell>;
}