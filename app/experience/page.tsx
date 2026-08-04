import type { Metadata } from "next";
import { experience } from "@/content/experience";
import { Page, PageTitle } from "@/components/site/Prose";
import TraceList from "@/components/site/TraceList";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Adan Rojas's roles: AWS Student Builder Campus Leader, Knight Hacks Hackathon Organizer and Workshop Instructor, and Software Engineer Intern at Publix Super Markets.",
  alternates: { canonical: "/experience" },
};

export default function ExperienceIndex() {
  const roles = experience.map((r) => ({
    slug: r.slug,
    role: r.role,
    org: r.org,
    location: r.location,
    dates: r.ongoing ? `${r.start} – Present` : r.end ? `${r.start} – ${r.end}` : r.start,
    // §0.3 closed 2026-08-04: do not disclose. Held bullets are filtered out
    // here and their count is not carried forward — the page says nothing
    // about what it is not showing.
    bullets: r.bullets.filter((b) => b.disclosure === "cleared").map((b) => b.text),
  }));

  return (
    <Page>
      <PageTitle
        eyebrow="Index"
        title="Experience"
        lede={`${roles.length} roles, most recent first.`}
      />
      {/* The v2 trace treatment, carried into the shipped site as the second
          signature element (Gate 2 decision). */}
      <TraceList roles={roles} />
    </Page>
  );
}
