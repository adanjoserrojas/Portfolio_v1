"use client";

import { useMemo, useState } from "react";
import type { LabData } from "../data";
import s from "./v6.module.css";

/**
 * v6 — Retrieval. The portfolio is a corpus; navigation is a retrieval step.
 *
 * The ranking is REAL: a small BM25-flavoured lexical score computed in the
 * browser over the real content layer. No embeddings, no model, no fabricated
 * similarity — and the UI says "lexical" rather than implying semantics it
 * does not have. This is the same honesty constraint §3.2 puts on v2.
 *
 * Empty query renders the entire corpus in document order, so the page is
 * fully readable without ever typing.
 */

type Doc = {
  id: string;
  kind: string;
  name: string;
  meta: string;
  fields: string[];
  href?: string;
  heldCount?: number;
};

function corpus(d: LabData): Doc[] {
  return [
    {
      id: "about",
      kind: "profile",
      name: d.name,
      meta: `${d.location} · ${d.education.degree}`,
      fields: [...d.bio],
    },
    ...d.roles.map((r) => ({
      id: `role-${r.slug}`,
      kind: "role",
      name: `${r.role} · ${r.org}`,
      meta: `${r.dates} · ${r.location}`,
      fields: r.siteProse ? [...r.bullets, r.siteProse] : [...r.bullets],
      heldCount: r.heldCount,
    })),
    ...d.projects.map((p) => ({
      id: `project-${p.slug}`,
      kind: "project",
      name: p.name,
      meta: p.stack.length ? `${p.date} · ${p.stack.join(" · ")}` : p.date,
      fields: [p.summary, ...p.bullets],
      href: p.href,
    })),
    ...d.categories.map((c) => ({
      id: `skills-${c}`,
      kind: "skills",
      name: c,
      meta: `${d.skills.filter((k) => k.category === c).length} entries`,
      fields: [
        d.skills
          .filter((k) => k.category === c)
          .map((k) => k.name)
          .join(", "),
      ],
    })),
    {
      id: "education",
      kind: "education",
      name: d.education.institution,
      meta: d.education.location,
      fields: [
        [
          d.education.degree,
          d.education.minor ? `Minor in ${d.education.minor}` : null,
          d.education.expectedGraduation,
        ]
          .filter(Boolean)
          .join(" · "),
      ],
    },
  ];
}

const tokenize = (s: string) => s.toLowerCase().match(/[a-z0-9#+.]+/g) ?? [];

/**
 * BM25-flavoured scoring. k1/b are the standard defaults; IDF is computed
 * over this (very small) corpus, so the numbers are honest for what they are:
 * lexical relevance within one document set.
 */
function score(doc: Doc, terms: string[], df: Map<string, number>, N: number, avgLen: number) {
  const text = tokenize([doc.name, doc.meta, ...doc.fields].join(" "));
  const len = text.length;
  const k1 = 1.5;
  const b = 0.75;

  let total = 0;
  for (const t of terms) {
    const tf = text.filter((w) => w === t || w.startsWith(t)).length;
    if (!tf) continue;
    const n = df.get(t) ?? 0;
    const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
    total += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * len) / avgLen)));
  }
  return total;
}

/** Highlights matched terms in place — shows *why* a result ranked. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) && terms.some((t) => p.toLowerCase().startsWith(t)) ? (
          <mark key={i} className={s.mark}>
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/**
 * Which named fields a term actually hit. Shown per result so the ranking
 * explains itself — the score alone says "this is relevant", the attribution
 * says *why*. This is the second-pass fix (§3.4): v6's weakest axis was that
 * a bare score badge asks you to trust the number.
 */
function matchedFields(doc: Doc, terms: string[]): string[] {
  if (!terms.length) return [];
  const hit = (text: string) => {
    const toks = tokenize(text);
    return terms.some((t) => toks.some((w) => w === t || w.startsWith(t)));
  };
  const out: string[] = [];
  if (hit(doc.name)) out.push("title");
  if (hit(doc.meta)) out.push("meta");
  if (doc.fields.some(hit)) out.push("body");
  return out;
}

export default function Retrieve({ data }: { data: LabData }) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(-1);
  const docs = useMemo(() => corpus(data), [data]);

  const stats = useMemo(() => {
    const df = new Map<string, number>();
    let totalLen = 0;
    for (const d of docs) {
      const toks = tokenize([d.name, d.meta, ...d.fields].join(" "));
      totalLen += toks.length;
      for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
    }
    return { df, avgLen: totalLen / docs.length };
  }, [docs]);

  const terms = useMemo(() => tokenize(q), [q]);

  const ranked = useMemo(() => {
    if (!terms.length) return docs.map((d) => ({ doc: d, s: 0 }));
    return docs
      .map((d) => ({ doc: d, s: score(d, terms, stats.df, docs.length, stats.avgLen) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s);
  }, [docs, terms, stats]);

  /**
   * ↑/↓ from the query field walks the ranked results — retrieval you can
   * drive without ever touching the mouse. Second-pass fix (§3.4).
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next =
        e.key === "ArrowDown"
          ? Math.min(cursor + 1, ranked.length - 1)
          : Math.max(cursor - 1, -1);
      setCursor(next);
      if (next >= 0) {
        document
          .getElementById(`r-${ranked[next].doc.id}`)
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
    if (e.key === "Escape") {
      setQ("");
      setCursor(-1);
    }
  };

  return (
    <>
      <div className={s.queryRow}>
        <label className={s.label} htmlFor="q">
          query · lexical BM25 over {docs.length} documents
        </label>
        <input
          id="q"
          className={s.input}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(-1);
          }}
          onKeyDown={onKeyDown}
          placeholder="mcp, tailwind, hackathon, publix…"
          autoComplete="off"
          aria-describedby="q-hint"
        />
        <p className={s.status} role="status" aria-live="polite">
          {terms.length
            ? `${ranked.length} of ${docs.length} documents matched`
            : `showing all ${docs.length} documents · no query`}
        </p>
        <p id="q-hint" className={s.status}>
          ↑↓ to walk results · Esc to clear
        </p>
      </div>

      {ranked.length === 0 ? (
        <p className={s.empty}>
          No document contains that term.
          <br />
          This is lexical matching, not semantic search — it finds words that are
          actually written, and nothing else.
        </p>
      ) : (
        <ul className={s.results}>
          {ranked.map(({ doc, s: sc }, i) => (
            <li
              key={doc.id}
              id={`r-${doc.id}`}
              className={s.result}
              data-cursor={i === cursor}
            >
              <div className={s.resultTop}>
                {terms.length > 0 && <span className={s.score}>{sc.toFixed(2)}</span>}
                <span className={s.kind}>{doc.kind}</span>
                <h2 className={s.rname}>
                  <Highlight text={doc.name} terms={terms} />
                </h2>
              </div>
              <p className={s.rmeta}>
                <Highlight text={doc.meta} terms={terms} />
              </p>
              {/* Why it ranked — not just that it did. */}
              {terms.length > 0 && (
                <p className={s.attribution}>
                  matched in {matchedFields(doc, terms).join(" · ")}
                </p>
              )}
              {doc.fields.map((f, i) => (
                <p key={i} className={i === 0 ? s.rbody : s.rfield}>
                  <Highlight text={f} terms={terms} />
                </p>
              ))}
              {doc.href && (
                <p className={s.rmeta} style={{ marginTop: "0.4rem", marginBottom: 0 }}>
                  <a className={s.link} href={doc.href}>
                    {doc.href.replace("https://", "")}
                  </a>
                </p>
              )}
              {doc.heldCount ? (
                <p className={s.held}>
                  {doc.heldCount} documents withheld from this corpus · §0.3 review pending
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
