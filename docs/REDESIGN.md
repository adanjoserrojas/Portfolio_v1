# plan.md — 4dan.dev Portfolio Redesign

**Owner:** Adan Rojas · **Live site:** https://www.4dan.dev · **Likely repo:** `adanjoserrojas/Portfolio_v1` (Next.js 15.5.9 / React 19 / Tailwind v4 / shadcn)
**Executor:** Claude Code (agentic, end-to-end)
**Goal:** Rebuild the *presentation layer* of the portfolio into something minimal, fast, accessible, immersive, and genuinely distinctive — while applying exactly one approved content migration (§0.1a) and inventing nothing beyond it.

---

## 0. Non-negotiable rules

Read these before every phase. Violating any of them fails the task.

### 0.1 Content is frozen, except for one approved migration
- **Do not add, remove, reword, re-date, or "improve" any factual content**, other than the changes enumerated in §0.1a. Project names, descriptions, dates, employers, and skill lists otherwise stay byte-identical to what exists in the repo today.
- Reformatting is allowed (moving a string from JSX into a typed content file). Rewriting is not.
- Prose that is clearly *chrome* rather than data — a section heading like "Projects", a button label like "Click to learn more!" — may be restyled or relabeled **only** if you log the change in `CHANGES-COPY.md` with before/after. Anything descriptive of Adan, his work, or his history is data and is frozen.

### 0.1a The approved content migration (the only permitted delta)

Adan has authorized exactly three changes. Nothing else about the content may move.

**1. Remove the Dahiana Rojas De Rojas LLC internship entirely.** Delete the role, its logo asset (`CanvasLogo.*`), and every reference to it. Superseded by the roles in §2.3.

**2. Replace/extend the experience section with the résumé roles** (AWS, Knight Hacks, Publix). Copy from `Adan_Rojas_Resume.pdf` verbatim per §2.3a.

**3. Remove the quiz entirely.** Delete `/quiz`, the quiz component, the four questions, `headBanging.mp4`, and `CatBiting.mp4`.
- ⚠️ The quiz currently gates a redirect to an unlisted project on a perfect score. Removing the quiz removes that entry point. **Before deleting, find the redirect target in the repo and record it in `OPEN-QUESTIONS.md`,** then ask Adan whether it should be (a) dropped, (b) linked openly, or (c) re-gated behind something else. Do not silently orphan a URL he built on purpose.
- Deleting both videos is also a meaningful performance win — record the byte savings in `RESULTS.md`.

Everything in this migration must be reflected in `CHANGES-CONTENT.md`: what was removed, what was added, and the truth source for each addition.

### 0.2 Zero invention
- Every string, number, date, logo, metric, and link rendered by the new UI must trace back to one of these **truth sources**:
  1. The existing repository (JSX/TSX, JSON, `public/`, `pictures/`)
  2. The live rendering at https://www.4dan.dev
  3. https://github.com/adanjoserrojas (profile README, repo names, repo descriptions, pinned repos)
  4. https://www.linkedin.com/in/adan-rojas/ (owner-supplied; agent must not scrape or guess)
  5. **`Adan_Rojas_Resume.pdf`** (owner-supplied, August 2026) — authoritative for education, experience, project tech stacks, project metrics, and contact email. **Where the résumé and the live site conflict, the résumé wins** and the conflict is logged in `OPEN-QUESTIONS.md` (see §2.3b).
- If a component *wants* data that does not exist (a project's tech stack, a metric, an architecture diagram's node labels, a start date), you **must not fill it in**. Instead:
  - Emit `NEEDS_INPUT` in the content file with a comment naming what's missing.
  - Design the component to render gracefully with the field absent.
  - Append the item to `OPEN-QUESTIONS.md`.
- Never fabricate: employment dates, GPAs, metrics, team sizes, user counts, awards, certifications, or testimonials. The résumé now supplies many real metrics — use those exact figures, never round them, never extrapolate a new one from them, and never restate a metric in stronger terms than the résumé does.
- Contact: `adan@4dan.dev` is now a confirmed address and may be used. Obfuscate it against scrapers (render via a `mailto:` built at runtime or an SVG/JS-assembled string) rather than printing it as plain text in the HTML source. No phone number or street address anywhere.
- **Résumé bullets are evidence, not copy.** You may render them verbatim, or you may render a shorter true subset. You may not paraphrase them into new claims, merge two bullets into one stronger one, or promote a scoped result ("on 4 benchmarks") into an unscoped one.

### 0.3 Scope
- **In scope:** layout, typography, color, motion, components, routing/navigation, bundle size, accessibility, metadata/SEO, image/video optimization, dependency hygiene.
- **Out of scope:** the substance of the writing, the set of projects shown, rewriting the résumé, backend services, analytics vendors requiring an account.
- **Confidentiality check (do this before building anything from the Publix bullets).** The résumé describes internal systems, headcounts, and cost figures from an internship. A résumé shown to recruiters and a public webpage indexed by Google are different disclosure surfaces. Flag in `OPEN-QUESTIONS.md`: *which Publix details are cleared for a public site?* Default to the conservative version (role, dates, technologies, the agent/token-optimization work) and hold the internal figures — 245,000 employees, 3M customers, "seven figures", 3000 engineers — until Adan confirms. This is a judgment call only he can make.

### 0.4 Process discipline
- Work on branch `redesign/v2`. Never commit to `main`.
- One phase per commit series; each phase ends with its acceptance gate passing.
- **Two hard STOP gates** where you must present output and wait for Adan: end of Phase 1 (content lock) and end of Phase 2 (design direction pick). Do not proceed past them autonomously.

---

## 1. Phase 0 — Recon and baseline

### 1.1 Confirm the target repo
The live site is `www.4dan.dev`; `Portfolio_v1`'s README lists `portfoliov1-eosin-mu.vercel.app` as its deployment. These may be the same project with a custom domain attached, or `4dan.dev` may be served from a newer repo.

```bash
# from inside the checked-out repo
git remote -v
git log --oneline -20
cat package.json next.config.ts components.json 2>/dev/null
```

Cross-check: does the repo render the same four projects (ReCueCareer, iPalo, Face2Learn, Knight Finder), the two current experience entries (Knight Hacks Workshop Instructor, Dahiana Rojas De Rojas LLC SWE Intern), and the quiz? If not, **stop and ask Adan which repo is authoritative.** Do not redesign the wrong codebase.

Note: the second experience entry and the quiz are both being *removed* in this project (§0.1a) — you're confirming their presence to identify the right repo, not to preserve them.

### 1.2 Inventory
Produce `AUDIT.md` containing:
- Full file tree of `app/`, `components/`, `lib/`, `public/`, `pictures/` (sizes included).
- Every route currently defined.
- Every dependency in `package.json` mapped to *where it is actually imported*. Flag unused ones.
- Every image and video with dimensions, format, and byte size.
- Every piece of user-facing text, with its file:line — this becomes the input to Phase 1.

Known dependency situation to verify (from `package.json` on `main`):

| Package | Concern |
|---|---|
| `framer-motion@^12` **and** `motion@^12` | Duplicate animation libs — same project, two entry points. Keep one. |
| `three@^0.181` + `@react-three/fiber@^9` + `@react-three/drei@^10` | ~600KB+ of 3D. Justify or remove. |
| `react-spring` + `@react-spring/web` + `@react-spring/parallax` | Third animation system. Almost certainly redundant with the above. |
| `@fortawesome/*` (3 packages) + `react-icons@^5` + `developer-icons@^6` + `lucide-react` | Four icon libraries. Consolidate to one + inline SVG. |
| `mini-svg-data-uri`, `tailwindcss-animate`, `tailwind-scrollbar-hide` | Check if still referenced under Tailwind v4. |

### 1.3 Baseline metrics
```bash
npm ci
npm run build          # capture the route-by-route size table Next prints
npx @next/bundle-analyzer   # or ANALYZE=true npm run build if configured
npx unlighthouse --site https://www.4dan.dev   # or lighthouse CLI per-route
```

Record in `AUDIT.md`: Lighthouse Performance / Accessibility / Best Practices / SEO for mobile **and** desktop, plus LCP, CLS, INP, TBT, TTFB, total transferred bytes, and initial JS. **These are the numbers the redesign must beat.** Also run `npx axe-core` or Lighthouse's a11y section and list every current violation.

**Gate 0:** `AUDIT.md` exists, repo is confirmed, baseline numbers are recorded.

---

## 2. Phase 1 — Extract content into a frozen, typed layer

The single biggest structural improvement: content currently lives inside JSX. Pull it out so the UI can be rebuilt many times without ever touching the data.

### 2.1 Create `content/` (data only, no JSX)

```
content/
  profile.ts       # name, role line, bio paragraphs, location, links
  projects.ts      # one entry per project
  experience.ts    # one entry per role
  education.ts     # UCF degree, minor, expected graduation (résumé)
  skills.ts        # skills, grouped by the résumé's own categories
  reading.ts       # arXiv IDs from the GitHub README (optional section)
  types.ts         # zod schemas + TS types
```

### 2.2 Extraction rules
- Copy strings **verbatim**, including punctuation, capitalization, and the em-dashes/ellipses as they appear.
- Preserve ordering: site order for anything carried over, résumé order for anything migrated in (experience is reverse-chronological on the résumé — keep it that way).
- Every field is either a real value or omitted. No `""`, no `"TBD"`, no placeholder lorem.
- Add a `_source` comment on each record noting where it came from (`app/page.tsx:142`).
- Validate at build time with zod; a schema failure should fail `npm run build`.

### 2.3 Known content (from the live site — verify against repo, repo wins on conflict)

**Identity:** Adan Rojas · Full-Stack Developer · UCF · Oviedo, FL · https://4dan.dev · https://github.com/adanjoserrojas · https://www.linkedin.com/in/adan-rojas/ · https://devpost.com/adanjoserrojas

**Projects (4):**
| Name | Date shown | One-liner shown |
|---|---|---|
| ReCueCareer | Jun 2025 – Present | AI-powered job search optimizer for students. |
| iPalo | Oct 2025 | Replacing the traditional White Cane for blind users. |
| Face2Learn | Sep 2025 | Help kids with social impairments recognize facial expressions and emotions. |
| Knight Finder | May 2024 | myUCF portal helper extension. |

**Skills currently on the site (38, site order):** React, Node.js, Python, Java, TypeScript, JavaScript, Next.js, Tailwind, MongoDB, PostgreSQL, Swift, Firebase, VSCode, XCode, HTML5, CSS, Copilot, Supabase, SQL, MySQL, Selenium, Flask, Bs4, Pandas, Gemini, Scikit-learn, NumPy, SciPy, TensorFlow, N8N, Figma, Notion, Huggingface, Vercel, Hubspot, Docker, Auth0, AWS. *(Superseded — see §2.3a.)*

**Removed:** the Dahiana Rojas De Rojas LLC role and the entire quiz, per §0.1a.

### 2.3a Résumé content (authoritative — `Adan_Rojas_Resume.pdf`)

**Contact:** adan@4dan.dev · linkedin.com/in/adan-rojas/ · github.com/adanjoserrojas

**Education:** University of Central Florida, Orlando, FL — Bachelor of Science in **Information Technology**, Minor in **Computer Engineering**, Fall 2027.

**Experience (3, reverse-chronological):**

| Role | Org | Location | Dates |
|---|---|---|---|
| Student Builder Campus Leader | AWS (Amazon Web Services) | Orlando, FL | Jan 2026 – Present |
| Hackathon Organizer | Knight Hacks | Orlando, FL | Jan 2026 – Present |
| Software Engineer Intern | Publix Super Markets | Lakeland, FL | May 2026 – Jul 2026 |

Copy each role's bullets into `experience.ts` **verbatim** from the résumé. Do not compress, merge, or re-order bullets. Structure them as an array of strings so the UI can show the first N and expand — truncation in the UI is fine, rewriting is not.

Notable real figures now available (subject to the §0.3 confidentiality check): 100+ students educated, 3 workshops, 100+ Builder Center sign-ups, 200+ students reached, 1,000+ hackathon participants, 36-hour event, 2 VB6→C#/.NET batch jobs, 18-engineer team, 5-agent MCP system, 71.1% average token savings across 4 benchmarks.

**Project detail (résumé) — merge into the existing project entries, do not replace their site one-liners:**

| Project | Stack (verbatim) | Date | Headline result |
|---|---|---|---|
| iPalo | Swift, C++, Python, ARKit, ElevenLabs API, ESP32 Microcontroller, LRAs, 3D Print, CAD | Oct 2025 | 1st place of 22 teams, Best Use of ElevenLabs, Knight Hacks VIII |
| Face2Learn | HTML, CSS, JavaScript, Python, MySQL, Gemini API, Figma | Sep 2025 | CNN on Kaggle facial-expression dataset, 7 emotions, 65% accuracy |
| ReCueCareer | Next.js, TypeScript, Python, Flask, Tailwind CSS, Supabase, Auth0 | Jul 2025 | 100+ ranked postings per session via Sentence-Transformers embeddings |
| Knight Finder | *(not on résumé — repo/site only)* | May 2024 | myUCF portal helper extension |

**Skills (résumé categories — use these as the canonical grouping):**
- **Languages:** Python, TypeScript, C#, Swift, HTML/CSS, Java/JavaScript, SQL
- **Frameworks/Libraries:** Selenium, .NET, Flask, bs4, Tailwind, Next.js, React, PyTorch, Gemini, Scikit-learn, NumPy, SciPy, SentenceTransformers, TensorFlow
- **Tools/Platforms:** Linux, Windows, MacOS, XCode, Visual Studio, VS Code, JetBrains CLion & IntelliJ, GitHub, Azure DevOps, Notion, MobaXTerm, WSL, N8N, Figma, Docker, Supabase, BoldTrail, HubSpot, MySQL, AWS, Oracle DBMS, Vercel, MongoDB, Hugging Face

> This is a significant improvement for Phase 5: the skill grouping is now **Adan's own**, taken from the résumé, rather than clusters the agent invented. Use these three categories. Do not create a fourth.

### 2.3b Conflicts to resolve at Gate 1 (log all in `OPEN-QUESTIONS.md`, do not decide alone)

1. **Knight Hacks role.** Site says "Workshop Instructor" (teaching UI/UX); résumé says "Hackathon Organizer" (Jan 2026 – Present). Are these two sequential roles at the same org, or one role renamed? Ask.
2. **ReCueCareer date.** Site: "Jun 2025 – Present". Résumé: "Jul 2025". Ask which is right; do not average or pick.
3. **Knight Finder** appears on the site but not the résumé. Keep it, drop it, or demote it? Default: keep.
4. **Skill list.** The résumé list drops several things the site shows (Node.js, PostgreSQL, Firebase, Copilot, Java as its own entry) and adds several the site doesn't (C#, .NET, PyTorch, SentenceTransformers, Azure DevOps, Oracle DBMS, Linux/WSL, JetBrains, BoldTrail). Default to the résumé list as canonical; confirm.
5. **Major.** The site's meta keywords say "Computer Science"; the résumé says Information Technology with a Computer Engineering minor. **This is a factual error in the current metadata — fix it** and note the fix.
6. **Headline role.** The site says "Full-Stack Developer". The résumé and GitHub both point at software engineering with an agentic-AI concentration. Adan's bio prose is frozen unless he approves a change — ask whether the hero role line and page titles should shift.
7. **Publix disclosure scope** — per §0.3.

**GitHub README themes (usable, already public):** Agentic AI & MCP tooling; token-optimization frameworks; LLMs / RAG systems; containers & virtualization. Currently-reading arXiv IDs: 2510.23473, 2403.10517, 2503.10200, 2512.20618, 2511.20785, 2511.05489.

> The GitHub README is a truth source, so its themes may inform the *design language* and may be surfaced as content **only if** Adan approves at the Phase 1 gate — it is new-to-the-site material even though it isn't invented.

### 2.4 Content diff proof
Write `scripts/verify-content.ts` that extracts all rendered text from the old build and the new build and diffs them, then checks the diff against an allowlist at `content/.migration-allowlist.json`.

The allowlist contains exactly two kinds of entry:
- **Removals** — Dahiana Rojas strings, all quiz strings, both video filenames.
- **Additions** — every string must be present in `Adan_Rojas_Resume.pdf`. The script should verify this mechanically: extract the résumé's text once into `content/.resume-source.txt` and assert that each newly added factual string is a substring of it (normalized for whitespace).

Anything in the diff that is not on the allowlist and not résumé-backed fails the build. This is the mechanism that makes "no invention" checkable rather than aspirational. Wire it as `npm run verify:content`.

**Gate 1 (STOP — human review):** Present `content/`, the diff report, and `OPEN-QUESTIONS.md`. Ask Adan to confirm: (a) nothing is misquoted; (b) all seven conflicts in §2.3b; (c) the Publix disclosure scope; (d) what to do with the quiz's secret-project redirect target; (e) whether GitHub-README material and the arXiv reading list may be surfaced. **Wait for a reply.** Do not start Phase 2 with unresolved facts — every design prototype renders this content, so getting it wrong here wastes six prototypes.

---

## 3. Phase 2 — Design exploration (do not settle for the first good-looking one)

This is the phase that determines whether the result is distinctive or another dark-mode-with-one-accent-color portfolio. Budget real effort here.

### 3.1 Calibration: what to avoid
Three looks dominate AI-generated design right now and read as tells. Do not produce any of them:
1. Cream `#F4F1EA` background + high-contrast serif display + terracotta `#D97757` accent.
2. Near-black background + a single acid-green or vermilion accent + glow.
3. Broadsheet layout with hairline rules, zero radius, dense newspaper columns.

Also avoid, unless the content genuinely is a sequence: `01 / 02 / 03` numbered eyebrows, "Building the future of…" copy, generic bento grids of stat cards, and a hero that is a big number with a small label.

### 3.2 Build six prototypes, not sketches
Create throwaway routes `app/lab/v1` … `app/lab/v6`, each rendering the **real content layer** from Phase 1. They must be real enough to screenshot and Lighthouse. Excluded from the sitemap, `noindex`, deleted before ship.

Each direction below is a starting brief — push past it, and record what you tried in `DESIGN-NOTES.md` so later passes don't repeat earlier ones.

---

**v1 — `~/adan` (filesystem)**
The portfolio *is* a directory. Persistent left rail tree, monospace-forward, `⌘K` palette, `j/k` navigation, breadcrumbs that read like a path. Content panes load into the right column without a full page transition. This is the most literal read of "directory menu logic" and the most keyboard-native.
*Risk to manage:* IDE-clone pastiche. Differentiate through typography and restraint, not chrome. No fake tab bars, no fake terminal prompt, no fake status bar.

**v2 — Run trace**
The page renders as an agent execution trace: each section is a step that resolves. Scrolling advances the run; the nav is the trace tree. Timestamps are section anchors. Directly expresses the agentic-AI interest without decorating with it.
*Risk:* If the trace is fake it's a lie. Make the "steps" genuinely correspond to real navigation events (a step completes because you actually navigated there), never a scripted illusion of computation.

**v3 — Latent atlas**
Skills and projects plotted as a 2D map, clustered by the résumé's own three categories (Languages / Frameworks & Libraries / Tools & Platforms). Zoom and pan reveal detail; hovering a project highlights the skills in its résumé stack line — a real edge, not a decorative one. Canvas-based, a few KB, no 3D engine.
*Risk:* An unlabeled scatter plot is decoration. The clustering must be legible and the whole thing must have a plain `<table>`/list equivalent for keyboard and screen-reader users, not as an afterthought but as the primary semantic layer.

**v4 — Reading room**
Built from the fact that Adan reads papers daily. Typographic, generous measure, sidenotes, footnote-style project references, extremely fast (near-zero JS). The projects become entries; the skills become an appendix.
*Risk:* This is the "safe" one. Only wins if the typography is genuinely exceptional — the type must be the signature, not a fallback.

**v5 — Inspector**
Split-pane: a quiet index on the left, and a right pane that behaves like a property inspector — select anything (a project, a skill, a role) and see its real attributes as structured fields. Everything is inspectable, nothing is hidden behind a modal.
*Risk:* Can feel like a database admin panel. Warmth has to come from spacing, motion timing, and one strong display face.

**v6 — Wildcard**
Your own. Must be justified in one paragraph against Adan's actual interests (AI, ML, CV, SWE, agents) and must not be a remix of v1–v5.

---

### 3.3 Design tokens per direction
For each prototype, first write a compact token plan in `DESIGN-NOTES.md` before writing code:
- **Color:** 4–6 named hex values, with the light-mode and dark-mode mapping for each. "Lightweight colors" per the brief: low chroma, high legibility, one accent maximum, no gradient meshes.
- **Type:** two or three roles — a characterful display face used with restraint, a body face, and a utility/mono face for data and labels. Do not default to Geist/Inter for everything because the repo already has `next/font` wired for Geist. Pick deliberately; self-host via `next/font/local` with `subset` + `display: swap`.
- **Layout:** one-sentence concept plus an ASCII wireframe.
- **Signature:** the one element the site is remembered by. Exactly one. Everything else stays quiet.

Then critique the plan against §3.1 *before* coding. If any axis reads like the default you'd produce for any portfolio, revise it and note what changed and why.

### 3.4 Screenshot and score
For each prototype capture desktop (1440×900) and mobile (390×844), light and dark, using Playwright:

```bash
npx playwright install chromium
node scripts/shoot.mjs   # writes design-lab/vN-{desktop,mobile}-{light,dark}.png
```

Look at the screenshots. Score each direction 1–5 in `DESIGN-REVIEW.md`:

| Criterion | Weight |
|---|---|
| Distinctiveness — could this be mistaken for another dev portfolio? | ×3 |
| Fit to Adan's actual work (AI/ML/CV/agents/SWE) | ×3 |
| Immersion — does it reward interaction over scrolling? | ×2 |
| Performance headroom (measured JS bytes, est. LCP) | ×2 |
| Accessibility feasibility | ×2 |
| Minimalism / restraint | ×1 |
| Craft of typography and spacing | ×2 |

Then run a second pass: take the top two, iterate each once more with a specific fix, re-screenshot, re-score. Do not skip this pass — the second iteration is usually where the design stops looking generated.

**Gate 2 (STOP — human review):** Present `DESIGN-REVIEW.md` with all screenshots, scores, your recommendation and reasoning, and the two refined finalists. **Wait for Adan to pick.** He may also ask for a hybrid — support that.

---

## 4. Phase 3 — Design system

Once a direction is chosen:

### 4.1 Tokens
Define in `app/globals.css` using Tailwind v4's `@theme`. Semantic names only (`--color-surface`, `--color-ink`, `--color-accent`), never raw hex in components.

Requirements:
- Light and dark are **both first-class**. Neither is a filter over the other; check every token pair for contrast independently.
- Theme resolution: `next-themes` (or an equivalent ~2KB implementation) with an inline blocking script in `<head>` to set the class before paint — **no flash of wrong theme**. Default to `system`.
- Body text ≥ 4.5:1, large text and UI borders ≥ 3:1, in both modes. Verify with a script, not by eye.
- One accent. If the direction needs a second, justify it in writing.

### 4.2 Type scale
A fixed modular scale using `clamp()` for fluid sizing. Max 6 steps. Set `text-wrap: balance` on headings and `pretty` on body. Optical sizing and tabular numerals where data is shown.

### 4.3 Motion
- All animation respects `prefers-reduced-motion: reduce` — reduce to opacity-only or nothing, never just "shorter".
- Animate only `transform` and `opacity`. No layout-affecting animation above the fold.
- One orchestrated entrance moment beats five scattered scroll effects.
- Total animation JS on first load: ≤ 20KB gzip.

### 4.4 Component inventory
Rebuild only what's needed: `Shell`, `DirectoryNav`, `CommandPalette`, `ThemeToggle`, `ProjectCard`, `ProjectDetail`, `ExperienceEntry`, `EducationBlock`, `SkillGrid`, `Footer`, plus one or two signature components from Phase 5. Delete everything else, including the quiz component tree.

---

## 5. Phase 4 — Architecture, routing, and directory-menu logic

### 5.1 Routes (real URLs, not modals)
Modal-only project details are invisible to search engines. Give every project a crawlable route.

```
/                       overview
/projects               index
/projects/[slug]        recuecareer | ipalo | face2learn | knight-finder
/experience             index — aws, knight-hacks, publix
/experience/[slug]      one page per role (résumé bullets, verbatim)
/skills                 grouped by the résumé's three categories
/about                  bio paragraphs + education
```

No `/quiz` route. If the old route was ever indexed, add a 301 from `/quiz` to `/` in `next.config.ts` rather than letting it 404.

Project detail pages contain **only existing content** — now meaningfully richer, since the résumé supplies a real stack and a real result for three of the four. Knight Finder stays thin because that's all the truth there is; do not pad it to match the others. A short honest page outranks a padded one.

Giving each role its own route is a real SEO gain: `4dan.dev/experience/publix` and `/experience/aws` are pages that can rank for "Adan Rojas Publix" and "Adan Rojas AWS" — queries where LinkedIn currently has no competition.

Static-render everything (`export const dynamic = 'force-static'`). No client-side data fetching for content.

### 5.2 Directory menu spec
- Desktop: persistent tree rail. Mobile: a sheet triggered by a single button, plus the palette.
- Semantics: `role="tree"` / `role="group"` / `role="treeitem"` with `aria-expanded`, `aria-selected`, `aria-level`. **Roving tabindex** — exactly one tab stop for the whole tree.
- Keys: `↑/↓` move, `←` collapse or go to parent, `→` expand or go to first child, `Home`/`End`, `Enter` navigate, type-ahead by first letter.
- Expansion state syncs to the URL and survives reload and back/forward.
- `⌘K` / `Ctrl+K` palette searching projects, experience, skills, and sections. Fuzzy match over the content layer, ~3KB, no heavyweight search dependency. Focus trapped, `Esc` closes and restores focus to the trigger.
- Current location is indicated by more than color (weight, marker, or indent), and marked `aria-current="page"`.
- The tree is **navigation, not the only path** — every page is reachable by a plain link, and the site works with JS disabled well enough to read.

### 5.3 App Router hygiene
- `loading.tsx` and `error.tsx` per segment.
- `not-found.tsx` that is on-brand and links back into the tree.
- Server Components by default. `"use client"` only on: theme toggle, palette, tree interactivity, and signature canvas components. Audit that the client boundary is as low in the tree as possible.
- View Transitions API for route changes where supported, feature-detected, disabled under reduced motion.

---

## 6. Phase 5 — Immersive components (the reason to stay)

Rule for every one of these: **it visualizes data that already exists, or it doesn't ship.** An interactive component that displays invented architecture is worse than no component.

Build **two**, not five. Two excellent interactive pieces beat five decorative ones, and five will destroy the performance budget.

Candidates, in priority order:

The résumé substantially upgrades what's possible here. The old plan had one strong candidate and three contingent ones; there are now two genuinely excellent options backed by hard numbers.

### 6.1 Token-optimization benchmark (uses real data — Publix résumé bullet) — **recommended signature**
The résumé states an Output Token Optimization Agent Skill that beat the Caveman skill on **4 benchmarks by 71.1% average token savings**, adopted into the Publix Plugin Marketplace. This is the single most distinctive thing on the résumé and it is *inherently visual*: token counts before vs. after, across four benchmarks.

- A small interactive comparison — pick a benchmark, watch the token count collapse from baseline to optimized. Tabular numerals, monospace, no chartjunk.
- **Hard constraint:** the résumé gives one aggregate figure (71.1% average across 4). It does **not** give the four individual benchmark names or their individual percentages. Do **not** invent four bars. Either (a) ask Adan at Gate 1 for the per-benchmark numbers and build the full comparison, or (b) build a single honest before/after that shows the aggregate only. Option (b) is a perfectly good component; a fabricated option (a) is a disqualifying failure.
- Gate the whole component on the §0.3 confidentiality answer. If Publix internals aren't cleared for public display, skip to 6.2.
- Pure CSS + ~2KB of state. No charting library — Recharts and friends cost 40KB+ to draw four bars.

### 6.2 Multi-agent MCP trace (uses real data — Publix résumé bullet)
"A Multi-Agent AI system of 5 agents that leveraged the MCP protocol to consult documentation across the development cycle." Five named nodes and a protocol is a diagram that draws itself, and it lands directly on Adan's stated interest in agents and MCP.
- Magic UI's `animated-beam` is the right primitive here — but only if Adan supplies the **five actual agent roles**. Five unlabeled circles are decoration; five labeled ones are a portfolio piece. `NEEDS_INPUT` in `content/experience.ts`, ask at Gate 1.
- If he supplies nothing, do not build it. Fall back to 6.3.
- Same confidentiality gate as 6.1.

### 6.3 Skill atlas (uses real data — résumé skill categories)
The résumé's own three groupings — Languages / Frameworks & Libraries / Tools & Platforms — rendered as an explorable map. Better than the original plan, because **the grouping is now Adan's, not the agent's**.
- Canvas 2D, no WebGL, no physics library. ~6KB of logic.
- Keyboard: arrow keys move focus between nodes; `Enter` filters projects by that skill — and this link is now *real*, since the résumé lists each project's stack explicitly. Only draw an edge where the skill actually appears in that project's résumé stack line.
- **Semantic fallback is the source of truth:** a real `<ul>` grouped by category, always in the DOM for screen readers and crawlers, visually hidden only while the canvas is active.
- Static render on first paint; canvas hydrates after idle.

### 6.4 Face2Learn concept demo (uses real data — résumé + repo)
The résumé now specifies a CNN trained on a Kaggle facial-expression dataset with Haar cascade detection, classifying seven emotions at 65% accuracy from live webcam input. A small interactive showing the seven emotion classes and the stated accuracy is a faithful illustration.
- No camera access. No model inference in the browser. No ML dependency. No invented confusion matrix — 65% aggregate is the only accuracy figure that exists.
- Lower priority than 6.1–6.3. Build only if one of those falls through.

**Pick two.** Preference order: 6.1 → 6.2 → 6.3 → 6.4. If the confidentiality check knocks out both Publix components, build 6.3 and 6.4.

### 6.5 Real numbers, used honestly
The résumé is full of figures that suit a `number-ticker` treatment (100+ students, 1,000+ participants, 22 teams, 71.1%, 18 engineers). Restraint applies:
- A wall of animated counters is exactly the templated look §3.1 warns about. Use at most **three**, and only where the number is the point.
- Always render the number in the DOM at its final value and animate from it — never animate from zero in a way that leaves `0` in the HTML for crawlers and screen readers.
- Always carry the qualifier. "1,000+ participants" is true; "1,000+ users" is not. "71.1% average token savings across 4 benchmarks" cannot be shortened to "71.1% faster."

### 6.5 Magic UI MCP usage rules
The Magic UI MCP server is available (`pnpm dlx @magicuidesign/cli@latest install claude`). Use it to *pull component source*, then own and trim that source — these are copy-in components, not a runtime dependency.

Components worth evaluating for this brief: `dock`, `terminal`, `file-tree`, `animated-beam`, `bento-grid`, `blur-fade`, `text-animate`, `number-ticker`, `dot-pattern`, `grid-pattern`, `scroll-progress`, `animated-theme-toggler`, `magic-card`, `border-beam`, `particles`, `marquee`, `icon-cloud`, `globe`, `orbiting-circles`.

Hard rules:
- **Measure before you keep.** Import it, build, diff the bundle. If a component costs more than 8KB gzip and isn't the signature element, cut it.
- **Reject on sight:** `globe` (cobe pulls significant weight for zero information), `icon-cloud` (a rotating ball of logos is decoration; the skills deserve the atlas instead), `meteors`, `confetti` (the quiz is gone — there's no longer any completion moment to celebrate), anything with `neon` or `rainbow` in the name — they contradict "minimal, lightweight colors."
- **Strong candidates given the résumé:** `animated-beam` (6.2), `number-ticker` (6.5, capped at three), `file-tree` and `dock` (directory navigation), `blur-fade` and `text-animate` (entrance), `dot-pattern` or `grid-pattern` (ambient, cheap).
- **Strip on adoption:** remove unused variants, unused props, and any `framer-motion` import you can replace with CSS. Many Magic UI components animate things CSS can do alone.
- Every adopted component gets `prefers-reduced-motion` handling added, because most ship without it.
- Log each adoption in `DESIGN-NOTES.md`: component, why, gzip cost, what was stripped.

---

## 7. Phase 6 — Performance

### 7.1 Budgets (enforced, not aspirational)
| Metric | Target |
|---|---|
| Lighthouse Performance (mobile, throttled) | ≥ 95 |
| Lighthouse Performance (desktop) | 100 |
| Initial JS, route `/`, gzip | ≤ 110 KB |
| Total transferred, route `/` | ≤ 400 KB |
| LCP (mobile) | ≤ 1.8 s |
| CLS | ≤ 0.01 |
| TBT | ≤ 100 ms |
| INP | ≤ 200 ms |
| Fonts | ≤ 2 families, ≤ 4 files, self-hosted, subset |

### 7.2 Dependency diet
Remove unless a specific shipped feature requires it:
- One of `framer-motion` / `motion` — keep `motion`, delete the other, update all imports.
- `three`, `@react-three/fiber`, `@react-three/drei` — remove unless the chosen direction's signature element genuinely needs WebGL. If it does: dynamic-import behind user intent, render a static image until then, and skip entirely under reduced motion or `navigator.deviceMemory < 4`.
- `react-spring`, `@react-spring/web`, `@react-spring/parallax` — remove; replace parallax with CSS `animation-timeline: scroll()` where supported, nothing where not.
- `@fortawesome/*`, `react-icons`, `developer-icons` — remove all three. Use `lucide-react` with named imports (tree-shakes) plus inline SVG sprites for brand/tech logos. Confirm every icon currently used has a replacement before deleting.
- `mini-svg-data-uri`, `tailwindcss-animate`, `tailwind-scrollbar-hide` — remove if unreferenced under Tailwind v4.

Run `npx depcheck` and `npx knip` to catch the rest. After removal, `npm run build` and confirm the size table dropped.

### 7.3 Assets
- Every image through `next/image` with explicit `width`/`height`, `sizes`, and AVIF+WebP via `next.config.ts` `images.formats`.
- The professional photo (`DSC_0037.png`) is a PNG — convert to AVIF/WebP at 2 densities. PNG for a photograph is the single easiest win here.
- Above-the-fold hero image: `priority`, everything else lazy.
- **Videos: delete both.** `headBanging.mp4` and `CatBiting.mp4` existed only for the quiz, which is gone (§0.1a). Remove the files, not just the references — record the byte savings in `RESULTS.md`. Confirm nothing else in the repo imports them before deleting.
- If any video is ever reintroduced: never autoplay, `preload="none"`, real controls, poster frame.
- Add `blurDataURL` placeholders to prevent CLS.
- Logo assets: `CanvasLogo.*` (Dahiana Rojas) is now orphaned — delete it. The AWS and Publix roles have no logo asset in the repo; **do not download corporate logos.** Third-party trademarks on a personal site are a licensing question, not a design one. Use typography for those entries unless Adan says otherwise.

### 7.4 Delivery
- `export const dynamic = 'force-static'` on all content routes.
- Cache headers for immutable assets (Next defaults are fine on Vercel — verify, don't assume).
- Preconnect only to origins actually used. Remove speculative hints.
- Confirm no render-blocking third-party scripts. If analytics is wanted, `@vercel/analytics` loads after hydration — nothing else.

### 7.5 Continuous enforcement
Add `.github/workflows/ci.yml`:
```yaml
# typecheck → lint → build → verify:content → lighthouse-ci (budgets from lighthouserc.json) → axe
```
Fail the build on budget regression. Commit `lighthouserc.json` with the §7.1 numbers as assertions.

---

## 8. Phase 7 — Accessibility (target: WCAG 2.2 AA, Lighthouse 100)

Non-negotiable checklist — verify each, don't assume:

- [ ] Skip-to-content link, visible on focus, first in tab order.
- [ ] One `<h1>` per page; heading levels never skip. (The current site has `#`/`##`/`###`/`####` used decoratively — fix this.)
- [ ] Landmarks: `header`, `nav`, `main`, `footer`, each labeled where there's more than one.
- [ ] Visible focus indicator on every interactive element, ≥ 3:1 against adjacent colors, never `outline: none` without a replacement.
- [ ] Full keyboard operability: tree, palette, atlas, signature component, theme toggle. Tab through the whole site with the mouse unplugged.
- [ ] No keyboard traps. Modal/sheet focus is trapped *while open* and restored on close.
- [ ] Target size ≥ 24×24 CSS px (WCAG 2.2 SC 2.5.8).
- [ ] Contrast verified programmatically for every token pair in both themes.
- [ ] `prefers-reduced-motion` respected everywhere, including the signature component and view transitions.
- [ ] Every image has meaningful `alt`; decorative images `alt=""`. Logos get the org name.
- [ ] Canvas components have a real DOM equivalent, not `aria-label` on a canvas.
- [ ] Live regions for async announcements (palette result count, filter changes in the skill atlas).
- [ ] Animated numbers (§6.5) are readable without JS and are not announced repeatedly while counting — set `aria-live="off"` on the ticker and expose the final value.
- [ ] `lang="en"` on `<html>`; `dir` set.
- [ ] Zoom to 200% and 400% without horizontal scroll or content loss.
- [ ] Test with VoiceOver (macOS) or NVDA on at least `/`, `/projects/ipalo`, and `/experience/publix`.

Automated gate:
```bash
npx @axe-core/cli http://localhost:3000 http://localhost:3000/projects/ipalo http://localhost:3000/experience/publix
npx pa11y-ci
```
Zero violations. Automated tools catch roughly a third of issues — the manual keyboard and screen-reader passes above are required, not optional.

---

## 9. Phase 8 — SEO

**The realistic goal.** For queries like `Adan Rojas portfolio`, `4dan.dev`, `Adan Rojas UCF software engineer`, outranking LinkedIn is very achievable. For the bare query `Adan Rojas`, LinkedIn has enormous domain authority and Google heavily favors it for person queries — you can win, but it takes months and depends mostly on off-site signals. Everything below is honest work toward that; none of it is a guarantee, and no one who promises a guarantee is being straight with you.

### 9.1 On-site — the agent does this

**Canonical host.** Pick one — `www.4dan.dev` or `4dan.dev` — and 301 the other. Currently the site's canonical says `www.` while the GitHub profile links the apex. Split signals dilute both. Set `metadataBase` in `app/layout.tsx` to match.

**Metadata via the Next.js Metadata API,** per route, generated from the content layer:
- Title pattern: `Adan Rojas — <page> | Software Engineer` for subpages; homepage title leads with the name. Keep under ~60 chars.
- Unique meta description per route, ~150 chars, drawn from existing copy. Do not write new marketing claims.
- `openGraph` and `twitter` per route. Generate per-project and per-role OG images with `next/og` (ImageResponse) using only real data — edge-rendered, no design tool needed.
- Keep the existing `robots: index, follow` and `googlebot` directives.
- **Fix the keywords meta.** It currently lists "Computer Science" (wrong — Information Technology major, Computer Engineering minor) and "Dahiana Rojas" (a removed employer). Rebuild the keyword list from the content layer. Keywords carry almost no ranking weight, but a wrong major in your own metadata is a credibility problem, not an SEO one.

**Structured data.** Add JSON-LD in `app/layout.tsx`:
```jsonc
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Adan Rojas",
  "url": "https://www.4dan.dev",
  "email": "mailto:adan@4dan.dev",
  "jobTitle": "Software Engineer",
  "alumniOf": {
    "@type": "CollegeOrUniversity",
    "name": "University of Central Florida",
    "address": { "@type": "PostalAddress", "addressLocality": "Orlando", "addressRegion": "FL" }
  },
  "address": { "@type": "PostalAddress", "addressLocality": "Oviedo", "addressRegion": "FL", "addressCountry": "US" },
  "knowsAbout": ["Agentic AI", "Model Context Protocol", "Machine Learning", "Computer Vision", "Software Engineering"],
  "sameAs": [
    "https://github.com/adanjoserrojas",
    "https://www.linkedin.com/in/adan-rojas/",
    "https://devpost.com/adanjoserrojas"
  ]
}
```
`sameAs` is the specific mechanism by which Google links the profiles into one entity — it makes the site a candidate for the knowledge panel rather than a competitor to LinkedIn.

Notes on the fields:
- `knowsAbout` values must be defensible from the résumé and GitHub README. The five above are. Don't extend the list.
- **Do not add `worksFor`.** The Publix internship ended in July 2026, and the AWS Student Builder Campus Leader role is a program affiliation, not employment — `worksFor: Amazon` would read as a claim Adan isn't making. If a current-affiliation signal is wanted, use `affiliation` pointing at UCF.
- Do not add `award`, `hasCredential`, or `alumniOf` entries beyond UCF.
- The iPalo hackathon win *can* be expressed as `award` on that project's `CreativeWork` node (1st place, Best Use of ElevenLabs, Knight Hacks VIII) — that's a real, verifiable award attached to the right entity.

Add `CreativeWork`/`SoftwareApplication` JSON-LD per project page and `BreadcrumbList` on nested routes. Validate every page at Google's Rich Results Test before shipping.

**Crawlability.**
- `app/sitemap.ts` generating from the content layer (all routes, real `lastModified` from git).
- `app/robots.ts` allowing everything, pointing to the sitemap, disallowing `/lab/`.
- Internal linking: every project reachable from `/` and from `/projects` with descriptive anchor text. The directory tree gives you a dense, crawlable internal link graph for free — one of the real advantages of this navigation model.
- Kill the `/lab/*` prototypes before shipping (`noindex` while they exist).
- 301 the removed `/quiz` route (and any removed Dahiana Rojas anchor) rather than serving a 404. Check Search Console's Pages report post-launch for anything else that 404s.
- Add `/llms.txt` — a plain-text summary of who Adan is and what's on the site, assembled from the content layer. Cheap, and increasingly read by AI search surfaces.

**Technical.** Core Web Vitals from §7.1 are a ranking input — Phase 6 is SEO work too. Also: HTTPS only, no mixed content, mobile-friendly (Google indexes mobile-first), no orphan pages.

### 9.2 Off-site — Adan does this (put in `SEO-CHECKLIST.md`)
This is where the LinkedIn fight is actually won. Ranked by impact:

1. **Google Search Console** — verify `4dan.dev`, submit the sitemap, request indexing on the homepage. Check the Performance tab monthly for what queries actually surface the site.
2. **Backlinks from properties you control** (each one is a signal that 4dan.dev is the canonical Adan Rojas):
   - GitHub profile README → link `https://www.4dan.dev` in prose, not just the sidebar field.
   - Every repo's "Website" field → set to the matching project page (`4dan.dev/projects/ipalo`, etc.).
   - Devpost profile → link the site.
   - LinkedIn: the Website field, the About section, and a Featured item pointing at the site. LinkedIn links are `nofollow`, so they don't pass ranking signal directly — but they drive real traffic, and they help Google associate the two profiles as one entity.
   - Knight Hacks: as a Hackathon Organizer you likely have an organizer/team page. Get your name linked to 4dan.dev there. A `.edu`-adjacent or org backlink is worth more than a dozen directory links, and this one you can simply ask for.
   - **AWS Builder Center:** the Student Builder Campus Leader program almost certainly gives you a public builder profile. Link the site from it. An `aws.amazon.com` backlink is a materially stronger signal than anything else on this list.
   - Devpost: the iPalo project page from Knight Hacks VIII is public and links back — make sure it points at `4dan.dev/projects/ipalo` specifically.
3. **Consistent name string everywhere.** "Adan Rojas" identically across GitHub, LinkedIn, Devpost, AWS Builder Center, and the site. Entity resolution is fuzzy; consistency helps it.
4. **Do not buy links or submit to link directories.** It's the fastest way to get the domain devalued.
5. **Patience and freshness.** New pages take weeks to settle. Shipping a project page when a project actually ships is worth more than any on-page tweak.

Target checkable outcome, 8–12 weeks post-launch: `4dan.dev` ranks #1 for `"Adan Rojas" portfolio` and `4dan dev`, and appears on page one for `Adan Rojas UCF`.

---

## 10. Phase 9 — Verification gates

Nothing ships until all of these pass. Record results in `RESULTS.md` alongside the Phase 0 baseline.

```bash
npm run typecheck                 # zero errors, strict mode on
npm run lint                      # zero warnings
npm run build                     # succeeds; size table recorded
npm run verify:content            # zero unexplained content diffs
npx lhci autorun                  # budgets from lighthouserc.json
npx @axe-core/cli <routes>        # zero violations
npx playwright test               # keyboard nav + theme persistence + palette + route coverage
grep -ri "dahiana\|quiz\|headBanging\|CatBiting\|CanvasLogo" . --exclude-dir=node_modules --exclude-dir=.git
```

That last grep must return nothing outside `CHANGES-CONTENT.md` and `OPEN-QUESTIONS.md`. Removal is only done when the strings are actually gone.

| Gate | Criterion |
|---|---|
| Content | `verify:content` clean; every factual string traceable to a truth source or the migration allowlist |
| Migration | Dahiana Rojas and quiz fully removed (grep clean); all three résumé roles present and verbatim; `/quiz` 301s |
| Invention | `OPEN-QUESTIONS.md` contains every unknown; zero `NEEDS_INPUT` rendered to users; every metric matches the résumé exactly, with its qualifier |
| Confidentiality | Publix disclosure scope confirmed by Adan in writing before any internal figure ships |
| Lighthouse | Perf ≥ 95 mobile / 100 desktop; A11y 100; Best Practices 100; SEO 100 — on `/`, `/projects/ipalo`, `/experience/publix` |
| Budget | Initial JS ≤ 110KB gzip on `/` |
| Keyboard | Full site operable with no mouse; verified manually |
| Screen reader | `/`, one project page, one experience page verified with VoiceOver or NVDA |
| Themes | No FOUC; preference persists; both modes pass contrast |
| Structured data | Every page valid in Rich Results Test |
| Cleanup | `/lab/*` deleted; unused deps removed; `depcheck` clean |
| Responsive | 320px → 2560px, no horizontal scroll, no overlap |

Then write `RESULTS.md`: baseline vs. final for every metric, bundle-size delta, dependencies and assets removed (including the two videos), design direction chosen and why, and the full change lists from `CHANGES-COPY.md` and `CHANGES-CONTENT.md`.

---

## 11. Phase 10 — Ship

1. Open a PR from `redesign/v2` → `main` with the before/after screenshots and `RESULTS.md` in the description.
2. Deploy to a Vercel preview. Run Lighthouse against the **preview URL**, not localhost — localhost numbers are optimistic and misleading.
3. Adan reviews the preview on a real phone.
4. Merge. Verify the canonical redirect works in production. Re-submit the sitemap in Search Console.
5. Work through `SEO-CHECKLIST.md` §9.2 manually.
6. Set a reminder to re-check Search Console in 30 days.

---

## Appendix A — Deliverables

| File | Contents |
|---|---|
| `AUDIT.md` | Phase 0 inventory + baseline metrics |
| `content/*` | Typed, validated content layer + `.migration-allowlist.json` + `.resume-source.txt` |
| `OPEN-QUESTIONS.md` | Everything the agent needed and refused to invent, incl. the §2.3b conflicts |
| `CHANGES-CONTENT.md` | The §0.1a migration: what was removed, what was added, source for each |
| `DESIGN-NOTES.md` | Token plans, what was tried, Magic UI adoption log |
| `DESIGN-REVIEW.md` | Six directions, screenshots, scores, recommendation |
| `CHANGES-COPY.md` | Every chrome-copy change, before/after |
| `SEO-CHECKLIST.md` | Adan's manual off-site tasks |
| `RESULTS.md` | Baseline vs. final, all gates |
| `lighthouserc.json`, `.github/workflows/ci.yml` | Enforcement |

## Appendix B — Standing reminders for the agent

- When you don't know a fact, **ask**. `OPEN-QUESTIONS.md` is a success signal, not a failure.
- When a component needs data that doesn't exist, change the component, not the truth.
- The résumé is the only new source of facts. If a claim isn't in it, in the repo, or on the live site, it doesn't exist.
- Never strengthen a metric. "71.1% average across 4 benchmarks" is not "71% faster." "1,000+ participants" is not "1,000+ users." The qualifier travels with the number.
- A résumé is a private document shown to a chosen audience; a website is public and permanent. When in doubt about a detail from an employer, leave it out and ask.
- Before finishing any phase, look at a screenshot. A picture catches what a diff can't.
- Chanel's rule applies to interfaces: before shipping, remove one thing.
- Spend the boldness in one place — the signature element — and keep everything around it quiet.
- Never `git push --force` to `main`. Never rewrite published history.
