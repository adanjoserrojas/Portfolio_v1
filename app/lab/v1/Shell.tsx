"use client";

import { useState } from "react";
import type { LabData } from "../data";
import Tree from "./Tree";
import s from "./v1.module.css";

/**
 * v1 content pane. Panes swap without a full page transition (§3.2 v1 brief).
 *
 * Every string rendered here comes from the content layer. Fields that do not
 * exist simply do not render a row — no placeholder ever reaches a user (§0.2).
 */
export default function Shell({ data }: { data: LabData }) {
  const [selected, setSelected] = useState("about");

  const project = data.projects.find((p) => `projects/${p.slug}` === selected);
  const role = data.roles.find((r) => `experience/${r.slug}` === selected);

  return (
    <div className={s.shell}>
      <div className={s.rail}>
        <p className={s.railHead}>~/adan</p>
        <Tree data={data} selected={selected} onSelect={setSelected} />
      </div>

      <main className={s.pane}>
        <p className={s.crumb}>~/adan/{selected}</p>

        {selected === "about" && (
          <>
            <h1 className={s.h1}>{data.name}</h1>
            <p className={s.role}>{data.roleLine}</p>
            <dl className={s.meta}>
              <dt>location</dt>
              <dd>{data.location}</dd>
              <dt>school</dt>
              <dd>
                {data.education.degree}, {data.education.institution}
              </dd>
              {data.education.minor && (
                <>
                  <dt>minor</dt>
                  <dd>{data.education.minor}</dd>
                </>
              )}
              {data.education.expectedGraduation && (
                <>
                  <dt>expected</dt>
                  <dd>{data.education.expectedGraduation}</dd>
                </>
              )}
            </dl>
            <div className={s.body}>
              {data.bio.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </>
        )}

        {selected === "projects" && (
          <>
            <h1 className={s.h1}>projects</h1>
            <p className={s.role}>{data.projects.length} entries</p>
            <div className={s.body}>
              {data.projects.map((p) => (
                <p key={p.slug}>
                  <b>{p.name}</b> — {p.summary} <span className={s.dir}>{p.date}</span>
                </p>
              ))}
            </div>
          </>
        )}

        {project && (
          <>
            <h1 className={s.h1}>{project.name}</h1>
            <p className={s.role}>{project.summary}</p>
            <dl className={s.meta}>
              <dt>date</dt>
              <dd>{project.date}</dd>
              {project.stack.length > 0 && (
                <>
                  <dt>stack</dt>
                  <dd>{project.stack.join(" · ")}</dd>
                </>
              )}
              {project.href && (
                <>
                  <dt>repo</dt>
                  <dd>
                    <a className={s.link} href={project.href}>
                      {project.href.replace("https://", "")}
                    </a>
                  </dd>
                </>
              )}
            </dl>
            {project.bullets.length > 0 && (
              <ul className={s.bullets}>
                {project.bullets.map((b) => (
                  <li key={b.slice(0, 24)}>{b}</li>
                ))}
              </ul>
            )}
          </>
        )}

        {selected === "experience" && (
          <>
            <h1 className={s.h1}>experience</h1>
            <p className={s.role}>{data.roles.length} roles</p>
            <div className={s.body}>
              {data.roles.map((r) => (
                <p key={r.slug}>
                  <b>{r.role}</b>, {r.org} <span className={s.dir}>{r.dates}</span>
                </p>
              ))}
            </div>
          </>
        )}

        {role && (
          <>
            <h1 className={s.h1}>{role.role}</h1>
            <p className={s.role}>{role.org}</p>
            <dl className={s.meta}>
              <dt>dates</dt>
              <dd>{role.dates}</dd>
              <dt>location</dt>
              <dd>{role.location}</dd>
            </dl>
            <ul className={s.bullets}>
              {role.bullets.map((b) => (
                <li key={b.slice(0, 24)}>{b}</li>
              ))}
            </ul>
            {role.siteProse && (
              <div className={s.body} style={{ marginTop: "1.5rem" }}>
                <p>{role.siteProse}</p>
              </div>
            )}
            {role.heldCount > 0 && (
              <p className={s.held}>
                {role.heldCount} further {role.heldCount === 1 ? "bullet" : "bullets"} withheld
                pending the §0.3 confidentiality review. Not a placeholder — real content, not
                yet cleared for a public page.
              </p>
            )}
          </>
        )}

        {selected === "skills" && (
          <>
            <h1 className={s.h1}>skills</h1>
            <p className={s.role}>{data.skills.length} across 3 categories</p>
            {data.categories.map((c) => (
              <section key={c} className={s.group}>
                <h2 className={s.groupName}>{c}</h2>
                <ul className={s.chips}>
                  {data.skills
                    .filter((k) => k.category === c)
                    .map((k) => (
                      <li key={k.name}>{k.name}</li>
                    ))}
                </ul>
              </section>
            ))}
          </>
        )}

        <p className={s.hint}>
          ↑↓ or j/k to move · ←→ to collapse/expand · Enter to open · type to jump
        </p>
      </main>
    </div>
  );
}
