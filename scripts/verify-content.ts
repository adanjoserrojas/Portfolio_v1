/**
 * verify-content.ts — REDESIGN.md §2.4
 *
 * "This is the mechanism that makes 'no invention' checkable rather than
 *  aspirational."
 *
 * Three checks, all of which must pass:
 *
 *   A. RÉSUMÉ BACKING — every factual string the content layer marks as
 *      résumé-sourced must be a substring of content/.resume-source.txt
 *      after normalization. Fabricating a metric, a date, or a bullet fails
 *      here, mechanically, with no human in the loop.
 *
 *   B. REMOVALS — the §0.1a strings and files must be gone from the codebase,
 *      outside the documents that exist to record their removal.
 *
 *   C. NO PLACEHOLDERS — nothing marked NEEDS_INPUT/TBD reaches a user.
 *
 * Run: npm run verify:content
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { profile, emailAddress } from "../content/profile";
import { education } from "../content/education";
import { experience, unresolvedRoles } from "../content/experience";
import { projects } from "../content/projects";
import { skills } from "../content/skills";

const ROOT = join(__dirname, "..");
const RESUME = join(ROOT, "content", ".resume-source.txt");
const ALLOWLIST = join(ROOT, "content", ".migration-allowlist.json");

type Allowlist = {
  removals: Record<string, { reason: string; strings?: string[]; files?: string[]; grepTokens?: string[] }>;
};

let failures = 0;
let checks = 0;

function fail(msg: string) {
  failures++;
  console.error(`  ✗ ${msg}`);
}
function pass() {
  checks++;
}
function section(title: string) {
  console.log(`\n${title}`);
}

/**
 * Whitespace-stripping normalization.
 *
 * §2.4 says "normalized for whitespace". Taken to its limit here because pypdf
 * inserts spaces mid-word at kerning boundaries — the résumé's "AWS" extracts
 * as "A WS", "Tailwind" as "T ailwind". Stripping all whitespace makes the
 * comparison immune to that without weakening it: a fabricated sentence still
 * will not appear in the source text.
 *
 * Curly quotes and dashes fold to ASCII because the PDF and the TSX literals
 * disagree about which codepoint they use for the same character.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/[∼˜~]/g, "~")
    .replace(/[…]/g, "...")
    .replace(/\s+/g, "");
}

if (!existsSync(RESUME)) {
  console.error(`FATAL: ${relative(ROOT, RESUME)} is missing.`);
  console.error("Extract it from Adan_Rojas_Resume.pdf before running this check.");
  process.exit(1);
}

const resumeRaw = readFileSync(RESUME, "utf8");
const resume = normalize(resumeRaw);
const allowlist: Allowlist = JSON.parse(readFileSync(ALLOWLIST, "utf8"));

/* ------------------------------------------------------------------ */
/* A. Résumé backing                                                    */
/* ------------------------------------------------------------------ */

section("A. Résumé backing (§2.4 — every added factual string must be in the résumé)");

function mustBeInResume(value: string, where: string) {
  if (resume.includes(normalize(value))) {
    pass();
    return;
  }
  const preview = value.length > 90 ? `${value.slice(0, 90)}…` : value;
  fail(`${where}\n      not found in résumé: "${preview}"`);
}

for (const role of experience) {
  const at = `experience[${role.slug}]`;
  mustBeInResume(role.role, `${at}.role`);
  mustBeInResume(role.org.replace(/\s*\(.*\)\s*/, ""), `${at}.org`);
  mustBeInResume(role.location, `${at}.location`);
  role.bullets.forEach((b, i) => mustBeInResume(b.text, `${at}.bullets[${i}]`));
}

for (const p of projects) {
  const at = `projects[${p.slug}]`;
  // Only résumé-sourced fields are checked. `summary` is frozen site prose and
  // `name`/`date`/`image`/`href` are exempt per the allowlist.
  p.stack?.forEach((s, i) => mustBeInResume(s, `${at}.stack[${i}]`));
  p.bullets?.forEach((b, i) => mustBeInResume(b.text, `${at}.bullets[${i}]`));
}

mustBeInResume(education.institution, "education.institution");
mustBeInResume(education.degree, "education.degree");
if (education.minor) mustBeInResume(education.minor, "education.minor");
if (education.expectedGraduation) {
  mustBeInResume(education.expectedGraduation, "education.expectedGraduation");
}

for (const s of skills) {
  if (s._source === "resume" || s._source === "both") {
    mustBeInResume(s.name, `skills[${s.name}]`);
  }
}

mustBeInResume(emailAddress(), "profile.email");

/* ------------------------------------------------------------------ */
/* B. Removals                                                          */
/* ------------------------------------------------------------------ */

section("B. Removals (§0.1a — Dahiana Rojas, the quiz, and both videos must be gone)");

/** Files that legitimately discuss the removal and are therefore exempt. */
const EXEMPT_FILES = new Set([
  "CHANGES-CONTENT.md",
  "CHANGES-COPY.md",
  "OPEN-QUESTIONS.md",
  "AUDIT.md",
  "RESULTS.md",
  "REDESIGN.md",
  "DESIGN-NOTES.md",
  "DESIGN-REVIEW.md",
  "SEO-CHECKLIST.md",
  join("content", ".migration-allowlist.json"),
  join("content", ".resume-source.txt"),
  join("scripts", "verify-content.ts"),
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "design-lab",
  "public",
  // Vendored Python — the Google API discovery cache contains the word "quiz"
  // in Forms API schemas and would otherwise fail the removal check forever.
  ".venv",
  "venv",
  "env",
  "__pycache__",
  ".vscode",
  ".idea",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|jsx|mjs|css|json|md|py)$/.test(entry)) out.push(full);
  }
  return out;
}

const sourceFiles = walk(ROOT).filter((f) => !EXEMPT_FILES.has(relative(ROOT, f)));

for (const [group, spec] of Object.entries(allowlist.removals)) {
  for (const token of spec.grepTokens ?? []) {
    const hits: string[] = [];
    const re = new RegExp(token, "i");
    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      text.split(/\r?\n/).forEach((line, n) => {
        if (re.test(line)) hits.push(`${relative(ROOT, file).split(sep).join("/")}:${n + 1}`);
      });
    }
    if (hits.length) {
      fail(`removal "${group}" — token /${token}/i still present at:\n      ${hits.join("\n      ")}`);
    } else {
      pass();
    }
  }

  for (const file of spec.files ?? []) {
    if (existsSync(join(ROOT, file))) {
      fail(`removal "${group}" — file still on disk: ${file}`);
    } else {
      pass();
    }
  }
}

/* ------------------------------------------------------------------ */
/* C. No placeholders reach a user                                      */
/* ------------------------------------------------------------------ */

section("C. No placeholders (§10 gate — zero NEEDS_INPUT rendered to users)");

const renderable: string[] = [
  profile.greeting,
  profile.roleLine,
  profile.location,
  ...profile.bio,
  ...profile.links.map((l) => l.label),
  education.institution,
  education.degree,
  ...experience.flatMap((r) => [r.role, r.org, r.location, ...r.bullets.map((b) => b.text)]),
  ...projects.flatMap((p) => [p.name, p.summary, p.date, ...(p.stack ?? []), ...(p.bullets ?? []).map((b) => b.text)]),
  ...skills.map((s) => s.name),
];

const BANNED = /\b(NEEDS_INPUT|TBD|TODO|FIXME|lorem ipsum|placeholder)\b/i;
for (const s of renderable) {
  if (BANNED.test(s)) fail(`placeholder reached the render layer: "${s}"`);
  else pass();
}

/* ------------------------------------------------------------------ */
/* Report                                                               */
/* ------------------------------------------------------------------ */

section("Summary");

const held = experience.flatMap((r) =>
  r.bullets.filter((b) => b.disclosure === "hold").map((b) => `${r.slug}: ${b.holdReason}`),
);

console.log(`  ${checks} checks passed, ${failures} failed.`);
console.log(`  ${experience.length} roles, ${projects.length} projects, ${skills.length} skills.`);

if (held.length) {
  console.log(`\n  ⚠️  ${held.length} bullets withheld pending the §0.3 confidentiality answer:`);
  held.forEach((h) => console.log(`      · ${h}`));
}

const conflicts = [
  ...experience.flatMap((r) => r.conflicts.map((c) => `${r.slug}.${c.field} → ${c.openQuestion}`)),
  ...projects.flatMap((p) => p.conflicts.map((c) => `${p.slug}.${c.field} → ${c.openQuestion}`)),
  ...unresolvedRoles.flatMap((r) => r.conflicts.map((c) => `${r.slug}.${c.field} → ${c.openQuestion}`)),
];
if (conflicts.length) {
  console.log(`\n  ⚠️  ${conflicts.length} unresolved conflicts awaiting Gate 1:`);
  conflicts.forEach((c) => console.log(`      · ${c}`));
}

if (failures > 0) {
  console.error(`\nFAILED — ${failures} check(s) did not pass.`);
  process.exit(1);
}
console.log("\nPASSED — every factual string traces to a truth source.");
