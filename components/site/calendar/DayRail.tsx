"use client";

/**
 * One day, drawn as a 24-hour rail.
 *
 * Three rules shaped it:
 *
 *   · The box never changes height, in any state. Blocks are positioned as
 *     percentages inside it, so late data paints without reflowing.
 *   · The only thing that moves is the `now` line, once a minute (§4.3).
 *   · Busy blocks are a real ordered list with real text; only the axis,
 *     gridlines and gap labels are `aria-hidden`, and the summary line restates
 *     what they convey (§8).
 *
 * Gaps are labelled "unbooked" rather than "free" — the payload can say no
 * event occupies a slot, not that the slot is available.
 */

import { useEffect, useMemo, useState } from "react";
import type { CalendarPayload } from "@/lib/calendar/schema";
import { clock, duration, longDay, minutesIntoDay, todayIn } from "@/lib/calendar/time";

export type RailState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: CalendarPayload };

const DAY_MINUTES = 1440;

/** Labelled every three hours; more than eight labels crowds at this height. */
const HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

const hourLabel = (h: number) =>
  h === 0 ? "12a" : h === 12 ? "12p" : h < 12 ? `${h}a` : `${h - 12}p`;

const pct = (minutes: number) => `${(minutes / DAY_MINUTES) * 100}%`;

type Segment = { start: number; end: number };

/** Busy intervals as minutes-into-the-day, clamped so an overnight event fits. */
function segments(data: CalendarPayload): Segment[] {
  return data.busy
    .map((b) => ({
      start: minutesIntoDay(b.start, data.date, data.timeZone),
      end: minutesIntoDay(b.end, data.date, data.timeZone),
    }))
    .filter((s) => s.end > s.start)
    .sort((a, b) => a.start - b.start);
}

/** The runs of the day no interval covers. Only those worth naming are returned. */
function gaps(busy: Segment[]): Segment[] {
  const out: Segment[] = [];
  let cursor = 0;

  for (const s of busy) {
    if (s.start > cursor) out.push({ start: cursor, end: s.start });
    cursor = Math.max(cursor, s.end);
  }
  if (cursor < DAY_MINUTES) out.push({ start: cursor, end: DAY_MINUTES });

  // Below an hour there is no room for the label and little worth saying.
  return out.filter((g) => g.end - g.start >= 60);
}

/**
 * Minute-of-day in `timeZone`, or null when `date` is not today there.
 *
 * `timeZone` is nullable because the zone is not known until the payload lands.
 */
function useNowMinute(date: string | null, timeZone: string | null): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!timeZone || !date) {
      setNow(null);
      return;
    }

    const read = () => {
      if (todayIn(timeZone) !== date) {
        setNow(null);
        return;
      }
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
      const [h, m] = parts.split(":").map(Number);
      setNow((h % 24) * 60 + m);
    };

    read();
    // Aligned to the next whole minute, then every minute after.
    const toNextMinute = 60_000 - (Date.now() % 60_000);
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      read();
      interval = setInterval(read, 60_000);
    }, toNextMinute);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [date, timeZone]);

  return now;
}

/** `date` is null only on the very first paint, before the API has named today. */
export default function DayRail({ date, state }: { date: string | null; state: RailState }) {
  const data = state.status === "ready" ? state.data : null;
  const timeZone = data?.timeZone ?? "UTC";

  const busy = useMemo(() => (data ? segments(data) : []), [data]);
  const open = useMemo(() => gaps(busy), [busy]);
  const now = useNowMinute(date, data ? timeZone : null);

  const bookedMinutes = busy.reduce((sum, s) => sum + (s.end - s.start), 0);

  return (
    <figure className="m-0 overflow-hidden rounded-(--radius) border border-line bg-surface">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-3 py-2.5">
        <h3 className="text-sm font-medium text-ink">{date ? longDay(date) : "Today"}</h3>
        <p className="font-mono text-xs text-muted">
          {state.status === "ready" ? timeZone.replace(/_/g, " ") : null}
        </p>
      </figcaption>

      {/* Fixed height, identical in every state. */}
      <div className="relative grid h-[26rem] grid-cols-[3rem_1fr] sm:h-[34rem]">
        {/* Hour axis. Derived from the clock, not from the data. */}
        <div aria-hidden="true" className="relative border-r border-line">
          {HOURS.map((h) => (
            <span
              key={h}
              className="absolute right-2 -translate-y-1/8 font-mono text-[0.65rem] tabular-nums text-muted"
              style={{ top: pct(h * 60) }}
            >
              {hourLabel(h)}
            </span>
          ))}
        </div>

        <div className="relative">
          {/* Gridlines at the labelled hours only — one rule per label. */}
          <div aria-hidden="true">
            {HOURS.map((h) => (
              <span
                key={h}
                className="absolute inset-x-0 border-t border-line/60"
                style={{ top: pct(h * 60) }}
              />
            ))}
          </div>

          {state.status === "loading" && <RailSkeleton />}

          {state.status === "error" && (
            <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted">
              Calendar unavailable.
            </p>
          )}

          {state.status === "ready" && (
            <>
              {/* Derived, so aria-hidden; the totals below carry it for AT. */}
              <div aria-hidden="true">
                {open.map((g) => {
                  const height = ((g.end - g.start) / DAY_MINUTES) * 100;
                  if (height < 6) return null;
                  return (
                    <span
                      key={g.start}
                      className="absolute inset-x-0 flex -translate-y-1/2 items-center justify-center font-mono text-[0.65rem] text-muted"
                      style={{ top: pct((g.start + g.end) / 2) }}
                    >
                      · {duration(g.end - g.start)} unbooked ·
                    </span>
                  );
                })}
              </div>

              <ol
                aria-label={`Busy blocks on ${longDay(state.data.date)}`}
                className="m-0 list-none p-0"
              >
                {state.data.busy.map((block, i) => {
                  const s = busy[i];
                  if (!s) return null;
                  const height = ((s.end - s.start) / DAY_MINUTES) * 100;
                  const label = `${clock(block.start, timeZone)} – ${clock(block.end, timeZone)}`;

                  return (
                    <li
                      key={block.start}
                      className="absolute inset-x-1.5 overflow-hidden rounded-(--radius) border-l-2 border-accent bg-accent/10 sm:inset-x-2"
                      style={{
                        top: pct(s.start),
                        // Floor: a 15-minute block is 1% of the day and would be a hairline.
                        height: `max(${height}%, 1.6%)`,
                        // Hatching, via color-mix so it stays on the accent token (§4.1).
                        backgroundImage:
                          "repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 12%, transparent) 0 5px, transparent 5px 11px)",
                      }}
                    >
                      {/* Below ~37 minutes there is no room to render the label unclipped. */}
                      <span
                        className={
                          height >= 2.6
                            ? "block px-2 py-0.5 font-mono text-[0.65rem] leading-tight tabular-nums text-ink"
                            : "sr-only"
                        }
                      >
                        {label}
                        <span className="sr-only"> busy</span>
                      </span>
                    </li>
                  );
                })}
              </ol>

              {now !== null && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 flex -translate-y-1/2 items-center"
                  style={{ top: pct(now) }}
                >
                  <span className="h-px flex-1 bg-accent" />
                  <span className="ml-1 mr-1.5 rounded-full bg-accent px-1.5 py-0.5 font-mono text-[0.6rem] leading-none tabular-nums text-surface">
                    now {String(Math.floor(now / 60)).padStart(2, "0")}:
                    {String(now % 60).padStart(2, "0")}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p className="min-h-[2.4rem] border-t border-line px-3 py-2 font-mono text-xs text-muted tabular-nums">
        {state.status === "loading" && "Reading the calendar…"}
        {state.status === "error" && "No data for this day."}
        {state.status === "ready" &&
          (busy.length === 0 ? (
            "Nothing booked · 24h unbooked"
          ) : (
            <>
              {busy.length} {busy.length === 1 ? "block" : "blocks"} ·{" "}
              <span className="text-ink">{duration(bookedMinutes)}</span> booked ·{" "}
              {duration(DAY_MINUTES - bookedMinutes)} unbooked
            </>
          ))}
      </p>
    </figure>
  );
}

/**
 * Placeholders, so the rail looks like a rail while it loads. Deliberately not
 * the shape of any real day.
 */
function RailSkeleton() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {[
        [8.5, 6],
        [18, 4],
        [30, 9],
      ].map(([top, height]) => (
        <span
          key={top}
          className="absolute inset-x-1.5 animate-pulse rounded-(--radius) bg-raised sm:inset-x-2"
          style={{ top: `${top}%`, height: `${height}%` }}
        />
      ))}
    </div>
  );
}
