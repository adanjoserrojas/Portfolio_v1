import { ExperienceSchema, validate, type Experience } from "./types";

/**
 * Experience, reverse-chronological as the résumé orders it (§2.2).
 *
 * Every bullet is copied verbatim from Adan_Rojas_Resume.pdf. Bullets are an
 * array of strings so the UI can show the first N and expand — truncation in
 * the UI is fine, rewriting is not (§2.3a).
 *
 * PDF text extraction introduces kerning artifacts ("A WS", "T ailwind",
 * "ASP .NET"). The strings below carry the résumé's actual words; the
 * verifier in scripts/verify-content.ts strips whitespace on both sides
 * before comparing, so these still match mechanically.
 *
 * §0.3 CONFIDENTIALITY — CLEARED.
 *
 * History, because a reversal should be legible rather than silently
 * overwritten:
 *
 *   · 2026-08-04, first instruction: "Do not disclose the 4 bullet points."
 *     The four Publix bullets carrying employer-internal figures were held.
 *   · 2026-08-04, superseding instruction: "aggregate the 4 bullet points to
 *     Publix description, at the end, that information is fine to disclose,
 *     I forgot but it is ok to disclose those."
 *
 * That second instruction is the written confirmation §10's confidentiality
 * gate requires before any employer-internal figure ships. All five Publix
 * bullets are now `cleared` and render.
 *
 * Per Adan's wording the four previously-held bullets are appended AFTER the
 * MCP bullet rather than restored to résumé order — "at the end" is explicit,
 * and it is his page.
 *
 * The `disclosure` mechanism is retained even though nothing is currently
 * held: it costs nothing, and the next employer will raise the same question.
 */
const roles = [
  {
    slug: "aws",
    role: "Student Builder Campus Leader",
    org: "AWS (Amazon Web Services)",
    location: "Orlando, FL",
    start: "Jan 2026",
    ongoing: true,
    bullets: [
      {
        text: "Educated 100+ students on AWS microservices (S3, DynamoDB, Lambda) by designing and hosting 3 hands-on technical workshops, building custom Python seeding scripts to demonstrate live S3 operations and boost interactivity.",
        disclosure: "cleared",
      },
      {
        text: "Drove 100+ student sign-ups to the AWS Builder Center by executing organic social media campaigns that showcased hands-on technical usage of AWS technologies as the Student Builder Campus Leader at the University of Central Florida.",
        disclosure: "cleared",
      },
      {
        text: "Increased AWS Builder Center awareness among 200+ students by delivering 3 class announcements that displayed the perks of the AWS Builder Center and partnering with Knight Hacks, UCF's largest programming organization, to co-promote AWS services.",
        disclosure: "cleared",
      },
    ],
    _source: "resume",
    _sourceRef: "Adan_Rojas_Resume.pdf:7-14",
  },

  {
    slug: "knight-hacks",
    role: "Hackathon Organizer",
    org: "Knight Hacks",
    location: "Orlando, FL",
    start: "Jan 2026",
    ongoing: true,
    bullets: [
      {
        text: "Participated in the planning and execution of a 1,000+ participant, 36-hour hackathon, coordinating cross-functional teams, sponsors, and complex logistics across multiple venues for one of Florida's largest student-run collegiate technical events.",
        disclosure: "cleared",
      },
      {
        text: "Coordinated strategic processes between sponsors and hackers, strengthening collaboration, requirements gathering, and communication to align expectations and resolve issues quickly in a high-pressure, fast-paced environment.",
        disclosure: "cleared",
      },
      {
        text: "Designed and delivered technical workshops, challenges, socials, ceremonies, and sub-events, increasing participant engagement and creating hands-on learning experiences for both beginner and advanced developers across multiple skill levels and backgrounds.",
        disclosure: "cleared",
      },
    ],
    // §Q10 #1 RESOLVED (Adan, 2026-08-04): "It is a progression." Workshop
    // Instructor (Aug 2025) preceded Hackathon Organizer (Jan 2026) at the
    // same org. Both are real roles; neither is a rename of the other.
    _source: "resume",
    _sourceRef: "Adan_Rojas_Resume.pdf:15-22",
  },

  {
    slug: "publix",
    role: "Software Engineer Intern",
    org: "Publix Super Markets",
    location: "Lakeland, FL",
    start: "May 2026",
    end: "Jul 2026",
    ongoing: false,
    bullets: [
      // The bullet that was public from the start — no held figure.
      {
        text: "Improved engineer productivity by building a Multi-Agent AI system of 5 agents that leveraged the MCP protocol to consult documentation across the development cycle in the Supply Chain Logistics Department.",
        disclosure: "cleared",
      },
      // The four previously held, appended "at the end" per Adan's wording.
      // Each is verbatim from the résumé; none was edited on the way in.
      {
        text: "Modernized and re-engineered 2 warehouse replenishment batch jobs from legacy VB6 to C#/.NET, improving long-term maintainability for inventory workflows supporting more than 3 million customers across Publix locations nationwide.",
        disclosure: "cleared",
      },
      {
        text: "Collaborated with a cross-functional team of 18 engineers and associates to develop an enterprise Learning Management System supporting 245,000 employees, leveraging MongoDB, Azure Blob/File Storage, ASP.NET MVC, and SQL Server while adhering to organizational security, privacy, and data-governance standards.",
        disclosure: "cleared",
      },
      {
        text: "Contributed to the in-house development of a modern enterprise LMS that reduced annual training costs by over seven figures, replacing third-party platform dependencies with scalable internal solutions that improved operational efficiency.",
        disclosure: "cleared",
      },
      {
        text: "Developed an Output Token Optimization Agent Skill that surpassed the Caveman skill on 4 benchmarks by 71.1% on average token output savings and was adopted by the Publix Plugin Marketplace, impacting the development cycles of more than 3000 engineers.",
        disclosure: "cleared",
      },
    ],
    _source: "resume",
    _sourceRef: "Adan_Rojas_Resume.pdf:23-35",
  },

  {
    // §Q10 #1 RESOLVED (Adan, 2026-08-04): "It is a progression." This is a
    // distinct earlier Knight Hacks role, not an old title for the Organizer
    // role above. Promoted from `unresolvedRoles` into the canonical array.
    //
    // Placed last because it is the earliest start date, keeping the array
    // reverse-chronological. The three résumé roles above hold résumé order
    // per §2.2; this one is site-sourced and appends.
    //
    // Its content is frozen site prose (§0.1) — not on either résumé, so it
    // is exempt from the §2.4 résumé-backing check by design.
    slug: "knight-hacks-workshop-instructor",
    role: "Workshop Instructor",
    org: "Knight Hacks",
    location: "Orlando, FL",
    start: "August 2025",
    ongoing: true,
    bullets: [
      {
        // _source: app/page.tsx:33 — the card's short description, verbatim
        // including its embedded newline.
        text: "This is where I teach UI/UX to Knight Hacks members.\n Knight Hacks is awesome, you should join!",
        disclosure: "cleared",
      },
    ],
    // _source: app/page.tsx:34 — the modal's long description, verbatim.
    siteProse:
      "In this role, I get to share my passion for UI/UX design by leading workshops for Knight Hacks members, and honestly, one of the best parts is pushing myself outside my comfort zone through public speaking. Every workshop is a chance to grow while teaching others about design principles, tools, and best practices. I love creating presentations and hands-on activities that make user-centered design click for people. Beyond the workshops, I work one-on-one with members on their projects, giving feedback and guidance to help their designs shine. I also team up with other instructors to build out a curriculum that gives our members real, practical skills they can actually use in the field. It's rewarding to see people develop their design thinking while I develop my own confidence in front of a room.",
    _source: "repo",
    _sourceRef: "app/page.tsx:33-35",
  },
] as const;

export const experience: Experience[] = roles.map((r, i) =>
  validate(ExperienceSchema, r, `experience.ts[${i}] (${r.slug})`),
);

export function roleBySlug(slug: string): Experience | undefined {
  return experience.find((r) => r.slug === slug);
}

/** Bullets safe to render today, per the §0.3 conservative default. */
export function clearedBullets(role: Experience) {
  return role.bullets.filter((b) => b.disclosure === "cleared");
}

/** True when a role has bullets withheld pending Adan's §0.3 answer. */
export function hasHeldBullets(role: Experience): boolean {
  return role.bullets.some((b) => b.disclosure === "hold");
}
