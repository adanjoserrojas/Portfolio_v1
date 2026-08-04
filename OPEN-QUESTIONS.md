# OPEN-QUESTIONS.md

Everything the agent needed and refused to invent. Per Appendix B, entries here are a success signal, not a failure.

**Legend:** 🔴 blocking · 🟡 needed before a specific phase · ⚪ informational

---

## 🔴 Q1 — Disk space (RESOLVED 2026-08-04)

C: had 0 bytes free of 929.71 GB, which blocked `npm run build`, `npm ci`, every `npx` tool, and even file writes (`ENOSPC`).

**Resolved:** `npm cache clean --force` recovered **8.91 GB**. Phase 0 measurement unblocked.

Watch: Phase 2 §3.4 needs a Playwright Chromium download (~150 MB) plus six prototype builds. If space runs short again, `%LOCALAPPDATA%\Temp` (1.63 GB) and `.next/` (1.01 GB) are the next safe, fully regenerable targets.

---

## ✅ Q2 — Résumé version mismatch (RESOLVED 2026-08-04)

**Adan supplied `Adan_Rojas_Resume.pdf`. It matches §2.3a exactly** — AWS, Knight Hacks Organizer, Publix, Information Technology / Fall 2027, `adan@4dan.dev`, and every figure the plan names (100+ students, 3 workshops, 100+ sign-ups, 200+ students, 1,000+ participants, 36-hour, 2 batch jobs, 18 engineers, 5 agents, 71.1% across 4 benchmarks).

Extracted verbatim to `content/.resume-source.txt`. All résumé-backing checks in `npm run verify:content` pass (235 total). **Phase 1 unblocked and complete.**

The original finding is kept below, because it explains why `public/Adan_Rojas_Resume_Oct.pdf` must not be used as a truth source and why §2.3b #5 resolved the way it did.

<details><summary>Original finding — the October résumé</summary>

`public/Adan_Rojas_Resume_Oct.pdf` is an older résumé containing none of the §2.3a content.

| §2.3a claim | Present in `Adan_Rojas_Resume_Oct.pdf`? |
|---|---|
| AWS — Student Builder Campus Leader, Orlando FL, Jan 2026 – Present | ❌ absent |
| Knight Hacks — Hackathon Organizer, Jan 2026 – Present | ❌ absent — says **Workshop Team Member, Aug 2025 – Present** |
| Publix Super Markets — SWE Intern, Lakeland FL, May–Jul 2026 | ❌ absent |
| B.S. **Information Technology**, Minor Computer Engineering, **Fall 2027** | ❌ says **B.S. Computer Science**, Minor Computer Engineering, **Spring 2027** |
| Contact `adan@4dan.dev` | ❌ says `adanrojas224@gmail.com` |
| 71.1% avg token savings across 4 benchmarks | ❌ absent |
| 5-agent MCP system | ❌ absent |
| 2 VB6→C#/.NET batch jobs, 18-engineer team | ❌ absent |
| 100+ Builder Center sign-ups, 200+ students reached, 1,000+ participants, 36-hour event | ❌ absent |
| Skills: C#, .NET, Azure DevOps, Oracle DBMS, Visual Studio, Haar/CNN grouping | ❌ absent |
| Dahiana Rojas De Rojas LLC role **removed** | ❌ still present, with 4 metric bullets (60% / 340% / 75% / 45%) |

**What the repo résumé actually contains:** Knight Hacks Workshop Team Member (Aug 2025 – Present, 600+ members, Figma→Tailwind/Next.js, framer-motion mentoring); Dahiana Rojas de Rojas LLC SWE Intern (Jun 2025 – Present, Miami FL, HubSpot/BoldTrail/N8N automation); and project entries for ReCueCareer, iPalo, and Face2Learn whose stacks and headline results **do** match §2.3a.

### Why this blocks rather than degrades

- §2.4 requires each newly added factual string to be **mechanically verified as a substring of the résumé text**. Every §2.3a addition fails that check against the file on disk.
- §2.3a instructs: "Copy each role's bullets into `experience.ts` **verbatim** from the résumé." Those bullets exist in no available source. `REDESIGN.md` gives role titles, orgs, dates, and a list of figures — but not bullets.
- Appendix B: "If a claim isn't in it, in the repo, or on the live site, it doesn't exist."

Reconstructing AWS / Knight Hacks Organizer / Publix bullets from §2.3a's summary table would be exactly the invention §0.2 prohibits, and would publish unverified employment claims.

</details>

**§2.3b conflict #5 is now settled.** The October résumé also said "Computer Science, Spring 2027", so the site metadata was not obviously wrong. The current résumé says Information Technology / Fall 2027, and §0.2 makes it canonical — so `app/layout.tsx:33` **is** a factual error, and the fix is logged in `CHANGES-CONTENT.md` §5a. Had the current résumé not arrived, "fixing" it would have meant overwriting a corroborated value on `REDESIGN.md`'s authority alone.

---

## ✅ Q13 — Hero role line vs. bio paragraph (CLOSED 2026-08-04)

**Adan's answer: "delete full-stack developer."**

`profile.bio[0]` opened *"I'm a Full-Stack Developer passionate about crafting…"*, contradicting the role line he approved at Gate 1. The words `a Full-Stack Developer` are deleted:

> **Before:** I'm ~~a Full-Stack Developer~~ passionate about crafting elegant, efficient web solutions that feel as good to use as they are to build.
> **After:** I'm passionate about crafting elegant, efficient web solutions that feel as good to use as they are to build.

The result is a strict **subsequence** of the original words — nothing rewritten or substituted, only removed. §0.2 permits "a shorter true subset" but forbids paraphrase, so dropping the article along with the noun phrase is the most conservative edit that still leaves a grammatical sentence.

**Also changed:** the metadata keyword `"Full-Stack Developer"` (`app/layout.tsx`) → `"Full-Stack Development"`, the phrasing Adan himself approved for the role line. The exact string he asked to delete now appears **nowhere** on any public surface — verified across all eight routes, `/llms.txt`, and `/sitemap.xml`: 0 occurrences.

The role line is unchanged: *Software Engineer with a passion for AI Agents, MCPs, and Full-Stack Development*. Adan dictated it two turns earlier, so "delete full-stack developer" was read as resolving this contradiction, not as retracting his own wording. **Say so if that reading is wrong** — it is a one-line change.

---

## ✅ Q12 — Old October résumé (CLOSED 2026-08-04)

**Adan: "delete old resume".** `public/Adan_Rojas_Resume_Oct.pdf` is deleted.

`next.config.ts` keeps a permanent redirect `/Adan_Rojas_Resume_Oct.pdf` → `/Adan_Rojas_Resume.pdf`, so any inbound link resolves to the current document rather than 404ing. Verified: the old path returns **308** to the new one.

---

## 🔴 Q3 — The quiz has no redirect. There is nothing to orphan.

§0.1a warns: "The quiz currently gates a redirect to an unlisted project on a perfect score… Before deleting, find the redirect target in the repo and record it."

**No such redirect exists.** Searched the full repo for `redirect`, `window.location`, `router.push`, and every `href=`.

- `components/ui/quizComponent.tsx` renders one question in isolation. It tracks `selected` and `answered` per instance, has **no cross-question score**, and never navigates. Its only outcome is a "Correct!" / "The answer was: X" line plus a "Try again" button.
- `app/page.tsx:152-159` renders four independent `<QuizComponent>` instances. Nothing aggregates their results.

The promise at `app/page.tsx:139` — *"If you guess all of them right, you will get redirected to a very important and secret project of mine"* — was **never implemented**.

**Question for Adan:** was the secret project ever built, and does its URL live somewhere outside this repo? If so, §0.1a's question still applies: drop it, link it openly, or re-gate it? If it was only ever an intention, deleting the quiz orphans nothing and this closes.

---

## ⚪ Q4 — There is no `/quiz` route

§5.1 says to add a 301 from `/quiz` to `/`. The quiz is inline on `/` (`app/page.tsx:137-167`); no `/quiz` route has ever existed, so no such URL was ever served or indexed. **The 301 is unnecessary** — adding one would be a redirect from a URL that never 200'd.

Recommend confirming in Search Console's Pages report post-launch rather than pre-emptively redirecting. No action needed unless Adan knows of an external link to `/quiz`.

---

## ✅ Q5 — Publix disclosure scope (CLOSED 2026-08-04)

**Adan's answer: "Do not disclose the 4 bullet points."**

The four Publix bullets carrying employer-internal figures are withheld **permanently**, not provisionally.

| Bullet | Held figure |
|---|---|
| VB6 → C#/.NET batch job modernisation | "more than 3 million customers" |
| Enterprise LMS, 18-engineer team | "245,000 employees" |
| LMS cost reduction | "over seven figures" |
| Output Token Optimization Agent Skill | "more than 3000 engineers" |

**Shown publicly:** the Multi-Agent MCP bullet only — 5 agents, MCP protocol, Supply Chain Logistics Department. No figure from the hold list.

### What changed as a result

The UI no longer reports that anything is withheld. While the question was open, each affected role rendered *"N further items not shown — confidentiality review pending"*, which correctly distinguished "there is more, withheld" from "there is nothing more". Once the answer is *never*, **that notice becomes a disclosure in its own right** — it tells a reader and a crawler that four more facts about a named employer exist, and invites the question of what they are. It is gone.

The bullets remain in `content/experience.ts`, verbatim and reasoned, so the record of what the résumé says is not lost and nobody re-adds them later without the context. They are filtered at the corpus boundary in `lib/retrieval.ts`, so they reach neither the page, the search index, nor `/llms.txt`.

**Verified:** grepping the rendered output of `/`, `/about`, `/experience`, `/experience/publix`, `/projects`, `/skills`, `/llms.txt`, and `/sitemap.xml` for all four figures — plus "18 engineers", "Caveman", and "71.1" — returns **0 matches on every surface**.

### Consequences for §6

§6.1 (token-optimization benchmark) and §6.2 (multi-agent MCP trace) are **permanently out** — both need cleared Publix figures. Per §390, the two signature components are §6.3 (skill atlas) and the v2 trace treatment on `/experience`. Both are built and both are backed entirely by cleared data.

> Adan confirmed separately that the four individual benchmark names and percentages exist. They were never supplied, and are now moot: the bullet they belong to is withheld.

**Do not change any `disclosure: "hold"` to `"cleared"` without a fresh written instruction.**

---

## ⚪ Q6 — Dead chatbot subsystem (DELETED — confirm if you disagree)

`AIChatSection.tsx`, `chat-section.tsx`, and `search-bar.tsx` were deleted at Phase 6.

**This went beyond §0.1a's three authorised removals**, so the reasoning is on the record: the subsystem was commented out at `app/page.tsx:66`, rendered nothing, and hardcoded `http://localhost:5000/chat` — mixed-content-blocked in production regardless. §4.4 requires deleting everything not rebuilt, and keeping it would have forced `framer-motion` and `lucide-react` to stay installed for code that never runs.

**No user-visible content changed**, because none of it rendered. Recoverable from git history.

`app/backend/` (the Flask service and `adan_persona.json`) is untouched — it is not part of the Next build.

**Say so if you wanted it kept** and I will restore it.

---

## ✅ Q7 — Wrong project repository links (CLOSED 2026-08-04)

Adan supplied the real URLs. The site's links were shifted by one — a live bug.

| Project | Was (live) | Now |
|---|---|---|
| ReCueCareer | `github.com/adanjoserrojas/iPalo` ❌ | `github.com/adanjoserrojas/ReCueCareer` |
| Face2Learn | `github.com/adanjoserrojas/ReCueCareer` ❌ | `github.com/adanjoserrojas/Face2Learn` |

---

## 🟡 Q8 — Corporate logo assets for the new roles

§7.3 forbids downloading corporate logos: "Third-party trademarks on a personal site are a licensing question, not a design one. Use typography for those entries unless Adan says otherwise."

`pictures/` has `KH2025Logo.png` (Knight Hacks, already in use) and `CanvasLogo.png` (Dahiana Rojas, being deleted). There is **no AWS or Publix logo asset**, and none will be added.

**Confirming the default:** AWS and Publix experience entries render typographically, with no logo. Say so if you have licensed assets or explicit permission.

---

## ✅ Q9 — GitHub README themes and arXiv reading list (CLOSED 2026-08-04)

**Adan: "When it comes to the GitHub ArXiv material do not place in portfolio for now."**

Nothing from `content/reading.ts` renders. `APPROVED_FOR_RENDER` stays `false` and no route imports the file.

The six arXiv IDs and four themes stay in the file, unused, with the provenance caveat intact — they came from `REDESIGN.md`, not a verified fetch of the live README, so they would need re-checking before any future use. **"For now" is recorded as exactly that**, not a permanent no.

---

## ✅ Q10 — §2.3b conflicts (ALL RESOLVED)

1. **Knight Hacks — three titles for one org.** ✅ *"It is a progression."* Workshop Instructor (Aug 2025) preceded Hackathon Organizer (Jan 2026). Both are real, sequential roles; both are canonical. The site shows 4 roles.

2. **ReCueCareer date.** ✅ *"The ReCueCareer Date is July 2025."* Confirms the résumé over the site's "Jun 2025 - Present". Rendered as **"Jul 2025"** — the same date, kept in the abbreviated form every other date on the site uses (Oct 2025, Sep 2025, May 2024). Say the word if you want it spelled out.

3. **Knight Finder.** ✅ Kept — and no longer thin. Adan supplied a real description on 2026-08-04: a 4-item stack, three bullets, and a 5th-of-23 placement. §5.1's "do not pad it" no longer applies, because nothing was padded — the detail is his. **One new conflict came with it: see §Q14.**

4. **Skill list.** ✅ *"Add Auth0 back."* Auth0 is restored to Tools/Platforms (46 skills). It was always the anomaly: the résumé drops it from the skills list but still names it in ReCueCareer's stack line, so it is résumé-backed and passes the §2.4 check. The other five (Node.js, PostgreSQL, Firebase, Copilot, Pandas) stay out, held in `droppedFromSite` and restorable in one line each.

5. **Major.** ✅ Information Technology / Fall 2027 — see Q2.

6. **Headline role.** ✅ Changed at Gate 1, and the contradicting bio sentence resolved at §Q13.

7. **Publix disclosure scope.** ✅ See Q5 — do not disclose.

---

## ✅ Q11 — Orphaned image assets (CLOSED 2026-08-04)

**Adan: "delete orphaned images".** Deleted:

| File | Size |
|---|---|
| `pictures/McChicekn.png` | 5,331.2 KB |
| `pictures/WrongLogo.png` | 45.9 KB |

`pictures/headBanging.mp4` (411 KB, an unreferenced duplicate) went earlier with the §0.1a video removals.

`pictures/` now holds only the four project images and the Knight Hacks logo — every one referenced. All recoverable from git history.

---

## 🟡 Q14 — Knight Finder: two different dates

**A new conflict, introduced by the description supplied on 2026-08-04.**

| Source | Date |
|---|---|
| The site, since before this work began (`app/page.tsx:29`) | **May 2024** |
| Adan's description, 2026-08-04 | "Knight Hacks **Spring 2025** Project Launch" |

Different academic terms, roughly a year apart. `/projects/knight-finder` currently shows **May 2024** in its date field while a bullet on the same page says Spring 2025. **That contradiction is visible on the page.**

I did not change it, because either direction silently rewrites history: correcting to Spring 2025 assumes the event date is the project date; leaving it assumes the new description misremembers the term.

**Question:** which is right? One line to fix.

---

## 🔴 Q15 — The résumé PDF contains the four withheld bullets

**Two instructions pull against each other, and this is not mine to resolve.**

- *"Do not disclose the 4 bullet points."*
- *"include the new resume in the portfolio, make it searchable."*

`public/Adan_Rojas_Resume.pdf` contains all four withheld Publix bullets **verbatim** — 3 million customers, 245,000 employees, over seven figures, 3000 engineers. Publishing it undoes the withholding for anyone who clicks.

### What I did

1. **The search index is clean.** The résumé's corpus entry is built from *cleared* content only — education, role titles, project names, skill lists, all already public elsewhere on the site. The PDF's own text is **not** indexed. Verified: no query can surface a withheld figure.
2. **The PDF is linked and downloadable** from the header on every page — you asked for it in the portfolio.
3. **`X-Robots-Tag: noindex` on the PDF** (`next.config.ts`). A human who clicks gets the document; search engines do not ingest or cache its text. Verified in the response headers.

That is the narrowest reading that honours both instructions.

### Question — pick one

- **(a) Ship as-is.** Public but unindexed. Anyone who clicks sees the four figures; Google does not archive them.
- **(b) Supply a redacted PDF** with those four bullets removed and I will swap the file. This is the only option where the figures are genuinely unpublished. I will not edit your résumé myself.
- **(c) Fully public.** Drop the `noindex` and accept the figures are searchable — say so and I will remove the header, though it substantially contradicts "do not disclose".

**Until you answer, (a) is what is committed.**
