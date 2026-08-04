import { ProjectSchema, validate, type Project } from "./types";
import { skillInStack } from "@/lib/skill-match";

/**
 * Projects in SITE order (§2.2: site order for anything carried over).
 *
 * Each entry merges two truth sources — the site's one-liner and date, and
 * the résumé's stack line and bullets. §2.3a: "merge into the existing project
 * entries, do not replace their site one-liners."
 *
 * Knight Finder stays thin because that is all the truth there is. §5.1:
 * "do not pad it to match the others. A short honest page outranks a padded one."
 *
 * ⚠️ `href` is omitted on ReCueCareer and Face2Learn. The site's current links
 * are shifted by one (ReCueCareer → /iPalo, Face2Learn → /ReCueCareer), so the
 * correct URLs are unknown rather than merely wrong. Guessing them would be
 * invention under §0.2. See OPEN-QUESTIONS.md §Q7.
 */
const items = [
  {
    slug: "recuecareer",
    name: "ReCueCareer",
    // _source: app/page.tsx:26
    summary: "AI-powered job search optimizer for students.",
    // §0.2: the résumé wins on conflict, so "Jul 2025" is canonical.
    // §2.3b #2 still says to ask, so the site's value is preserved below.
    date: "Jul 2025",
    // _source: Adan_Rojas_Resume.pdf:51 — verbatim stack line.
    stack: [
      "Next.js",
      "TypeScript",
      "Python",
      "Flask",
      "Tailwind CSS",
      "Supabase",
      "Auth0",
    ],
    bullets: [
      {
        text: "Built a Python scraping pipeline using bs4, resulting in the extraction of 100+ personalized job postings per user session, by transforming data through Sentence-Transformers embeddings and ranking results by semantic relevance.",
        disclosure: "cleared",
      },
      {
        text: "Engineered a full-stack dashboard with Next.js, TypeScript, and Tailwind CSS, resulting in real-time visualization of tailored job insights, by integrating Python APIs with modular React components.",
        disclosure: "cleared",
      },
    ],
    // _source: Adan, 2026-08-04, at Gate 1 — resolving §Q7. The site's link
    // (app/page.tsx:26) pointed at the iPalo repo; this is the real one.
    href: "https://github.com/adanjoserrojas/ReCueCareer",
    image: "ReCueCareer.png",
    // §Q10 #2 RESOLVED (Adan, 2026-08-04): "The ReCueCareer Date is July
    // 2025." Confirms the résumé over the site's "Jun 2025 - Present". Kept in
    // the site's abbreviated form for consistency with every other date on the
    // page (Oct 2025, Sep 2025, May 2024) — "Jul 2025" is the same date.
    _source: "both",
    _sourceRef: "app/page.tsx:26 + Adan_Rojas_Resume.pdf:51-55",
  },

  {
    slug: "ipalo",
    name: "iPalo",
    // _source: app/page.tsx:27
    summary: "Replacing the traditional White Cane for blind users.",
    date: "Oct 2025",
    // _source: Adan_Rojas_Resume.pdf:37 — verbatim stack line.
    stack: [
      "Swift",
      "C++",
      "Python",
      "ARKit",
      "ElevenLabs API",
      "ESP32 Microcontroller",
      "LRAs",
      "3D Print",
      "CAD",
    ],
    bullets: [
      {
        text: "Won 1st place (out of 22 teams) for Best Use of ElevenLabs at Knight Hacks VIII by engineering an iPhone 16 Pro Max LiDAR-powered assistive device that delivered directional haptic feedback to replace the white cane for blind users.",
        disclosure: "cleared",
      },
      {
        text: "Developed an iOS app in Swift with ARKit that integrated a Python based pipeline to convert voice commands into real-time environmental audio descriptions (~5 sec latency) using Gemini API and ElevenLabs API.",
        disclosure: "cleared",
      },
      {
        text: "Prototyped a LiDAR-driven haptic navigation system using Linear Resonance Actuators (LRAs) and an ESP32 microcontroller via Core Bluetooth to provide directional feedback and enhance spatial awareness for blind users.",
        disclosure: "cleared",
      },
    ],
    // _source: app/page.tsx:27 — the one project card whose href is correct.
    href: "https://github.com/adanjoserrojas/iPalo",
    image: "iPalo.png",
    _source: "both",
    _sourceRef: "app/page.tsx:27 + Adan_Rojas_Resume.pdf:37-43",
  },

  {
    slug: "face2learn",
    name: "Face2Learn",
    // _source: app/page.tsx:28
    summary:
      "Help kids with social impairments recognize facial expressions and emotions.",
    date: "Sep 2025",
    // _source: Adan_Rojas_Resume.pdf:44 — verbatim stack line.
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Python",
      "MySQL",
      "Gemini API",
      "Figma",
    ],
    bullets: [
      {
        text: "Built a Chrome extension using HTML and Tailwind CSS in under 36 hours that delivered facial emotion recognition at 65% accuracy, enabling autistic learners to interpret interactions.",
        disclosure: "cleared",
      },
      {
        text: "Trained a CNN on a Kaggle facial expression dataset using TensorFlow with Haar cascade detection, accurately classifying seven distinct emotions from live webcam input in real time for efficient, lightweight on-device analysis.",
        disclosure: "cleared",
      },
      {
        text: "Enhanced user accessibility by developing non-intrusive YouTube overlays with Tailwind CSS + Canvas API, rendering real-time captions and visual cues without disrupting playback, resulting in a seamless, privacy-first learning experience.",
        disclosure: "cleared",
      },
    ],
    // _source: Adan, 2026-08-04, at Gate 1 — resolving §Q7. The site's link
    // (app/page.tsx:28) pointed at the ReCueCareer repo; this is the real one.
    href: "https://github.com/adanjoserrojas/Face2Learn",
    image: "Face2Learn.jpg",
    _source: "both",
    _sourceRef: "app/page.tsx:28 + Adan_Rojas_Resume.pdf:44-50",
  },

  {
    slug: "knight-finder",
    name: "Knight Finder",
    // _source: app/page.tsx:29 — frozen site one-liner, retained.
    summary: "myUCF portal helper extension.",
    // ⚠️ CONFLICT. The site has always said May 2024. The description Adan
    // supplied on 2026-08-04 names "Knight Hacks Spring 2025 Project Launch",
    // which is a different term entirely. Neither value is changed here
    // because guessing would silently rewrite history in one direction or the
    // other. See OPEN-QUESTIONS.md §Q14.
    date: "May 2024",
    // _source: Adan, 2026-08-04. Named in the description he supplied.
    stack: ["JavaScript", "Python", "GenAI", "MySQL"],
    bullets: [
      {
        // Adan's lead sentence, with its trailing clause removed because the
        // next bullet states the same fact verbatim and rendering both reads
        // as a stutter. §0.2 permits "a shorter true subset" but forbids
        // paraphrase, so this is a strict subsequence of what he wrote —
        // nothing substituted.
        //
        // His full original, for one-line restoration:
        //   "Delivered Knight Finder Chrome extension using JavaScript,
        //    Python, GenAI & MySQL for Knight Hacks Spring 2025 Project
        //    Launch—placed 5th of 23—and cut navigation from five clicks to
        //    two, saving approximately 4,200 student-hours weekly."
        text: "Delivered Knight Finder Chrome extension using JavaScript, Python, GenAI & MySQL for Knight Hacks Spring 2025 Project Launch—placed 5th of 23.",
        disclosure: "cleared",
      },
      {
        text: "Cut navigation from five clicks to two, saving approximately 4,200 student-hours weekly.",
        disclosure: "cleared",
      },
      {
        text: "Engineered a GenAI-powered search assistant that highlights myUCF menu paths, tripling task completion speed and reducing support tickets by 90%.",
        disclosure: "cleared",
      },
    ],
    // _source: app/page.tsx:29 — points at a collaborator's account, so
    // per-project repo ownership is not uniform.
    href: "https://github.com/jaysprogram/Knight-Finder",
    image: "Knight_Finder.png",
    // §Q10 #3 RESOLVED (Adan, 2026-08-04): kept, and no longer thin — he
    // supplied real detail, so §5.1's "do not pad it" no longer applies.
    // Nothing here was invented to fill space.
    _source: "owner",
    _sourceRef: "Adan, 2026-08-04 (conversation) + app/page.tsx:29",
  },
] as const;

export const projects: Project[] = items.map((p, i) =>
  validate(ProjectSchema, p, `projects.ts[${i}] (${p.slug})`),
);

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/**
 * Projects whose résumé stack line contains a given skill. The edge is real —
 * §6.3: "Only draw an edge where the skill actually appears in that project's
 * résumé stack line."
 */
export function projectsUsingSkill(skillName: string): Project[] {
  return projects.filter((p) => (p.stack ? skillInStack(skillName, p.stack) : false));
}
