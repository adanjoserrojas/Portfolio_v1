/**
 * Connection smoke test: does Google accept the key, and is the calendar
 * shared? Isolates that from every Next.js and Vercel concern.
 *
 *     npm run smoke:calendar
 */

import { getBusyToday } from "../lib/calendar/client";

async function main() {
  const { date, timeZone, busy } = await getBusyToday();

  console.log(`${process.env.CALENDAR_ID} — ${date} (${timeZone})\n`);

  if (busy.length === 0) {
    console.log("  (nothing booked)");
    return;
  }

  const clock = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  for (const block of busy) {
    console.log(`  ${clock(block.start)}-${clock(block.end)}  busy`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
