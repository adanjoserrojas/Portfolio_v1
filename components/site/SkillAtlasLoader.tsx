"use client";

import dynamic from "next/dynamic";
import type { AtlasSkill, AtlasProject } from "./SkillAtlas";

/**
 * Code-splits the atlas out of the initial bundle.
 *
 * The canvas is an enhancement over the semantic skill list, which is a Server
 * Component and always in the DOM — so nothing is lost by loading this late.
 * Hydrating it eagerly cost 220 ms of TBT on /skills and dropped that route to
 * Performance 96; deferring it is the difference between a nice-to-have
 * blocking first input and not.
 *
 * ssr:false because the canvas has no server-rendered output to reconcile —
 * it draws from measured CSS custom properties, which only exist in a browser.
 */
/**
 * The skeleton must reserve the EXACT box the loaded atlas occupies, or
 * deferring it just trades blocking time for layout shift. A first attempt
 * reserved only the canvas and scored CLS 0.136 on this route; this mirrors
 * the full structure — canvas, readout strip, and the project button grid.
 */
function Skeleton() {
  return (
    <div className="mb-10" aria-hidden="true">
      <div className="overflow-hidden rounded-(--radius) border border-line">
        <div style={{ aspectRatio: "1200 / 520" }} />
        <div className="min-h-[2.6rem] border-t border-line px-3 py-2" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[58px] rounded-(--radius) border border-line" />
        ))}
      </div>
    </div>
  );
}

const SkillAtlas = dynamic(() => import("./SkillAtlas"), {
  ssr: false,
  loading: Skeleton,
});

export default function SkillAtlasLoader(props: {
  skills: AtlasSkill[];
  projects: AtlasProject[];
  categories: string[];
}) {
  return <SkillAtlas {...props} />;
}
