/**
 * Google Calendar free/busy access — SERVER ONLY.
 *
 * Uses `freeBusy` rather than `events.list`: it returns nothing but
 * `{start, end}` intervals with overlaps already merged, so titles, attendees
 * and locations never cross the wire and there is nothing to forget to strip.
 * An all-day event arrives as a 24-hour block.
 *
 * Never import this from a "use client" file. The client component talks to
 * /api/calendar over HTTP and imports only types.
 */

import "server-only";

import { JWT } from "google-auth-library";
import {
  CALENDAR_WINDOW,
  CalendarPayloadSchema,
  FreeBusyResponseSchema,
  MonthPayloadSchema,
  parseExternal,
} from "./schema";
import type { BusyBlock, CalendarPayload, DayDensity, MonthPayload } from "./schema";
// In ./time.ts because the browser needs the identical version to place a block.
import { addDays, localDayOf, todayIn, zonedMidnight } from "./time";

/** Narrower than `calendar.readonly`: this cannot read a title. */
const SCOPES = ["https://www.googleapis.com/auth/calendar.freebusy"];

const FREEBUSY_URL = "https://www.googleapis.com/calendar/v3/freeBusy";

/** Module scope, so a warm lambda reuses the client and its cached token. */
let cached: JWT | null = null;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

/**
 * The service account key, as JSON in `GOOGLE_SERVICE_ACCOUNT_JSON`.
 *
 * Base64 is accepted too: pasting a key through a dashboard field or a shell
 * can mangle the `\n` escapes inside `private_key`, and the resulting decoder
 * error points nowhere near the cause.
 */
function serviceAccount(): { client_email: string; private_key: string } {
  const raw = required("GOOGLE_SERVICE_ACCOUNT_JSON").trim();
  const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is neither JSON nor base64-encoded JSON.");
  }

  const key = parsed as Partial<{ client_email: string; private_key: string }>;
  if (!key.client_email || !key.private_key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key.");
  }
  return { client_email: key.client_email, private_key: key.private_key };
}

function client(): JWT {
  if (!cached) {
    const { client_email, private_key } = serviceAccount();
    cached = new JWT({ email: client_email, key: private_key, scopes: SCOPES });
  }
  return cached;
}

/** Local midnight-to-midnight bounds, as RFC3339. */
function dayBounds(from: string, to: string, timeZone: string): { timeMin: string; timeMax: string } {
  return {
    timeMin: zonedMidnight(from, timeZone).toISOString(),
    // Exclusive end: midnight *after* the last day requested.
    timeMax: zonedMidnight(addDays(to, 1), timeZone).toISOString(),
  };
}

/** The calendar's configured zone. One place, so day maths never disagrees with itself. */
function zone(): string {
  return process.env.TIMEZONE || "America/New_York";
}

/**
 * The days the API will answer for.
 *
 * Anchored to today in the calendar's zone, not the server's — a lambda at
 * 00:30 UTC is still on the previous local day, and a window that slid by one
 * would fail for a date the UI had already offered.
 */
export function windowBounds(): { today: string; min: string; max: string; timeZone: string } {
  const timeZone = zone();
  const today = todayIn(timeZone);
  return {
    today,
    timeZone,
    min: addDays(today, -CALENDAR_WINDOW.backDays),
    max: addDays(today, CALENDAR_WINDOW.forwardDays),
  };
}

/** True if `day` is inside the served window. */
export function withinWindow(day: string): boolean {
  const { min, max } = windowBounds();
  // Lexical comparison is exact for zero-padded ISO dates.
  return day >= min && day <= max;
}

/** One freeBusy call over an inclusive range of local days. */
async function freeBusy(from: string, to: string): Promise<BusyBlock[]> {
  const calendarId = required("CALENDAR_ID");
  const timeZone = zone();
  const { timeMin, timeMax } = dayBounds(from, to, timeZone);

  const { token } = await client().getAccessToken();
  if (!token) throw new Error("No access token returned for the service account.");

  const response = await fetch(FREEBUSY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin, timeMax, timeZone, items: [{ id: calendarId }] }),
    // Caching is the CDN's job. Next's fetch cache would freeze this at build time.
    cache: "no-store",
  });

  if (!response.ok) {
    // Server log only — the route never forwards this to a client.
    throw new Error(`freeBusy failed: ${response.status} ${await response.text()}`);
  }

  const body = parseExternal(
    FreeBusyResponseSchema,
    await response.json(),
    "Google freeBusy response",
  );

  const calendar = body.calendars[calendarId];
  if (!calendar) throw new Error("freeBusy returned no entry for the configured calendar.");

  // A 200 can still carry per-calendar errors; without this they render as a free day.
  if (calendar.errors?.length) {
    throw new Error(`freeBusy reported ${calendar.errors.map((e) => e.reason).join(", ")}.`);
  }

  return calendar.busy ?? [];
}

/** One day's busy intervals, earliest first. */
export async function getBusyForDay(date: string): Promise<CalendarPayload> {
  const { timeZone, min, max } = windowBounds();
  return parseExternal(
    CalendarPayloadSchema,
    { date, timeZone, min, max, busy: await freeBusy(date, date) },
    "calendar payload",
  );
}

/** Today, in the calendar's zone. Used by `npm run smoke:calendar`. */
export async function getBusyToday(): Promise<CalendarPayload> {
  return getBusyForDay(todayIn(zone()));
}

/** minutes booked → the four-step bucket the month grid shades with. */
function densityLevel(minutes: number): 0 | 1 | 2 | 3 {
  if (minutes <= 0) return 0;
  if (minutes <= 120) return 1;
  if (minutes <= 300) return 2;
  return 3;
}

/**
 * A month's worth of day shading, from a single freeBusy call.
 *
 * Only the part of the month inside the window is fetched or returned. A block
 * spanning local midnight is split and counted against both days.
 */
export async function getMonthDensity(month: string): Promise<MonthPayload> {
  const { min, max, timeZone } = windowBounds();

  const [year, monthNumber] = month.split("-").map(Number);
  const monthStart = `${month}-01`;
  // Day 0 of the following month is the last day of this one — leap years included.
  const monthEnd = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);

  const from = monthStart > min ? monthStart : min;
  const to = monthEnd < max ? monthEnd : max;

  if (from > to) {
    return parseExternal(
      MonthPayloadSchema,
      { month, timeZone, days: [], min, max },
      "month payload",
    );
  }

  const minutes = new Map<string, number>();
  for (const block of await freeBusy(from, to)) {
    let cursor = Date.parse(block.start);
    const end = Date.parse(block.end);

    // Walk the block one local day at a time, bounded by the range fetched.
    while (cursor < end) {
      const day = localDayOf(new Date(cursor), timeZone);
      const dayEnd = zonedMidnight(addDays(day, 1), timeZone).getTime();
      const segmentEnd = Math.min(end, dayEnd);
      minutes.set(day, (minutes.get(day) ?? 0) + (segmentEnd - cursor) / 60_000);
      cursor = segmentEnd;
    }
  }

  const days: DayDensity[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) {
    const level = densityLevel(minutes.get(day) ?? 0);
    // Free days are the grid's default; sending them would be most of the payload.
    if (level > 0) days.push({ date: day, level });
  }

  return parseExternal(MonthPayloadSchema, { month, timeZone, days, min, max }, "month payload");
}
