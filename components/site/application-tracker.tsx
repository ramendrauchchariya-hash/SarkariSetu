'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const STATUSES = ['interested', 'applied', 'exam-appeared', 'shortlisted', 'selected', 'rejected'] as const;
type Status = typeof STATUSES[number];

type Tracker = {
  id: string; recruitment_id: string; application_status: Status;
  application_date: string | null; application_number: string | null; notes: string | null;
  recruitment: { slug: string; title: string; application_end: string | null; organization: { name: string } | null } | null;
};

const labels: Record<Status, string> = {
  interested: 'Interested', applied: 'Applied', 'exam-appeared': 'Exam Appeared',
  shortlisted: 'Shortlisted', selected: 'Selected', rejected: 'Rejected',
};

export function ApplicationTracker({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<Tracker | null>(null);
  const [status, setStatus] = useState<Status>('interested');
  const [applicationDate, setApplicationDate] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoaded(true); return; }
    const { data } = await supabase.from('application_tracker')
      .select('id, recruitment_id, application_status, application_date, application_number, notes, recruitment:recruitments(slug, title, application_end, organization:organizations(name))')
      .eq('user_id', user.id).eq('recruitment_id', jobId).maybeSingle();
    if (data) {
      const item = data as unknown as Tracker;
      setRecord(item);
      setStatus(STATUSES.includes(item.application_status) ? item.application_status : 'interested');
      setApplicationDate(item.application_date ?? '');
      setApplicationNumber(item.application_number ?? '');
      setNotes(item.notes ?? '');
      setOpen(true);
    }
    setLoaded(true);
  }

  useEffect(() => { load(); }, [jobId]);

  async function save() {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname);
      return;
    }
    const payload = {
      user_id: user.id, recruitment_id: jobId, application_status: status,
      application_date: applicationDate || null, application_number: applicationNumber.trim() || null,
      notes: notes.trim() || null,
    };
    const result = record
      ? await supabase.from('application_tracker').update(payload).eq('id', record.id).select('id, recruitment_id, application_status, application_date, application_number, notes, recruitment:recruitments(slug, title, application_end, organization:organizations(name))').single()
      : await supabase.from('application_tracker').insert(payload).select('id, recruitment_id, application_status, application_date, application_number, notes, recruitment:recruitments(slug, title, application_end, organization:organizations(name))').single();
    if (!result.error && result.data) {
      setRecord(result.data as unknown as Tracker);
      setOpen(true);
    }
    setBusy(false);
  }

  async function remove() {
    if (!record) return;
    setBusy(true);
    const { error } = await supabase.from('application_tracker').delete().eq('id', record.id);
    if (!error) {
      setRecord(null); setOpen(false); setStatus('interested'); setApplicationDate(''); setApplicationNumber(''); setNotes('');
    }
    setBusy(false);
  }

  if (!loaded) return <Button variant="outline" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading tracker</Button>;

  return (
    <div className="w-full">
      {!open && !record ? (
        <Button variant="outline" className="w-full gap-2" onClick={() => setOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Track Application
        </Button>
      ) : null}
      {open && (
        <Card className="mt-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Track: {jobTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={'status-' + jobId}>Status</Label>
                <select id={'status-' + jobId} value={status} onChange={(e) => setStatus(e.target.value as Status)}
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm">
                  {STATUSES.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={'date-' + jobId}>Application Date</Label>
                <Input id={'date-' + jobId} type="date" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={'number-' + jobId}>Application / Registration Number</Label>
              <Input id={'number-' + jobId} value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={'notes-' + jobId}>Notes</Label>
              <Textarea id={'notes-' + jobId} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a reminder or note (optional)" rows={3} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{record ? 'Update Tracker' : 'Save Tracker'}</Button>
              {record && <Button variant="ghost" onClick={remove} disabled={busy}><Trash2 className="mr-2 h-4 w-4" /> Remove</Button>}
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Close</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}