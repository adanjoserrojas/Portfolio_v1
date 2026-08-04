/**
 * Serializable view of the content layer for the Phase 2 prototypes.
 *
 * Every prototype renders THIS — the real Phase 1 data (§3.2: "each rendering
 * the real content layer from Phase 1"). Nothing here invents a field.
 *
 * §0.3: bullets marked `disclosure: "hold"` are filtered out before they cross
 * into any prototype. A held bullet cannot render even by accident, because it
 * never reaches the component tree.
 */
import { profile, emailAddress } from "@/content/profile";
import { education } from "@/content/education";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { skills, skillCategories } from "@/content/skills";

export type LabRole = {
  slug: string;
  role: string;
  org: string;
  location: string;
  dates: string;
  bullets: string[];
  heldCount: number;
  siteProse?: string;
};

export type LabProject = {
  slug: string;
  name: string;
  summary: string;
  date: string;
  stack: string[];
  bullets: string[];
  href?: string;
};

export type LabSkill = { name: string; category: string; href?: string };

export type LabData = {
  name: string;
  roleLine: string;
  greeting: string;
  location: string;
  email: string;
  bio: string[];
  links: { label: string; href: string }[];
  education: {
    institution: string;
    location: string;
    degree: string;
    minor?: string;
    expectedGraduation?: string;
  };
  roles: LabRole[];
  projects: LabProject[];
  skills: LabSkill[];
  categories: string[];
};

function dateRange(start: string, end: string | undefined, ongoing: boolean): string {
  if (ongoing) return `${start} – Present`;
  return end ? `${start} – ${end}` : start;
}

export function labData(): LabData {
  return {
    name: profile.name,
    roleLine: profile.roleLine,
    greeting: profile.greeting,
    location: profile.location,
    email: emailAddress(),
    bio: [...profile.bio],
    links: profile.links.map((l) => ({ label: l.label, href: l.href })),
    education: {
      institution: education.institution,
      location: education.location,
      degree: education.degree,
      minor: education.minor,
      expectedGraduation: education.expectedGraduation,
    },
    roles: experience.map((r) => ({
      slug: r.slug,
      role: r.role,
      org: r.org,
      location: r.location,
      dates: dateRange(r.start, r.end, r.ongoing),
      // §0.3 gate — held bullets never leave the content layer.
      bullets: r.bullets.filter((b) => b.disclosure === "cleared").map((b) => b.text),
      heldCount: r.bullets.filter((b) => b.disclosure === "hold").length,
      siteProse: r.siteProse,
    })),
    projects: projects.map((p) => ({
      slug: p.slug,
      name: p.name,
      summary: p.summary,
      date: p.date,
      stack: p.stack ? [...p.stack] : [],
      bullets: (p.bullets ?? []).filter((b) => b.disclosure === "cleared").map((b) => b.text),
      href: p.href,
    })),
    skills: skills.map((s) => ({ name: s.name, category: s.category, href: s.href })),
    categories: [...skillCategories],
  };
}

/**
 * Projects whose résumé stack line contains this skill. A real edge, per §6.3
 * — never a decorative one.
 */
export function projectsForSkill(data: LabData, skill: string): string[] {
  return data.projects
    .filter((p) => p.stack.some((s) => s.toLowerCase() === skill.toLowerCase()))
    .map((p) => p.name);
}
