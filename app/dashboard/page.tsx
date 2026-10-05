'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, Bookmark, CalendarDays, ClipboardList, Loader2, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type User = { id: string; email?: string | null };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [counts, setCounts] = useState({ saved: 0, applications: 0, alerts: 0, exams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { id: user.id, email: user.email } : null);
      if (!user) {
        setLoading(false);
        return;
      }

      const [saved, applications, alerts, exams] = await Promise.all([
        supabase.from('saved_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('application_tracker').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('notification_subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('exam_tracking').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setCounts({
        saved: saved.count ?? 0,
        applications: applications.count ?? 0,
        alerts: alerts.count ?? 0,
        exams: exams.count ?? 0,
      });
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <SiteShell><div className="container-page flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div></SiteShell>;
  }

  if (!user) {
    return (
      <SiteShell>
        <div className="container-page py-12">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-8 text-center">
              <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h1 className="mt-4 font-display text-2xl font-bold">Your SarkariSetu Dashboard</h1>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Sign in to manage saved jobs, application tracking and job alerts from one place.
              </p>
              <Button asChild className="mt-6">
                <Link href="/auth/login?redirectTo=%2Fdashboard">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SiteShell>
    );
  }

  const cards = [
    { title: 'Saved Jobs', value: counts.saved, description: 'Jobs you want to revisit', href: '/dashboard/saved-jobs', icon: Bookmark },
    { title: 'My Applications', value: counts.applications, description: 'Track application progress', href: '/dashboard/applications', icon: ClipboardList },
    { title: 'Job Alerts', value: counts.alerts, description: 'Your notification preferences', href: '/dashboard/notifications', icon: Bell },
    { title: 'Tracked Exams', value: counts.exams, description: 'Important exam dates', href: '/dashboard/exams', icon: CalendarDays },
  ];

  return (
    <SiteShell>
      <div className="container-page py-8 sm:py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">My Dashboard</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email ?? 'Signed-in user'}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ title, value, description, href, icon: Icon }) => (
            <Card key={title} className="transition-shadow hover:shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                <Button asChild variant="link" className="mt-3 h-auto p-0">
                  <Link href={href}>Open <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild><Link href="/jobs">Browse Jobs</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/saved-jobs">View Saved Jobs</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/applications">Track Applications</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/notifications">Manage Job Alerts</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/exams">Track Exams</Link></Button>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Personal</Badge>
          Your dashboard data is private to your account.
        </div>
      </div>
    </SiteShell>
  );
}