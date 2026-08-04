import { profile } from "@/content/profile";
import { education } from "@/content/education";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { skills, skillCategories } from "@/content/skills";

export const dynamic = "force-static";

/**
 * §9.1 — "An `/llms.txt` at the root: a plain-text summary of who Adan is and
 * what's on the site. Cheap, and increasingly read by AI crawlers."
 *
 * Generated from the content layer, so it cannot drift from the site.
 * §0.3 holds apply here exactly as they do in the UI: bullets marked `hold`
 * are filtered out, not summarised.
 */
function range(start: string, end: string | undefined, ongoing: boolean) {
  return ongoing ? `${start} - Present` : end ? `${start} - ${end}` : start;
}

export function GET() {
  const lines: string[] = [];

  lines.push(`# ${profile.name}`);
  lines.push("");
  lines.push(`> ${profile.roleLine}`);
  lines.push("");
  lines.push(`Location: ${profile.location}`);
  lines.push(`Site: https://www.4dan.dev`);
  // No email here. §0.2 requires the address be obfuscated against scrapers,
  // and a plaintext file served at a well-known path is the single easiest
  // thing on the site to harvest. Contact is reachable from /about.
  lines.push(`Contact: https://www.4dan.dev/about`);
  lines.push("");

  lines.push("## About");
  lines.push("");
  profile.bio.forEach((p) => {
    lines.push(p);
    lines.push("");
  });

  lines.push("## Education");
  lines.push("");
  lines.push(
    `- ${education.degree}${education.minor ? `, minor in ${education.minor}` : ""} — ${education.institution}, ${education.location}${education.expectedGraduation ? ` (expected ${education.expectedGraduation})` : ""}`,
  );
  lines.push("");

  lines.push("## Experience");
  lines.push("");
  for (const r of experience) {
    lines.push(
      `### ${r.role} — ${r.org} (${range(r.start, r.end, r.ongoing)}, ${r.location})`,
    );
    lines.push(`URL: https://www.4dan.dev/experience/${r.slug}`);
    lines.push("");
    r.bullets
      .filter((b) => b.disclosure === "cleared")
      .forEach((b) => lines.push(`- ${b.text}`));
    lines.push("");
  }

  lines.push("## Projects");
  lines.push("");
  for (const p of projects) {
    lines.push(`### ${p.name} (${p.date})`);
    lines.push(`URL: https://www.4dan.dev/projects/${p.slug}`);
    if (p.href) lines.push(`Repository: ${p.href}`);
    if (p.stack?.length) lines.push(`Stack: ${p.stack.join(", ")}`);
    lines.push("");
    lines.push(p.summary);
    lines.push("");
    (p.bullets ?? [])
      .filter((b) => b.disclosure === "cleared")
      .forEach((b) => lines.push(`- ${b.text}`));
    lines.push("");
  }

  lines.push("## Skills");
  lines.push("");
  for (const c of skillCategories) {
    lines.push(
      `- ${c}: ${skills
        .filter((k) => k.category === c)
        .map((k) => k.name)
        .join(", ")}`,
    );
  }
  lines.push("");

  lines.push("## Links");
  lines.push("");
  profile.links.forEach((l) => lines.push(`- ${l.label}: ${l.href}`));
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
