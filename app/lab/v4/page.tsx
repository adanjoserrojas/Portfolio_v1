import { labData } from "../data";
import { newsreader, jetbrainsMono } from "../fonts";
import s from "./v4.module.css";

export const dynamic = "force-static";
export const metadata = { title: "v4 — Reading room" };

/**
 * v4 — Reading room. Zero client JavaScript: a pure Server Component.
 * Projects become entries; skills become an appendix.
 */
export default function V4() {
  const d = labData();

  return (
    <div className={`proto ${s.proto} ${newsreader.variable} ${jetbrainsMono.variable}`}>
      <main className={s.wrap}>
        <div className={s.col}>
          <h1 className={s.title}>{d.name}</h1>
          <p className={s.standfirst}>{d.roleLine}</p>

          <div className={s.body}>
            {d.bio.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <h2 className={s.h2}>Work</h2>
          {d.roles.map((r) => (
            <article key={r.slug} className={s.entry}>
              <p className={s.entryMeta}>
                {r.dates} · {r.location}
              </p>
              <h3 className={s.h3}>
                {r.role}, {r.org}
              </h3>
              <ul className={s.notes}>
                {r.bullets.map((b) => (
                  <li key={b.slice(0, 24)}>{b}</li>
                ))}
              </ul>
              {r.siteProse && <p style={{ marginTop: "0.7rem" }}>{r.siteProse}</p>}
              {r.heldCount > 0 && (
                <p className={s.held}>
                  {r.heldCount} withheld · §0.3 review pending
                </p>
              )}
            </article>
          ))}

          <h2 className={s.h2}>Projects</h2>
          {d.projects.map((p) => (
            <article key={p.slug} className={s.entry}>
              <p className={s.entryMeta}>{p.date}</p>
              <h3 className={s.h3}>{p.name}</h3>
              <p>{p.summary}</p>
              {p.bullets.length > 0 && (
                <ul className={s.notes}>
                  {p.bullets.map((b) => (
                    <li key={b.slice(0, 24)}>{b}</li>
                  ))}
                </ul>
              )}
              {/* A real sidenote: the résumé stack line, set in the margin. */}
              {p.stack.length > 0 && (
                <p className={s.sidenote}>
                  {p.stack.join(" · ")}
                  {p.href && (
                    <>
                      <br />
                      <a className={s.link} href={p.href}>
                        {p.href.replace("https://github.com/", "")}
                      </a>
                    </>
                  )}
                </p>
              )}
            </article>
          ))}

          <h2 className={s.h2}>Education</h2>
          <div className={s.body}>
            <p>
              {d.education.degree}
              {d.education.minor ? `, minor in ${d.education.minor}` : ""} —{" "}
              {d.education.institution}, {d.education.location}
              {d.education.expectedGraduation
                ? `. Expected ${d.education.expectedGraduation}.`
                : "."}
            </p>
          </div>

          <section className={s.appendix}>
            <h2 className={s.h2} style={{ marginTop: 0 }}>
              Appendix — tools
            </h2>
            {d.categories.map((c) => (
              <div key={c} className={s.appendixGroup}>
                <p className={s.appendixName}>{c}</p>
                <p className={s.appendixList}>
                  {d.skills
                    .filter((k) => k.category === c)
                    .map((k) => k.name)
                    .join(", ")}
                  .
                </p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
