# AUDIT.md — Phase 0 recon and baseline

**Branch:** `redesign/v2` (created from `main` @ `016f5df`)
**Date:** 2026-08-04
**Status:** Inventory complete. Baseline metrics pending — see §5.

---

## 1. Repo confirmation (§1.1)

`git remote -v` → `https://github.com/adanjoserrojas/Portfolio_v1.git`

Cross-check against the plan's identification criteria:

| Expected | Found | Where |
|---|---|---|
| ReCueCareer, iPalo, Face2Learn, Knight Finder | ✅ all four | `app/page.tsx:26-29` |
| Knight Hacks — Workshop Instructor | ✅ | `app/page.tsx:33` |
| Dahiana Rojas De Rojas LLC — SWE Intern | ✅ | `app/page.tsx:36` |
| Quiz (4 questions) | ✅ | `app/page.tsx:41-46`, `components/ui/quizComponent.tsx` |
| `headBanging.mp4` / `CatBiting.mp4` | ✅ | `app/page.tsx:145,161` |

**Verdict: this is the authoritative repo.** Proceed.

Stack: Next.js (declared `15.5.9`, **installed `15.5.2`** — see §6.1), React 19.2, Tailwind v4, shadcn config present (`components.json`, style `new-york`, iconLibrary `lucide`) but **no shadcn components are actually installed**.

---

## 2. File tree with sizes

### `app/`
| Path | Size |
|---|---|
| `app/layout.tsx` | 2.8 KB |
| `app/page.tsx` | 10.1 KB |
| `app/globals.css` | 2.2 KB |
| `app/sitemap.ts` | 0.3 KB |
| `app/backend/chatbot.py` | 8.3 KB |
| `app/backend/data/adan_persona.json` | 2.9 KB |
| `app/backend/.env` | 0.1 KB (gitignored — **not** tracked, verified with `git ls-files`) |

### `components/ui/`
| Path | Size | Rendered today? |
|---|---|---|
| `CardDemo.tsx` | 18.7 KB | ✅ skills section |
| `nav-bar.tsx` | 13.1 KB | ✅ |
| `background-gradient-animation.tsx` | 6.2 KB | ✅ |
| `FloatExperience.tsx` | 4.6 KB | ✅ experience cards |
| `quizComponent.tsx` | 3.5 KB | ✅ — **to be deleted (§0.1a)** |
| `spotlight-new.tsx` | 3.5 KB | ✅ |
| `RotatingCube.tsx` | 3.4 KB | ✅ (project card "learn more" transition) |
| `AIChatSection.tsx` | 3.1 KB | ❌ dead — see §6.2 |
| `ProjectCard.tsx` | 3.0 KB | ✅ |
| `chat-section.tsx` | 2.3 KB | ❌ dead |
| `search-bar.tsx` | 1.5 KB | ❌ dead |
| `lib/utils.ts` | 0.2 KB | ✅ `cn()` |

### `pictures/` — **37.9 MB total, all unoptimized**
| File | Size | Used at |
|---|---|---|
| `DSC_0037.png` | **37.4 MB** | `app/page.tsx:16,81` — hero photo, rendered at max 420×420 |
| `McChicekn.png` | **5.3 MB** | ❌ **orphaned** (no import anywhere) |
| `CanvasLogo.png` | 275.5 KB | `app/page.tsx:15` — Dahiana Rojas logo, **to be deleted (§0.1a)** |
| `iPalo.png` | 274.8 KB | `app/page.tsx:10` |
| `ReCueCareer.png` | 138.3 KB | `app/page.tsx:13` |
| `WrongLogo.png` | 45.9 KB | ❌ **orphaned** |
| `KH2025Logo.png` | 41.0 KB | `app/page.tsx:14` |
| `Face2Learn.jpg` | 27.8 KB | `app/page.tsx:12` |
| `Knight_Finder.png` | 25.7 KB | `app/page.tsx:11` |
| `headBanging.mp4` | 411 KB | ❌ **duplicate** of `public/videos/headBanging.mp4`, unreferenced |

### `public/` — 27.8 MB total
| File | Size | Used at |
|---|---|---|
| `images/og-image.png` | **27.0 MB** | `app/layout.tsx:52,64` — declared 1200×630 OG image |
| `Adan_Rojas_Resume_Oct.pdf` | 110.3 KB | `components/ui/nav-bar.tsx:175,271` |
| `videos/headBanging.mp4` | 411 KB | `app/page.tsx:145` — **to be deleted** |
| `videos/CatBiting.mp4` | 219.5 KB | `app/page.tsx:161` — **to be deleted** |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | 3.2 KB combined | ❌ all orphaned Next.js boilerplate |
| `robots.txt` | 0.1 KB | ✅ (static; note `app/sitemap.ts` also exists) |

**Asset total: ~65.7 MB of images/video in the repo.** Two files (`DSC_0037.png` at 37.4 MB and `og-image.png` at 27.0 MB) are 98% of it.

> ⚠️ `og-image.png` at 27 MB is a live, currently-shipping defect, not just a redesign target: every social/link-preview crawler that fetches it downloads 27 MB. Most will time out and render no preview at all.

---

## 3. Routes currently defined

| Route | Source | Notes |
|---|---|---|
| `/` | `app/page.tsx` | The entire site. Single page, `"use client"` at the root. |
| `/sitemap.xml` | `app/sitemap.ts` | Emits exactly one URL (`https://www.4dan.dev`). |
| `/robots.txt` | `public/robots.txt` | Static file, not `app/robots.ts`. |

**There is no `/quiz` route.** The quiz is inline on `/` (`app/page.tsx:137-167`). Plan §5.1's "301 the `/quiz` route" is therefore **moot** — no such URL was ever served, so nothing can 404. Recorded in `OPEN-QUESTIONS.md` §Q4 anyway, since the plan asserts otherwise.

---

## 4. Dependencies mapped to actual imports

Verified by grepping every `from "…"` across `app/`, `components/`, `lib/`.

### Used
| Package | Imported at |
|---|---|
| `next` | `app/layout.tsx:2` (`next/font/google`), `ProjectCard.tsx:2`, `FloatExperience.tsx:5` (`next/image`) |
| `react`, `react-dom` | throughout |
| `framer-motion` | `page.tsx:6`, `nav-bar.tsx:3`, `ProjectCard.tsx:3`, `FloatExperience.tsx:3`, `quizComponent.tsx:3`, `AIChatSection.tsx:5`, `chat-section.tsx:7` — **7 files** |
| `motion` | `CardDemo.tsx:2`, `spotlight-new.tsx:4` — **2 files**, imported as `motion/react` |
| `lucide-react` | `nav-bar.tsx:6,7`, `search-bar.tsx:5`, `AIChatSection.tsx:4` |
| `react-icons` | `CardDemo.tsx:15,44,51,56,61,66,68` — 7 sub-packages (`fa`, `si`, `di`, `vsc`, `tb`, `bs`, `go`) |
| `three` | `RotatingCube.tsx:4` (`import * as THREE`) |
| `clsx`, `tailwind-merge` | `lib/utils.ts:1,2` |
| `tailwind-scrollbar-hide` | `tailwind.config.ts` plugin |

### Unused — zero imports found
| Package | Verdict |
|---|---|
| `@fortawesome/free-brands-svg-icons` | ❌ remove |
| `@fortawesome/free-solid-svg-icons` | ❌ remove |
| `@fortawesome/react-fontawesome` | ❌ remove |
| `@react-spring/parallax` | ❌ remove |
| `@react-spring/web` | ❌ remove |
| `react-spring` | ❌ remove |
| `@react-three/drei` | ❌ remove |
| `@react-three/fiber` | ❌ remove |
| `developer-icons` | ❌ remove |
| `mini-svg-data-uri` | ❌ remove |
| `tailwindcss-animate` | ❌ remove (not referenced in `tailwind.config.ts` or `globals.css`) |
| `class-variance-authority` | ❌ remove (shadcn scaffolding, no component uses it) |

**12 of 22 runtime dependencies are dead.** This resolves the plan's §1.2 table:

- `framer-motion` + `motion`: both genuinely imported (7 files vs. 2). Consolidate on `motion`, rewrite 7 imports.
- Three.js: `three` **is** used, by `RotatingCube` — a spinning white cube shown for 2 seconds during the project-card click transition (`ProjectCard.tsx:36-48`). `@react-three/fiber` and `@react-three/drei` are pure dead weight. The cube itself is ~600 KB of WebGL for a 2-second loading spinner; recommend cutting it and the `three` dep with it.
- `react-spring` family: confirmed fully unused.
- Icon libraries: `react-icons` (heavy — 38 icons in `CardDemo`) and `lucide-react` (8 icons) are used; `@fortawesome/*` and `developer-icons` are not.

---

## 5. Baseline metrics

**Captured 2026-08-04 against the live site. Full detail in `RESULTS.md`.** Measurement was initially blocked by a full disk (0 bytes free on C:); `npm cache clean --force` recovered 8.91 GB and unblocked it.

| Metric | Baseline | Target (§7.1) |
|---|---|---|
| Lighthouse Performance (mobile) | **66** | ≥ 95 |
| Lighthouse Performance (desktop) | **89** | 100 |
| Lighthouse Accessibility | **88** | 100 |
| Lighthouse Best Practices | **96** | 100 |
| Lighthouse SEO | **100** | 100 |
| LCP (mobile / desktop) | **3.4 s** / 0.9 s | ≤ 1.8 s |
| CLS (mobile / desktop) | **0.053** / 0.000 | ≤ 0.01 |
| TBT (mobile / desktop) | **600 ms** / 60 ms | ≤ 100 ms |
| Speed Index (mobile) | **62.6 s** | — |
| Time to Interactive (mobile) | **107.8 s** | — |
| TTFB | 40 ms | — |
| Total transferred, `/` | **37.5 MB** | ≤ 400 KB |
| First Load JS, `/` | **333 kB** | ≤ 110 KB |
| axe-core violations | **30** | 0 |

Two findings dominate:

1. **`DSC_0037.png` is 97.5% of the page** — 37,445 KiB transferred raw, because `app/page.tsx:81` uses a plain `<motion.img>` instead of `next/image`, so the image pipeline never runs. Displayed at ≤420×420.
2. **`svg-img-alt` × 25** — every `react-icons` skill glyph renders `<svg role="img">` with no accessible name.

`npm run build` also emits **24 ESLint warnings**, mostly unused imports and `react-hooks/exhaustive-deps` (`CardDemo.tsx:334`, `background-gradient-animation.tsx:55,70`). §10's gate requires zero.

---

## 6. Findings not in the plan's scope list

### 6.1 Next.js version drift
`package.json` declares `"next": "15.5.9"`; the installed tree is `15.5.2`, and `eslint-config-next` is pinned to `15.5.2`. `15.5.9` was the React Server Components CVE fix (commit `ee45058`). **The installed dependency does not include that security patch.** A clean `npm ci` fixes it.

### 6.2 Dead chatbot subsystem
`AIChatSection.tsx`, `chat-section.tsx`, and `search-bar.tsx` form a complete Gemini chatbot UI wired to a Flask backend (`app/backend/chatbot.py`, persona in `app/backend/data/adan_persona.json`). It is disabled at `app/page.tsx:66`:

```jsx
{/*<AIChatSection />*/} {/* Chat section removed for cleaner intro, will work in V2 */}
```

`chat-section.tsx:26` hardcodes `http://localhost:5000/chat`, which would be mixed-content-blocked in production regardless. There is also a **circular naming inversion**: `chat-section.tsx:6` imports `ChatContainer` from `./AIChatSection`, while `AIChatSection.tsx` is itself the container — the file named `chat-section` is the section and the file named `AIChatSection` is the container.

**Not covered by §0.1a.** Deleting it is a content change (removes the "Ask me any questions you want!" / "Chat with me :3" strings) even though nothing renders today. Logged as `OPEN-QUESTIONS.md` §Q6.

### 6.3 Accessibility violations visible by inspection
Not a substitute for the axe run, but already certain:

- **Heading hierarchy is decorative.** `app/page.tsx` uses `<h1>` for the hero (`:58`), `<h1>` again for "Projects" (`:92`), `<h2>` "Skills" (`:111`), `<h3>` "Experience" (`:117`), `<h4>` "A little quiz about Me" (`:137`) — chosen for visual order, not structure. `FloatExperience.tsx:36` then emits a **third** `<h1>` per experience card.
- **No landmarks.** No `<header>`, no `<footer>`. `<nav>` exists but is portalled to `document.body` (`nav-bar.tsx:285`), placing it outside `<main>` in DOM order — accidentally correct.
- **No skip-to-content link.**
- **Buttons wrapped in anchors.** `nav-bar.tsx:97-105`, `:151-159`, `:161-169` nest `<motion.button>` inside `<a>` — invalid HTML, unpredictable for screen readers.
- **Malformed palette.** `globals.css:32-33` sets `--color-Beige` and `--color-darkBeige` both to `#ffff`, a **4-digit hex**. The documented beige/cream palette in the comment block above (`:4-21`) is wired to nothing. Body copy renders at `text-darkBeige/50` — 50% white on `#0c0c0c` ≈ **4.0:1**, below the 4.5:1 AA floor.
- **`window.open` on click** (`CardDemo.tsx:402`, `ProjectCard.tsx:44`, `nav-bar.tsx:175`) instead of real anchors — not keyboard- or middle-click-friendly, invisible to crawlers.
- **Autoplaying video ×2** (`page.tsx:144-151`, `:160-166`) with no `prefers-reduced-motion` guard. Moot after §0.1a removal.
- **Scroll hijacking / keyboard trap.** `CardDemo.tsx:278` sets `document.body.style.overflow = 'hidden'` and `:289-304` `preventDefault()`s wheel events to drive the skills carousel. It also swallows `ArrowUp`/`ArrowDown`/`Space`/`PageUp`/`PageDown` (`:306-313`). WCAG 2.2 failure.
- **`prefers-reduced-motion` is respected nowhere in the codebase** (zero occurrences).

### 6.4 Client boundary
`app/page.tsx:1` is `"use client"`. **The entire site is a client component** — there is no server-rendered content tree at all. Every string ships as JS.

### 6.5 Font loaded twice, two ways
`app/layout.tsx:5-13` loads Geist + Geist Mono via `next/font/google` (self-hosted, good). `app/globals.css:2` *also* `@import`s **Inter** from `fonts.googleapis.com` — a render-blocking external request — and `globals.css:116` sets `font-family: 'Inter', sans-serif` on `body`, which **overrides the Geist variables entirely**. Geist is downloaded and never used.

### 6.6 Metadata defects (feeds §9.1)
`app/layout.tsx:19-34` keywords include `"Dahiana Rojas"` (`:25`) — an employer being removed — and `"Computer Science"` (`:33`). Both flagged by the plan, but see `OPEN-QUESTIONS.md` §Q2: the résumé in the repo also says Computer Science, so this is not the unambiguous error §2.3b assumes.

### 6.7 Broken project links
`app/page.tsx:26` — **ReCueCareer's card links to `https://github.com/adanjoserrojas/iPalo`.**
`app/page.tsx:28` — **Face2Learn's card links to `https://github.com/adanjoserrojas/ReCueCareer`.**

The `href`s are shifted by one relative to their titles. iPalo (`:27`) correctly links to `iPalo`, so two of four project cards send visitors to the wrong repository. Live bug on production.

### 6.8 Content-frozen prose inventory (input to Phase 1)

| Text | Location | Class |
|---|---|---|
| `Hey there! I'm Adan` | `page.tsx:64` | data (chrome-adjacent) |
| 3 bio paragraphs | `page.tsx:74,76,78` | **data — frozen** |
| `Projects` / `Skills` / `Experience` headings | `page.tsx:92,111,117` | chrome |
| 3 section sub-lines | `page.tsx:94,113,119` | chrome |
| 4 project titles/dates/descriptions | `page.tsx:26-29` | **data — frozen** |
| `Click to learn more!` | `ProjectCard.tsx:75` | chrome |
| 38 skill names + links | `CardDemo.tsx:72-109` | **data** |
| 2 roles: title/company/duration/description/innerDescription | `page.tsx:33-38` | **data** (both affected by §0.1a) |
| Quiz heading + 2 intro lines | `page.tsx:137,139,141` | **removed** |
| 4 questions × 4 options | `page.tsx:42-45` | **removed** |
| `Correct!` / `The answer was:` / `Try again` | `quizComponent.tsx:97,103` | **removed** |
| `Ask me any questions you want!` | `AIChatSection.tsx:43` | dead code — §Q6 |
| `Chat with me :3` / `Ask` / `Thinking...` | `search-bar.tsx:32,41` | dead code — §Q6 |
| `I don't know about that lol` | `chat-section.tsx:51` | dead code — §Q6 |
| Title + 2 meta descriptions | `layout.tsx:16,18,48,63` | **data** |

---

## 7. Gate 0 status

| Criterion | Status |
|---|---|
| `AUDIT.md` exists | ✅ |
| Repo confirmed | ✅ |
| Baseline numbers recorded | ✅ §5 + `RESULTS.md` |

**Gate 0 passes.**

Phase 1 is **independently blocked** on the résumé discrepancy — see `OPEN-QUESTIONS.md` §Q2. Adan is supplying the current résumé; content extraction resumes when it lands.
