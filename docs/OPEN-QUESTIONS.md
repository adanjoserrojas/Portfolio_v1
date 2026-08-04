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

## ✅ Q3 — The quiz's "secret project" (CLOSED 2026-08-04)

**Adan: "The quiz was never built."**

This confirms the Phase 0 finding. `quizComponent.tsx` scored each question in isolation, had no cross-question state, and never navigated — the promise at `app/page.tsx:139` ("you will get redirected to a very important and secret project of mine") was never implemented.

**Nothing was orphaned by deleting the quiz.** No URL to preserve, no redirect to write.

---

## ⚪ Q4 — There is no `/quiz` route

§5.1 says to add a 301 from `/quiz` to `/`. The quiz is inline on `/` (`app/page.tsx:137-167`); no `/quiz` route has ever existed, so no such URL was ever served or indexed. **The 301 is unnecessary** — adding one would be a redirect from a URL that never 200'd.

Recommend confirming in Search Console's Pages report post-launch rather than pre-emptively redirecting. No action needed unless Adan knows of an external link to `/quiz`.

---

## ✅ Q5 — Publix disclosure scope (REVERSED, then CLOSED 2026-08-04)

**This question was answered twice, in opposite directions. Both are recorded, because a reversal should be legible rather than silently overwritten.**

| | Instruction |
|---|---|
| First | *"Do not disclose the 4 bullet points."* |
| **Superseding** | *"aggregate the 4 bullet points to Publix description, at the end, that information is fine to disclose, I forgot but it is ok to disclose those."* |

**Final state: all five Publix bullets are public.** The second instruction is the written confirmation §10's confidentiality gate requires before any employer-internal figure ships.

Per Adan's wording, the four previously-held bullets are appended **after** the MCP bullet rather than restored to résumé order — "at the end" is explicit.

Now public: *more than 3 million customers*, *245,000 employees*, *over seven figures* in annual training cost reduction, *more than 3000 engineers*, the 18-engineer team size, the *Caveman* skill comparison, and the *71.1%* benchmark result.

**One thing worth saying once, not repeated:** a webpage is public, permanent, and indexed. Once this deploys and Google crawls it, those figures are effectively out for good — deleting the page later does not retract them. That is Adan's call to make and he has made it in writing.

The `disclosure` mechanism stays in `content/experience.ts` even though nothing is currently held. It costs nothing, and the next employer will raise the same question.

### Consequences

- **§6.1 and §6.2 are unblocked.** The token-optimization benchmark and multi-agent MCP trace components are now buildable. Neither was built, because neither was asked for — and §6.1's full four-bar version still needs the individual benchmark names and percentages, which exist but have not been supplied. The honest aggregate-only version (71.1% across 4 benchmarks) is now possible.
- The withheld-count notice stays deleted. Nothing is withheld, so there is nothing to report.

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

## ✅ Q8 — Corporate logos (CLOSED 2026-08-04)

**Adan: "no logos is fine."**

Every experience entry renders typographically. §7.3: third-party trademarks on a personal site are a licensing question, not a design one.

**Consequence:** the `logo` field is removed from the schema and from both Knight Hacks entries, and `pictures/KH2025Logo.png` (41 KB) is deleted — with nothing rendering logos, it was an orphaned asset and a field the UI never read.

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

## ✅ Q14 — Knight Finder date (CLOSED 2026-08-04)

**Adan: "Knight Finder date is Spring 2025."**

Supersedes the site's long-standing "May 2024" and agrees with the "Knight Hacks Spring 2025 Project Launch" named in the description he supplied. The page and its bullet now say the same thing.

---

## ✅ Q15 — The résumé PDF (CLOSED 2026-08-04, by §Q5)

This question existed only because the PDF contained four bullets the site was withholding. **§Q5 reversed: those bullets are now public on the site itself**, so the PDF discloses nothing the pages do not.

The résumé is linked from the header and searchable as a corpus document.

**One thing left deliberately in place:** `X-Robots-Tag: noindex` on `/Adan_Rojas_Resume.pdf` (`next.config.ts`). This is now a normal SEO choice rather than a confidentiality one — an indexed PDF competes with `/about` and `/experience/*` for the same queries and usually outranks them with a worse landing experience. Say the word and I will remove it.

---

## ✅ Q16 — Project images (CLOSED 2026-08-04)

**Adan: "Untrack and delete the pictures folder."**

`pictures/` is removed from git and from disk — all four project screenshots, 466 KB. The `image` field is dropped from `ProjectSchema` and from every project.

The site is text-first by design. Recoverable from git history if that changes.
