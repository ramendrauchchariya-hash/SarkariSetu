import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle2,
  FileEdit,
  Clock,
  CalendarClock,
  ShieldAlert,
  Plus,
  ArrowRight,
  History,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { computeRecruitmentStatus } from '@/lib/recruitment-status';
import { verificationStatusConfig, jobStatusConfig } from '@/lib/admin-config';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Admin Dashboard' };

async function getDashboardStats() {
  const { count: totalJobs } = await supabaseAdmin
    .from('recruitments')
    .select('*', { count: 'exact', head: true });

  const { count: publishedJobs } = await supabaseAdmin
    .from('recruitments')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .eq('is_archived', false);

  const { count: draftJobs } = await supabaseAdmin
    .from('recruitments')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', false)
    .eq('is_archived', false);

  const { count: archivedJobs } = await supabaseAdmin
    .from('recruitments')
    .select('*', { count: 'exact', head: true })
    .eq('is_archived', true);

  const { count: pendingVerification } = await supabaseAdmin
    .from('recruitments')
    .select('*', { count: 'exact', head: true })
    .neq('verification_status', 'verified')
    .eq('is_archived', false);

  // Get all non-archived recruitments for status computation
  const { data: allActive } = await supabaseAdmin
    .from('recruitments')
    .select('id, application_start, application_end, status_override, is_published, is_archived')
    .eq('is_archived', false);

  let closingSoon = 0;
  let upcoming = 0;
  if (allActive) {
    for (const r of allActive) {
      if (!r.is_published) continue;
      const status = computeRecruitmentStatus(r);
      if (status === 'closing-soon') closingSoon++;
      if (status === 'upcoming') upcoming++;
    }
  }

  // Recent jobs (latest 5)
  const { data: recentJobs } = await supabaseAdmin
    .from('recruitments')
    .select(`
      id,
      title,
      slug,
      is_published,
      is_archived,
      verification_status,
      updated_at,
      organization_id,
      department,
      application_start,
      application_end,
      status_override,
      organizations:organization_id (name)
    `)
    .order('updated_at', { ascending: false })
    .limit(5);

  // Recent audit logs
  const { data: recentActivity } = await supabaseAdmin
    .from('audit_logs')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      created_at,
      user_id
    `)
    .order('created_at', { ascending: false })
    .limit(8);

  return {
    totalJobs: totalJobs ?? 0,
    publishedJobs: publishedJobs ?? 0,
    draftJobs: draftJobs ?? 0,
    archivedJobs: archivedJobs ?? 0,
    pendingVerification: pendingVerification ?? 0,
    closingSoon,
    upcoming,
    recentJobs: recentJobs ?? [],
    recentActivity: recentActivity ?? [],
  };
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Published', value: stats.publishedJobs, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Drafts', value: stats.draftJobs, icon: FileEdit, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Closing Soon', value: stats.closingSoon, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Upcoming', value: stats.upcoming, icon: CalendarClock, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Pending Verification', value: stats.pendingVerification, icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <AdminShell title="Dashboard" breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}>
      {/* Welcome */}
      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="font-display text-lg font-bold">{admin.email}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="p-4">
                <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/jobs/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Job
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/jobs" className="gap-2">
            <FileText className="h-4 w-4" />
            Manage Jobs
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent jobs */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Jobs</CardTitle>
              <Link href="/admin/jobs" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentJobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No jobs yet. Create your first job to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Job Title</th>
                      <th className="pb-2 pr-4 font-medium">Organization</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 pr-4 font-medium">Verification</th>
                      <th className="pb-2 font-medium">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.recentJobs.map((job: Record<string, unknown>) => {
                      const orgName = (job.organizations as { name: string } | null)?.name ?? '—';
                      const status = computeRecruitmentStatus({
                        application_start: job.application_start as string | null,
                        application_end: job.application_end as string | null,
                        status_override: job.status_override as import('@/lib/database-types').RecruitmentStatus | null,
                      });
                      const vConfig = verificationStatusConfig[job.verification_status as string] ?? verificationStatusConfig.unverified;
                      const sConfig = jobStatusConfig[status] ?? jobStatusConfig.open;
                      const isPublished = job.is_published as boolean;
                      const isArchived = job.is_archived as boolean;

                      return (
                        <tr key={job.id as string} className="group">
                          <td className="py-3 pr-4">
                            <Link
                              href={`/admin/jobs/${job.id}/edit`}
                              className="font-medium text-foreground group-hover:text-primary"
                            >
                              {job.title as string}
                            </Link>
                            {isArchived && <span className="ml-2 text-xs text-muted-foreground">(Archived)</span>}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{orgName}</td>
                          <td className="py-3 pr-4">
                            {isArchived ? (
                              <Badge variant="outline">Archived</Badge>
                            ) : isPublished ? (
                              <Badge variant={sConfig.variant as 'success' | 'warning' | 'destructive' | 'info' | 'default' | 'secondary' | 'outline'}>{sConfig.label}</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={vConfig.variant as 'success' | 'warning' | 'destructive' | 'info' | 'default' | 'secondary' | 'outline'}>
                              {vConfig.label}
                            </Badge>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            {formatDate(job.updated_at as string)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {stats.recentActivity.map((log: Record<string, unknown>) => (
                  <li key={log.id as string} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/50" />
                    <div className="min-w-0">
                      <p className="font-medium capitalize">{(log.action as string).replace(/:/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.created_at as string, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
