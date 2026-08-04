/**
 * Does a skill appear in a project's résumé stack line?
 *
 * §6.3: "Only draw an edge where the skill actually appears in that project's
 * résumé stack line." The question is what "appears" means, and exact string
 * equality is the wrong answer — it misses edges that are genuinely there:
 *
 *   skill "Tailwind"        vs stack entry "Tailwind CSS"   → is an edge
 *   skill "Gemini"          vs stack entry "Gemini API"     → is an edge
 *   skill "HTML/CSS"        vs stack entries "HTML", "CSS"  → is an edge
 *   skill "Java/JavaScript" vs stack entry "JavaScript"     → is an edge
 *
 * So: split a slash-separated skill into its alternatives, and match an
 * alternative against whole words in the stack entry. Word-boundary matching,
 * not substring — otherwise "React" would match "React Native" (fine) but
 * "SQL" would also match "MySQL" and "PostgreSQL", which are different things.
 *
 * Imports nothing, so it is safe on both sides of the client boundary and the
 * canvas and the skill list can never disagree about what an edge is.
 */

const norm = (s: string) => s.toLowerCase().trim();

/** "Java/JavaScript" → ["java/javascript", "java", "javascript"] */
function alternatives(skill: string): string[] {
  const n = norm(skill);
  const parts = n.split("/").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? [n, ...parts] : [n];
}

/**
 * The entry either IS the skill, or names it and qualifies it:
 *   "tailwind css"  starts with "tailwind"  → edge
 *   "gemini api"    starts with "gemini"    → edge
 *   "html"          equals     "html"       → edge
 *
 * Prefix rather than containment, deliberately. Containment matched
 * "HTML/CSS" against ReCueCareer's "Tailwind CSS", which is a false edge — the
 * stack line names a CSS *framework*, not CSS the language. Prefix matching
 * also keeps "SQL" out of "MySQL" and "PostgreSQL", which are different things.
 */
function namesSkill(entry: string, skill: string): boolean {
  return entry === skill || entry.startsWith(`${skill} `);
}

export function skillInStack(skill: string, stack: readonly string[]): boolean {
  const alts = alternatives(skill);
  return stack.some((entry) => {
    const e = norm(entry);
    return alts.some((a) => namesSkill(e, a));
  });
}
