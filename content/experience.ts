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
 * §0.3 CONFIDENTIALITY. A résumé is shown to a chosen audience; a website is
 * public and permanent. Bullets carrying Publix-internal figures default to
 * `disclosure: "hold"` and MUST NOT render until Adan clears them in writing.
 * See OPEN-QUESTIONS.md §Q5.
 */
const roles = [
  {
    slug: "aws",
    role: "Student Builder Campus Leader",
    org: "AWS (Amazon Web Services)",
    location: "Orlando, FL",
    start: "Jan 2026",
    ongoing: true,
    // No logo. §7.3: do not download corporate logos — this entry renders
    // typographically. See OPEN-QUESTIONS.md §Q8.
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
    // _source: pictures/KH2025Logo.png — already in the repo and already
    // used by the site, so this is the one org with a licensed asset.
    logo: "KH2025Logo.png",
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
    conflicts: [
      {
        field: "role",
        value: "Hackathon Organizer",
        alternative: "Workshop Instructor",
        question:
          "The site shows 'Workshop Instructor' at Knight Hacks starting August 2025; the résumé shows 'Hackathon Organizer' starting January 2026. Are these two sequential roles at the same org, or one role renamed? If sequential, both belong on the site — see `unresolvedRoles` below.",
        openQuestion: "Q10 #1",
      },
    ],
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
    // No logo. §7.3 — see OPEN-QUESTIONS.md §Q8.
    bullets: [
      {
        text: "Modernized and re-engineered 2 warehouse replenishment batch jobs from legacy VB6 to C#/.NET, improving long-term maintainability for inventory workflows supporting more than 3 million customers across Publix locations nationwide.",
        disclosure: "hold",
        holdReason: "'more than 3 million customers' — §0.3 names this among the internal figures to hold until Adan confirms.",
      },
      {
        text: "Collaborated with a cross-functional team of 18 engineers and associates to develop an enterprise Learning Management System supporting 245,000 employees, leveraging MongoDB, Azure Blob/File Storage, ASP.NET MVC, and SQL Server while adhering to organizational security, privacy, and data-governance standards.",
        disclosure: "hold",
        holdReason: "'245,000 employees' — §0.3 names this among the internal figures to hold. The 18-engineer team size is not on §0.3's list but travels in the same sentence.",
      },
      {
        text: "Contributed to the in-house development of a modern enterprise LMS that reduced annual training costs by over seven figures, replacing third-party platform dependencies with scalable internal solutions that improved operational efficiency.",
        disclosure: "hold",
        holdReason: "'over seven figures' in annual cost reduction — §0.3 names this among the internal figures to hold.",
      },
      {
        text: "Improved engineer productivity by building a Multi-Agent AI system of 5 agents that leveraged the MCP protocol to consult documentation across the development cycle in the Supply Chain Logistics Department.",
        // §0.3's conservative default explicitly clears "the agent/token-
        // optimization work". This bullet carries no figure from the hold list.
        disclosure: "cleared",
      },
      {
        text: "Developed an Output Token Optimization Agent Skill that surpassed the Caveman skill on 4 benchmarks by 71.1% on average token output savings and was adopted by the Publix Plugin Marketplace, impacting the development cycles of more than 3000 engineers.",
        disclosure: "hold",
        holdReason: "'more than 3000 engineers' — §0.3 names this among the internal figures to hold. The 71.1%/4-benchmark result itself is cleared work; only the engineer count triggers the hold. Ask whether a shorter true subset ending at 'Publix Plugin Marketplace' may ship.",
      },
    ],
    _source: "resume",
    _sourceRef: "Adan_Rojas_Resume.pdf:23-35",
  },
] as const;

export const experience: Experience[] = roles.map((r, i) =>
  validate(ExperienceSchema, r, `experience.ts[${i}] (${r.slug})`),
);

/**
 * NOT CANONICAL — do not render until Gate 1 resolves OPEN-QUESTIONS.md §Q10 #1.
 *
 * The site currently shows a Knight Hacks "Workshop Instructor" role starting
 * August 2025. The résumé shows "Hackathon Organizer" starting January 2026.
 * §0.2 says the résumé wins on conflict, but §2.3b #1 says to ask whether
 * these are two sequential roles rather than one renamed — and if they are
 * sequential, deleting this one would destroy real history.
 *
 * It is preserved here, unrendered, so that either answer is cheap.
 *
 * Note a third variant exists: the OLD résumé (public/Adan_Rojas_Resume_Oct.pdf)
 * called it "Workshop Team Member", Aug 2025 – Present. Three titles, one org.
 */
export const unresolvedRoles: Experience[] = [
  validate(
    ExperienceSchema,
    {
      slug: "knight-hacks-workshop-instructor",
      role: "Workshop Instructor",
      org: "Knight Hacks",
      location: "Orlando, FL",
      start: "August 2025",
      ongoing: true,
      logo: "KH2025Logo.png",
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
      conflicts: [
        {
          field: "existence",
          value: "retained pending Gate 1",
          alternative: "removed as a rename of Hackathon Organizer",
          question:
            "Is this a distinct earlier role, or the same Knight Hacks role under its old title?",
          openQuestion: "Q10 #1",
        },
      ],
      _source: "repo",
      _sourceRef: "app/page.tsx:33-35",
    },
    "experience.ts unresolvedRoles[0]",
  ),
];

/** Bullets safe to render today, per the §0.3 conservative default. */
export function clearedBullets(role: Experience) {
  return role.bullets.filter((b) => b.disclosure === "cleared");
}

/** True when a role has bullets withheld pending Adan's §0.3 answer. */
export function hasHeldBullets(role: Experience): boolean {
  return role.bullets.some((b) => b.disclosure === "hold");
}
