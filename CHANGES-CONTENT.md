# CHANGES-CONTENT.md

The §0.1a migration — the only permitted content delta. Every removal, every addition, and the truth source for each.

**Truth source for all additions:** `Adan_Rojas_Resume.pdf` (supplied by Adan, 2026-08-04), extracted verbatim to `content/.resume-source.txt`.

**Mechanically verified:** `npm run verify:content` — 235 checks, all passing. No factual string in the content layer is unbacked.

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

**Status: complete.** The content layer removed it at Phase 1; the JSX and the asset were deleted at Phase 3–6. `verify:content` check B now passes.

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

### 3b. A fourth role, resolved at Gate 1

The site's Knight Hacks **"Workshop Instructor"** (Aug 2025) was held unrendered through Phase 1 while three titles existed for one org:

| Source | Title | Start |
|---|---|---|
| `app/page.tsx:33` | Workshop Instructor | August 2025 |
| `public/Adan_Rojas_Resume_Oct.pdf` (old) | Workshop Team Member | Aug 2025 |
| `Adan_Rojas_Resume.pdf` (current) | Hackathon Organizer | Jan 2026 |

**Adan resolved this at Gate 1: "It is a progression."** Both are real, sequential roles. Workshop Instructor is now canonical — see §10a. The site shows **4 roles**.

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
| **A. Résumé backing** — every résumé-sourced string is a substring of `.resume-source.txt` | ✅ **all pass** |
| **B. Removals** — §0.1a strings and files gone from the codebase | ✅ **all pass** |
| **C. No placeholders** — nothing marked NEEDS_INPUT/TBD reaches a user | ✅ pass |
| **Total** | **235 checks, 0 failed** |
| `npm run typecheck` | ✅ clean |
| `npm run lint` | ✅ clean |
| `npm run verify:contrast` | ✅ 20 pairs, both modes |

Normalization strips all whitespace and folds curly quotes/dashes to ASCII before comparing, because `pypdf` inserts spaces at kerning boundaries — the résumé's "AWS" extracts as "A WS", "Tailwind" as "T ailwind", "ASP.NET" as "ASP .NET". Stripping whitespace defeats that without weakening the check: a fabricated sentence still would not appear in the source text. The known artifacts are catalogued in `content/.migration-allowlist.json`.

The removal check **blanks comments before matching**. It exists to prove the strings no longer reach a user; flagging a code comment that explains why something was removed would push the codebase toward silently deleting its own rationale.

---

## 10. Gate 1 answers, applied 2026-08-04

Adan resolved four blockers. Each is recorded here with what changed.

### 10a. Knight Hacks — "It is a progression"

§Q10 #1 resolved. Workshop Instructor (Aug 2025) preceded Hackathon Organizer (Jan 2026) at the same org. **Both are real roles; neither is a rename of the other.**

Workshop Instructor was promoted from `unresolvedRoles` into the canonical `experience` array, placed last to keep the array reverse-chronological. `unresolvedRoles` no longer exists.

The site now shows **4 roles**. Its content is frozen site prose from `app/page.tsx:33-35` and appears on no résumé, so it is exempt from the §2.4 résumé-backing check by design — `verify-content.ts` skips records whose `_source` is `repo`.

### 10b. Project repository URLs

§Q7 resolved. Adan supplied the real URLs, replacing links that were **wrong on the live site** — the `href`s were shifted by one.

| Project | Was (live) | Now |
|---|---|---|
| ReCueCareer | `github.com/adanjoserrojas/iPalo` ❌ | `github.com/adanjoserrojas/ReCueCareer` |
| Face2Learn | `github.com/adanjoserrojas/ReCueCareer` ❌ | `github.com/adanjoserrojas/Face2Learn` |
| iPalo | `github.com/adanjoserrojas/iPalo` ✅ | unchanged |
| Knight Finder | `github.com/jaysprogram/Knight-Finder` ✅ | unchanged |

### 10c. Role line

§Q10 #6 resolved. Adan's instruction: *"Change for Software Engineer with a passion for AI Agents, MCPs, Full-Stack Development, etc etc."*

`profile.roleLine`: **"Full-Stack Developer"** → **"Software Engineer with a passion for AI Agents, MCPs, and Full-Stack Development"**

This is data, not chrome — it describes Adan — so it changed only on his explicit approval. **The trailing "etc etc" was not expanded.** Inventing further interests would breach §0.2.

The bio paragraph that contradicted this was resolved separately — see §13.

### 10d. Benchmarks exist

§Q5 question 4 answered: the four individual benchmark names and percentages **do** exist. They were not supplied, so §6.1 was not built — inventing four bars is exactly what §6.1 forbids.

§Q5 was closed separately — see §13 below.

---

## 11. Additional deletions (Phases 3–6)

Beyond the §0.1a removals in §1–2 above.

### 11a. Dead chatbot subsystem — `OPEN-QUESTIONS.md` §Q6

`AIChatSection.tsx`, `chat-section.tsx`, `search-bar.tsx` deleted.

**This went beyond §0.1a's three authorised changes, and the reasoning should be visible.** The subsystem was commented out at `app/page.tsx:66`, rendered nothing, and hardcoded `http://localhost:5000/chat` — mixed-content-blocked in production regardless. §4.4 requires deleting everything not rebuilt, and keeping it would have forced `framer-motion` and `lucide-react` to stay installed for code that never runs.

**No user-visible content changed**, because none of it rendered. Recoverable from git history. `app/backend/` (the Flask service and `adan_persona.json`) is untouched — it is not part of the Next build.

### 11b. Old UI components

`CardDemo.tsx`, `ProjectCard.tsx`, `FloatExperience.tsx`, `nav-bar.tsx`, `RotatingCube.tsx`, `spotlight-new.tsx`, `background-gradient-animation.tsx`, `lib/utils.ts`, `tailwind.config.ts`, `components.json`. All replaced by the Phase 3–5 rebuild.

### 11c. Assets

`DSC_0037.png` (36.5 MB) replaced by `public/img/portrait.{avif,webp,jpg}` at 640×640 — twice the largest render. The 6000×4000 original remains in git history.

`public/images/og-image.png` (27 MB) replaced by `app/opengraph-image.tsx`, generated by `next/og` at 32.9 KiB.

`public/*.svg` (Next boilerplate) and `public/robots.txt` (superseded by `app/robots.ts`) deleted.

**Not deleted:** `pictures/McChicekn.png` (5.3 MB) and `pictures/WrongLogo.png` — orphaned but unresolved (§Q11). They are not in the bundle; they only bloat the repo.

### 11d. Phase 2 design lab

`app/lab/` and its six prototypes deleted, per §10's cleanup gate. Screenshots remain in `design-lab/` (gitignored). `DESIGN-REVIEW.md` records the comparison.

---

## 12. Content the redesign added

Only two categories, both from the content layer:

1. **Routes.** 8 detail pages (`/projects/[slug]` × 4, `/experience/[slug]` × 4) rendering data that already existed but had no URL. §5.1's SEO argument.
2. **`/llms.txt`.** Generated from the content layer; cannot drift from the site.

**No new factual claims.** `verify:content` proves it: 235 checks, every résumé-sourced string verified as a substring of `content/.resume-source.txt`.

The email is in neither. `/llms.txt` points to `/about` instead of printing the address — a plaintext file at a well-known path is the easiest thing on a site to harvest, and §0.2 requires obfuscation.

---

## 13. Final disclosure decisions, 2026-08-04

Two instructions from Adan, both closing questions this document had been holding open.

### 13a. "Do not disclose the 4 bullet points" — §Q5 CLOSED

The four Publix bullets carrying employer-internal figures are withheld **permanently**, not provisionally.

| Withheld bullet | Figure |
|---|---|
| VB6 → C#/.NET batch job modernisation | "more than 3 million customers" |
| Enterprise LMS, 18-engineer team | "245,000 employees" |
| LMS cost reduction | "over seven figures" |
| Output Token Optimization Agent Skill | "more than 3000 engineers" |

**Publicly shown for Publix:** the Multi-Agent MCP bullet only — 5 agents, MCP protocol, Supply Chain Logistics Department.

**The withheld-count notice was removed from the UI.** While the question was open, each affected role rendered *"N further items not shown — confidentiality review pending"*. That was correct then: it distinguished "there is more, withheld" from "there is nothing more". Once the answer is *never*, the notice becomes a disclosure in its own right — it tells a reader and a crawler that four more facts about a named employer exist. `Withheld` is deleted from `components/site/Prose.tsx`, and `heldCount` no longer crosses into any component.

The bullets stay in `content/experience.ts`, verbatim, each with its reason, so the record of what the résumé says is not lost and nobody re-adds them later without the context. They are filtered at the corpus boundary in `lib/retrieval.ts`, so they reach neither the page, the search index, nor `/llms.txt`.

**Verified:** all four figures — plus "18 engineers", "Caveman", and "71.1" — return **0 matches** across `/`, `/about`, `/experience`, `/experience/publix`, `/projects`, `/skills`, `/llms.txt`, and `/sitemap.xml`.

**Consequence:** §6.1 and §6.2 are permanently out. Per §390 the signature components are §6.3 (skill atlas) and the v2 trace treatment on `/experience` — both built, both backed entirely by cleared data.

### 13b. "delete full-stack developer" — §Q13 CLOSED

This is the **second and final** authorised change to frozen bio prose.

`profile.bio[0]`:

> **Before:** I'm **a Full-Stack Developer** passionate about crafting elegant, efficient web solutions that feel as good to use as they are to build.
> **After:** I'm passionate about crafting elegant, efficient web solutions that feel as good to use as they are to build.

The result is a strict **subsequence** of the original words — nothing rewritten or substituted, only removed. §0.2 permits "a shorter true subset" but forbids paraphrase; dropping the article with the noun phrase is the most conservative edit that leaves a grammatical sentence.

Also changed: metadata keyword `"Full-Stack Developer"` → `"Full-Stack Development"` (`app/layout.tsx`), matching the phrasing Adan approved for the role line.

**The exact string "Full-Stack Developer" now appears on no public surface** — 0 occurrences across all eight routes, `/llms.txt`, and `/sitemap.xml`.

`profile.roleLine` is unchanged: *Software Engineer with a passion for AI Agents, MCPs, and Full-Stack Development*. Adan dictated that wording himself at Gate 1, so this instruction was read as resolving the contradiction, not retracting it. Flagged in `OPEN-QUESTIONS.md` §Q13 in case that reading is wrong.

---

## 14. Final content decisions, 2026-08-04 (second batch)

### 14a. Deletions — §Q11, §Q12 closed

| File | Size | Why |
|---|---|---|
| `public/Adan_Rojas_Resume_Oct.pdf` | 110.3 KB | Superseded résumé — wrong major, removed employer, old email. A permanent redirect to the current PDF keeps inbound links alive. |
| `pictures/McChicekn.png` | 5,331.2 KB | Orphaned, zero imports |
| `pictures/WrongLogo.png` | 45.9 KB | Orphaned, zero imports |

`pictures/` now holds only the four project images and the Knight Hacks logo — every one referenced.

### 14b. Auth0 restored — §Q10 #4 closed

Added back to **Tools/Platforms**. Skill count 45 → **46**.

Appended rather than inserted, because everything above it holds the résumé's own ordering and Auth0 is not in the résumé's *skill list*. It is still résumé-backed and passes the §2.4 substring check — the résumé names it in ReCueCareer's stack line, which was always the anomaly that made dropping it look like an oversight.

The other five dropped skills (Node.js, PostgreSQL, Firebase, Copilot, Pandas) stay out, held in `droppedFromSite`.

### 14c. ReCueCareer date confirmed — §Q10 #2 closed

*"The ReCueCareer Date is July 2025."* Confirms the résumé over the site's "Jun 2025 - Present". Rendered as **"Jul 2025"** — the same date, in the abbreviated form every other date on the site uses (Oct 2025, Sep 2025, May 2024). The conflict record is removed.

### 14d. Knight Finder — real detail, supplied by Adan — §Q10 #3 closed

Adan supplied a description on 2026-08-04. Knight Finder is no longer a thin entry, and **nothing was padded to make it fuller** — every word is his.

**Added:** stack `JavaScript · Python · GenAI · MySQL`, three bullets, and `award: "5th place of 23, Knight Hacks Spring 2025 Project Launch"` in its `SoftwareApplication` schema.

**One edit, and exactly what it was.** His lead sentence ended with a clause that the next bullet then repeated word for word:

> "…Project Launch—placed 5th of 23—**and cut navigation from five clicks to two, saving approximately 4,200 student-hours weekly.**"
> "• **Cut navigation from five clicks to two, saving approximately 4,200 student-hours weekly.**"

Rendering both reads as a stutter. The trailing clause is removed from the lead sentence, which the following bullet already states. §0.2 permits "a shorter true subset" but forbids paraphrase, so the result is a strict **subsequence** of what he wrote — nothing substituted. His full original is preserved in a comment in `content/projects.ts` for one-line restoration.

**New `owner` source type.** `SourceSchema` gains `"owner"` for content supplied directly by Adan in conversation. He is authoritative for his own history, but this material is on no résumé, so it is exempt from the §2.4 résumé-backing check by design — and `_sourceRef` must name the date it was supplied, so the provenance stays traceable.

> ⚠️ **This introduced a date conflict.** The site has always said Knight Finder is May 2024; the new description names "Knight Hacks Spring 2025 Project Launch". Both now appear on the same page. Unresolved — `OPEN-QUESTIONS.md` §Q14.

### 14e. GitHub / arXiv material — §Q9 closed

*"do not place in portfolio for now."* Nothing from `content/reading.ts` renders; `APPROVED_FOR_RENDER` stays `false` and no route imports it. Recorded as "for now", not a permanent no.

### 14f. The résumé, in the portfolio and searchable

*"include the new resume in the portfolio, make it searchable."*

- **Linked** from the header on every page, as a plain `<a>` to `/Adan_Rojas_Resume.pdf` (a file, not a route — no prefetch), labelled "Résumé" with "(PDF)" for screen readers.
- **Searchable** as a 14th corpus document, so a query returns it alongside everything else.

> ⚠️ **The résumé's corpus entry contains no résumé text.** Its fields are assembled from *cleared* content only — education, role titles, project names, skill lists — all already public elsewhere on the site. `content/.resume-source.txt` holds all four withheld Publix bullets, so indexing the file itself would have quietly undone the §0.3 decision through the search box.
>
> The PDF still contains them. `X-Robots-Tag: noindex` is set on it so a human who clicks gets the document while search engines do not ingest its text — the narrowest way to honour both instructions without editing Adan's résumé for him. **Flagged for decision: `OPEN-QUESTIONS.md` §Q15.**

---

## 15. Final answers, 2026-08-04 (third batch)

### 15a. The quiz's "secret project" — §Q3 closed

**Adan: "The quiz was never built."** This confirms the Phase 0 finding: `quizComponent.tsx` scored each question in isolation, had no cross-question state, and never navigated. The redirect promised at `app/page.tsx:139` was never implemented.

**Nothing was orphaned by deleting the quiz.** No URL to preserve, no redirect to write. §5.1's proposed `/quiz` 301 stays unnecessary — see §Q4.

### 15b. Corporate logos — §Q8 closed

**Adan: "no logos is fine."** Every experience entry renders typographically, as §7.3 recommends.

**Consequence:** the `logo` field is removed from `ExperienceSchema` and from both Knight Hacks entries, and `pictures/KH2025Logo.png` (41 KB) is deleted. With nothing rendering logos it was an orphaned asset, and a schema field the UI never reads is a promise the interface does not keep.

This applies to AWS and Publix trademarks. It does **not** cover Adan's own project screenshots, which raise no licensing question — see §Q16.

### 15c. Newly surfaced: project images render nowhere

Found while clearing the logo asset. All four projects carry an `image` field that nothing imports:

`iPalo.png` (274.8 KB), `ReCueCareer.png` (138.3 KB), `Face2Learn.jpg` (27.8 KB), `Knight_Finder.png` (25.7 KB).

**The redesign dropped project imagery entirely.** The old site put a picture on each project card; the new project pages are text-first. That followed from the Retrieval direction rather than from an explicit decision, and it should have been flagged at Gate 2 rather than discovered now.

The files are retained, unused, pending Adan's answer at `OPEN-QUESTIONS.md` §Q16 — deleting his project screenshots on an assumption would be the wrong error to make.

---

## 16. Final batch, 2026-08-04 — including one reversal

### 16a. Publix disclosure REVERSED — §Q5 re-opened and re-closed

**This question was answered twice, in opposite directions.** Both are on the record, because a reversal should be legible rather than silently overwritten.

| | Instruction |
|---|---|
| First | *"Do not disclose the 4 bullet points."* |
| **Superseding** | *"aggregate the 4 bullet points to Publix description, at the end, that information is fine to disclose, I forgot but it is ok to disclose those."* |

**All five Publix bullets are now public.** The second instruction is the written confirmation §10's confidentiality gate requires before any employer-internal figure ships.

Per Adan's wording the four previously-held bullets are appended **after** the MCP bullet rather than restored to résumé order — "at the end" is explicit, and it is his page. Each is verbatim from the résumé; none was edited on the way in.

Now public: *more than 3 million customers*, *245,000 employees*, *over seven figures*, *more than 3000 engineers*, the 18-engineer team size, the *Caveman* comparison, and the *71.1%* result.

Said once and not repeated: a webpage is public, permanent, and indexed. Once this deploys and Google crawls it, those figures are effectively out for good. That is Adan's call and he has made it in writing.

The `disclosure` mechanism stays even though nothing is held — it costs nothing and the next employer will raise the same question.

**Unblocked but not built:** §6.1 (token-optimization benchmark) and §6.2 (multi-agent MCP trace) are now possible. Neither was built, because neither was asked for. §6.1's full four-bar version still needs the individual benchmark names and percentages, which exist but have not been supplied; the honest aggregate-only version is now buildable.

### 16b. Knight Finder date — §Q14 closed

**"Knight Finder date is Spring 2025."** Supersedes the site's long-standing "May 2024" and agrees with the "Knight Hacks Spring 2025 Project Launch" named in his description. The date field and the bullet now say the same thing.

### 16c. `pictures/` deleted — §Q16 closed

**"Untrack and delete the pictures folder."** Removed from git and from disk: `iPalo.png`, `ReCueCareer.png`, `Face2Learn.jpg`, `Knight_Finder.png` — 466 KB.

The `image` field is dropped from `ProjectSchema` and from every project. The site is text-first by design. All recoverable from git history.

With this, `pictures/` no longer exists. Every image the site serves lives in `public/img/`.

### 16d. §Q15 closed as a consequence

The résumé PDF question existed only because the PDF carried four bullets the site was withholding. Those bullets are now public on the site itself, so the PDF discloses nothing the pages do not.

`X-Robots-Tag: noindex` stays on the PDF — now an ordinary SEO choice (an indexed PDF competes with `/about` and `/experience/*` for the same queries), not a confidentiality one.
