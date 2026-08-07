"use client";

/**
 * shadcn/ui Calendar (`npx shadcn add calendar`), restyled onto this repo's
 * design system. Adopted for react-day-picker's accessible grid — `role="grid"`,
 * roving tabindex, arrow/Home/End/PageUp/PageDown, `aria-disabled` on
 * out-of-range days (§8).
 *
 * Changed from the registry version: every class (it assumes shadcn's own token
 * layer, which does not exist here), `lucide-react` → inline SVG,
 * `components/ui/button.tsx` → plain <button>, and a density bar driven by the
 * custom `density1`/`density2`/`density3` modifiers. Callers that omit those
 * modifiers get a plain calendar.
 *
 * See DESIGN-NOTES.md §6.5 for the adoption record.
 */

import * as React from "react";
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker";

import { cn } from "@/lib/utils";

/** 15px stroked chevron, same construction as ThemeToggle's icons. */
function Chevron({ direction }: { direction: "left" | "right" | "down" }) {
  const d =
    direction === "left" ? "M15 5l-7 7 7 7" : direction === "right" ? "M9 5l7 7-7 7" : "M6 9l6 6 6-6";
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/** Nav and caption controls share this; it is the only "button variant" left. */
const CONTROL =
  "inline-flex items-center justify-center rounded-(--radius) border border-line text-muted " +
  "transition-colors hover:border-accent hover:text-ink " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-40 " +
  "disabled:pointer-events-none disabled:opacity-40";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        // 2.5rem cells: past the 24px minimum target size (§8, WCAG 2.2 SC 2.5.8).
        "group/calendar [--cell-size:2.5rem]",
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between",
          defaultClassNames.nav,
        ),
        button_previous: cn(CONTROL, "size-8 select-none", defaultClassNames.button_previous),
        button_next: cn(CONTROL, "size-8 select-none", defaultClassNames.button_next),
        month_caption: cn(
          "flex h-8 w-full items-center justify-center px-10",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-8 w-full items-center justify-center gap-1.5 text-sm",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-(--radius) border border-line",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium text-ink",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center gap-1 rounded-(--radius) pl-2 pr-1 text-sm [&>svg]:text-muted",
          defaultClassNames.caption_label,
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 select-none pb-1 font-mono text-[0.65rem] font-normal uppercase tracking-[0.09em] text-muted",
          defaultClassNames.weekday,
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        // Fixed height rather than the registry's `aspect-square`, so the reserved
        // box for the deferred chunk is correct at every viewport width.
        day: cn(
          "group/day relative h-(--cell-size) w-full p-0 text-center select-none",
          defaultClassNames.day,
        ),
        today: cn("[&_button]:border-accent [&_button]:border", defaultClassNames.today),
        outside: cn("opacity-40", defaultClassNames.outside),
        disabled: cn("opacity-30", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),
        Chevron: ({ orientation }) => (
          <Chevron direction={orientation === "left" ? "left" : orientation === "right" ? "right" : "down"} />
        ),
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  children,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);

  // react-day-picker tracks which day should hold focus; moving real DOM focus
  // to match is the consumer's job. Kept from the registry.
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const level = modifiers.density3 ? 3 : modifiers.density2 ? 2 : modifiers.density1 ? 1 : 0;

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected={modifiers.selected || undefined}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1 rounded-(--radius)",
        "font-mono text-sm leading-none text-ink tabular-nums transition-colors",
        "hover:bg-raised",
        // `text-surface` rather than hard-coded white: inverts correctly in both
        // themes, and both pairings clear 4.5:1 (scripts/verify-contrast.ts).
        "data-[selected=true]:bg-accent data-[selected=true]:text-surface",
        "data-[selected=true]:hover:bg-accent",
        "disabled:pointer-events-none disabled:text-muted",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {/* aria-hidden: the count is already in the button's accessible name (§8). */}
      <span
        aria-hidden="true"
        data-level={level}
        className={cn(
          "block h-[3px] rounded-full transition-all",
          level === 0 && "w-1 bg-line",
          level === 1 && "w-2 bg-accent/40",
          level === 2 && "w-3 bg-accent/70",
          level === 3 && "w-4 bg-accent",
          "group-data-[selected=true]/day:bg-surface",
        )}
      />
    </button>
  );
}

export { Calendar, CalendarDayButton };
