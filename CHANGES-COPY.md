# CHANGES-COPY.md

Every **chrome-copy** change, before/after, per §0.1.

> "Prose that is clearly *chrome* rather than data — a section heading like 'Projects', a button label like 'Click to learn more!' — may be restyled or relabeled **only** if you log the change in `CHANGES-COPY.md` with before/after. Anything descriptive of Adan, his work, or his history is data and is frozen."

---

## Changed

| # | Before | After | Where | Why |
|---|---|---|---|---|
| 1 | `Here are some of my personal and collaborative projects that I've worked on recently.` | `4 projects, in the order they appear on the site.` | `/projects` lede | The original was written for a single-page site where the sentence introduced a section. On a dedicated index route it restates the page title; the replacement says something the heading doesn't. |
| 2 | `Here are some of the technologies and tools I work with:` | `45 entries in three categories, grouped as the résumé groups them.` | `/skills` lede | Same reason, plus it now names the grouping — which is Adan's own, from the résumé, not one an agent invented. |
| 3 | `A few roles I've had the pleasure to work in recently:` | `4 roles, most recent first.` | `/experience` lede | Same reason. |
| 4 | `Click to learn more!` | *(deleted)* | project cards | The control it labelled no longer exists. Project names are now real links to real routes (`/projects/[slug]`), so the affordance is the link itself. §0.1 names this string explicitly as chrome. |

**Deleted, not reworded:** #4. The old button opened a GitHub repo in a new tab after a 2-second spinning-cube animation. Under §5.1 project detail became a route, so the destination changed and the control went with it.

---

## New chrome introduced by the redesign

Marked `(new)` per the rule that new agent-written words stay visible in one place.

| String | Where | Note |
|---|---|---|
| `Skip to content` | skip link | §8 requirement. |
| `Search` + `⌘K` / `Ctrl K` | header trigger | §5.2. |
| `Query · lexical BM25 over 13 documents` | homepage label | Says exactly what the ranking is. Not "semantic", not "AI-powered" — it is lexical, and the label says so. |
| `Search everything on this site…` | query placeholder | |
| `Showing all 13 documents · no query` / `N of 13 documents matched` | status line | |
| `↑↓ to walk results · esc to clear` | keyboard hint | |
| `Try:` + 6 query chips | homepage empty state | The chips are **real corpus terms** (MCP, hackathon, Swift, TypeScript, accessibility, AWS), not invented suggestions — none can return zero results. |
| `matched in title · meta · body` | per result | Why it ranked, not just that it did. |
| `No document contains that term. This is lexical matching, not semantic search — it finds words that are actually written, and nothing else.` | empty result | Explains the mechanism rather than apologising for it. |
| `↑↓ navigate · ↵ open · esc close` | palette footer | |
| `Index` | eyebrow on index routes | |
| `4 projects, in the order they appear on the site.` etc. | ledes | See table above. |
| `N/4 resolved` | `/experience` trace | Reports genuine traversal state. No durations — none exist to report. |
| `Atlas` + `The same 45 skills, plotted by category. Hovering or focusing a project highlights the ones named in its stack — every line is an edge that exists in the source, not a decorative connection.` | `/skills` | States the honesty constraint in the UI. |
| `Focus or hover a project to highlight the skills in its stack.` | atlas readout | |
| `no stack on record` | atlas, Knight Finder | Honest absence, not a placeholder. |
| `N further items from this role are not shown — pending a confidentiality review of employer-internal figures.` | held bullets | §0.3. Says real content exists and is withheld — a different statement from "there is nothing more". |
| `This project predates the material on record, so there is no detail beyond the above. It is listed because it was built, not padded to match the others.` | `/projects/knight-finder` | §5.1: "a short honest page outranks a padded one." |
| `No document at that address` + `Nothing is indexed here. Everything on this site is listed below.` | 404 | |
| `Elsewhere` | `/about` links heading | |
| `Switch to light theme` / `Switch to dark theme` | toggle `aria-label` | |

---

## Frozen data — NOT changed (§0.1)

Recorded so the boundary stays unambiguous:

- `Hey there! I'm Adan` — reads like a greeting, but it is Adan speaking in his own voice and it names him. **Data.** *(Currently unused: the homepage leads with the name and role line. Retained in `content/profile.ts`.)*
- All three bio paragraphs — verbatim, including the contradiction flagged in `OPEN-QUESTIONS.md` §Q13.
- All four project names, dates, and one-line summaries.
- All role titles, orgs, durations, and both Knight Hacks description fields.
- Every résumé bullet — verbatim, never compressed or merged.
- All 45 skill names.

**Not "changed copy":** the quiz text, the Dahiana Rojas prose, and the dead chatbot strings were *removed*. Those belong in `CHANGES-CONTENT.md`.

### One change that looks like copy but is data

`profile.roleLine` changed from **"Full-Stack Developer"** to **"Software Engineer with a passion for AI Agents, MCPs, and Full-Stack Development"**.

That is data, not chrome — it describes Adan. It is logged in `CHANGES-CONTENT.md` §10, and it was made **only** because Adan approved it explicitly at Gate 1. The trailing "etc etc" in his instruction was deliberately not expanded; inventing further interests would breach §0.2.

---

## Change log

| Date | Location | Before | After | Reason |
|---|---|---|---|---|
| 2026-08-04 | `/projects` lede | `Here are some of my personal and collaborative projects that I've worked on recently.` | `4 projects, in the order they appear on the site.` | Section sub-line became a route lede |
| 2026-08-04 | `/skills` lede | `Here are some of the technologies and tools I work with:` | `45 entries in three categories, grouped as the résumé groups them.` | As above; names the grouping |
| 2026-08-04 | `/experience` lede | `A few roles I've had the pleasure to work in recently:` | `4 roles, most recent first.` | As above |
| 2026-08-04 | project cards | `Click to learn more!` | *(deleted)* | Control replaced by real links to real routes |
