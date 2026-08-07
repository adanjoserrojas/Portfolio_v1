/**
 * Schemas for the calendar feature.
 *
 * `FreeBusyResponseSchema` validates Google's reply — the one input here we do
 * not control. The payload schemas declare what we serve, which is what makes
 * "busy blocks only" checkable rather than a convention: they have nowhere to
 * put a title, an attendee or a location.
 *
 * No `server-only` import: the client component imports the *types* from this
 * module, which erase at compile time.
 */

import { z } from "zod";

/** RFC3339 with a zone, which is what the Calendar API emits. */
const Rfc3339 = z.iso.datetime({ offset: true });

/** A local calendar day, YYYY-MM-DD. */
export const DayString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** A local calendar month, YYYY-MM. */
export const MonthString = z.string().regex(/^\d{4}-\d{2}$/);

/** How far either side of today the endpoint will answer, in local days. */
export const CALENDAR_WINDOW = { backDays: 7, forwardDays: 60 } as const;

/** A single busy interval. Overlapping events are already merged by Google. */
export const BusyBlockSchema = z.object({
  start: Rfc3339,
  end: Rfc3339,
});

/**
 * Google's freeBusy reply, narrowed to the fields we read.
 *
 * `errors` matters: a bad calendar ID or a revoked share produces a 200 whose
 * per-calendar entry carries a reason and no `busy` array, not a non-200.
 */
export const FreeBusyResponseSchema = z.object({
  calendars: z.record(
    z.string(),
    z.object({
      busy: z.array(BusyBlockSchema).optional(),
      errors: z
        .array(z.object({ domain: z.string().optional(), reason: z.string() }))
        .optional(),
    }),
  ),
});

/** What `GET /api/calendar?date=…` returns — one day. */
export const CalendarPayloadSchema = z.object({
  date: DayString,
  /** IANA zone the times should be read in — the owner's, not the viewer's. */
  timeZone: z.string(),
  busy: z.array(BusyBlockSchema),
  /**
   * The window's bounds. The picker cannot compute these itself: they are
   * anchored to today in the calendar's zone, and browsers in different zones
   * disagree about what today is.
   */
  min: DayString,
  max: DayString,
});

/**
 * One day's shading in the month grid.
 *
 * `level` is a bucket rather than a raw minute count — the grid needs four
 * visual weights and nothing more. Exact times exist only for the single day a
 * visitor actually asks for.
 */
export const DayDensitySchema = z.object({
  date: DayString,
  /** 0 free · 1 (≤2h) · 2 (≤5h) · 3 (>5h). */
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});

/** What `GET /api/calendar?month=…` returns — one month of shading. */
export const MonthPayloadSchema = z.object({
  month: MonthString,
  timeZone: z.string(),
  /** Only days inside CALENDAR_WINDOW appear. */
  days: z.array(DayDensitySchema),
  min: DayString,
  max: DayString,
});

export type BusyBlock = z.infer<typeof BusyBlockSchema>;
export type CalendarPayload = z.infer<typeof CalendarPayloadSchema>;
export type DayDensity = z.infer<typeof DayDensitySchema>;
export type MonthPayload = z.infer<typeof MonthPayloadSchema>;

/** Mirrors `validate()` in content/types.ts, but names an external source. */
export function parseExternal<T>(schema: z.ZodType<T>, value: unknown, what: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `${what} failed validation:\n` +
        result.error.issues.map((i) => `  · ${i.path.join(".")}: ${i.message}`).join("\n"),
    );
  }
  return result.data;
}
