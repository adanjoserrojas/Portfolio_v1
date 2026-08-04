"use client";

import { useEffect, useRef, useState } from "react";
import { useTrace } from "./Trace";
import s from "./v2.module.css";

/**
 * A trace step that resolves when you ACTUALLY reach it.
 *
 * §3.2's stated risk for v2: "If the trace is fake it's a lie. Make the
 * 'steps' genuinely correspond to real navigation events (a step completes
 * because you actually navigated there), never a scripted illusion of
 * computation."
 *
 * So: an IntersectionObserver, nothing else. No timers, no fabricated
 * latency, no invented token counts. The status is `pending` until the step
 * enters the viewport and `resolved` after — which is a true statement about
 * your traversal, and the only true statement available.
 *
 * Under reduced motion the step renders resolved immediately: the transition
 * is the only motion here, and removing it should not hide information.
 */
export default function Step({
  id,
  name,
  children,
}: {
  id: string;
  name: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [resolved, setResolved] = useState(false);
  const { resolve } = useTrace();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setResolved(true);
      resolve(id);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setResolved(true);
          resolve(id);
        }
      },
      { rootMargin: "-15% 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id, resolve]);

  return (
    <section ref={ref} id={id} className={s.step} data-resolved={resolved}>
      <span className={s.marker} aria-hidden="true" />
      <h2 className={s.stepHead}>
        <span className={s.stepName}>{name}</span>
        {/* aria-live is off: this is decorative status, and announcing every
            step as you scroll would be noise, not information. */}
        <span className={s.status} aria-live="off">
          {resolved ? "resolved" : "pending"}
        </span>
      </h2>
      {children}
    </section>
  );
}
