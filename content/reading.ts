import { ReadingSchema, validate, type Reading } from "./types";

/**
 * OPTIONAL SECTION — NOT APPROVED FOR RENDER.
 *
 * §2.1 marks reading.ts optional; §193 is explicit that GitHub README material
 * "may be surfaced as content **only if** Adan approves at the Phase 1 gate —
 * it is new-to-the-site material even though it isn't invented."
 *
 * Nothing here renders until OPEN-QUESTIONS.md §Q9 is answered "yes".
 *
 * ⚠️ PROVENANCE CAVEAT. These IDs were transcribed from REDESIGN.md §191, not
 * fetched from github.com/adanjoserrojas. Before any of this renders it must be
 * re-verified against the live profile README — a "currently reading" list is
 * time-sensitive by nature, and REDESIGN.md is a plan document, not one of the
 * four truth sources in §0.2.
 *
 * No titles, authors, or abstracts are stored. Adding them would mean fetching
 * or recalling paper metadata, which §0.2 does not authorize.
 */
const ids = [
  "2510.23473",
  "2403.10517",
  "2503.10200",
  "2512.20618",
  "2511.20785",
  "2511.05489",
] as const;

export const reading: Reading[] = ids.map((arxivId, i) =>
  validate(ReadingSchema, { arxivId, _source: "github" }, `reading.ts[${i}] (${arxivId})`),
);

export function arxivUrl(entry: Reading): string {
  return `https://arxiv.org/abs/${entry.arxivId}`;
}

/**
 * Themes from the GitHub profile README. Same approval gate as `reading`.
 * §522 already clears these five for schema.org `knowsAbout`; surfacing them
 * as visible page content is a separate question.
 *
 * _source: REDESIGN.md §191 — re-verify against the live README before render.
 */
export const githubThemes = [
  "Agentic AI & MCP tooling",
  "token-optimization frameworks",
  "LLMs / RAG systems",
  "containers & virtualization",
] as const;

/** Whether §Q9 has been answered. Flip to true only on Adan's word. */
export const APPROVED_FOR_RENDER = false;
