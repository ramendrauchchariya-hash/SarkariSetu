/**
 * Recruitment status computation.
 *
 * Status is derived from application dates in the Asia/Kolkata calendar.
 * A valid status_override may intentionally force a status, but invalid
 * override values are ignored so bad data can never masquerade as a status.
 */

import type { Recruitment, RecruitmentStatus } from './database-types';

/** Days before application_end to consider a recruitment "closing soon". */
const CLOSING_SOON_DAYS = 7;

const VALID_STATUSES = new Set<RecruitmentStatus>([
  'upcoming',
  'open',
  'closing-soon',
  'closed',
]);

/**
 * Returns today's calendar date in India as YYYY-MM-DD.
 *
 * Using formatToParts avoids relying on locale-specific date formatting
 * behavior, which can vary between Node/browser runtimes.
 */
export function getIndiaDate(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Unable to determine India calendar date');
  }

  return `${year}-${month}-${day}`;
}

function isValidDateOnly(value: string | null | undefined): value is string {
  return Boolean(value && /^\\d{4}-\\d{2}-\\d{2}$/.test(value));
}

function calendarDayNumber(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24);
}

/**
 * Compute the recruitment status from application dates.
 *
 * Rules:
 * - upcoming: application_start is after today
 * - closed: application_end is before today
 * - closing-soon: application is open and deadline is within 7 calendar days
 * - open: application is currently open and deadline is more than 7 days away
 *
 * Application_end is inclusive: a recruitment remains applicable on its
 * deadline date and becomes closed on the following India calendar day.
 */
export function computeRecruitmentStatus(
  recruitment: Pick<Recruitment, 'application_start' | 'application_end' | 'status_override'>
): RecruitmentStatus {
  const override = recruitment.status_override;
  if (override && VALID_STATUSES.has(override)) {
    return override;
  }

  const today = getIndiaDate();
  const start = isValidDateOnly(recruitment.application_start)
    ? recruitment.application_start
    : null;
  const end = isValidDateOnly(recruitment.application_end)
    ? recruitment.application_end
    : null;

  if (start && today < start) {
    return 'upcoming';
  }

  if (end && today > end) {
    return 'closed';
  }

  if (end) {
    const daysLeft = calendarDayNumber(end) - calendarDayNumber(today);

    if (daysLeft >= 0 && daysLeft <= CLOSING_SOON_DAYS) {
      return 'closing-soon';
    }

    return 'open';
  }

  // If there is no deadline, an already-started recruitment remains open.
  if (start && today >= start) {
    return 'open';
  }

  return 'upcoming';
}

/** Days remaining until application_end in the Asia/Kolkata calendar. */
export function daysUntilDeadline(applicationEnd: string | null): number {
  if (!isValidDateOnly(applicationEnd)) return 0;

  const today = getIndiaDate();
  return Math.max(0, calendarDayNumber(applicationEnd) - calendarDayNumber(today));
}
