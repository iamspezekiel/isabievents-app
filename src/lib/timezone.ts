/**
 * Africa/Lagos (WAT — UTC+1, no daylight saving) helpers.
 *
 * Event datetimes are stored as naive wall-clock strings typed by organizers
 * ("2026-03-14T18:00:00") — they mean Lagos time. These helpers interpret them
 * as Lagos time no matter which timezone the viewer's device is in, and format
 * them back in Lagos time, so upcoming/past classification and refund
 * deadlines are identical for everyone.
 */

export const LAGOS_TZ = 'Africa/Lagos';
/** Lagos has no DST — a fixed +01:00 offset is always correct. */
const LAGOS_OFFSET = '+01:00';

/** Parses a stored value (naive Lagos wall-clock, offset-qualified, or a Date). */
export function toLagosDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  if (!raw) return null;
  // Already carries an offset or Z — trust it as an absolute instant.
  if (/(Z|[+-]\d{2}:?\d{2})$/.test(raw)) {
    const zoned = new Date(raw);
    return Number.isNaN(zoned.getTime()) ? null : zoned;
  }
  // Date-only values mean Lagos midnight; naive datetimes are Lagos wall-clock.
  const naive = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw;
  const ts = Date.parse(`${naive}${LAGOS_OFFSET}`);
  return Number.isNaN(ts) ? null : new Date(ts);
}

/** Epoch ms for a stored value (0 when unparseable). */
export function lagosTs(value?: string | Date | null): number {
  return toLagosDate(value)?.getTime() ?? 0;
}

/** The value that decides when an event ends: endDate when set, else date. */
export function eventEndValue(event: {date?: string; endDate?: string}): string {
  return event.endDate || event.date || '';
}

/** True when the event's end has passed (Africa/Lagos wall-clock). */
export function isEventEnded(
  event: {date?: string; endDate?: string},
  now: number = Date.now()
): boolean {
  const end = lagosTs(eventEndValue(event));
  return end > 0 && end < now;
}

/** Formatted event date in Lagos time (e.g. "14 Mar 2026"). */
export function formatEventDate(value?: string | Date | null): string {
  const d = toLagosDate(value);
  return d ? d.toLocaleDateString('en-NG', {timeZone: LAGOS_TZ, dateStyle: 'medium'}) : '—';
}

/** Formatted event date + time in Lagos time (e.g. "14 Mar 2026, 6:00 pm"). */
export function formatEventDateTime(
  value?: string | Date | null,
  opts: Intl.DateTimeFormatOptions = {dateStyle: 'medium', timeStyle: 'short'}
): string {
  const d = toLagosDate(value);
  if (!d) return '—';
  return d.toLocaleString('en-NG', {timeZone: LAGOS_TZ, ...opts});
}

/** Any stored timestamp (createdAt/paidAt/…) shown in Lagos time. */
export function formatStamp(
  value?: string | Date | null,
  opts: Intl.DateTimeFormatOptions = {dateStyle: 'medium', timeStyle: 'short'}
): string {
  const d = toLagosDate(value);
  if (!d) return '—';
  return d.toLocaleString('en-NG', {timeZone: LAGOS_TZ, ...opts});
}

/**
 * Refund deadline = event start minus `cutoffHours`, as an absolute ISO
 * instant (so the comparison is timezone-independent). Returns '' when the
 * event date is unusable.
 */
export function refundDeadlineFor(eventDateValue?: string, cutoffHours?: number): string {
  const start = lagosTs(eventDateValue);
  if (!start) return '';
  const hours = Math.max(0, Number(cutoffHours) || 0);
  return new Date(start - hours * 3_600_000).toISOString();
}

/** True while `deadlineISO` is still in the future (i.e. cancellation allowed). */
export function isBeforeDeadline(deadlineISO?: string, now: number = Date.now()): boolean {
  if (!deadlineISO) return false;
  const t = Date.parse(deadlineISO);
  return Number.isNaN(t) ? false : t > now;
}

/** Human deadline copy shown to attendees, in Lagos time. */
export function describeDeadline(deadlineISO?: string, cutoffHours?: number): string {
  if (!deadlineISO) return 'Until the event starts';
  const hours = Math.max(0, Number(cutoffHours) || 0);
  const label = formatEventDateTime(deadlineISO, {dateStyle: 'full', timeStyle: 'short'});
  if (hours === 0) return `Until the event starts (${label}, Africa/Lagos)`;
  const unit = hours % 168 === 0 && hours >= 168
    ? `${hours / 168} week${hours >= 336 ? 's' : ''}`
    : hours % 24 === 0
      ? `${hours / 24} day${hours >= 48 ? 's' : ''}`
      : `${hours} hours`;
  return `${unit} before the event starts — ${label} (Africa/Lagos)`;
}
