import { EducationSchema, validate, type Education } from "./types";

/**
 * _source: Adan_Rojas_Resume.pdf lines 4–5, verbatim:
 *   "University of Central Florida  Orlando, FL"
 *   "Bachelor of Science in Information Technology, Minor in Computer
 *    Engineering  Fall 2027"
 *
 * §2.3b #5 is resolved by this file. The site's metadata keyword list
 * (app/layout.tsx:33) says "Computer Science", and the OLD résumé in the repo
 * (public/Adan_Rojas_Resume_Oct.pdf) also said "Computer Science, Spring 2027".
 * The current résumé says Information Technology, Fall 2027 — and per §0.2 the
 * résumé wins. The metadata is therefore a genuine factual error, and the fix
 * is logged in CHANGES-CONTENT.md.
 *
 * No GPA. §0.2 forbids fabricating one, and the résumé does not state one.
 */
const data = {
  institution: "University of Central Florida",
  location: "Orlando, FL",
  degree: "Bachelor of Science in Information Technology",
  minor: "Computer Engineering",
  expectedGraduation: "Fall 2027",
  _source: "resume",
} as const;

export const education: Education = validate(EducationSchema, data, "education.ts");
