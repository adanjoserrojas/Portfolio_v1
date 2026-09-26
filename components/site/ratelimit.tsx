import { Clock3 } from "lucide-react";

export default function TooManyReqs() {
  return (
    <div
      role="alert"
      aria-atomic="true"
      className="flex items-start gap-3 rounded-(--radius) border border-line bg-raised p-5 text-ink sm:gap-4 sm:p-6"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-match text-accent">
        <Clock3 aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 pt-1">
        <h2 className="text-base font-medium leading-snug">
          Daily message limit reached
        </h2>
        <p className="mt-2 max-w-[48ch] text-sm text-muted">
          Your message wasn’t sent. Please try again after midnight UTC, when
          the limit resets.
        </p>
        <p className="mt-3 text-xs text-muted">
          Refresh this page before trying again.
        </p>
      </div>
    </div>
  );
}
