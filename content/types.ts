import { z } from "zod";

/**
 * Zod schemas + TS types for the frozen content layer (plan §2.1).
 *
 * Rules enforced here, from REDESIGN.md §2.2:
 *   - Every field is either a real value or omitted. No "", no "TBD", no lorem.
 *   - A schema failure must fail `npm run build`.
 *
 * Rules enforced by scripts/verify-content.ts instead:
 *   - Every factual string traces to a truth source (§0.2).
 */

/** A non-empty string. Rejects "" and whitespace-only, per §2.2. */
const NonEmpty = z.string().trim().min(1, "empty strings are not allowed — omit the field instead");

/** Rejects the placeholder values §2.2 explicitly bans. */
const NoPlaceholder = NonEmpty.refine(
  (s) => !/^(tbd|n\/a|todo|lorem|placeholder|needs_input)$/i.test(s.trim()),
  { message: "placeholder value — omit the field and log it in OPEN-QUESTIONS.md" },
);

/**
 * Where a record's data came from. Required on every record so the
 * `_source` discipline in §2.2 is checkable rather than a comment convention.
 */
export const SourceSchema = z.enum([
  "repo",     // existing JSX/TSX/JSON in this repository
  "resume",   // Adan_Rojas_Resume.pdf (August 2026)
  "both",     // present in the repo and corroborated by the résumé
  "github",   // github.com/adanjoserrojas profile README
  // Supplied directly by Adan in conversation. He is the owner and therefore
  // an authoritative source, but this content appears on NO résumé, so it is
  // exempt from the §2.4 résumé-backing check by design. Every record using
  // this must name the date it was supplied in `_sourceRef`.
  "owner",
]);

/**
 * §0.3 confidentiality gate. A résumé is shown to a chosen audience;
 * a website is public and permanent. Bullets carrying internal employer
 * figures default to "hold" until Adan clears them in writing.
 */
export const DisclosureSchema = z.enum(["cleared", "hold"]);

export const BulletSchema = z.object({
  /** Verbatim from the truth source. Never paraphrased (§0.2). */
  text: NoPlaceholder,
  disclosure: DisclosureSchema,
  /** Why this bullet is held. Required when disclosure === "hold". */
  holdReason: NoPlaceholder.optional(),
}).refine((b) => b.disclosure !== "hold" || !!b.holdReason, {
  message: "a held bullet must say which figure triggered the hold",
  path: ["holdReason"],
});

/**
 * A field where two truth sources disagree and §2.3b says to ask rather
 * than decide. `value` carries the §0.2 default (résumé wins); `alternative`
 * preserves the losing value so nothing is destroyed before Gate 1.
 */
export const ConflictSchema = z.object({
  field: NonEmpty,
  value: NonEmpty,
  alternative: NonEmpty,
  question: NonEmpty,
  /** Matches the heading in OPEN-QUESTIONS.md. */
  openQuestion: NonEmpty,
});

export const LinkSchema = z.object({
  label: NonEmpty,
  href: z.url(),
});

export const ProfileSchema = z.object({
  name: NonEmpty,
  /** The role line shown in the hero. Frozen prose (§2.3b #6). */
  roleLine: NonEmpty,
  location: NonEmpty,
  /**
   * Split so the address never appears as a contiguous string in the
   * HTML source. Reassembled at runtime (§0.2).
   */
  email: z.object({ user: NonEmpty, domain: NonEmpty }),
  bio: z.array(NonEmpty).min(1),
  greeting: NonEmpty,
  links: z.array(LinkSchema).min(1),
  _source: SourceSchema,
});

export const EducationSchema = z.object({
  institution: NonEmpty,
  location: NonEmpty,
  degree: NonEmpty,
  minor: NonEmpty.optional(),
  /** Expected graduation. Omitted rather than guessed if unknown. */
  expectedGraduation: NonEmpty.optional(),
  _source: SourceSchema,
});

export const ExperienceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  role: NonEmpty,
  org: NonEmpty,
  location: NonEmpty,
  start: NonEmpty,
  /** Omitted for ongoing roles — never filled with "Present" as a date. */
  end: NonEmpty.optional(),
  ongoing: z.boolean(),
  bullets: z.array(BulletSchema).min(1),
  /** Long-form prose carried over from the site. Frozen (§0.1). */
  siteProse: NonEmpty.optional(),
  // No `logo` field. §7.3 and Adan (2026-08-04, "no logos is fine"): every
  // experience entry renders typographically. Third-party trademarks on a
  // personal site are a licensing question, not a design one — and a field
  // nothing reads is a promise the UI does not keep.
  conflicts: z.array(ConflictSchema).default([]),
  _source: SourceSchema,
  _sourceRef: NonEmpty,
});

export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  name: NonEmpty,
  /** The one-liner shown on the site today. Frozen (§0.1). */
  summary: NonEmpty,
  /** Date as shown on the site. */
  date: NonEmpty,
  /** Verbatim résumé stack line. Absent for projects not on the résumé. */
  stack: z.array(NonEmpty).min(1).optional(),
  /** Verbatim résumé bullets. Absent for projects not on the résumé. */
  bullets: z.array(BulletSchema).min(1).optional(),
  /** Repo URL. Optional rather than guessed. */
  href: z.url().optional(),
  // No `image` field. Adan deleted pictures/ on 2026-08-04 (§Q16): the
  // redesign is text-first and nothing rendered the project screenshots, so
  // the field described assets that no longer exist.
  conflicts: z.array(ConflictSchema).default([]),
  _source: SourceSchema,
  _sourceRef: NonEmpty,
});

/** The résumé's own three groupings. Do not create a fourth (§2.3a). */
export const SkillCategorySchema = z.enum([
  "Languages",
  "Frameworks/Libraries",
  "Tools/Platforms",
]);

export const SkillSchema = z.object({
  name: NonEmpty,
  category: SkillCategorySchema,
  /** Carried over from the site where one exists. Never invented. */
  href: z.url().optional(),
  /** True when the site listed this skill before the résumé migration. */
  onSiteBefore: z.boolean(),
  _source: SourceSchema,
});

export const ReadingSchema = z.object({
  arxivId: z.string().regex(/^\d{4}\.\d{4,5}$/, "must be an arXiv ID"),
  _source: SourceSchema,
});

export type Source = z.infer<typeof SourceSchema>;
export type Disclosure = z.infer<typeof DisclosureSchema>;
export type Bullet = z.infer<typeof BulletSchema>;
export type Conflict = z.infer<typeof ConflictSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Reading = z.infer<typeof ReadingSchema>;

/**
 * Parses at module load so an invalid content file throws during
 * `next build` rather than rendering something wrong (§2.2).
 */
export function validate<T>(schema: z.ZodType<T>, value: unknown, what: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `content/${what} failed validation:\n` +
        result.error.issues.map((i) => `  · ${i.path.join(".")}: ${i.message}`).join("\n"),
    );
  }
  return result.data;
}
