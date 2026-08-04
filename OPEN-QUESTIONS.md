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

## 🟡 Q12 — The old October résumé is still served

**Partly handled.** `Adan_Rojas_Resume.pdf` is now in `public/`, and `next.config.ts` permanently redirects `/Adan_Rojas_Resume_Oct.pdf` → `/Adan_Rojas_Resume.pdf`, so any existing link resolves to the current file rather than breaking. `/resume` is a convenience redirect to the same place. The old nav that linked the October PDF no longer exists.

**Still outstanding:** `public/Adan_Rojas_Resume_Oct.pdf` is still on disk. The 301 means nothing reaches it, so this is now hygiene rather than exposure — but the file itself contains a superseded major (Computer Science, Spring 2027), a removed employer, and an old personal email address.

**Question:** delete it? The 301 already covers inbound links, so deleting it costs nothing. I left it because deleting a résumé is your call, not mine.

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

1. **Knight Hacks role — three titles for one org.** 🔴

   | Source | Title | Start |
   |---|---|---|
   | `app/page.tsx:33` | Workshop Instructor | August 2025 |
   | `public/Adan_Rojas_Resume_Oct.pdf` | Workshop Team Member | Aug 2025 |
   | `Adan_Rojas_Resume.pdf` (current) | **Hackathon Organizer** | **Jan 2026** |

   §0.2 makes the current résumé canonical, so `experience.ts` carries Hackathon Organizer. But §2.3b #1 asks whether these are *sequential roles* — and the dates suggest they might be: Workshop Instructor from Aug 2025, Hackathon Organizer from Jan 2026 reads like a progression, not a rename.

   The Workshop Instructor entry (with its 633-character site prose) is preserved in `content/experience.ts` as `unresolvedRoles`, **unrendered**. If it is a distinct earlier role, say so and it joins the canonical array. If it is a rename, say so and it is deleted. I will not guess, because one answer destroys real history.

2. **ReCueCareer date.** Site `app/page.tsx:26` says "Jun 2025 - Present". Both résumés say "Jul 2025". §0.2 makes the résumé canonical so `projects.ts` carries "Jul 2025", but §2.3b #2 says to confirm rather than pick. **Which is right — and is the project still ongoing?** The site's "- Present" is dropped by the résumé's bare "Jul 2025", which changes what the card says about the project's status.

3. **Knight Finder.** On the site, absent from both résumés. Default per §2.3b #3: keep. Currently kept, deliberately thin — no stack, no bullets, no metrics, because none exist. Confirm.

4. **Skill list.** The résumé's 3 groups × 45 skills replace the site's flat 38. Adds 16 (C#, .NET, PyTorch, SentenceTransformers, Linux, Windows, MacOS, Visual Studio, JetBrains, GitHub, Azure DevOps, MobaXTerm, WSL, BoldTrail, Oracle DBMS, Hugging Face); drops 6 (Node.js, PostgreSQL, Firebase, Copilot, Pandas, **Auth0**). The dropped six are held in `skills.ts` as `droppedFromSite`, restorable in one line.

   **Auth0 is worth a second look:** the résumé drops it from the skill list but still names it in ReCueCareer's stack line. Deliberate, or an oversight?

5. **Major.** ✅ **Resolved** — see Q2. Information Technology / Fall 2027 is canonical; the metadata keyword is a genuine error and is corrected.

6. **Headline role.** Site says "Full-Stack Developer" (`app/page.tsx:74`, the opening clause of a frozen bio paragraph, mirrored in `profile.roleLine`). The résumé and GitHub both point at software engineering with an agentic-AI concentration. **Should the hero role line and page titles shift?** Changing it edits frozen prose, so it needs explicit approval — and note the phrase appears mid-sentence in bio paragraph 1, so changing the role line without changing the paragraph would leave the two contradicting each other.

7. **Publix disclosure scope** — see Q5.

---

## 🟡 Q11 — Two orphaned image assets

`pictures/McChicekn.png` (5.3 MB) and `pictures/WrongLogo.png` (45.9 KB) have **no import anywhere** in the codebase. `pictures/headBanging.mp4` (411 KB) is an unreferenced duplicate of `public/videos/headBanging.mp4`.

Not covered by §0.1a. They ship in the repo but not in the bundle, so this is repo hygiene rather than a performance win.

**Question:** delete all three? Recommend yes — recoverable from git history.
