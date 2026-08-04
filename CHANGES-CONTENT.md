# CHANGES-CONTENT.md

The §0.1a migration — the only permitted content delta. Every removal, every addition, and the truth source for each.

**Truth source for all additions:** `Adan_Rojas_Resume.pdf` (supplied by Adan, 2026-08-04), extracted verbatim to `content/.resume-source.txt`.

**Mechanically verified:** `npm run verify:content` — 220 résumé-backing checks, all passing. No factual string in the content layer is unbacked.

---

## 1. Removed — Dahiana Rojas De Rojas LLC internship (§0.1a #1)

| What | Where it was |
|---|---|
| Role record: "Software Engineer Intern", "Dahiana Rojas De Rojas LLC", "June 2025 - Present" | `app/page.tsx:36-38` |
| Card description: *"I helped this Real Estate company automating processes \nAgentic workflows made with N8N."* | `app/page.tsx:36` |
| Modal prose (633 chars, beginning *"I worked with a real estate firm to build agentic workflows using N8N…"*) | `app/page.tsx:37` |
| Logo asset `CanvasLogo.png` (275.5 KB) | `pictures/CanvasLogo.png`, imported at `app/page.tsx:15` |
| Metadata keyword `"Dahiana Rojas"` | `app/layout.tsx:25` |

**Superseded by** the three résumé roles in §3 below.

**Status:** recorded in the content layer as removed; the JSX deletion happens when the UI is rebuilt in Phase 3–4. `verify:content` check B stays red until then — by design. It currently reports 3 outstanding Dahiana references.

---

## 2. Removed — the quiz (§0.1a #3)

| What | Where it was |
|---|---|
| Section heading *"A little quiz about Me"* | `app/page.tsx:137` |
| Two intro paragraphs (incl. the secret-project promise) | `app/page.tsx:139, 141` |
| 4 questions × 4 options = 20 strings | `app/page.tsx:42-45` |
| Component + its strings (*"Correct!"*, *"The answer was:"*, *"Try again"*) | `components/ui/quizComponent.tsx` (3.5 KB) |
| `headBanging.mp4` (411 KB) | `public/videos/`, rendered at `app/page.tsx:145` |
| `CatBiting.mp4` (219.5 KB) | `public/videos/`, rendered at `app/page.tsx:161` |
| `headBanging.mp4` duplicate (411 KB) | `pictures/` — unreferenced, see `OPEN-QUESTIONS.md` §Q11 |

**Byte savings from the videos: 1,041.5 KB** (630.5 KB of it shipping on every page load — see `RESULTS.md` §3, where the two videos account for 400 KB of the 463 KB media budget). Recorded in `RESULTS.md` §8.

### ⚠️ Two of the plan's premises about the quiz were wrong

**There is no redirect.** §0.1a instructed me to find the redirect target before deleting, so the unlisted project would not be silently orphaned. I searched the whole repo for `redirect`, `window.location`, `router.push`, and every `href=`. `quizComponent.tsx` scores each question in isolation, has no cross-question state, and never navigates. The promise at `app/page.tsx:139` was never implemented. **Nothing is orphaned.** Confirmation question in `OPEN-QUESTIONS.md` §Q3.

**There is no `/quiz` route.** The quiz is inline on `/`. §5.1's 301 is unnecessary — no such URL was ever served. See `OPEN-QUESTIONS.md` §Q4.

---

## 3. Added — the three résumé roles (§0.1a #2)

All bullets copied **verbatim**. Not compressed, not merged, not re-ordered. Stored as arrays of strings so the UI may truncate but never rewrite (§2.3a).

Order is reverse-chronological, as the résumé has it (§2.2).

| # | Role | Org | Location | Dates | Bullets | Source |
|---|---|---|---|---|---|---|
| 1 | Student Builder Campus Leader | AWS (Amazon Web Services) | Orlando, FL | Jan 2026 – Present | 3 | `Adan_Rojas_Resume.pdf:7-14` |
| 2 | Hackathon Organizer | Knight Hacks | Orlando, FL | Jan 2026 – Present | 3 | `Adan_Rojas_Resume.pdf:15-22` |
| 3 | Software Engineer Intern | Publix Super Markets | Lakeland, FL | May 2026 – Jul 2026 | 5 | `Adan_Rojas_Resume.pdf:23-35` |

Written to `content/experience.ts`. Every one of the 11 bullets passes the mechanical substring check against `content/.resume-source.txt`.

### 3a. Four Publix bullets are withheld pending §0.3

A résumé is shown to a chosen audience; a website is public and permanent. Per §0.3 these default to `disclosure: "hold"` and **will not render** until Adan clears them in writing.

| Bullet | Held figure |
|---|---|
| VB6 → C#/.NET batch job modernization | "more than 3 million customers" |
| Enterprise LMS with an 18-engineer team | "245,000 employees" |
| LMS cost reduction | "over seven figures" |
| Output Token Optimization Agent Skill | "more than 3000 engineers" |

**Cleared by default:** the Multi-Agent MCP bullet (5 agents, MCP protocol, Supply Chain Logistics Department) — §0.3's conservative version explicitly clears "the agent/token-optimization work", and this bullet carries no figure from the hold list.

This gates both recommended signature components: §6.1 (token-optimization benchmark) and §6.2 (multi-agent MCP trace). See `OPEN-QUESTIONS.md` §Q5.

### 3b. One existing role retained, unrendered, pending Gate 1

The site's Knight Hacks **"Workshop Instructor"** (Aug 2025 – Present) is preserved in `content/experience.ts` as `unresolvedRoles` — **not** in the canonical `experience` array, so it renders nowhere.

Three titles exist for one org:

| Source | Title | Start |
|---|---|---|
| `app/page.tsx:33` | Workshop Instructor | August 2025 |
| `public/Adan_Rojas_Resume_Oct.pdf` (old) | Workshop Team Member | Aug 2025 |
| `Adan_Rojas_Resume.pdf` (current) | Hackathon Organizer | Jan 2026 |

§0.2 makes the current résumé canonical, but §2.3b #1 says to ask whether these are sequential roles rather than one renamed. If sequential, deleting the earlier one destroys real history. Preserved so either answer is cheap. See `OPEN-QUESTIONS.md` §Q10 #1.

---

## 4. Added — résumé detail merged into existing projects (§2.3a)

Site one-liners are **retained**, not replaced. Stack lines and bullets are new.

| Project | Site one-liner | Added from résumé |
|---|---|---|
| ReCueCareer | kept (`app/page.tsx:26`) | 7-item stack, 2 bullets |
| iPalo | kept (`app/page.tsx:27`) | 9-item stack, 3 bullets |
| Face2Learn | kept (`app/page.tsx:28`) | 7-item stack, 3 bullets |
| Knight Finder | kept (`app/page.tsx:29`) | **nothing — it is not on the résumé** |

Knight Finder stays deliberately thin. §5.1: "do not pad it to match the others. A short honest page outranks a padded one."

**Project order is site order** (ReCueCareer, iPalo, Face2Learn, Knight Finder), per §2.2's rule that anything carried over keeps its site ordering. Note this differs from the résumé's own project order (iPalo, Face2Learn, ReCueCareer).

---

## 5. Added — education (§2.3a)

| Field | Value | Source |
|---|---|---|
| Institution | University of Central Florida | `Adan_Rojas_Resume.pdf:4` |
| Location | Orlando, FL | `Adan_Rojas_Resume.pdf:4` |
| Degree | Bachelor of Science in Information Technology | `Adan_Rojas_Resume.pdf:5` |
| Minor | Computer Engineering | `Adan_Rojas_Resume.pdf:5` |
| Expected graduation | Fall 2027 | `Adan_Rojas_Resume.pdf:5` |

No GPA — the résumé states none, and §0.2 forbids inventing one.

### 5a. Metadata correction (§2.3b #5)

`app/layout.tsx:33` lists the keyword `"Computer Science"`. The current résumé says **Information Technology**, and per §0.2 the résumé wins. **This is a factual error in Adan's own metadata and is corrected.**

Worth recording how close this came to going the other way: the *old* résumé in the repo (`public/Adan_Rojas_Resume_Oct.pdf`) also said "Computer Science, Spring 2027". Had the current résumé not arrived, the plan's instruction to "fix" this would have meant overwriting a correct-looking value using only `REDESIGN.md` as authority. The current résumé is what settles it.

---

## 6. Changed — skills regrouped into the résumé's three categories (§2.3a)

The site's flat list of 38 is replaced by the résumé's own grouping. "Use these three categories. Do not create a fourth."

| Category | Count | Source |
|---|---|---|
| Languages | 7 | `Adan_Rojas_Resume.pdf:57` |
| Frameworks/Libraries | 14 | `Adan_Rojas_Resume.pdf:58-59` |
| Tools/Platforms | 24 | `Adan_Rojas_Resume.pdf:60-61` |
| **Total** | **45** | |

**Added by the résumé (16):** C#, .NET, PyTorch, SentenceTransformers, Linux, Windows, MacOS, Visual Studio, JetBrains CLion & IntelliJ, GitHub, Azure DevOps, MobaXTerm, WSL, BoldTrail, Oracle DBMS, Hugging Face *(the site had "Huggingface")*.

**Dropped by the résumé (6):** Node.js, PostgreSQL, Firebase, Copilot, Pandas, Auth0.

These six are preserved in `content/skills.ts` as `droppedFromSite` — not rendered, restorable in one line. §2.3b #4 defaults to the résumé as canonical; confirmation in `OPEN-QUESTIONS.md` §Q10 #4.

> Auth0 is the awkward one: the résumé drops it from the skills list but still names it in ReCueCareer's stack line. Adan clearly uses it.

**Merged pairs:** the site listed HTML5 and CSS separately, and Java and JavaScript separately. The résumé combines them as "HTML/CSS" and "Java/JavaScript". Kept combined, because the résumé is canonical for the grouping.

**Links carried over** from `components/ui/CardDemo.tsx:72-109` wherever the site already had one. Skills the site never listed have **no link** — §0.2 treats a link as content needing a truth source, so none were invented. 29 of 45 skills have links.

---

## 7. Added — contact email

`adan@4dan.dev`, from `Adan_Rojas_Resume.pdf:2`. Confirmed by §0.2 as usable.

Stored split (`{ user: "adan", domain: "4dan.dev" }`) and reassembled at runtime by `emailAddress()` / `emailHref()` in `content/profile.ts`, so the address never appears contiguously in the HTML source (§0.2 anti-scraper requirement).

No phone number. No street address. `profile.location` holds only "Oviedo, FL", which is city-level and already public on the live site.

---

## 8. Not migrated — held for Gate 1

| Item | Why | Question |
|---|---|---|
| GitHub README themes (4) | New-to-the-site material; §193 requires approval | §Q9 |
| arXiv reading list (6 IDs) | Same, plus the IDs came from `REDESIGN.md`, not a verified fetch of the README | §Q9 |
| Dead chatbot strings | Not covered by §0.1a; deleting them is an unauthorized content change | §Q6 |
| ReCueCareer / Face2Learn repo URLs | The site's links are shifted by one, so the correct URLs are unknown, not merely wrong | §Q7 |

`content/reading.ts` exports `APPROVED_FOR_RENDER = false`. Nothing in it renders until that flips on Adan's word.

---

## 9. Verification

```
npm run verify:content
```

| Check | Result |
|---|---|
| **A. Résumé backing** — every résumé-sourced string is a substring of `.resume-source.txt` | ✅ **220/220** |
| **B. Removals** — §0.1a strings and files gone from the codebase | ⏳ 10 outstanding (the old UI still exists; clears in Phase 3–4) |
| **C. No placeholders** — nothing marked NEEDS_INPUT/TBD reaches a user | ✅ pass |
| `npm run typecheck` | ✅ zero errors |

Normalization strips all whitespace and folds curly quotes/dashes to ASCII before comparing. This is necessary because `pypdf` inserts spaces at kerning boundaries — the résumé's "AWS" extracts as "A WS", "Tailwind" as "T ailwind", "ASP.NET" as "ASP .NET". Stripping whitespace defeats that artifact without weakening the check: a fabricated sentence still would not appear in the source text. The known artifacts are catalogued in `content/.migration-allowlist.json`.
