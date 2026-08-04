# CHANGES-COPY.md

Every **chrome-copy** change, before/after, per §0.1.

> "Prose that is clearly *chrome* rather than data — a section heading like 'Projects', a button label like 'Click to learn more!' — may be restyled or relabeled **only** if you log the change in `CHANGES-COPY.md` with before/after. Anything descriptive of Adan, his work, or his history is data and is frozen."

---

## Status after Phase 1

**No chrome copy has been changed yet.** Phase 1 extracted content into a typed layer; it did not rebuild the UI. Relabelling decisions belong to Phase 3–5, once a design direction is chosen at Gate 2.

This file is the register those changes land in. It is deliberately not empty of content — the inventory below is what Phase 3+ is allowed to touch, and everything not on it is frozen.

---

## The chrome inventory — what may be relabelled

| # | Current string | Location | Notes |
|---|---|---|---|
| 1 | `Projects` | `app/page.tsx:92` | Section heading. Currently an `<h1>` — see the a11y note below. |
| 2 | `Skills` | `app/page.tsx:111` | Section heading (`<h2>`). |
| 3 | `Experience` | `app/page.tsx:117` | Section heading (`<h3>`). Note the leading space in the JSX. |
| 4 | `Here are some of my personal and collaborative projects that I've worked on recently.` | `app/page.tsx:94` | Section sub-line. |
| 5 | `Here are some of the technologies and tools I work with:` | `app/page.tsx:113` | Section sub-line. |
| 6 | `A few roles I've had the pleasure to work in recently:` | `app/page.tsx:119` | Section sub-line. |
| 7 | `Click to learn more!` | `components/ui/ProjectCard.tsx:75` | Button label. §0.1 names this one explicitly as an example of chrome. |

That is the complete set. Seven strings.

---

## What is NOT on this list (frozen data — §0.1)

Recorded here so the boundary is unambiguous, and so a later pass does not mistake any of it for chrome:

- `Hey there! I'm Adan` — `app/page.tsx:64`. Reads like a greeting, but it is Adan speaking in his own voice and it names him. **Data.**
- All three bio paragraphs — `app/page.tsx:74, 76, 78`.
- All four project titles, dates, and one-line descriptions — `app/page.tsx:26-29`.
- All experience titles, companies, durations, and both description fields — `app/page.tsx:33-38`.
- All 38 skill names — `components/ui/CardDemo.tsx:72-109`.
- Page title and both meta descriptions — `app/layout.tsx:16, 18, 48, 63`.
- Every string in `Adan_Rojas_Resume.pdf`.

Removed strings are not "changed copy" and belong in `CHANGES-CONTENT.md`, not here — that covers the quiz text, the Dahiana Rojas prose, and the dead chatbot strings.

---

## Constraints on any future relabelling

1. **Headings 1–3 must be fixed structurally regardless of wording.** `RESULTS.md` §5 records `heading-order` violations from axe: the page uses `<h1>` twice and reaches `<h4>` decoratively, and `FloatExperience.tsx:36` emits a third `<h1>` per card. Correcting the *level* is an accessibility fix, not a copy change, and needs no entry here. Changing the *words* does.

2. **Sub-lines 4–6 are borderline.** Each is written in Adan's first person ("projects that I've worked on", "tools I work with", "roles I've had the pleasure to work in"). They are chrome by function but personal in voice. Recommend preserving them verbatim unless a chosen design has no room for them — and if one is cut rather than reworded, log the deletion here.

3. **Label 7 is the safest change on the page.** "Click to learn more!" is generic, and the button's actual behaviour is to open a GitHub repo in a new tab after a 2-second cube animation (`ProjectCard.tsx:36-48`). Under §5.1 project details become real routes, so this control's destination changes and its label should change with it. Whatever it becomes gets logged here with before/after.

4. **New chrome introduced by the redesign** — nav labels, breadcrumbs, a command-palette placeholder, "skip to content", empty states, `not-found.tsx` copy — is new chrome, not changed chrome. It still gets logged here, marked `(new)`, so the total surface of agent-written words stays visible in one place.

---

## Change log

| Date | Location | Before | After | Reason |
|---|---|---|---|---|
| — | — | — | — | *No changes yet.* |
