'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Loader2, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type TrackingStatus = 'watching' | 'registered' | 'appeared' | 'result-awaiting' | 'completed';

const statuses: Array<{ value: TrackingStatus; label: string }> = [
  { value: 'watching', label: 'Watching' },
  { value: 'registered', label: 'Registered' },
  { value: 'appeared', label: 'Exam Appeared' },
  { value: 'result-awaiting', label: 'Result Awaiting' },
  { value: 'completed', label: 'Completed' },
];

export function ExamTracker({ recruitmentId, examTitle }: { recruitmentId: string; examTitle: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<TrackingStatus>('watching');
  const [notes, setNotes] = useState('');
  const [tracked, setTracked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('exam_tracking')
        .select('tracking_status, notes')
        .eq('user_id', user.id)
        .eq('recruitment_id', recruitmentId)
        .maybeSingle();
      if (active && data) {
        setTracked(true);
        setStatus(data.tracking_status as TrackingStatus);
        setNotes(data.notes ?? '');
      }
      if (active) setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [recruitmentId]);

  async function startTracking() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('exam_tracking').insert({
      user_id: user.id,
      recruitment_id: recruitmentId,
      tracking_status: status,
      notes: notes.trim() || null,
    });
    if (!error) setTracked(true);
    setSaving(false);
  }

  async function saveChanges() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setSaving(true);
    await supabase.from('exam_tracking')
      .update({ tracking_status: status, notes: notes.trim() || null })
      .eq('user_id', user.id)
      .eq('recruitment_id', recruitmentId);
    setSaving(false);
  }

  async function removeTracking() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    await supabase.from('exam_tracking')
      .delete()
      .eq('user_id', user.id)
      .eq('recruitment_id', recruitmentId);
    setTracked(false);
    setStatus('watching');
    setNotes('');
    setSaving(false);
  }

  if (loading) return <Button variant="outline" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading</Button>;

  if (!tracked) {
    return (
      <Button variant="outline" onClick={startTracking} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
        Track Exam
      </Button>
    );
  }

  return (
    <div className="w-full rounded-xl border bg-muted/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Exam tracked</p>
          <Badge variant="secondary" className="mt-1">{statuses.find((x) => x.value === status)?.label}</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={removeTracking} disabled={saving} aria-label={`Stop tracking ${examTitle}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <Select value={status} onValueChange={(v) => setStatus(v as TrackingStatus)}>
          <SelectTrigger><SelectValue placeholder="Tracking status" /></SelectTrigger>
          <SelectContent>
            {statuses.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" rows={2} />
        <Button onClick={saveChanges} disabled={saving} size="sm">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Tracking
        </Button>
      </div>
    </div>
  );
}
