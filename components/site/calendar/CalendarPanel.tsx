"use client";

/**
 * The /assistant calendar: a date picker bound to a 24-hour day rail.
 *
 * A client leaf on a `force-static` page — the page ships as static HTML and
 * this one component fetches its own data. Today loads on mount; the picker
 * chunk and the month shading load after idle. Both boxes are fixed-size in
 * every state, so neither step contributes to CLS.
 *
 * Days and months are memoised in refs for the life of the page.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { CalendarPayload, MonthPayload } from "@/lib/calendar/schema";
import { addDays, longDay } from "@/lib/calendar/time";

import DayRail, { type RailState } from "./DayRail";

/** Deferred so react-day-picker lands in its own chunk, requested after idle. */
type CalendarModule = typeof import("@/components/ui/calendar");

const monthOf = (date: string) => date.slice(0, 7);

/** `?date=` and `?month=` responses both come back through here. */
async function get<T>(query: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`/api/calendar${query}`, { signal });
  if (!response.ok) throw new Error(String(response.status));
  return (await response.json()) as T;
}

/** UTC noon, so a bare YYYY-MM-DD becomes the Date react-day-picker expects
 *  without the viewer's zone dragging it onto the previous day. */
const toDate = (day: string) => new Date(`${day}T12:00:00Z`);

/** The inverse. react-day-picker hands back a Date in the *viewer's* zone. */
const toDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export default function CalendarPanel() {
  const [rail, setRail] = useState<RailState>({ status: "loading" });
  const [selected, setSelected] = useState<string | null>(null);
  const [bounds, setBounds] = useState<{ min: string; max: string } | null>(null);

  const [month, setMonth] = useState<string | null>(null);
  const [density, setDensity] = useState<MonthPayload | null>(null);

  const [picker, setPicker] = useState<CalendarModule | null>(null);
  const [pickerFailed, setPickerFailed] = useState(false);

  const days = useRef(new Map<string, CalendarPayload>());
  const months = useRef(new Map<string, MonthPayload>());

  /** One in-flight day request at a time, so a slow response cannot land last. */
  const dayRequest = useRef<AbortController | null>(null);

  const loadDay = useCallback((date: string) => {
    setSelected(date);

    const cached = days.current.get(date);
    if (cached) {
      setRail({ status: "ready", data: cached });
      return;
    }

    dayRequest.current?.abort();
    const abort = new AbortController();
    dayRequest.current = abort;
    setRail({ status: "loading" });

    get<CalendarPayload>(`?date=${date}`, abort.signal)
      .then((data) => {
        days.current.set(date, data);
        setRail({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setRail({ status: "error" });
      });
  }, []);

  // Step 1 — today. The unparameterised route answers with the calendar's own today.
  useEffect(() => {
    const abort = new AbortController();

    get<CalendarPayload>("", abort.signal)
      .then((data) => {
        days.current.set(data.date, data);
        setRail({ status: "ready", data });
        setSelected(data.date);
        setMonth(monthOf(data.date));
        setBounds({ min: data.min, max: data.max });
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setRail({ status: "error" });
      });

    return () => abort.abort();
  }, []);

  // Step 2 — the picker chunk, after the browser is idle.
  useEffect(() => {
    let cancelled = false;

    const load = () => {
      import("@/components/ui/calendar")
        .then((mod) => !cancelled && setPicker(mod))
        .catch(() => !cancelled && setPickerFailed(true));
    };

    if ("requestIdleCallback" in window) {
      const id = (
        window as unknown as { requestIdleCallback: (f: () => void) => number }
      ).requestIdleCallback(load);
      return () => {
        cancelled = true;
        (window as unknown as { cancelIdleCallback: (i: number) => void }).cancelIdleCallback(id);
      };
    }

    const timer = setTimeout(load, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Shading for the month on screen. Failure is silent: the grid still works without it.
  useEffect(() => {
    if (!month) return;

    const cached = months.current.get(month);
    if (cached) {
      setDensity(cached);
      return;
    }

    const abort = new AbortController();
    get<MonthPayload>(`?month=${month}`, abort.signal)
      .then((data) => {
        months.current.set(month, data);
        setDensity(data);
      })
      .catch(() => {});

    return () => abort.abort();
  }, [month]);

  const Calendar = picker?.Calendar;
  const marks = density?.month === month ? density.days : [];

  return (
    <section aria-labelledby="calendar-heading" className="mb-12">
      <h2 id="calendar-heading" className="sr-only">
        Calendar availability
      </h2>

      <div className="grid gap-4 md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] md:items-start">
        {/* Fixed height in both states; `fixedWeeks` keeps it constant across months. */}
        <div className="relative h-[21.5rem] overflow-hidden rounded-(--radius) border border-line p-3">
          {Calendar && bounds ? (
            <Calendar
              mode="single"
              fixedWeeks
              selected={selected ? toDate(selected) : undefined}
              month={month ? toDate(`${month}-01`) : undefined}
              onMonthChange={(next: Date) => setMonth(toDay(next).slice(0, 7))}
              onSelect={(next: Date | undefined) => next && loadDay(toDay(next))}
              startMonth={toDate(bounds.min)}
              endMonth={toDate(bounds.max)}
              disabled={[{ before: toDate(bounds.min) }, { after: toDate(bounds.max) }]}
              modifiers={{
                density1: marks.filter((d) => d.level === 1).map((d) => toDate(d.date)),
                density2: marks.filter((d) => d.level === 2).map((d) => toDate(d.date)),
                density3: marks.filter((d) => d.level === 3).map((d) => toDate(d.date)),
              }}
              /* The density bar is aria-hidden; this is its only channel to AT — §8. */
              labels={{
                labelDayButton: (date: Date) => {
                  const day = toDay(date);
                  const level = marks.find((d) => d.date === day)?.level ?? 0;
                  const load =
                    level === 0
                      ? "nothing booked"
                      : level === 1
                        ? "lightly booked"
                        : level === 2
                          ? "moderately booked"
                          : "heavily booked";
                  return `${longDay(day)}, ${load}`;
                },
              }}
            />
          ) : (
            <PickerPlaceholder
              failed={pickerFailed}
              selected={selected}
              bounds={bounds}
              onPick={loadDay}
            />
          )}
        </div>

        <DayRail date={selected} state={rail} />
      </div>

      <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
        Free/busy only — no titles, attendees or locations are read or sent.
        {bounds && (
          <>
            {" "}
            Showing {longDay(bounds.min)} – {longDay(bounds.max)}.
          </>
        )}
      </p>
    </section>
  );
}

/**
 * Holds the picker's box until its chunk arrives.
 *
 * If the chunk fails, the two controls are enough to reach any day in the
 * window without it.
 */
function PickerPlaceholder({
  failed,
  selected,
  bounds,
  onPick,
}: {
  failed: boolean;
  selected: string | null;
  bounds: { min: string; max: string } | null;
  onPick: (date: string) => void;
}) {
  if (!failed) {
    return (
      <div aria-hidden="true" className="flex h-full flex-col gap-3">
        <div className="h-8 animate-pulse rounded-(--radius) bg-raised" />
        <div className="grid flex-1 grid-cols-7 gap-1">
          {Array.from({ length: 42 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-(--radius) bg-raised/60" />
          ))}
        </div>
      </div>
    );
  }

  const step = (n: number) => selected && addDays(selected, n);
  const previous = step(-1);
  const next = step(1);
  const inRange = (day: string | null | undefined) =>
    Boolean(day && bounds && day >= bounds.min && day <= bounds.max);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-muted">The date picker could not load.</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          data-target
          disabled={!inRange(previous)}
          onClick={() => previous && onPick(previous)}
          className="rounded-(--radius) border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          ← Previous day
        </button>
        <button
          type="button"
          data-target
          disabled={!inRange(next)}
          onClick={() => next && onPick(next)}
          className="rounded-(--radius) border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          Next day →
        </button>
      </div>
    </div>
  );
}
