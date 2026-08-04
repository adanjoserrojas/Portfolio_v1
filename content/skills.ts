import { SkillSchema, validate, type Skill, type SkillCategory } from "./types";

/**
 * Skills grouped by the résumé's OWN three categories (§2.3a).
 * "Use these three categories. Do not create a fourth."
 *
 * _source: Adan_Rojas_Resume.pdf:57-61, in résumé order within each group.
 *
 * `href` is carried over from components/ui/CardDemo.tsx:72-109 where the site
 * already had a link for that skill. Skills the site never listed have no
 * link — §0.2 treats a link as content requiring a truth source, so none are
 * invented here.
 *
 * `onSiteBefore` records whether the skill appeared in the site's flat list of
 * 38, so CHANGES-CONTENT.md can show the delta precisely.
 */
type Row = {
  name: string;
  href?: string;
  onSiteBefore: boolean;
  source: "resume" | "both";
};

const LANGUAGES: Row[] = [
  { name: "Python", href: "https://www.python.org/", onSiteBefore: true, source: "both" },
  { name: "TypeScript", href: "https://www.typescriptlang.org/", onSiteBefore: true, source: "both" },
  { name: "C#", onSiteBefore: false, source: "resume" },
  { name: "Swift", href: "https://swift.org/", onSiteBefore: true, source: "both" },
  // The résumé combines these; the site listed HTML5 and CSS separately.
  // Kept combined because the résumé is canonical for the grouping.
  { name: "HTML/CSS", onSiteBefore: true, source: "both" },
  { name: "Java/JavaScript", onSiteBefore: true, source: "both" },
  { name: "SQL", href: "https://en.wikipedia.org/wiki/SQL", onSiteBefore: true, source: "both" },
];

const FRAMEWORKS: Row[] = [
  { name: "Selenium", href: "https://www.selenium.dev/", onSiteBefore: true, source: "both" },
  { name: ".NET", onSiteBefore: false, source: "resume" },
  { name: "Flask", href: "https://flask.palletsprojects.com/", onSiteBefore: true, source: "both" },
  { name: "bs4", href: "https://pypi.org/project/beautifulsoup4/", onSiteBefore: true, source: "both" },
  { name: "Tailwind", href: "https://tailwindcss.com/", onSiteBefore: true, source: "both" },
  { name: "Next.js", href: "https://nextjs.org/", onSiteBefore: true, source: "both" },
  { name: "React", href: "https://reactjs.org/", onSiteBefore: true, source: "both" },
  { name: "PyTorch", onSiteBefore: false, source: "resume" },
  {
    name: "Gemini",
    href: "https://ai.googleblog.com/2024/10/introducing-gemini-1-5-next-step-toward.html",
    onSiteBefore: true,
    source: "both",
  },
  { name: "Scikit-learn", href: "https://scikit-learn.org/", onSiteBefore: true, source: "both" },
  { name: "NumPy", href: "https://numpy.org/", onSiteBefore: true, source: "both" },
  { name: "SciPy", href: "https://scipy.org/", onSiteBefore: true, source: "both" },
  { name: "SentenceTransformers", onSiteBefore: false, source: "resume" },
  { name: "TensorFlow", href: "https://www.tensorflow.org/", onSiteBefore: true, source: "both" },
];

const TOOLS: Row[] = [
  { name: "Linux", onSiteBefore: false, source: "resume" },
  { name: "Windows", onSiteBefore: false, source: "resume" },
  { name: "MacOS", onSiteBefore: false, source: "resume" },
  { name: "XCode", href: "https://developer.apple.com/xcode/", onSiteBefore: true, source: "both" },
  { name: "Visual Studio", onSiteBefore: false, source: "resume" },
  { name: "VS Code", href: "https://code.visualstudio.com/", onSiteBefore: true, source: "both" },
  { name: "JetBrains CLion & IntelliJ", onSiteBefore: false, source: "resume" },
  { name: "GitHub", onSiteBefore: false, source: "resume" },
  { name: "Azure DevOps", onSiteBefore: false, source: "resume" },
  { name: "Notion", href: "https://www.notion.so/", onSiteBefore: true, source: "both" },
  { name: "MobaXTerm", onSiteBefore: false, source: "resume" },
  { name: "WSL", onSiteBefore: false, source: "resume" },
  { name: "N8N", href: "https://n8n.io/", onSiteBefore: true, source: "both" },
  { name: "Figma", href: "https://www.figma.com/", onSiteBefore: true, source: "both" },
  { name: "Docker", href: "https://www.docker.com/", onSiteBefore: true, source: "both" },
  { name: "Supabase", href: "https://supabase.com/", onSiteBefore: true, source: "both" },
  { name: "BoldTrail", onSiteBefore: false, source: "resume" },
  { name: "HubSpot", href: "https://www.hubspot.com/", onSiteBefore: true, source: "both" },
  { name: "MySQL", href: "https://www.mysql.com/", onSiteBefore: true, source: "both" },
  { name: "AWS", href: "https://aws.amazon.com/", onSiteBefore: true, source: "both" },
  { name: "Oracle DBMS", onSiteBefore: false, source: "resume" },
  { name: "Vercel", href: "https://vercel.com/", onSiteBefore: true, source: "both" },
  { name: "MongoDB", href: "https://www.mongodb.com/", onSiteBefore: true, source: "both" },
  { name: "Hugging Face", href: "https://huggingface.co/", onSiteBefore: true, source: "both" },
  // Restored by Adan on 2026-08-04 ("Add Auth0 back"), resolving §Q10 #4.
  //
  // Appended rather than inserted, because everything above holds the
  // résumé's own ordering and Auth0 is not in the résumé's skill list. It is
  // still résumé-backed and passes the §2.4 substring check — the résumé
  // names it in ReCueCareer's stack line, which was always the anomaly that
  // made dropping it look like an oversight.
  { name: "Auth0", href: "https://auth0.com/", onSiteBefore: true, source: "both" },
];

function build(rows: Row[], category: SkillCategory, group: string): Skill[] {
  return rows.map((r, i) =>
    validate(
      SkillSchema,
      { name: r.name, category, href: r.href, onSiteBefore: r.onSiteBefore, _source: r.source },
      `skills.ts ${group}[${i}] (${r.name})`,
    ),
  );
}

export const skills: Skill[] = [
  ...build(LANGUAGES, "Languages", "Languages"),
  ...build(FRAMEWORKS, "Frameworks/Libraries", "Frameworks/Libraries"),
  ...build(TOOLS, "Tools/Platforms", "Tools/Platforms"),
];

/** The résumé's three groups, in résumé order. Never add a fourth (§2.3a). */
export const skillCategories: SkillCategory[] = [
  "Languages",
  "Frameworks/Libraries",
  "Tools/Platforms",
];

export function skillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter((s) => s.category === category);
}

/**
 * Skills the old site listed that the current résumé does not.
 *
 * §Q10 #4 RESOLVED (Adan, 2026-08-04): Auth0 restored — it moved into
 * `skills` above. The remaining five stay out: the résumé list is canonical
 * per §2.3b #4, and Adan restored only the one he was asked about.
 *
 * Kept here so the removal stays visible and any of them is one line from
 * coming back.
 *
 * _source: components/ui/CardDemo.tsx:72-109 (deleted at Phase 6)
 */
export const droppedFromSite = [
  { name: "Node.js", href: "https://nodejs.org/" },
  { name: "PostgreSQL", href: "https://www.postgresql.org/" },
  { name: "Firebase", href: "https://firebase.google.com/" },
  { name: "Copilot", href: "https://copilot.github.com/" },
  { name: "Pandas", href: "https://pandas.pydata.org/" },
] as const;
