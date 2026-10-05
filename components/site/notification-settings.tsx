'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, Check, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Subscription = {
  id: string;
  category: string | null;
  department: string | null;
  state: string | null;
  created_at: string;
};

const CATEGORIES = [
  '10th Pass',
  '12th Pass',
  'ITI',
  'Diploma',
  'Graduate',
  'Engineering',
  'Post Graduate',
];

const STATES = [
  'All India',
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Rajasthan',
  'Delhi',
  'Bihar',
  'Maharashtra',
  'Gujarat',
  'Haryana',
  'Other',
];

export function NotificationSettings() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_subscriptions')
      .select('id, category, department, state, created_at')
      .order('created_at', { ascending: false });

    if (!error) setSubscriptions((data ?? []) as Subscription[]);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        setLoading(false);
        return;
      }
      load();
    });
    return () => { active = false; };
  }, []);

  async function addSubscription() {
    setMessage('');
    if (!category && !department.trim() && !state) {
      setMessage('Select at least one alert preference.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('notification_subscriptions').insert({
      category: category || null,
      department: department.trim() || null,
      state: state || null,
    });

    if (error) {
      setMessage(error.message.includes('auth') ? 'Please sign in to manage job alerts.' : error.message);
    } else {
      setCategory('');
      setDepartment('');
      setState('');
      setMessage('Job alert saved.');
      await load();
    }
    setSaving(false);
  }

  async function removeSubscription(id: string) {
    const { error } = await supabase.from('notification_subscriptions').delete().eq('id', id);
    if (!error) setSubscriptions((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Create a job alert</CardTitle>
              <CardDescription>Choose the type of government opportunities you want to track.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Any qualification" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department / Organization</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. SSC, UPSC, Railway"
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger><SelectValue placeholder="Any state" /></SelectTrigger>
              <SelectContent>
                {STATES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Button onClick={addSubscription} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
              Save Job Alert
            </Button>
            {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your alerts</CardTitle>
          <CardDescription>Manage the job-alert preferences saved to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading alerts…</div>
          ) : subscriptions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Bell className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
              <p className="font-medium">No job alerts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first alert above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <p className="font-medium">Job alert</p>
                      <p className="text-muted-foreground">
                        {[item.category, item.department, item.state].filter(Boolean).join(' • ') || 'All new opportunities'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeSubscription(item.id)} aria-label="Delete job alert">
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
