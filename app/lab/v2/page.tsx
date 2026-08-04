import { labData } from "../data";
import { plexMono, plexSans } from "../fonts";
import Step from "./Step";
import { TraceProvider } from "./Trace";
import s from "./v2.module.css";

export const dynamic = "force-static";
export const metadata = { title: "v2 — Run trace" };

export default function V2() {
  const d = labData();

  const steps = [
    { id: "about", name: "load_profile" },
    { id: "experience", name: `resolve_experience(${d.roles.length})` },
    { id: "projects", name: `resolve_projects(${d.projects.length})` },
    { id: "skills", name: `resolve_skills(${d.skills.length})` },
  ];

  return (
    <div className={`proto ${s.proto} ${plexMono.variable} ${plexSans.variable}`}>
      <header className={s.wrap} style={{ paddingBottom: 0 }}>
        <div className={s.head}>
          {/* Not a fabricated run ID — it names what this page actually is. */}
          <p className={s.runId}>trace · adan rojas · 4dan.dev</p>
          <h1 className={s.h1}>{d.name}</h1>
          <p className={s.role}>{d.roleLine}</p>
        </div>
      </header>

      <TraceProvider steps={steps}>
        <Step id="about" name="load_profile">
          <div className={s.bio}>
            {d.bio.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <p className={s.cardMeta}>
            {d.location} · {d.education.degree}, {d.education.institution}
            {d.education.expectedGraduation ? ` · ${d.education.expectedGraduation}` : ""}
          </p>
        </Step>

        <Step id="experience" name={`resolve_experience(${d.roles.length})`}>
          {d.roles.map((r) => (
            <article key={r.slug} className={s.card}>
              <div className={s.cardTop}>
                <h3 className={s.cardName}>
                  {r.role} · {r.org}
                </h3>
                <span className={s.cardMeta}>
                  {r.dates} · {r.location}
                </span>
              </div>
              <ul className={s.bullets}>
                {r.bullets.map((b) => (
                  <li key={b.slice(0, 24)}>{b}</li>
                ))}
              </ul>
              {r.heldCount > 0 && (
                <p className={s.held}>
                  {r.heldCount} bullets withheld · §0.3 confidentiality review pending
                </p>
              )}
            </article>
          ))}
        </Step>

        <Step id="projects" name={`resolve_projects(${d.projects.length})`}>
          {d.projects.map((p) => (
            <article key={p.slug} className={s.card}>
              <div className={s.cardTop}>
                <h3 className={s.cardName}>{p.name}</h3>
                <span className={s.cardMeta}>{p.date}</span>
              </div>
              <p className={s.cardSummary}>{p.summary}</p>
              {p.stack.length > 0 && (
                <ul className={s.stack}>
                  {p.stack.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              {p.bullets.length > 0 && (
                <ul className={s.bullets}>
                  {p.bullets.map((b) => (
                    <li key={b.slice(0, 24)}>{b}</li>
                  ))}
                </ul>
              )}
              {p.href && (
                <p className={s.cardMeta} style={{ marginTop: "0.75rem" }}>
                  <a className={s.link} href={p.href}>
                    {p.href.replace("https://", "")}
                  </a>
                </p>
              )}
            </article>
          ))}
        </Step>

        <Step id="skills" name={`resolve_skills(${d.skills.length})`}>
          {d.categories.map((c) => (
            <div key={c}>
              <h3 className={s.groupName}>{c}</h3>
              <ul className={s.chips}>
                {d.skills
                  .filter((k) => k.category === c)
                  .map((k) => (
                    <li key={k.name}>{k.name}</li>
                  ))}
              </ul>
            </div>
          ))}
        </Step>
      </TraceProvider>
    </div>
  );
}
