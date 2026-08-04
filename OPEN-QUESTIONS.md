# OPEN-QUESTIONS.md

Everything the agent needed and refused to invent. Per Appendix B, entries here are a success signal, not a failure.

**Legend:** 🔴 blocking · 🟡 needed before a specific phase · ⚪ informational

---

## 🔴 Q1 — Disk space (RESOLVED 2026-08-04)

C: had 0 bytes free of 929.71 GB, which blocked `npm run build`, `npm ci`, every `npx` tool, and even file writes (`ENOSPC`).

**Resolved:** `npm cache clean --force` recovered **8.91 GB**. Phase 0 measurement unblocked.

Watch: Phase 2 §3.4 needs a Playwright Chromium download (~150 MB) plus six prototype builds. If space runs short again, `%LOCALAPPDATA%\Temp` (1.63 GB) and `.next/` (1.01 GB) are the next safe, fully regenerable targets.

---

## 🔴 Q2 — The résumé in the repo is not the résumé the plan describes

**This blocks all of Phase 1.**

`REDESIGN.md` §0.2 and §2.3a treat `Adan_Rojas_Resume.pdf` (owner-supplied, August 2026) as authoritative. The only PDF in the repo is `public/Adan_Rojas_Resume_Oct.pdf`. Its full text was extracted and compared.

**It is an older résumé containing none of the §2.3a content.**

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

**Status:** Adan is supplying the current résumé (decision recorded 2026-08-04). On arrival: re-extract to `content/.resume-source.txt`, re-verify every §2.3a string, then proceed with the full §0.1a migration.

**Note for §2.3b conflict #5.** The plan calls "Computer Science" in the site metadata a factual error to fix. But the résumé in the repo *also* says Computer Science, Spring 2027 — only `REDESIGN.md` says Information Technology, Fall 2027. **The new résumé decides this.** Do not "fix" the metadata until it does.

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

## 🟡 Q5 — Publix disclosure scope (§0.3)

**Cannot be assessed yet** — the Publix role is absent from the résumé on disk (see Q2). Carried forward.

Once the current résumé lands, the §0.3 confidentiality check applies to: 245,000 employees, 3M customers, "seven figures", 3,000 engineers, 18-engineer team, and the internal system names.

**Default until Adan confirms in writing:** ship role, dates, technologies, and the agent/token-optimization work. Hold every internal figure. §6.1 and §6.2 (the two recommended signature components) are both gated on this answer.

---

## 🟡 Q6 — The dead chatbot subsystem is not covered by §0.1a

Three components form a complete, currently-disabled Gemini chatbot: `components/ui/AIChatSection.tsx`, `components/ui/chat-section.tsx`, `components/ui/search-bar.tsx`, backed by `app/backend/chatbot.py` and `app/backend/data/adan_persona.json`.

It is commented out at `app/page.tsx:66` (*"Chat section removed for cleaner intro, will work in V2"*) and hardcodes `http://localhost:5000/chat`, which would be mixed-content-blocked in production.

§0.1a authorizes exactly three content changes and this is not one of them. But §3.1/§4.4 call for deleting everything not rebuilt, and these files carry user-facing strings ("Ask me any questions you want!", "Chat with me :3", "I don't know about that lol").

**Question:** delete the chatbot subsystem, or preserve it for a future V2? If preserved, it stays out of the build and out of the content layer. Recommend deleting — it can be recovered from git history, and `adan_persona.json` is a content source that would otherwise need auditing against the no-invention rules.

---

## 🟡 Q7 — Two project cards link to the wrong repository

`app/page.tsx:26` points **ReCueCareer** at `https://github.com/adanjoserrojas/iPalo`.
`app/page.tsx:28` points **Face2Learn** at `https://github.com/adanjoserrojas/ReCueCareer`.

The `href`s are shifted one position relative to their titles. Live bug on production.

This is a **link**, which §0.2 lists as content requiring a truth source — so the corrected targets need confirming rather than guessing. The obvious reading is that each project should link to its own repo, but ReCueCareer's and Face2Learn's actual repository URLs are not otherwise recorded in this codebase.

**Question:** confirm the correct repo URL for ReCueCareer and for Face2Learn. (Knight Finder correctly points at `github.com/jaysprogram/Knight-Finder`, a collaborator's account — so per-project ownership is not uniform and should not be assumed.)

---

## 🟡 Q8 — Corporate logo assets for the new roles

§7.3 forbids downloading corporate logos: "Third-party trademarks on a personal site are a licensing question, not a design one. Use typography for those entries unless Adan says otherwise."

`pictures/` has `KH2025Logo.png` (Knight Hacks, already in use) and `CanvasLogo.png` (Dahiana Rojas, being deleted). There is **no AWS or Publix logo asset**, and none will be added.

**Confirming the default:** AWS and Publix experience entries render typographically, with no logo. Say so if you have licensed assets or explicit permission.

---

## 🟡 Q9 — GitHub README material and the arXiv reading list

§2.3b and §193 flag this as new-to-the-site material that is a valid truth source but requires approval before surfacing.

Pending Adan's answer at Gate 1:
- **Themes:** Agentic AI & MCP tooling; token-optimization frameworks; LLMs / RAG systems; containers & virtualization.
- **Currently-reading arXiv IDs:** 2510.23473, 2403.10517, 2503.10200, 2512.20618, 2511.20785, 2511.05489.

Note: these came from `REDESIGN.md`, not from a fetch of the GitHub profile. They should be re-verified against the live README before rendering, since the reading list is by nature time-sensitive and `content/reading.ts` is marked optional in §2.1.

---

## 🟡 Q10 — §2.3b conflicts still awaiting Adan (verbatim from the plan)

Restated here so Gate 1 has one checklist. Several now depend on Q2.

1. **Knight Hacks role** — site says "Workshop Instructor" (Aug 2025 – Present); repo résumé says "Workshop Team Member" (Aug 2025 – Present); `REDESIGN.md` says "Hackathon Organizer" (Jan 2026 – Present). **Three different titles.** Sequential roles, or renames? Note the site and the repo résumé also disagree with each other, independent of Q2.
2. **ReCueCareer date** — site `app/page.tsx:26`: "Jun 2025 - Present". Repo résumé: "Jul 2025 – Present". Which is right? Do not average or pick.
3. **Knight Finder** — on the site, absent from both résumés. Default: keep. Confirm.
4. **Skill list** — the résumé grouping supersedes the site's flat 38. Confirm the résumé list is canonical, and confirm which résumé (see Q2).
5. **Major** — see Q2. Blocked on the new résumé, *not* an unambiguous metadata error.
6. **Headline role** — site says "Full-Stack Developer" (`app/page.tsx:74`, inside a frozen bio paragraph). Should the hero role line and page titles shift toward software engineering / agentic AI? Changing it edits frozen prose, so it needs explicit approval.
7. **Publix disclosure scope** — see Q5.

---

## 🟡 Q11 — Two orphaned image assets

`pictures/McChicekn.png` (5.3 MB) and `pictures/WrongLogo.png` (45.9 KB) have **no import anywhere** in the codebase. `pictures/headBanging.mp4` (411 KB) is an unreferenced duplicate of `public/videos/headBanging.mp4`.

Not covered by §0.1a. They ship in the repo but not in the bundle, so this is repo hygiene rather than a performance win.

**Question:** delete all three? Recommend yes — recoverable from git history.
