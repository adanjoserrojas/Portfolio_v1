import { ProfileSchema, validate, type Profile } from "./types";

/**
 * Identity and bio. Every string here is frozen prose (§0.1) —
 * reformatted out of JSX, never rewritten.
 */
const data = {
  name: "Adan Rojas",

  // _source: app/page.tsx:74 — the opening clause of the first bio paragraph.
  // §2.3b #6 asks whether this should shift toward software engineering /
  // agentic AI. Changing it edits frozen prose, so it needs Adan's approval.
  roleLine: "Full-Stack Developer",

  // _source: live site footer / REDESIGN.md §2.3. Not present in the repo.
  location: "Oviedo, FL",

  // _source: Adan_Rojas_Resume.pdf line 2 — "adan@4dan.dev".
  // Split so the address never appears contiguously in the HTML source (§0.2).
  // Reassemble at runtime; never render as plain text.
  email: { user: "adan", domain: "4dan.dev" },

  // _source: app/page.tsx:64
  greeting: "Hey there! I'm Adan",

  // _source: app/page.tsx:74, :76, :78 — verbatim, including the curly
  // apostrophes as they appear in the JSX string literals.
  bio: [
    "I'm a Full-Stack Developer passionate about crafting elegant, efficient web solutions that feel as good to use as they are to build.",
    "I enjoy turning complex ideas into clean, intuitive experiences. Alongside web development, I'm actively exploring machine learning and quantitative research. These fields I'm just beginning to dive into, driven by curiosity and a desire to understand how data, models, and mathematics can power smarter systems.",
    "This minimalist portfolio reflects how I think and work: focused, intentional, and always evolving, where creativity meets functionality and learning never stops.",
  ],

  // _source: components/ui/nav-bar.tsx:151,161 (GitHub, LinkedIn) and
  // Adan_Rojas_Resume.pdf line 2. Devpost is from REDESIGN.md §2.3 —
  // it is not linked anywhere in the repo today.
  links: [
    { label: "GitHub", href: "https://github.com/adanjoserrojas" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/adan-rojas/" },
    { label: "Devpost", href: "https://devpost.com/adanjoserrojas" },
  ],

  _source: "both",
} as const;

export const profile: Profile = validate(ProfileSchema, data, "profile.ts");

/** Builds the mailto at runtime so no scraper finds it in the HTML source. */
export function emailAddress(): string {
  return `${profile.email.user}@${profile.email.domain}`;
}

export function emailHref(): string {
  return `mailto:${emailAddress()}`;
}
