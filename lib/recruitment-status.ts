/**
 * Recruitment status computation.
 *
 * Status is derived from application dates (in Asia/Kolkata timezone)
 * rather than stored as a column. The `status_override` field on the
 * recruitments table allows an admin to force a specific status when
 * automatic calculation doesn't match reality.
 */

import type { Recruitment, RecruitmentStatus } from './database-types';

/** Days before application_end to consider a recruitment "closing soon" */
const CLOSING_SOON_DAYS = 7;

/**
 * Returns the current date in Asia/Kolkata timezone as a YYYY-MM-DD string.
 * This ensures status calculations are consistent regardless of the server
 * or user's browser timezone.
 */
export function getIndiaDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

/**
 * Compute the recruitment status from application dates.
 *
 * - upcoming: application_start is in the future (or null and not yet posted)
 * - open: current date is between application_start and application_end
 * - closing-soon: open and application_end is within CLOSING_SOON_DAYS
 * - closed: application_end has passed
 *
 * If status_override is set, it takes precedence.
 */
export function computeRecruitmentStatus(recruitment: Pick<Recruitment, 'application_start' | 'application_end' | 'status_override'>): RecruitmentStatus {
  if (recruitment.status_override) {
    return recruitment.status_override;
  }

  const today = getIndiaDate();
  const start = recruitment.application_start;
  const end = recruitment.application_end;

  if (start && today < start) {
    return 'upcoming';
  }

  if (end && today > end) {
    return 'closed';
  }

  if (start && end && today >= start && today <= end) {
    const daysLeft = Math.ceil(
      (new Date(end).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft >= 0 && daysLeft <= CLOSING_SOON_DAYS) {
      return 'closing-soon';
    }
    return 'open';
  }

  // Fallback: if we have an end date but no start, treat as open until end
  if (end && today <= end) {
    const daysLeft = Math.ceil(
      (new Date(end).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft >= 0 && daysLeft <= CLOSING_SOON_DAYS) {
      return 'closing-soon';
    }
    return 'open';
  }

  // No dates at all — treat as upcoming
  return 'upcoming';
}

/**
 * Days remaining until application_end (in Asia/Kolkata time).
 * Returns 0 if the deadline has passed or end is null.
 */
export function daysUntilDeadline(applicationEnd: string | null): number {
  if (!applicationEnd) return 0;
  const today = getIndiaDate();
  const diff = Math.ceil(
    (new Date(applicationEnd).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
}
