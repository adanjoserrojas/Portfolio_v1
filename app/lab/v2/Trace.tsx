"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import s from "./v2.module.css";

/**
 * v2 second-pass fix (§3.4).
 *
 * First pass scored lowest on Immersion: the trace resolved as you scrolled,
 * which is a real signal but rewards scrolling rather than interaction. The
 * fix is to make the trace TRAVERSABLE — the run's shape becomes the nav, so
 * you can jump to any step and see which have resolved.
 *
 * Still no fabrication: a step is `resolved` only because you genuinely
 * reached it. The rail reports that state; it does not manufacture it.
 */

type Ctx = {
  register: (id: string, name: string) => void;
  resolve: (id: string) => void;
  resolved: Record<string, boolean>;
  current: string | null;
  setCurrent: (id: string) => void;
};

const TraceCtx = createContext<Ctx | null>(null);

export function useTrace() {
  const ctx = useContext(TraceCtx);
  if (!ctx) throw new Error("useTrace outside TraceProvider");
  return ctx;
}

export function TraceProvider({
  steps,
  children,
}: {
  steps: { id: string; name: string }[];
  children: React.ReactNode;
}) {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState<string | null>(null);

  const resolve = useCallback((id: string) => {
    setResolved((r) => (r[id] ? r : { ...r, [id]: true }));
    setCurrent(id);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ register: () => {}, resolve, resolved, current, setCurrent }),
    [resolve, resolved, current],
  );

  const done = steps.filter((st) => resolved[st.id]).length;

  return (
    <TraceCtx.Provider value={value}>
      <div className={s.layout}>
        <nav className={s.rail} aria-label="Trace steps">
          <p className={s.railHead}>
            run · {done}/{steps.length} resolved
          </p>
          <ul className={s.railList}>
            {steps.map((st) => (
              <li key={st.id}>
                <a
                  href={`#${st.id}`}
                  data-resolved={!!resolved[st.id]}
                  aria-current={current === st.id ? "true" : undefined}
                >
                  <span className={s.railDot} aria-hidden="true" />
                  {st.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>{children}</div>
      </div>
    </TraceCtx.Provider>
  );
}
