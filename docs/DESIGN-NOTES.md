# DESIGN-NOTES.md

Token plans, what was tried, and the Magic UI adoption log.

Per §3.3, each direction's token plan is written **before** its code, then critiqued against §3.1 before implementing. The critique for each is recorded inline — if an axis read like the default you'd produce for any portfolio, what changed and why.

---

## Calibration — the three tells to avoid (§3.1)

Held as hard constraints across all six:

1. ❌ Cream `#F4F1EA` + high-contrast serif display + terracotta `#D97757`
2. ❌ Near-black + a single acid-green or vermilion accent + glow
3. ❌ Broadsheet: hairline rules, zero radius, dense newspaper columns

Also barred unless the content genuinely is a sequence: `01 / 02 / 03` eyebrows, "Building the future of…" copy, bento grids of stat cards, a hero that is a big number with a small label.

**Self-check applied to every palette below:** no swatch within ΔE 10 of `#F4F1EA` or `#D97757`; accent chroma capped so nothing reads as neon; exactly one accent per direction.

**A note on the existing site's palette.** `app/globals.css:32-33` sets `--color-Beige` and `--color-darkBeige` both to `#ffff` — a malformed 4-digit hex — while the documented beige/cream palette in the comment block above is wired to nothing. So there is no incumbent palette to respect. All six directions start clean.

---

## v1 — `~/adan` (filesystem)

**Concept.** The portfolio *is* a directory. Persistent left rail tree, monospace-forward, breadcrumbs that read like a path. The most literal read of directory-menu logic and the most keyboard-native.

**Color** — cool graphite, one accent (dark ochre). Deliberately *not* warm-neutral, to stay clear of tell #1.

| Token | Light | Dark |
|---|---|---|
| `--surface` | `#F7F8F8` | `#121417` |
| `--raised` | `#FFFFFF` | `#181B1F` |
| `--ink` | `#16181A` | `#E6E9EC` |
| `--muted` | `#5F6871` | `#8B949E` |
| `--line` | `#E3E6E8` | `#262B31` |
| `--accent` | `#8A6A2F` | `#C9A227` |

Body on surface: 15.9:1 light, 14.2:1 dark. Accent on surface: 5.1:1 light, 8.4:1 dark.

**Type.** JetBrains Mono for structure, paths, and labels (the signature voice). Public Sans for body prose — a grotesque with a large x-height that holds up at small sizes without reading as Inter.

**Layout.**
```
┌──────────────┬────────────────────────────────────┐
│ ~/adan       │ ~/adan/projects/ipalo              │
│ ├ about      │ ────────────────────────────────── │
│ ├ projects/  │ iPalo                              │
│ │ ├ ipalo    │ Replacing the traditional White    │
│ │ ├ face2…   │ Cane for blind users.              │
│ ├ experience/│                                    │
│ ├ skills/    │ stack  Swift · C++ · Python · …    │
└──────────────┴────────────────────────────────────┘
```

**Signature.** The tree rail itself — real `role="tree"` semantics, roving tabindex, `j/k` navigation.

**§3.1 critique.** First pass had a fake terminal prompt (`adan@4dan:~$`) above the content pane and a faux status bar at the bottom. Both cut — §3.2 names IDE-clone pastiche as the exact risk, and neither carried information. Differentiation now comes from typography and restraint. The accent moved from `#D97757`-adjacent rust to dark ochre after the tell #1 check.

---

## v2 — Run trace

**Concept.** The page renders as an agent execution trace: each section is a step that resolves. The nav is the trace tree; timestamps are section anchors. Expresses the agentic-AI interest without decorating with it.

**Color** — near-neutral slate with a single desaturated teal. Teal chosen because it is the one hue that reads "instrumentation" without reading "terminal green" (tell #2).

| Token | Light | Dark |
|---|---|---|
| `--surface` | `#FAFAFA` | `#0F1113` |
| `--raised` | `#F1F2F3` | `#171A1D` |
| `--ink` | `#1A1C1E` | `#E8EAEC` |
| `--muted` | `#646B72` | `#8C949C` |
| `--line` | `#E0E2E4` | `#23272B` |
| `--accent` | `#2C6E75` | `#5FB3B8` |

**Type.** IBM Plex Mono for step IDs, durations, and status. IBM Plex Sans for prose. One family, two voices — the trace reads as one instrument.

**Layout.** Single column, left gutter of step markers connected by a vertical rule. Each step is `▸ step-name  ·  status  ·  anchor`.

**Signature.** Steps that resolve as you actually reach them.

**§3.1 critique — this is the one that needed the most restraint.** The obvious version animates fake latencies and prints invented token counts. §3.2 is explicit: "If the trace is fake it's a lie." So every step resolves from a *real* navigation event — an IntersectionObserver firing because you genuinely scrolled there — and no step displays a duration, because no real duration exists to display. What remains is honest: a trace of your traversal, not a simulation of computation.

---

## v3 — Latent atlas

**Concept.** Skills and projects plotted as a 2D map, clustered by the résumé's own three categories. Hovering a project highlights the skills in its résumé stack line — a real edge, not a decorative one.

**Color** — three cluster hues at very low chroma so the map reads as one system, plus one accent for the active edge.

| Token | Light | Dark |
|---|---|---|
| `--surface` | `#FCFCFD` | `#0E1013` |
| `--ink` | `#181A1D` | `#E7E9EC` |
| `--muted` | `#61686F` | `#89909A` |
| `--line` | `#E4E6E9` | `#22262B` |
| `--cluster-lang` | `#5B6E8C` | `#7E93B3` |
| `--cluster-fw` | `#6B7A5E` | `#93A484` |
| `--cluster-tool` | `#7E6A80` | `#A38FA6` |
| `--accent` | `#B4553B` | `#D98063` |

Three cluster hues are not three accents — they are a categorical encoding carrying information, and each is desaturated to roughly equal lightness so none dominates. The single accent is reserved for the active edge.

> ⚠️ The dark-mode accent `#D98063` sits uncomfortably close to the `#D97757` of tell #1. Kept for now because it appears only on hover against a slate map, never as a large field, but this is the one palette decision to revisit if v3 advances.

**Type.** Space Grotesk for the display line (its wide apertures survive being small on a map). IBM Plex Mono for node labels and the tabular fallback.

**Signature.** The map — Canvas 2D, no WebGL, no physics library, ~6 KB of logic.

**§3.1 critique.** An unlabeled scatter plot is decoration. The **semantic layer is primary**: a real `<ul>` grouped by category is always in the DOM, and the canvas is the progressive enhancement over it — not the reverse. Edges are drawn only where a skill actually appears in that project's résumé stack line (`projectsUsingSkill()`), so no edge is invented.

---

## v4 — Reading room

**Concept.** Built from the fact that Adan reads papers daily. Typographic, generous measure, sidenotes, footnote-style project references, near-zero JS.

**Color** — warm-neutral paper. **This is the direction most at risk of tell #1**, so the palette is deliberately steered off it: the paper is a hair cooler and lighter than `#F4F1EA`, and the accent is ink-blue rather than terracotta.

| Token | Light | Dark |
|---|---|---|
| `--surface` | `#FBFAF8` | `#131316` |
| `--ink` | `#1C1B19` | `#E9E7E3` |
| `--muted` | `#63605A` | `#918D86` |
| `--line` | `#E6E3DD` | `#282A2E` |
| `--accent` | `#3A5A8C` | `#7FA3D8` |

**Type.** Newsreader for display and body — an optical-size family, so headings and body can share one voice at genuinely different weights. JetBrains Mono for sidenote labels and dates.

**Layout.** Single 62ch measure, sidenotes in the right margin at ≥1024px, collapsing inline below.

**Signature.** The type itself. Optical sizing, real sidenotes, `text-wrap: pretty`.

**§3.1 critique.** §3.2 calls this "the safe one" and says it only wins if the typography is genuinely exceptional. Serif display + warm paper is *half* of tell #1 — the terracotta accent is what completes it, so the accent went ink-blue. It still needs watching: if this direction advances, the measure, the optical sizing, and the sidenote rhythm have to be the argument, not the palette.

---

## v5 — Inspector

**Concept.** Split-pane. A quiet index on the left; the right pane behaves like a property inspector — select anything and see its real attributes as structured fields. Everything is inspectable, nothing hides behind a modal.

**Color** — the coolest, most neutral of the six, with a single indigo accent. Warmth has to come from spacing and timing, not hue.

| Token | Light | Dark |
|---|---|---|
| `--surface` | `#F8F9FA` | `#101215` |
| `--raised` | `#FFFFFF` | `#171A1E` |
| `--ink` | `#15171A` | `#E5E8EB` |
| `--muted` | `#5D646C` | `#878F98` |
| `--line` | `#E2E5E8` | `#242830` |
| `--accent` | `#4B5BA6` | `#8B99DD` |

**Type.** Archivo for the display line — a grotesque with enough width variation to feel authored rather than defaulted. IBM Plex Mono for field keys and values.

**Layout.** `index | inspector`, 34/66 at ≥900px, stacked below.

**Signature.** The property table — keys in mono, values typed, `NEEDS_INPUT` never shown because absent fields simply do not render a row.

**§3.1 critique.** §3.2's risk is "database admin panel". The fix is spacing: field rows get 14px vertical rhythm rather than the 6px an actual inspector would use, and the display line is set large enough that the page has a voice before you touch anything. First pass used a monospace *display* line too — cut, because it made the whole page read as chrome with no human in it.

---

## v6 — Wildcard: Retrieval

**Justification (one paragraph, per §3.2).** Adan's stated interests are agentic AI, MCP tooling, LLMs and RAG systems, and token optimization — his GitHub themes and his Publix work both land there. Every other direction here treats navigation as *browsing*: you pick a section and go to it. A RAG system does not browse; it **retrieves** — you express an information need and the system ranks its corpus against it, showing you why each chunk scored. So v6 makes the portfolio a corpus and navigation a retrieval step: you type, and the content layer is scored and ranked in front of you, with the matched terms visible in each result. This is not a remix of v1–v5 — v1's tree, v5's index, and v3's map all present a fixed structure the user traverses, while here the structure is *produced per query*. And it is honest in the way §3.2 demands of v2: the ranking is real lexical scoring computed over the real content layer in the browser, not a scripted illusion. It also degrades correctly — with no query, it renders the whole corpus as a plain document.

**Color** — near-monochrome with one warm-neutral accent used solely to mark matched terms.

| Token | Light | Dark |
|---|---|---|
| `--surface` | `#FCFCFC` | `#0D0F11` |
| `--raised` | `#F4F5F6` | `#16191C` |
| `--ink` | `#17191B` | `#E6E8EA` |
| `--muted` | `#5E656C` | `#868D95` |
| `--line` | `#E5E7E9` | `#22262A` |
| `--accent` | `#996515` | `#D7A44A` |
| `--match-bg` | `#F6E9CC` | `#3A2E14` |

**Type.** DM Sans for prose, DM Mono for scores and field labels. The mono carries every number so the ranking reads as measurement.

**Layout.** Query field pinned top; ranked results below, each showing its score and the fields that matched.

**Signature.** The visible ranking — a score badge per result, matched terms highlighted in place.

**§3.1 critique.** The trap is building a search box and calling it a concept. What makes it a direction rather than a feature is that there is **no other navigation** — no nav bar, no section anchors. The empty state is the full corpus, so the site is completely readable without ever typing. Scoring is a small BM25-flavoured lexical function over the content layer, ~2 KB, no search dependency. No fake embeddings and no "semantic" claim: it is lexical, and the UI says so.

---

## Cross-direction decisions

**Fonts.** All six load through `next/font/google`, which self-hosts and emits `display: swap` automatically — so the render-blocking `@import` of Inter at `app/globals.css:2` (see `AUDIT.md` §6.5) is not reproduced in any prototype. Whichever direction wins moves to `next/font/local` with explicit subsetting at Phase 3.

**No direction ships more than one accent.** v3's three cluster hues are a categorical encoding, not accents, and are argued above.

**Reduced motion.** Every prototype either has no motion or wraps it in `@media (prefers-reduced-motion: reduce)`. The current codebase respects it in exactly zero places (`AUDIT.md` §6.3); no prototype inherits that.

**Client boundary.** v1, v3, and v6 need interactivity. v2 needs an IntersectionObserver. v4 and v5 are fully static server components. Every `"use client"` sits on the smallest possible leaf, never at the page root — the opposite of `app/page.tsx:1` today.

---

## Magic UI adoption log (§6.5)

| Component | Adopted? | Why / gzip cost | Stripped |
|---|---|---|---|
| — | none yet | Phase 2 prototypes use no Magic UI. Adoption is a Phase 5 decision, made after Gate 2 picks a direction, and each adoption gets measured before it is kept. | — |

**Pre-rejected on sight, per §6.5:** `globe` (cobe is significant weight for zero information), `icon-cloud` (a rotating ball of logos is decoration; the skills deserve the atlas), `meteors`, `confetti` (the quiz is gone — there is no completion moment left to celebrate), and anything with `neon` or `rainbow` in the name.

---

## What was tried and rejected

Recorded so later passes do not repeat earlier ones (§3.2).

| Tried | Direction | Why cut |
|---|---|---|
| Fake terminal prompt + status bar | v1 | IDE-clone pastiche, the exact risk §3.2 names. Carried no information. |
| Animated step latencies / token counts | v2 | Would have been fabricated. §3.2: "If the trace is fake it's a lie." |
| Force-directed physics layout | v3 | Needed a physics library for a layout that is better computed once, statically, from three fixed categories. |
| Terracotta accent on warm paper | v4 | Completes tell #1. Moved to ink-blue. |
| Monospace display line | v5 | Made the page read as pure chrome with no human in it. |
| "Semantic" / embedding-based ranking | v6 | Would require either a model in the browser or a fabricated similarity score. Lexical scoring is real and the UI says so. |
| Animated counters on the résumé figures | all | §6.5 caps these at three and warns a wall of them is exactly the templated look §3.1 warns about. Deferred to Phase 5, if at all. |
