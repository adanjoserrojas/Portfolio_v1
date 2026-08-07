/**
 * Zone arithmetic for the calendar feature. Pure, dependency-free, and
 * deliberately not `server-only`: the browser needs the same notion of local
 * midnight the server used, or blocks land in the wrong place at the DST
 * boundaries.
 *
 * Everything reads times in the calendar's zone, never the viewer's.
 *
 * `date-fns` came in with react-day-picker and is not used here — its timezone
 * support is a separate package, and Intl carries the zone database already.
 */

/** How far `timeZone` sits from UTC at a given instant, in milliseconds. */
export function offsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const at = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  // `hour` comes back as 24 rather than 0 at midnight under hour12: false.
  const wallClock = Date.UTC(
    at("year"),
    at("month") - 1,
    at("day"),
    at("hour") % 24,
    at("minute"),
    at("second"),
  );
  return wallClock - instant.getTime();
}

/** The instant at which local midnight occurs on `day` (YYYY-MM-DD) in `timeZone`. */
export function zonedMidnight(day: string, timeZone: string): Date {
  const naive = Date.parse(`${day}T00:00:00Z`);
  const first = offsetMs(new Date(naive), timeZone);

  // Subtracting the offset can land on the far side of a DST transition, where
  // the offset differs. Re-deriving once at the corrected instant is enough.
  const corrected = offsetMs(new Date(naive - first), timeZone);
  return new Date(naive - corrected);
}

/** Today's date in `timeZone`, as YYYY-MM-DD. en-CA formats in exactly that order. */
export function todayIn(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Which local day an instant falls on, in `timeZone`. */
export function localDayOf(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** `day` shifted by `n` calendar days. Zone-independent: pure date arithmetic. */
export function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Minutes from local midnight on `day` to `iso`, clamped to the day.
 *
 * Clamping is what lets an overnight block render correctly: it arrives as one
 * interval and should fill the last hour of the earlier day, not overflow it.
 */
export function minutesIntoDay(iso: string, day: string, timeZone: string): number {
  const delta = (Date.parse(iso) - zonedMidnight(day, timeZone).getTime()) / 60_000;
  return Math.max(0, Math.min(1440, delta));
}

/** `9:30 AM`, in the calendar's zone. */
export function clock(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
}

/** `6h 15m`, `45m`, `2h`. */
export function duration(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * `Thu, Aug 6`.
 *
 * Formatted in UTC against the day's own UTC midnight — the one way to name a
 * bare YYYY-MM-DD without a zone silently moving it back a day.
 */
export function longDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
