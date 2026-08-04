"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { skillInStack } from "@/lib/skill-match";

/**
 * §6.3 — the skill atlas.
 *
 * Chosen because §0.3's confidentiality question is unanswered, which knocks
 * out §6.1 and §6.2 (both need cleared Publix figures). §390: "If the
 * confidentiality check knocks out both Publix components, build 6.3 and 6.4."
 *
 * The grouping is Adan's own — the résumé's three categories — not clusters an
 * agent invented.
 *
 * Rules honoured here:
 *   · Canvas 2D. No WebGL, no physics library. Layout is deterministic
 *     (golden-angle spiral per column), so the same data always draws the
 *     same map.
 *   · An edge is drawn ONLY where the skill actually appears in that project's
 *     résumé stack line. Nothing decorative is connected to anything.
 *   · The semantic <ul> in the parent Server Component is the source of truth
 *     and is always in the DOM. This canvas is aria-hidden, because §8 forbids
 *     putting aria-label on a canvas as a substitute for a DOM equivalent.
 *   · Hydrates after idle; the page is complete without it.
 */

const W = 1200;
const H = 520;

export type AtlasSkill = { name: string; category: string };
export type AtlasProject = { slug: string; name: string; stack: string[] };

type Node = { name: string; category: string; x: number; y: number };

function layout(skills: AtlasSkill[], categories: string[]): Node[] {
  return categories.flatMap((cat, ci) => {
    const inCat = skills.filter((k) => k.category === cat);
    const cx = ((ci + 0.5) / categories.length) * W;
    const cy = H / 2;
    const spread = Math.min(W / categories.length, H) * 0.4;
    return inCat.map((k, i) => {
      const t = inCat.length === 1 ? 0 : i / (inCat.length - 1);
      const r = spread * Math.sqrt(t);
      const a = i * 2.399963; // golden angle
      return { name: k.name, category: cat, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  });
}

export default function SkillAtlas({
  skills,
  projects,
  categories,
}: {
  skills: AtlasSkill[];
  projects: AtlasProject[];
  categories: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const nodes = useMemo(() => layout(skills, categories), [skills, categories]);

  // Hydrate the drawing after idle — the page is complete without it.
  useEffect(() => {
    const cb = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = (window as unknown as { requestIdleCallback: (f: () => void) => number })
        .requestIdleCallback(cb);
      return () =>
        (window as unknown as { cancelIdleCallback: (i: number) => void }).cancelIdleCallback(id);
    }
    const t = setTimeout(cb, 200);
    return () => clearTimeout(t);
  }, []);

  /**
   * Skill names that appear in the active project's stack line — using the
   * same matcher as the skill list, so the canvas and the list can never
   * disagree about what counts as an edge.
   */
  const highlighted = useMemo(() => {
    if (!active) return new Set<string>();
    const p = projects.find((x) => x.slug === active);
    if (!p) return new Set<string>();
    return new Set(
      skills.filter((k) => skillInStack(k.name, p.stack)).map((k) => k.name.toLowerCase()),
    );
  }, [active, projects, skills]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(canvas);
    const ink = css.getPropertyValue("--color-ink").trim();
    const muted = css.getPropertyValue("--color-muted").trim();
    const line = css.getPropertyValue("--color-line").trim();
    const accent = css.getPropertyValue("--color-accent").trim();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Cluster boundaries — the clustering has to be legible, not implied.
    categories.forEach((_, ci) => {
      if (ci === 0) return;
      const x = (ci / categories.length) * W;
      ctx.strokeStyle = line;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, H - 20);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    if (active && highlighted.size) {
      const hit = nodes.filter((n) => highlighted.has(n.name.toLowerCase()));
      if (hit.length) {
        const hx = hit.reduce((a, n) => a + n.x, 0) / hit.length;
        const hy = hit.reduce((a, n) => a + n.y, 0) / hit.length;
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.45;
        hit.forEach((n) => {
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }
    }

    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    nodes.forEach((n) => {
      const on = highlighted.has(n.name.toLowerCase());
      ctx.globalAlpha = active && !on ? 0.2 : 1;
      ctx.fillStyle = on ? accent : muted;
      ctx.beginPath();
      ctx.arc(n.x, n.y, on ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = on ? accent : active ? muted : ink;
      ctx.fillText(n.name, n.x, n.y + 13);
      ctx.globalAlpha = 1;
    });
  }, [ready, nodes, active, highlighted, categories]);

  return (
    <div className="mb-10">
      <div className="overflow-hidden rounded-(--radius) border border-line">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ aspectRatio: `${W} / ${H}` }}
          className="block h-auto w-full"
        />
        <p className="min-h-[2.6rem] border-t border-line px-3 py-2 font-mono text-xs leading-relaxed text-muted">
          {active
            ? (() => {
                const p = projects.find((x) => x.slug === active);
                return p ? (
                  <>
                    <span className="text-ink">{p.name}</span> — {highlighted.size} of these
                    skills appear in its stack
                  </>
                ) : null;
              })()
            : "Focus or hover a project to highlight the skills in its stack."}
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {projects.map((p) => (
          <button
            key={p.slug}
            type="button"
            data-target
            onMouseEnter={() => setActive(p.slug)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(p.slug)}
            onBlur={() => setActive(null)}
            // Fixed height and a single truncated stack line, so the deferred
            // skeleton reserves exactly this box and nothing shifts on load.
            className="h-[58px] overflow-hidden rounded-(--radius) border border-line px-3 py-2 text-left transition-colors hover:border-accent"
          >
            <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
            <span className="block truncate font-mono text-xs text-muted">
              {p.stack.length > 0 ? p.stack.join(" · ") : "no stack on record"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
