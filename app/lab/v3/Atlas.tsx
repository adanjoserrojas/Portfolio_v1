"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LabData } from "../data";
import s from "./v3.module.css";

/**
 * v3 — the atlas. Canvas 2D, no WebGL, no physics library (§6.3).
 *
 * Layout is DETERMINISTIC, not simulated: three category columns, nodes
 * distributed on a golden-angle spiral within each. Same input, same map,
 * every time — and no physics dependency.
 *
 * Edges are drawn only where a skill actually appears in that project's
 * résumé stack line (§6.3: "Only draw an edge where the skill actually
 * appears"). Nothing decorative is connected to anything.
 *
 * The canvas is an enhancement over the semantic list in page.tsx, which is
 * always in the DOM and is the source of truth for screen readers.
 */

const W = 1200;
const H = 560;

type Node = { name: string; category: string; x: number; y: number };

function layout(data: LabData): Node[] {
  const cols = data.categories.length;
  return data.categories.flatMap((cat, ci) => {
    const inCat = data.skills.filter((k) => k.category === cat);
    const cx = ((ci + 0.5) / cols) * W;
    const cy = H / 2;
    // Radius scales with cluster size so the three read as comparable
    // densities rather than one blob and two dots.
    const spread = Math.min(W / cols, H) * 0.42;
    return inCat.map((k, i) => {
      const t = inCat.length === 1 ? 0 : i / (inCat.length - 1);
      const r = spread * Math.sqrt(t);
      const a = i * 2.399963; // golden angle
      return { name: k.name, category: cat, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  });
}

export default function Atlas({ data }: { data: LabData }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const nodes = useMemo(() => layout(data), [data]);

  /** Skills named in the active project's résumé stack line. A real edge. */
  const highlighted = useMemo(() => {
    if (!active) return new Set<string>();
    const p = data.projects.find((x) => x.slug === active);
    return new Set((p?.stack ?? []).map((t) => t.toLowerCase()));
  }, [active, data.projects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(canvas);
    const hue = (name: string) =>
      ({
        Languages: css.getPropertyValue("--lang"),
        "Frameworks/Libraries": css.getPropertyValue("--fw"),
        "Tools/Platforms": css.getPropertyValue("--tool"),
      })[name] || css.getPropertyValue("--muted");
    const accent = css.getPropertyValue("--accent").trim();
    const line = css.getPropertyValue("--line").trim();
    const muted = css.getPropertyValue("--muted").trim();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Cluster boundaries — the clustering must be legible (§6.3 risk).
    data.categories.forEach((_, ci) => {
      if (ci === 0) return;
      const x = (ci / data.categories.length) * W;
      ctx.strokeStyle = line;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, H - 24);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Edges from the active project's centroid to each named skill.
    if (active && highlighted.size) {
      const hit = nodes.filter((n) => highlighted.has(n.name.toLowerCase()));
      if (hit.length) {
        const hx = hit.reduce((a, n) => a + n.x, 0) / hit.length;
        const hy = hit.reduce((a, n) => a + n.y, 0) / hit.length;
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1;
        hit.forEach((n) => {
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }
    }

    ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    nodes.forEach((n) => {
      const on = highlighted.has(n.name.toLowerCase());
      const dim = active !== null && !on;

      ctx.globalAlpha = dim ? 0.22 : 1;
      ctx.fillStyle = on ? accent : hue(n.category).trim();
      ctx.beginPath();
      ctx.arc(n.x, n.y, on ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = on ? accent : muted;
      ctx.fillText(n.name, n.x, n.y + 13);
      ctx.globalAlpha = 1;
    });
  }, [nodes, active, highlighted, data.categories]);

  return (
    <>
      <div className={s.stage}>
        <canvas
          ref={canvasRef}
          className={s.canvas}
          style={{ aspectRatio: `${W} / ${H}` }}
          // The canvas is decorative: the real content is the list below.
          // §8 forbids putting aria-label on a canvas as a substitute for a
          // DOM equivalent, so it is hidden from assistive tech entirely.
          aria-hidden="true"
        />
        <p className={s.readout}>
          {active ? (
            (() => {
              const p = data.projects.find((x) => x.slug === active);
              return p ? (
                <>
                  <b>{p.name}</b> — {p.summary} <em>{p.stack.length} skills highlighted</em>
                </>
              ) : null;
            })()
          ) : (
            <>Hover a project to highlight the skills in its résumé stack line.</>
          )}
        </p>
      </div>

      {/* An <h2> before the project cards' <h3>s — without it the document
          goes h1 → h3, which axe flags as heading-order. */}
      <h2 className={s.srHeading}>Projects</h2>
      <div className={s.projects}>
        {data.projects.map((p) => (
          <button
            key={p.slug}
            type="button"
            className={s.pcard}
            style={{ textAlign: "left", cursor: "pointer", background: "none", color: "inherit" }}
            onMouseEnter={() => setActive(p.slug)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(p.slug)}
            onBlur={() => setActive(null)}
            aria-describedby={`stack-${p.slug}`}
          >
            <h3 className={s.pname}>{p.name}</h3>
            <p className={s.pmeta}>
              {p.date}
              {p.stack.length > 0 ? ` · ${p.stack.length} technologies` : ""}
            </p>
            <p className={s.psummary}>{p.summary}</p>
            {/* Real text for the edge, not just a canvas line. */}
            {p.stack.length > 0 && (
              <p id={`stack-${p.slug}`} className={s.pmeta} style={{ marginTop: "0.5rem" }}>
                {p.stack.join(" · ")}
              </p>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
