"use client";

import { useState } from "react";
import type { LabData } from "../data";
import { projectsForSkill } from "../data";
import s from "./v5.module.css";

/**
 * v5 — everything is inspectable, nothing is hidden behind a modal.
 *
 * A field renders only when it has a real value. There is no empty state,
 * no "—", no "N/A" — absent data produces no row (§0.2, §2.2).
 */
type Sel = { kind: "role" | "project" | "skill" | "education"; id: string };

export default function Inspector({ data }: { data: LabData }) {
  const [sel, setSel] = useState<Sel>({ kind: "role", id: data.roles[0].slug });

  const isOn = (kind: Sel["kind"], id: string) => sel.kind === kind && sel.id === id;

  return (
    <div className={s.split}>
      <div className={s.index}>
        <h1 className={s.name}>{data.name}</h1>
        <p className={s.role}>{data.roleLine}</p>

        <h2 className={s.groupName}>Experience</h2>
        <ul className={s.list}>
          {data.roles.map((r) => (
            <li key={r.slug}>
              <button
                type="button"
                className={s.item}
                aria-pressed={isOn("role", r.slug)}
                onClick={() => setSel({ kind: "role", id: r.slug })}
              >
                {r.role}
                <span className={s.itemSub}>
                  {r.org} · {r.dates}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <h2 className={s.groupName}>Projects</h2>
        <ul className={s.list}>
          {data.projects.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                className={s.item}
                aria-pressed={isOn("project", p.slug)}
                onClick={() => setSel({ kind: "project", id: p.slug })}
              >
                {p.name}
                <span className={s.itemSub}>{p.date}</span>
              </button>
            </li>
          ))}
        </ul>

        <h2 className={s.groupName}>Education</h2>
        <ul className={s.list}>
          <li>
            <button
              type="button"
              className={s.item}
              aria-pressed={isOn("education", "ucf")}
              onClick={() => setSel({ kind: "education", id: "ucf" })}
            >
              {data.education.institution}
              <span className={s.itemSub}>{data.education.expectedGraduation}</span>
            </button>
          </li>
        </ul>

        {data.categories.map((c) => (
          <div key={c}>
            <h2 className={s.groupName}>{c}</h2>
            <ul className={s.list}>
              {data.skills
                .filter((k) => k.category === c)
                .map((k) => (
                  <li key={k.name}>
                    <button
                      type="button"
                      className={s.item}
                      aria-pressed={isOn("skill", k.name)}
                      onClick={() => setSel({ kind: "skill", id: k.name })}
                    >
                      {k.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <main className={s.inspector} aria-live="polite">
        {sel.kind === "role" && <RolePane data={data} id={sel.id} />}
        {sel.kind === "project" && <ProjectPane data={data} id={sel.id} />}
        {sel.kind === "skill" && <SkillPane data={data} id={sel.id} />}
        {sel.kind === "education" && <EducationPane data={data} />}
      </main>
    </div>
  );
}

function RolePane({ data, id }: { data: LabData; id: string }) {
  const r = data.roles.find((x) => x.slug === id);
  if (!r) return null;
  return (
    <>
      <p className={s.kind}>Role</p>
      <h2 className={s.title}>{r.role}</h2>
      <dl className={s.fields}>
        <dt>org</dt>
        <dd>{r.org}</dd>
        <dt>dates</dt>
        <dd>{r.dates}</dd>
        <dt>location</dt>
        <dd>{r.location}</dd>
        {r.bullets.length > 0 && (
          <>
            <dt>work</dt>
            <dd>
              <ul className={s.multi}>
                {r.bullets.map((b) => (
                  <li key={b.slice(0, 24)}>{b}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        {r.siteProse && (
          <>
            <dt>notes</dt>
            <dd>
              <p className={s.prose}>{r.siteProse}</p>
            </dd>
          </>
        )}
        {r.heldCount > 0 && (
          <>
            <dt>withheld</dt>
            <dd>
              <p className={s.held}>
                {r.heldCount} bullets exist but are not cleared for a public page.
                §0.3 confidentiality review pending.
              </p>
            </dd>
          </>
        )}
      </dl>
    </>
  );
}

function ProjectPane({ data, id }: { data: LabData; id: string }) {
  const p = data.projects.find((x) => x.slug === id);
  if (!p) return null;
  return (
    <>
      <p className={s.kind}>Project</p>
      <h2 className={s.title}>{p.name}</h2>
      <dl className={s.fields}>
        <dt>summary</dt>
        <dd>{p.summary}</dd>
        <dt>date</dt>
        <dd>{p.date}</dd>
        {p.stack.length > 0 && (
          <>
            <dt>stack</dt>
            <dd>
              <ul className={s.tags}>
                {p.stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        {p.href && (
          <>
            <dt>repo</dt>
            <dd>
              <a className={s.link} href={p.href}>
                {p.href.replace("https://", "")}
              </a>
            </dd>
          </>
        )}
        {p.bullets.length > 0 && (
          <>
            <dt>detail</dt>
            <dd>
              <ul className={s.multi}>
                {p.bullets.map((b) => (
                  <li key={b.slice(0, 24)}>{b}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>
    </>
  );
}

function SkillPane({ data, id }: { data: LabData; id: string }) {
  const k = data.skills.find((x) => x.name === id);
  if (!k) return null;
  // A real edge: only projects whose résumé stack line names this skill.
  const used = projectsForSkill(data, k.name);
  return (
    <>
      <p className={s.kind}>Skill</p>
      <h2 className={s.title}>{k.name}</h2>
      <dl className={s.fields}>
        <dt>category</dt>
        <dd>{k.category}</dd>
        {used.length > 0 && (
          <>
            <dt>used in</dt>
            <dd>{used.join(", ")}</dd>
          </>
        )}
        {k.href && (
          <>
            <dt>docs</dt>
            <dd>
              <a className={s.link} href={k.href}>
                {k.href.replace("https://", "")}
              </a>
            </dd>
          </>
        )}
      </dl>
    </>
  );
}

function EducationPane({ data }: { data: LabData }) {
  const e = data.education;
  return (
    <>
      <p className={s.kind}>Education</p>
      <h2 className={s.title}>{e.institution}</h2>
      <dl className={s.fields}>
        <dt>degree</dt>
        <dd>{e.degree}</dd>
        {e.minor && (
          <>
            <dt>minor</dt>
            <dd>{e.minor}</dd>
          </>
        )}
        <dt>location</dt>
        <dd>{e.location}</dd>
        {e.expectedGraduation && (
          <>
            <dt>expected</dt>
            <dd>{e.expectedGraduation}</dd>
          </>
        )}
      </dl>
    </>
  );
}
