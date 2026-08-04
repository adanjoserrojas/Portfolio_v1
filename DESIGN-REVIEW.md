# DESIGN-REVIEW.md

Six directions, screenshots, scores, recommendation, and two refined finalists.

**Gate 2 — this is a hard STOP.** Adan picks. A hybrid is supported.

---

## How this was produced

All six are **real routes**, not sketches — `/lab/v1` … `/lab/v6`, each rendering the actual Phase 1 content layer (4 roles, 4 projects, 45 skills, real bios, real résumé bullets). Each is `noindex`, excluded from the sitemap, and **deleted before ship** (§10 cleanup gate).

- **Screenshots:** 48 PNGs in [design-lab/](design-lab/) — every direction at desktop 1440×900 and mobile 390×844, light and dark, viewport and full-page. Captured with `node scripts/shoot.mjs`.
- **Scores:** Lighthouse 12.8.2 mobile, throttled, against a production build served locally.

Two bugs were caught **only by looking at the screenshots**, exactly as Appendix B predicts. Both traced to one cause: the first server was serving dev-mode asset URLs, so no client component hydrated — v3's canvas stayed blank and v2's steps all read "pending" while fully on screen. A clean rebuild fixed both. A diff would never have shown this.

---

## Measured results (mobile, throttled)

| | Perf | A11y | Best Prac. | LCP | TBT | CLS | Page weight | First Load JS |
|---|---|---|---|---|---|---|---|---|
| **v1** ~/adan | 99 | **100** | 96 | 1.7 s | 70 ms | 0.002 | 270 KiB | 105 kB |
| **v2** Run trace | 98 | **100** | 96 | 2.2 s | 70 ms | 0 | 264 KiB | 103 kB |
| **v3** Latent atlas | 96 | **100** | 93 | 2.1 s | 190 ms | 0.001 | 236 KiB | 104 kB |
| **v4** Reading room | 99 | **100** | 96 | 1.7 s | 60 ms | 0 | 301 KiB | 103 kB |
| **v5** Inspector | 97 | **100** | 96 | 2.3 s | 110 ms | 0.002 | 248 KiB | **126 kB** |
| **v6** Retrieval | **100** | **100** | 96 | 1.7 s | 60 ms | 0.003 | 249 KiB | 105 kB |
| *baseline (live site)* | *66* | *88* | *96* | *3.4 s* | *600 ms* | *0.053* | ***37.5 MB*** | *333 kB* |
| **§7.1 target** | ≥95 | 100 | 100 | ≤1.8 s | ≤100 ms | ≤0.01 | ≤400 KB | ≤110 KB |

**Every direction already beats every performance target except Best Practices.** Page weight drops from 37.5 MB to ~250 KiB — a **99.3% reduction** — before any of the Phase 6 work, simply because no prototype ships a 37 MB PNG.

Two honest caveats:

1. **The one Best Practices failure is universal and trivial:** `errors-in-console`, caused by `GET /favicon.ico → 404`. There is no favicon in the repo. It is not a design decision and it will be fixed once, globally, in Phase 3.
2. **The 102 kB shared baseline is React 19 + Next's App Router.** Against a ≤110 KB budget that leaves roughly 8 kB of headroom per route, so v5's 126 kB is a real overage, not a rounding error. Every other direction fits.

### Accessibility note

The first scoring pass showed all six failing `color-contrast`. On inspection the single failing element was **my own design-lab chrome bar** (`#7a7a7a` on `#1a1a1a` = 4.05:1) — throwaway scaffolding, not any prototype's palette. Fixed to `#9a9a9a` (6.1:1) so the scores measure the designs. v3 also failed `heading-order` (h1 → h3, because project cards preceded the skills heading); fixed with a screen-reader-only `<h2>`.

**All six now score Accessibility 100** with zero axe violations, against a baseline of 88 and 30 violations.

---

## Scores (§3.4 criteria, weighted)

Scored 1–5. Maximum 75.

| Criterion | ×w | v1 | v2 | v3 | v4 | v5 | v6 |
|---|---|---|---|---|---|---|---|
| Distinctiveness — could this be mistaken for another dev portfolio? | ×3 | 4 | 5 | 4 | 2 | 3 | 5 |
| Fit to Adan's actual work (AI/ML/CV/agents/SWE) | ×3 | 3 | 5 | 4 | 3 | 3 | 5 |
| Immersion — rewards interaction over scrolling | ×2 | 4 | 3 | 4 | 2 | 4 | 5 |
| Performance headroom (measured) | ×2 | 5 | 4 | 3 | 5 | 3 | 5 |
| Accessibility feasibility | ×2 | 5 | 4 | 3 | 5 | 4 | 4 |
| Minimalism / restraint | ×1 | 4 | 4 | 2 | 5 | 3 | 4 |
| Craft of typography and spacing | ×2 | 4 | 4 | 3 | 4 | 4 | 4 |
| **Weighted total** | | **61** | **64** | **52** | **52** | **51** | **70** |

### Reasoning, direction by direction

**v6 — Retrieval (70).** The only direction where the concept *is* the navigation rather than a skin over it. Typing changes the page structure, so it is the sole entry that genuinely rewards interaction over scrolling. It lands directly on Adan's stated interests — RAG, retrieval, agentic tooling — without decorating with them, and the ranking is real lexical BM25 over the content layer rather than a claim. Scored 100 on performance. Marked down on accessibility feasibility only because keyboard result traversal had to be added (it was, in pass 2).

**v2 — Run trace (64).** Highest distinctiveness alongside v6 and an equally direct expression of the agentic-AI interest. Its weakness was immersion: steps resolved as you scrolled, which is a true signal but still rewards scrolling. Addressed in pass 2. The discipline here is what makes it work — no fabricated latencies, no invented token counts, because none exist to display.

**v1 — ~/adan (61).** The strongest keyboard experience of the six and the cleanest accessibility story: real `role="tree"` semantics with roving tabindex, `j/k` navigation, and type-ahead were built and passing from the first pass. Marked down on fit — it says "developer", not "AI engineer". "Dev portfolio as filesystem" is also a recognisable genre, so it is distinctive but not novel.

**v3 — Latent atlas (52).** Visually the most arresting and the busiest. Three real problems: TBT of 190 ms is the worst of the six; label collisions in the 24-node Tools cluster hurt craft; and there is a naming honesty issue — it is called a *latent* atlas but the layout is a deterministic categorical arrangement, not an embedding space. Calling it latent would imply a computation that is not happening. Salvageable as a component (§6.3) rather than a whole direction.

**v4 — Reading room (52).** §3.2 predicted this: "the safe one", winning only if the typography is genuinely exceptional. It is good, not exceptional. It also sits closest to §3.1's tell #1 — serif display on warm paper is half of that formula, avoided only because the accent went ink-blue. Excellent performance and accessibility, but scored 2 on both distinctiveness and immersion.

**v5 — Inspector (51).** Competent and genuinely useful, but §3.2's "database admin panel" risk was not fully escaped even with the loosened spacing. It is also the only direction that misses the JS budget (126 kB vs 110 kB) because every skill renders as an index button. Lowest total.

---

## Second pass — the two finalists

§3.4: *"take the top two, iterate each once more with a specific fix, re-screenshot, re-score. Do not skip this pass — the second iteration is usually where the design stops looking generated."*

### v6 → fix: make the ranking explain itself

**The problem.** A bare score badge asks you to trust a number. The point of showing a ranking is that it is inspectable.

**What changed.**
- **Match attribution per result** — each result now says which fields the query actually hit (`matched in title · body`), not just that it scored.
- **↑/↓ keyboard traversal** from the query field, with the cursor marked by an inset bar plus a background, never colour alone. `Esc` clears.
- Cursor row uses `scroll-margin-block` so a walked-to result lands clear of the sticky query bar.

**Re-scored:** Perf 99, A11y 100, LCP 2.1 s, TBT 60 ms, CLS 0.001, 251 KiB. Immersion and craft both improve; the direction now demonstrates its own mechanism.

### v2 → fix: make the trace traversable, not just observable

**The problem.** Its lowest axis was immersion — the trace resolved as you scrolled, rewarding scrolling rather than interaction.

**What changed.**
- **The trace tree is now the nav** — a sticky rail listing every step with its live resolved/pending state and a running `2/4 resolved` counter.
- Steps are jump targets; the rail marks the current step with `aria-current`, weight, and a bar.
- Resolution state lifted into a context so the rail reports genuine state rather than duplicating the observer.

**Critically, the honesty constraint holds.** A step still resolves *only* because you actually reached it. The rail reports that; it does not manufacture it.

**Re-scored:** **Perf 100**, A11y 100, **LCP 1.5 s**, TBT 60 ms, **CLS 0**, 266 KiB. Best measured numbers of any prototype in either pass.

| Finalist | Pass | Perf | A11y | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|
| v2 Run trace | 1 | 98 | 100 | 2.2 s | 70 ms | 0 | 264 KiB |
| v2 Run trace | **2** | **100** | 100 | **1.5 s** | **60 ms** | **0** | 266 KiB |
| v6 Retrieval | 1 | 100 | 100 | 1.7 s | 60 ms | 0.003 | 249 KiB |
| v6 Retrieval | **2** | 99 | 100 | 2.1 s | 60 ms | **0.001** | 251 KiB |

---

## Recommendation: **v6 — Retrieval**, with v2's trace as its signature component

v6 wins on the two criteria the plan weights most heavily (×3 each), and it wins them for the same reason: **it is the only direction whose structure is produced rather than presented.** v1's tree, v5's index, v3's map, and v4's page all show you a fixed structure to traverse. v6 builds the structure from your query and shows its work. That is both the most distinctive thing here and the most faithful to what Adan actually does — his Publix work is agent tooling and token optimisation, his GitHub themes are MCP and RAG, and a retrieval interface expresses that without a single decorative flourish.

It also degrades honestly, which matters more than it sounds: with no query the page renders the entire corpus as a plain document, so it is fully readable with no interaction, and every word is in the DOM for crawlers. Search-as-navigation usually fails the SEO test; this one does not.

**Why pair it with v2 rather than choosing between them.** They are compatible: v6 is a retrieval surface over a corpus; v2 is a way of rendering one traversal through it. §6 asks for two signature components, and v2's honest-status treatment is a natural fit for the `/experience/publix` route where the agent work lives. This is not a compromise hybrid — it is v6 as the site, with v2's mechanism as one component.

**The case against, stated fairly.** v6's risk is that a first-time visitor sees a search box and does not know what to type. The empty state carries the whole burden. If that state is not excellent, the direction fails — and it currently renders the corpus in document order, which is *fine* rather than compelling. That is the first thing Phase 3 must solve, and it is a real risk, not a formality.

**If you disagree:** v1 is the safest strong choice — best keyboard story, best accessibility headroom, most legible concept — at the cost of saying "developer" rather than "AI engineer". v4 is the safest choice outright and I would advise against it, because §3.2 is right that it only wins on exceptional typography, and it is not there.

---

## Screenshot index

All in [design-lab/](design-lab/), 48 files: `{v1…v6}-{desktop,mobile}-{light,dark}[-full].png`

| | Desktop light | Desktop dark | Mobile light | Mobile dark |
|---|---|---|---|---|
| v1 | `v1-desktop-light.png` | `v1-desktop-dark.png` | `v1-mobile-light.png` | `v1-mobile-dark.png` |
| v2 | `v2-desktop-light.png` | `v2-desktop-dark.png` | `v2-mobile-light.png` | `v2-mobile-dark.png` |
| v3 | `v3-desktop-light.png` | `v3-desktop-dark.png` | `v3-mobile-light.png` | `v3-mobile-dark.png` |
| v4 | `v4-desktop-light.png` | `v4-desktop-dark.png` | `v4-mobile-light.png` | `v4-mobile-dark.png` |
| v5 | `v5-desktop-light.png` | `v5-desktop-dark.png` | `v5-mobile-light.png` | `v5-mobile-dark.png` |
| v6 | `v6-desktop-light.png` | `v6-desktop-dark.png` | `v6-mobile-light.png` | `v6-mobile-dark.png` |

`-full.png` variants capture the whole scroll height — worth opening, since the fold hides most of the content on mobile.

---

## What Gate 2 needs from Adan

1. **Pick a direction** — or ask for a hybrid.
2. If v6: **what should the empty state be?** It is the direction's single point of failure.
3. Confirm the §6 signature components, which still depend on the unanswered §0.3 Publix disclosure question in `OPEN-QUESTIONS.md` §Q5.

Phase 3 (design system) cannot start until (1) is answered — §4 opens "Once a direction is chosen."
