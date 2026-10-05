'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STATUSES = ['tracking', 'downloaded', 'exam-appeared', 'completed'] as const;
type Status = typeof STATUSES[number];

const labels: Record<Status, string> = {
  tracking: 'Tracking',
  downloaded: 'Downloaded',
  'exam-appeared': 'Exam Appeared',
  completed: 'Completed',
};

type RecordType = { id: string; tracking_status: Status; notes: string | null };

export function AdmitCardTracker({ admitCardId, title }: { admitCardId: string; title: string }) {
  const [record, setRecord] = useState<RecordType | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('tracking');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await (supabase as any).from('admit_card_tracking')
        .select('id,tracking_status,notes')
        .eq('user_id', user.id).eq('admit_card_id', admitCardId).maybeSingle();
      if (data) {
        setRecord(data as RecordType);
        setStatus(STATUSES.includes(data.tracking_status) ? data.tracking_status : 'tracking');
        setNotes(data.notes ?? '');
      }
      setLoading(false);
    }
    load();
  }, [admitCardId]);

  async function save() {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname);
      return;
    }
    const payload = { user_id: user.id, admit_card_id: admitCardId, tracking_status: status, notes: notes.trim() || null };
    const result = record
      ? await (supabase as any).from('admit_card_tracking').update(payload).eq('id', record.id).select('id,tracking_status,notes').single()
      : await (supabase as any).from('admit_card_tracking').insert(payload).select('id,tracking_status,notes').single();
    if (!result.error && result.data) {
      setRecord(result.data as RecordType);
      setOpen(false);
    }
    setBusy(false);
  }

  async function remove() {
    if (!record) return;
    setBusy(true);
    const { error } = await (supabase as any).from('admit_card_tracking').delete().eq('id', record.id);
    if (!error) { setRecord(null); setOpen(false); setStatus('tracking'); setNotes(''); }
    setBusy(false);
  }

  if (loading) return <Button variant="outline" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading</Button>;

  return (
    <div className="w-full">
      {!record && !open && <Button variant="outline" className="w-full gap-2" onClick={() => setOpen(true)}><PlusCircle className="h-4 w-4" /> Track Admit Card</Button>}
      {record && !open && <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => setOpen(true)}>Tracking: {labels[record.tracking_status]}</Button><Button variant="ghost" size="icon" onClick={remove} disabled={busy} aria-label="Remove admit card tracking"><Trash2 className="h-4 w-4" /></Button></div>}
      {open && <Card className="mt-2"><CardHeader className="pb-3"><CardTitle className="text-base">Track: {title}</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor={'admit-status-' + admitCardId}>Status</Label><select id={'admit-status-' + admitCardId} value={status} onChange={(e) => setStatus(e.target.value as Status)} className="flex h-10 w-full rounded-md border bg-background px-3 text-sm">{STATUSES.map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select></div>
        <div className="space-y-1.5"><Label htmlFor={'admit-notes-' + admitCardId}>Notes</Label><Input id={'admit-notes-' + admitCardId} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional reminder" /></div>
        <div className="flex flex-wrap gap-2"><Button onClick={save} disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{record ? 'Update' : 'Save'}</Button>{record && <Button variant="ghost" onClick={remove} disabled={busy}>Remove</Button>}<Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Close</Button></div>
      </CardContent></Card>}
    </div>
  );
}