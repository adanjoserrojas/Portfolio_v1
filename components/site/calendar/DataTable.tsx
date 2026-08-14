/**
 * Every gym session Assistant has logged, as one table.
 *
 * A server component: the rows are HTML, there is no client JS, and the box
 * grows with the data — one row per record, whatever the query returns today.
 * Card, rules and mono labels are the same furniture DayRail uses, so the two
 * panels on /assistant read as one surface.
 *
 * The heading, footer and empty state are all derived from `records`, so a day
 * that adds twenty sessions needs no change here.
 */

import { getRecords, type RecordItems } from "@/lib/dynamo/getRecord";
import { duration } from "@/lib/calendar/time";

import Link from "next/link";

/** Every column, in order. `align` is the only thing that varies per column. */
const COLUMNS = [
  { key: "workout", label: "Workout" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "duration", label: "Duration", align: "right" as const },
];

/** Stands in for any attribute the item does not carry. */
const ABSENT = "—";

/**
 * Statuses arrive as free text, so this reads rather than switches: anything
 * naming a finished session takes the accent, everything else stays quiet.
 */
function isDone(status: string): boolean {
  return /^(done|complete|completed|logged|finished)$/i.test(status.trim());
}

/**
 * One row, ready to render.
 *
 * The RecordItems type says every attribute is present; Dynamo disagrees —
 * items written before a field existed simply have no such key, and the
 * projection returns them without it. Nothing below may assume otherwise, so
 * the widening to `unknown` here is deliberate: it is the only place that
 * touches raw attribute values.
 */
type Row = {
  workout: string | null;
  location: string | null;
  status: string | null;
  minutes: number | null;
};

/** Empty strings count as absent — a blank cell reads as a rendering bug. */
function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Numbers may arrive as numeric strings; anything not finite is absent. */
function minutes(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = text(value) === null ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRow(record: RecordItems): Row {
  return {
    workout: text(record.workout),
    location: text(record.location_code),
    status: text(record.status),
    minutes: minutes(record.actual_duration_minutes),
  };
}

export default async function RecordsTable() {
  const records = await getRecords(process.env.PARTITION_KEY || "");
  const rows = records.map(toRow);

  const loggedMinutes = rows.reduce((sum, r) => sum + (r.minutes ?? 0), 0);

  return (
    <section aria-labelledby="logs-heading" className="mb-12">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="logs-heading" className="text-lg font-semibold">
          Gym logs
        </h2>
        <p className="font-mono text-xs text-muted">
          Tracked by{" "}
          <Link href="/projects/assistant" className="underline hover:text-ink">
            Assistant
          </Link>
        </p>
      </div>

      <div className="overflow-hidden rounded-(--radius) border border-line bg-surface">
        {/* The only axis that scrolls: the page itself never goes sideways. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-104 border-collapse text-sm">
            <caption className="sr-only">
              Gym sessions logged by Assistant, one row per session.
            </caption>

            <thead>
              <tr className="border-b border-line">
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={`px-3 py-2.5 font-mono text-xs font-normal uppercase tracking-[0.09em] text-muted ${
                      c.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    No sessions logged yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    // Nothing in the projection identifies a row, and the order
                    // is the query's own — position is the only key available.
                    key={i}
                    className="border-b border-line/60 transition-colors last:border-b-0 hover:bg-raised/60"
                  >
                    {/* The workout names the row, so it carries the row header. */}
                    <th
                      scope="row"
                      className={`px-3 py-2.5 text-left font-normal ${
                        r.workout ? "text-ink" : "text-muted"
                      }`}
                    >
                      {r.workout ?? ABSENT}
                    </th>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-muted">
                      {r.location ?? ABSENT}
                    </td>
                    <td className="px-3 py-2.5">
                      {r.status === null ? (
                        <span className="font-mono text-xs text-muted">{ABSENT}</span>
                      ) : (
                        <span
                          className={`inline-block whitespace-nowrap rounded-(--radius) border px-2 py-0.5 font-mono text-xs ${
                            isDone(r.status)
                              ? "border-accent/40 bg-accent/10 text-ink"
                              : "border-line text-muted"
                          }`}
                        >
                          {r.status}
                        </span>
                      )}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs tabular-nums ${
                        r.minutes === null ? "text-muted" : "text-ink"
                      }`}
                    >
                      {r.minutes === null ? ABSENT : duration(r.minutes)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* The same summary line the day rail carries, for the same reason (§8). */}
        <p className="min-h-[2.4rem] border-t border-line px-3 py-2 font-mono text-xs tabular-nums text-muted">
          {rows.length === 0 ? (
            "Nothing logged yet."
          ) : (
            <>
              {rows.length} {rows.length === 1 ? "session" : "sessions"} ·{" "}
              <span className="text-ink">{duration(loggedMinutes)}</span> logged
            </>
          )}
        </p>
      </div>
    </section>
  );
}
