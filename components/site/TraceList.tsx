"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Signature component #2 — the v2 "run trace" treatment, carried into the
 * shipped site at Gate 2.
 *
 * §6's rule: "it visualizes data that already exists, or it doesn't ship."
 * What this visualizes is your traversal — a step resolves because you
 * genuinely reached it, never on a timer. §3.2: "If the trace is fake it's a
 * lie." There are no durations shown, because no real duration exists.
 *
 * Under prefers-reduced-motion every step renders resolved immediately: the
 * transition is the only motion, and removing it must not hide information.
 */

export type TraceRole = {
  slug: string;
  role: string;
  org: string;
  location: string;
  dates: string;
  bullets: string[];
  heldCount: number;
};

export default function TraceList({ roles }: { roles: TraceRole[] }) {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setResolved(Object.fromEntries(roles.map((r) => [r.slug, true])));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.slug;
            if (id) setResolved((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
          }
        }
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [roles]);

  const done = roles.filter((r) => resolved[r.slug]).length;

  return (
    <div>
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.09em] text-muted">
        {done}/{roles.length} resolved
      </p>

      {roles.map((r, i) => (
        <section
          key={r.slug}
          data-slug={r.slug}
          ref={(el) => {
            refs.current[r.slug] = el;
          }}
          className="relative pb-10 pl-8"
        >
          {/* The connecting rule, omitted on the last step. */}
          {i < roles.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-[6px] top-6 w-px bg-line"
            />
          )}
          <span
            aria-hidden="true"
            className={`absolute left-0 top-[7px] h-[13px] w-[13px] rounded-full border transition-colors duration-300 ${
              resolved[r.slug] ? "border-accent bg-accent" : "border-line bg-surface"
            }`}
          />

          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-lg font-semibold">
              <Link
                href={`/experience/${r.slug}`}
                className="text-ink no-underline hover:underline"
              >
                {r.role}
              </Link>
            </h2>
            <span className="font-mono text-xs text-muted">{r.org}</span>
          </div>

          <p className="tabular mb-3 font-mono text-xs text-muted">
            {r.dates} · {r.location}
          </p>

          <ul className="m-0 list-none p-0">
            {r.bullets.map((b) => (
              <li key={b.slice(0, 32)} className="relative mb-3 pl-4 text-sm leading-relaxed">
                <span aria-hidden="true" className="absolute left-0.5 text-accent">
                  ·
                </span>
                {b}
              </li>
            ))}
          </ul>

          {r.heldCount > 0 && (
            <p className="mt-4 font-mono text-xs text-muted">
              {r.heldCount} further items not shown — confidentiality review pending
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
