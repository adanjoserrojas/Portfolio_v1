/**
 * Corpus construction — SERVER ONLY.
 *
 * This module imports the whole content layer (and therefore zod). It must
 * never be imported from a "use client" file, or the validation stack ships to
 * the browser. Client components receive `Doc[]` as props and rank with
 * `lib/rank.ts`, which imports nothing.
 */

import "server-only";

import { profile } from "@/content/profile";
import { education } from "@/content/education";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { skills, skillCategories } from "@/content/skills";
import type { Doc } from "./rank";

function range(start: string, end: string | undefined, ongoing: boolean) {
  return ongoing ? `${start} – Present` : end ? `${start} – ${end}` : start;
}

/**
 * Built once at module load; the content layer is static.
 *
 * §0.3: bullets marked `hold` are filtered here, at the boundary — so a held
 * bullet cannot reach the browser, the search index, or /llms.txt even by
 * accident.
 */
export const corpus: Doc[] = [
  {
    id: "about",
    kind: "profile",
    title: profile.name,
    meta: `${profile.roleLine} · ${profile.location}`,
    fields: [...profile.bio],
    href: "/about",
  },
  {
    id: "education",
    kind: "education",
    title: education.institution,
    meta: education.location,
    fields: [
      [
        education.degree,
        education.minor ? `Minor in ${education.minor}` : null,
        education.expectedGraduation,
      ]
        .filter(Boolean)
        .join(" · "),
    ],
    href: "/about",
  },
  ...experience.map<Doc>((r) => ({
    id: `role-${r.slug}`,
    kind: "role",
    title: `${r.role} · ${r.org}`,
    meta: `${range(r.start, r.end, r.ongoing)} · ${r.location}`,
    fields: [
      ...r.bullets.filter((b) => b.disclosure === "cleared").map((b) => b.text),
      ...(r.siteProse ? [r.siteProse] : []),
    ],
    href: `/experience/${r.slug}`,
  })),
  ...projects.map<Doc>((p) => ({
    id: `project-${p.slug}`,
    kind: "project",
    title: p.name,
    meta: p.stack?.length ? `${p.date} · ${p.stack.join(" · ")}` : p.date,
    fields: [
      p.summary,
      ...(p.bullets ?? []).filter((b) => b.disclosure === "cleared").map((b) => b.text),
    ],
    href: `/projects/${p.slug}`,
  })),
  ...skillCategories.map<Doc>((c) => ({
    id: `skills-${c}`,
    kind: "skills",
    title: c,
    meta: `${skills.filter((k) => k.category === c).length} entries`,
    fields: [
      skills
        .filter((k) => k.category === c)
        .map((k) => k.name)
        .join(", "),
    ],
    href: "/skills",
  })),
];

/**
 * The résumé, as a searchable document. Adan asked for it in the portfolio and
 * findable by query (2026-08-04).
 *
 * ⚠️ Its `fields` are assembled from CLEARED content only — the same strings
 * already public elsewhere on the site. The PDF's own text is deliberately NOT
 * indexed, because `content/.resume-source.txt` contains all four withheld
 * Publix bullets. Indexing the file would have quietly undone the §0.3
 * decision through the search box.
 *
 * The PDF itself still contains them. That is flagged in OPEN-QUESTIONS.md
 * §Q15 — it is Adan's document and his call, but it is not a call this file
 * can make on his behalf.
 */
const resumeDoc: Doc = {
  id: "resume",
  kind: "resume",
  title: "Résumé (PDF)",
  meta: `${profile.name} · updated August 2026 · download`,
  fields: [
    `${education.degree}${education.minor ? `, minor in ${education.minor}` : ""} — ${education.institution}${education.expectedGraduation ? `, expected ${education.expectedGraduation}` : ""}.`,
    `Experience: ${experience.map((r) => `${r.role} at ${r.org}`).join("; ")}.`,
    `Projects: ${projects.map((p) => p.name).join(", ")}.`,
    ...skillCategories.map(
      (c) =>
        `${c}: ${skills
          .filter((k) => k.category === c)
          .map((k) => k.name)
          .join(", ")}.`,
    ),
  ],
  href: "/Adan_Rojas_Resume.pdf",
};

corpus.push(resumeDoc);

export type { Doc, Hit } from "./rank";
