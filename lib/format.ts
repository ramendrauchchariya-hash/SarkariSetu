import type { ListingStatus, ResultType } from './types';

export function formatDate(
  dateStr: string,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', opts);
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export const statusConfig: Record<
  ListingStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }
> = {
  active: { label: 'Active', variant: 'success' },
  'closing-soon': { label: 'Closing Soon', variant: 'warning' },
  closed: { label: 'Closed', variant: 'destructive' },
  upcoming: { label: 'Upcoming', variant: 'info' },
  'result-out': { label: 'Result Out', variant: 'success' },
  'admit-card-available': { label: 'Available', variant: 'success' },
};

export const resultTypeConfig: Record<ResultType, { label: string }> = {
  'exam-result': { label: 'Exam Result' },
  'merit-list': { label: 'Merit List' },
  cutoff: { label: 'Cutoff' },
  scorecard: { label: 'Scorecard' },
  'final-result': { label: 'Final Result' },
};

export function formatCount(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
  return n.toString();
}

export function formatPosts(n: number): string {
  return n.toLocaleString('en-IN');
}
