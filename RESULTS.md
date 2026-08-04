# RESULTS.md

Baseline vs. final for every metric. **Phase 0 baseline captured 2026-08-04.** Final columns fill in at Phase 9.

Baseline was measured against the **live production site** (`https://www.4dan.dev`), per §1.3 — not localhost.

- Lighthouse 12.8.2, Chrome 150.0.7871.187, headless
- axe-core 4.11.0 via `@axe-core/cli`
- Build: Next.js 15.5.2 (installed; `package.json` declares 15.5.9 — see `AUDIT.md` §6.1)

---

## 1. Lighthouse — baseline

| Category | Mobile | Desktop | Target (§7.1) | Gap |
|---|---|---|---|---|
| **Performance** | **66** | **89** | ≥ 95 / 100 | −29 / −11 |
| **Accessibility** | **88** | **88** | 100 | −12 |
| **Best Practices** | **96** | **96** | 100 | −4 |
| **SEO** | **100** | **100** | 100 | ✅ already met |

## 2. Core Web Vitals & lab metrics — baseline

| Metric | Mobile | Desktop | Target | Status |
|---|---|---|---|---|
| First Contentful Paint | 1.1 s | 0.5 s | — | |
| **Largest Contentful Paint** | **3.4 s** | 0.9 s | ≤ 1.8 s | ❌ mobile 1.9× over |
| **Total Blocking Time** | **600 ms** | 60 ms | ≤ 100 ms | ❌ mobile 6× over |
| **Cumulative Layout Shift** | **0.053** | 0.000 | ≤ 0.01 | ❌ mobile 5× over |
| **Speed Index** | **62.6 s** | 11.4 s | — | ❌ catastrophic |
| **Time to Interactive** | **107.8 s** | 17.7 s | — | ❌ catastrophic |
| Server response time | 40 ms | 40 ms | — | ✅ Vercel edge is fine |
| INP | not measured in lab | — | ≤ 200 ms | needs field data or a scripted interaction pass |

> Speed Index of **62.6 s** and TTI of **107.8 s** on mobile are not typical "needs improvement" numbers — they are the signature of a single enormous render-blocking image. See §3.

## 3. Page weight — baseline

| Resource type | Requests | Transferred |
|---|---|---|
| **Image** | 7 | **37,510 KiB** |
| Media (video) | 4 | 463 KiB |
| Script | 15 | 337 KiB |
| Font | 2 | 52 KiB |
| Document | 1 | 34 KiB |
| Stylesheet | 2 | 8 KiB |
| Third-party | 0 | 0 KiB |
| **Total** | **31** | **38,403 KiB (37.5 MB)** |

**Target (§7.1): ≤ 400 KB total transferred on `/`. Baseline is 96× over budget.**

### Largest resources

| Size | Type | URL |
|---|---|---|
| **37,445 KiB** | Image | `/_next/static/media/DSC_0037.c01731b7.png` |
| 220 KiB | Media | `/videos/CatBiting.mp4` |
| 180 KiB | Media | `/videos/headBanging.mp4` |
| 84 KiB | Script | `chunks/b536a0f1-…js` |
| 62 KiB | Script | `chunks/600-…js` |
| 55 KiB | Script | `chunks/4bd1b696-…js` |
| 48 KiB | Script | `chunks/bd904a5c-…js` |
| 45 KiB | Script | `chunks/255-…js` |
| 34 KiB | Document | `/` |

**A single file is 97.5% of the page.** `DSC_0037.png` ships **raw and unoptimized** because `app/page.tsx:81` renders it through a plain `<motion.img src={…}>` rather than `next/image` — so Next's image pipeline never touches it. It is displayed at a maximum of 420×420 CSS px.

Lighthouse's own estimates for this one asset:
- `uses-responsive-images`: **37,332 KiB savings**
- `modern-image-formats`: **33,518 KiB savings**

## 4. Bundle — baseline

From `npm run build` on `redesign/v2`:

```
Route (app)                                 Size  First Load JS
┌ ○ /                                     231 kB         333 kB
├ ○ /_not-found                            991 B         103 kB
└ ○ /sitemap.xml                           123 B         102 kB
+ First Load JS shared by all             102 kB
  ├ chunks/255-e3bf15caf1f1e0f9.js       45.7 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)             2 kB
```

| Metric | Baseline | Target (§7.1) | Gap |
|---|---|---|---|
| **First Load JS, `/`** | **333 kB** | ≤ 110 KB gzip | ❌ ~3× over |
| Route JS, `/` | 231 kB | — | |
| Shared baseline | 102 kB | — | |

Lighthouse additionally reports **73 KiB of unused JavaScript** (mobile) and 11 KiB of legacy/transpiled JS.

Headroom is real: `AUDIT.md` §4 identifies **12 of 22 runtime dependencies with zero imports**, and the whole site is one `"use client"` component (`AUDIT.md` §6.4), so every string currently ships as JS.

## 5. Accessibility violations — baseline

**axe-core 4.11.0: 30 issues across 4 rules.** Target: zero.

| Rule | Occurrences | Where |
|---|---|---|
| **`svg-img-alt`** | **25** | Every `react-icons` skill glyph in `CardDemo.tsx`. They render `<svg role="img">` with no accessible text, so a screen reader announces 25 unlabeled images instead of the skill names. |
| `button-name` | 2 | `nav-bar.tsx:98` (the rotating `X` logo button) and `nav-bar.tsx:183` (mobile hamburger) — icon-only buttons with no accessible name. |
| `heading-order` | 2 | `ProjectCard.tsx:63` (`<h3>` inside a card, following the page `<h1>`) and `app/page.tsx:137` (`<h4>` for the quiz heading). |
| `link-name` | 1 | `nav-bar.tsx:97` — `<a href="…youtube.com/shorts/…">` wrapping an icon button, no discernible text. |

Lighthouse's desktop run flags the same rules with a wider node count (4 `button-name`, 3 `link-name`) because it also evaluates the mobile-menu markup.

**Automated tools catch roughly a third of issues.** `AUDIT.md` §6.3 lists what inspection already found and axe cannot see — most importantly the **keyboard trap** in the skills carousel (`CardDemo.tsx:278,306-313`), the sub-AA body-copy contrast (≈4.0:1), the absent skip link, the absent landmarks, and the complete absence of `prefers-reduced-motion` handling anywhere in the codebase.

## 6. Best Practices — baseline

One failing audit: **`errors-in-console`**.

```
404  https://www.4dan.dev/favicon.ico
```

There is no favicon in the repo. Every page load logs a console error. Trivial to fix; it is the only thing between the site and Best Practices 100.

## 7. SEO — baseline

**100 / 100 on both mobile and desktop.** No automated SEO audit fails today.

That score is not the goal, though — §9 is about *entity* SEO against LinkedIn, which Lighthouse does not measure. The real work is structured data, per-route metadata, crawlable project/role URLs, and the off-site checklist in §9.2. Note also that `AUDIT.md` §6.6 flags two content defects in the metadata that Lighthouse scores as fine: a removed employer and a possibly-wrong major in the keywords.

---

## 8. Removals — to be recorded at Phase 9

| Item | Bytes | Status |
|---|---|---|
| `public/videos/headBanging.mp4` | 411 KB | pending §0.1a |
| `public/videos/CatBiting.mp4` | 219.5 KB | pending §0.1a |
| `pictures/headBanging.mp4` (unreferenced duplicate) | 411 KB | pending — `OPEN-QUESTIONS.md` §Q11 |
| `pictures/CanvasLogo.png` (Dahiana Rojas) | 275.5 KB | pending §0.1a |
| `pictures/McChicekn.png` (orphaned) | 5,331.2 KB | pending — §Q11 |
| `pictures/WrongLogo.png` (orphaned) | 45.9 KB | pending — §Q11 |
| `public/*.svg` (Next boilerplate, orphaned) | 3.2 KB | pending |
| 12 unused dependencies | TBD | pending §7.2 |
| `DSC_0037.png` → AVIF/WebP @ 2 densities | ~37,000 KB expected | pending §7.3 |
| `og-image.png` → correctly-sized 1200×630 | ~26,900 KB expected | pending §7.3 |

**Projected asset savings alone: ~64 MB**, before any JS work.

---

## 9. Summary — what the redesign must beat

| Metric | Baseline | Target | Multiple |
|---|---|---|---|
| Lighthouse Perf (mobile) | 66 | ≥ 95 | |
| Lighthouse Perf (desktop) | 89 | 100 | |
| Lighthouse A11y | 88 | 100 | |
| Lighthouse Best Practices | 96 | 100 | |
| Lighthouse SEO | 100 | 100 | ✅ hold |
| LCP (mobile) | 3.4 s | ≤ 1.8 s | 1.9× |
| CLS (mobile) | 0.053 | ≤ 0.01 | 5.3× |
| TBT (mobile) | 600 ms | ≤ 100 ms | 6× |
| Total transferred | 37.5 MB | ≤ 400 KB | **96×** |
| First Load JS `/` | 333 kB | ≤ 110 KB | 3× |
| axe violations | 30 | 0 | |

The performance targets are **not ambitious against this baseline** — two image fixes recover 98% of the page weight, and deleting twelve dead dependencies plus moving content to Server Components should clear the JS budget on its own. The genuinely hard gates are Accessibility 100 (which needs the keyboard trap and contrast work, not just the axe list) and the §9.2 off-site SEO campaign, which is Adan's to run.
