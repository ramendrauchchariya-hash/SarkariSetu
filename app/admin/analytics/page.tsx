import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { computeRecruitmentStatus } from '@/lib/recruitment-status';
import { BarChart3, Briefcase, Users, Heart, ClipboardList, Bell, FileCheck2, TicketCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — Analytics' };

async function getAnalytics() {
  const [jobs, users, saved, applications, alerts, results, admitCards] = await Promise.all([
    supabaseAdmin.from('recruitments').select('id,application_start,application_end,status_override,is_published,is_archived,organization_id').eq('is_archived', false),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('saved_jobs').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('application_tracker').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('notification_subscriptions').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('results').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabaseAdmin.from('admit_cards').select('id', { count: 'exact', head: true }).eq('is_published', true),
  ]);

  const rows = jobs.data ?? [];
  const status = { upcoming: 0, open: 0, 'closing-soon': 0, closed: 0 };

  for (const row of rows) {
    if (row.is_published) status[computeRecruitmentStatus(row)]++;
  }

  const orgIds = Array.from(new Set(rows.map((row) => row.organization_id).filter(Boolean))) as string[];
  let organizations: { id: string; name: string }[] = [];

  if (orgIds.length) {
    const { data } = await supabaseAdmin.from('organizations').select('id,name').in('id', orgIds);
    organizations = data ?? [];
  }

  const organizationCounts = new Map<string, number>();
  for (const row of rows) {
    if (row.is_published && row.organization_id) {
      organizationCounts.set(row.organization_id, (organizationCounts.get(row.organization_id) ?? 0) + 1);
    }
  }

  const topOrganizations = organizations
    .map((organization) => ({
      name: organization.name,
      count: organizationCounts.get(organization.id) ?? 0,
    }))
    .filter((organization) => organization.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    publishedJobs: rows.filter((row) => row.is_published).length,
    status,
    users: users.count ?? 0,
    saved: saved.count ?? 0,
    applications: applications.count ?? 0,
    alerts: alerts.count ?? 0,
    results: results.count ?? 0,
    admitCards: admitCards.count ?? 0,
    topOrganizations,
  };
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const analytics = await getAnalytics();

  const cards = [
    ['Published Jobs', analytics.publishedJobs, Briefcase],
    ['Registered Users', analytics.users, Users],
    ['Saved Jobs', analytics.saved, Heart],
    ['Applications Tracked', analytics.applications, ClipboardList],
    ['Job Alerts', analytics.alerts, Bell],
    ['Published Results', analytics.results, FileCheck2],
    ['Published Admit Cards', analytics.admitCards, TicketCheck],
  ];

  const maxStatus = Math.max(1, ...Object.values(analytics.status));

  return (
    <AdminShell title="Analytics" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Analytics' }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => {
          const ChartIcon = Icon as typeof BarChart3;
          return (
            <Card key={label as string}>
              <CardContent className="p-5">
                <ChartIcon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">{(value as number).toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">{label as string}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Published Job Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.status).map(([name, count]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize">{name.replace('-', ' ')}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: ((count / maxStatus) * 100) + '%' }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Organizations</CardTitle></CardHeader>
          <CardContent>
            {analytics.topOrganizations.length ? (
              <div className="space-y-3">
                {analytics.topOrganizations.map((organization) => (
                  <div key={organization.name} className="flex items-center justify-between gap-4 text-sm">
                    <span className="truncate">{organization.name}</span>
                    <span className="font-semibold">{organization.count}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No organization data yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-primary" />Automatic Status Updates</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Published job status is calculated live from application dates using the India (Asia/Kolkata) calendar. No manual status update is required. An admin status override is used only when intentionally set.
          </p>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
