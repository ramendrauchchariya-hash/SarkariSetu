'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Eye,
  Edit,
  Copy,
  Send,
  EyeOff,
  Archive,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/format';
import { computeRecruitmentStatus } from '@/lib/recruitment-status';
import { verificationStatusConfig, jobStatusConfig } from '@/lib/admin-config';
import {
  publishJob,
  unpublishJob,
  archiveJob,
  duplicateJob,
} from '@/lib/admin-actions';
import { toast } from 'sonner';

export interface AdminJob {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  is_archived: boolean;
  verification_status: string;
  department: string | null;
  application_end: string | null;
  application_start: string | null;
  status_override: string | null;
  updated_at: string;
  organization_id: string | null;
  organizations: { id: string; name: string } | null;
}

interface Props {
  jobs: AdminJob[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  search: string;
  sort: string;
  statusFilter: string;
  verificationFilter: string;
  orgFilter: string;
  organizations: { id: string; name: string }[];
  error?: string;
}

export function AdminJobsListClient({
  jobs,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  search,
  sort,
  statusFilter,
  verificationFilter,
  orgFilter,
  organizations,
  error,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(search);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'publish' | 'unpublish' | 'archive' | 'duplicate';
    job: AdminJob;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if (updates.q !== undefined || updates.status !== undefined || updates.verification !== undefined || updates.organization !== undefined || updates.sort !== undefined) {
        params.delete('page');
      }
      const qs = params.toString();
      router.push(qs ? `/admin/jobs?${qs}` : '/admin/jobs');
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput });
  };

  const handlePublish = async (job: AdminJob) => {
    setActionLoading(`publish-${job.id}`);
    setConfirmDialog(null);
    const result = await publishJob(job.id);
    if (result.success) {
      toast.success(`"${job.title}" is now published and visible on /jobs`);
      setSuccessMsg(`"${job.title}" published successfully.`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to publish job');
    }
    setActionLoading(null);
  };

  const handleUnpublish = async (job: AdminJob) => {
    setActionLoading(`unpublish-${job.id}`);
    setConfirmDialog(null);
    const result = await unpublishJob(job.id);
    if (result.success) {
      toast.success(`"${job.title}" has been unpublished`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to unpublish job');
    }
    setActionLoading(null);
  };

  const handleArchive = async (job: AdminJob) => {
    setActionLoading(`archive-${job.id}`);
    setConfirmDialog(null);
    const result = await archiveJob(job.id);
    if (result.success) {
      toast.success(`"${job.title}" has been archived`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to archive job');
    }
    setActionLoading(null);
  };

  const handleDuplicate = async (job: AdminJob) => {
    setActionLoading(`duplicate-${job.id}`);
    setConfirmDialog(null);
    const result = await duplicateJob(job.id);
    if (result.success) {
      toast.success(`"${job.title}" duplicated as a new draft`);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to duplicate job');
    }
    setActionLoading(null);
  };

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">Unable to load jobs</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
          <button className="ml-auto text-muted-foreground hover:text-foreground" onClick={() => setSuccessMsg('')}>
            <span className="sr-only">Dismiss</span>×
          </button>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title or slug..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
              aria-label="Search jobs"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">Search</Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter || 'all'} onValueChange={(v) => updateParams({ status: v === 'all' ? '' : v })}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={verificationFilter || 'all'} onValueChange={(v) => updateParams({ verification: v === 'all' ? '' : v })}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verifications</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orgFilter || 'all'} onValueChange={(v) => updateParams({ organization: v === 'all' ? '' : v })}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_desc">Last Updated (Newest)</SelectItem>
              <SelectItem value="updated_asc">Last Updated (Oldest)</SelectItem>
              <SelectItem value="title_asc">Title (A-Z)</SelectItem>
              <SelectItem value="title_desc">Title (Z-A)</SelectItem>
              <SelectItem value="deadline_asc">Deadline (Soonest)</SelectItem>
              <SelectItem value="deadline_desc">Deadline (Latest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {totalCount > 0 ? (
          <>Showing <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-semibold text-foreground">{totalCount.toLocaleString('en-IN')}</span> jobs</>
        ) : (
          'No jobs found'
        )}
      </p>

      {/* Jobs table */}
      {jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">No jobs match your filters. Try adjusting your search or filters.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => {
            setSearchInput('');
            router.push('/admin/jobs');
          }}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Job Title</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Verification</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.map((job) => {
                const computedStatus = computeRecruitmentStatus({
                  application_start: job.application_start,
                  application_end: job.application_end,
                  status_override: job.status_override as import('@/lib/database-types').RecruitmentStatus | null,
                });
                const vConfig = verificationStatusConfig[job.verification_status] ?? verificationStatusConfig.unverified;
                const sConfig = jobStatusConfig[computedStatus] ?? jobStatusConfig.open;
                const isArchived = job.is_archived;
                const isPublished = job.is_published;

                return (
                  <tr key={job.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link href={`/admin/jobs/${job.id}/edit`} className="font-medium text-foreground hover:text-primary">
                        {job.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">/{job.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {job.organizations?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {job.application_end ? formatDate(job.application_end) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {isArchived ? (
                        <Badge variant="outline">Archived</Badge>
                      ) : isPublished ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="success">Published</Badge>
                          <Badge variant={sConfig.variant as 'success' | 'warning' | 'destructive' | 'info'}>{sConfig.label}</Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={vConfig.variant as 'success' | 'warning' | 'destructive'}>
                        {vConfig.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(job.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/jobs/${job.id}/preview`} title="Preview" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/admin/jobs/${job.id}/edit`} title="Edit" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          title="Duplicate"
                          disabled={actionLoading === `duplicate-${job.id}`}
                          onClick={() => setConfirmDialog({ type: 'duplicate', job })}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                        >
                          {actionLoading === `duplicate-${job.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                        </button>

                        {!isArchived && !isPublished && (
                          <button
                            title="Publish"
                            disabled={actionLoading === `publish-${job.id}`}
                            onClick={() => setConfirmDialog({ type: 'publish', job })}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                          >
                            {actionLoading === `publish-${job.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        )}

                        {!isArchived && isPublished && (
                          <button
                            title="Unpublish"
                            disabled={actionLoading === `unpublish-${job.id}`}
                            onClick={() => setConfirmDialog({ type: 'unpublish', job })}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                          >
                            {actionLoading === `unpublish-${job.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        )}

                        {!isArchived && (
                          <button
                            title="Archive"
                            disabled={actionLoading === `archive-${job.id}`}
                            onClick={() => setConfirmDialog({ type: 'archive', job })}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                          >
                            {actionLoading === `archive-${job.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateParams({ page: String(currentPage - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateParams({ page: String(currentPage + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation dialogs */}
      {confirmDialog && (
        <AlertDialog open onOpenChange={(open) => !open && setConfirmDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.type === 'publish' && 'Publish Job'}
                {confirmDialog.type === 'unpublish' && 'Unpublish Job'}
                {confirmDialog.type === 'archive' && 'Archive Job'}
                {confirmDialog.type === 'duplicate' && 'Duplicate Job'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.type === 'publish' &&
                  `Are you sure you want to publish "${confirmDialog.job.title}"? This will make it visible on the public /jobs page. The job must be at least "Pending Review" and have required fields filled.`}
                {confirmDialog.type === 'unpublish' &&
                  `Are you sure you want to unpublish "${confirmDialog.job.title}"? It will be removed from the public /jobs page but its data will be kept intact.`}
                {confirmDialog.type === 'archive' &&
                  `Are you sure you want to archive "${confirmDialog.job.title}"? It will be hidden from public listings and from the normal admin list. Archived jobs can be restored later. The job data will not be deleted.`}
                {confirmDialog.type === 'duplicate' &&
                  `Create a copy of "${confirmDialog.job.title}"? The duplicate will be created as a new draft with a "-copy" slug. Verification status will be reset to "Unverified".`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmDialog.type === 'publish') handlePublish(confirmDialog.job);
                  else if (confirmDialog.type === 'unpublish') handleUnpublish(confirmDialog.job);
                  else if (confirmDialog.type === 'archive') handleArchive(confirmDialog.job);
                  else if (confirmDialog.type === 'duplicate') handleDuplicate(confirmDialog.job);
                }}
              >
                {confirmDialog.type === 'publish' && 'Publish'}
                {confirmDialog.type === 'unpublish' && 'Unpublish'}
                {confirmDialog.type === 'archive' && 'Archive'}
                {confirmDialog.type === 'duplicate' && 'Duplicate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
