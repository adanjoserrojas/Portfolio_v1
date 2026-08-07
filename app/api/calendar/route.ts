import {
  getBusyForDay,
  getMonthDensity,
  windowBounds,
  withinWindow,
} from "@/lib/calendar/client";
import { DayString, MonthString } from "@/lib/calendar/schema";

/** google-auth-library signs the JWT with node crypto; it cannot run on Edge. */
export const runtime = "nodejs";

/** A schedule baked at build time would be permanently wrong. */
export const dynamic = "force-dynamic";

const FRESH = "public, s-maxage=300, stale-while-revalidate=600";

const fail = (error: string, status: number) =>
  Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Zero or one parameter, named `date` or `month`.
 *
 * The CDN keys its cache on the whole query string, so this is what keeps the
 * set of cacheable URLs finite rather than arbitrary.
 */
function allowedQuery(params: URLSearchParams): boolean {
  const keys = [...params.keys()];
  if (keys.length === 0) return true;
  return keys.length === 1 && (keys[0] === "date" || keys[0] === "month");
}

/**
 * `?date=YYYY-MM-DD` → that day's busy blocks, with times.
 * `?month=YYYY-MM`   → that month's day shading, bucketed, without times.
 * neither            → today, same shape as `?date=`.
 *
 * Everything is validated and range-checked before any upstream call is made.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (!allowedQuery(params)) return fail("bad_query", 400);

  const date = params.get("date");
  const month = params.get("month");

  try {
    if (month !== null) {
      if (!MonthString.safeParse(month).success) return fail("bad_month", 400);

      // A month is in range if any part of it is; getMonthDensity trims the rest.
      const { min, max } = windowBounds();
      if (`${month}-31` < min || `${month}-01` > max) return fail("out_of_range", 400);

      return Response.json(await getMonthDensity(month), {
        headers: { "Cache-Control": FRESH },
      });
    }

    if (date !== null) {
      if (!DayString.safeParse(date).success) return fail("bad_date", 400);
      if (!withinWindow(date)) return fail("out_of_range", 400);

      return Response.json(await getBusyForDay(date), { headers: { "Cache-Control": FRESH } });
    }

    const { today } = windowBounds();
    return Response.json(await getBusyForDay(today), { headers: { "Cache-Control": FRESH } });
  } catch (error) {
    // Upstream errors quote internal identifiers. Log them; never return them.
    console.error("[api/calendar]", error);
    return fail("calendar_unavailable", 503);
  }
}
