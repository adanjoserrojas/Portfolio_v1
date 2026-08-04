import type { Metadata } from "next";
import { skills, skillCategories } from "@/content/skills";
import { projects, projectsUsingSkill } from "@/content/projects";
import { Page, PageTitle } from "@/components/site/Prose";
import SkillAtlas from "@/components/site/SkillAtlasLoader";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Languages, frameworks, and tools Adan Rojas works with — grouped as his résumé groups them, with the projects each one appears in.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return (
    <Page>
      <PageTitle
        eyebrow="Index"
        title="Skills"
        lede={`${skills.length} entries in three categories, grouped as the résumé groups them.`}
      />

      {/**
       * §6.3 — "Semantic fallback is the source of truth: a real <ul> grouped
       * by category, always in the DOM for screen readers and crawlers."
       *
       * It is not visually hidden, and it comes FIRST. Putting the canvas
       * above it meant a large empty box rendered before any text, which hurt
       * LCP for a decorative element — the wrong way round for a component
       * that is explicitly an enhancement over this list.
       */}
      {skillCategories.map((c) => (
        <section key={c} className="mb-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-muted">
            {c}
          </h2>
          <ul className="m-0 list-none p-0">
            {skills
              .filter((k) => k.category === c)
              .map((k) => {
                const used = projectsUsingSkill(k.name);
                return (
                  <li
                    key={k.name}
                    className="flex flex-wrap items-baseline gap-x-3 border-b border-line py-2"
                  >
                    <span className="min-w-[10rem] text-sm text-ink">
                      {k.href ? (
                        <a href={k.href} rel="noopener" className="text-ink no-underline hover:underline">
                          {k.name}
                        </a>
                      ) : (
                        k.name
                      )}
                    </span>
                    {/* A real edge: only where the résumé stack line names it. */}
                    {used.length > 0 && (
                      <span className="font-mono text-xs text-muted">
                        {used.map((p) => p.name).join(" · ")}
                      </span>
                    )}
                  </li>
                );
              })}
          </ul>
        </section>
      ))}

      <section aria-labelledby="atlas-heading" className="mt-12">
        <h2
          id="atlas-heading"
          className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-muted"
        >
          Atlas
        </h2>
        <p className="mb-4 max-w-[52ch] text-sm text-muted">
          The same {skills.length} skills, plotted by category. Hovering or focusing a
          project highlights the ones named in its stack — every line is an edge that
          exists in the source, not a decorative connection.
        </p>
        <SkillAtlas
          skills={skills.map((s) => ({ name: s.name, category: s.category }))}
          projects={projects.map((p) => ({
            slug: p.slug,
            name: p.name,
            stack: p.stack ? [...p.stack] : [],
          }))}
          categories={[...skillCategories]}
        />
      </section>
    </Page>
  );
}
