"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
// lib/rank imports nothing — the content layer and zod stay on the server.
import { retrieve, tokenize, type Doc, type Hit } from "@/lib/rank";

/**
 * The homepage retrieval surface — the site's signature (§3.3).
 *
 * Honesty constraints, carried over from the v6 prototype:
 *   · The ranking is real lexical BM25 over the content layer. The label says
 *     "lexical", because that is what it is — no embeddings, no model, no
 *     fabricated similarity.
 *   · Every result shows WHY it ranked: the score, and which fields matched.
 *   · Empty query renders the entire corpus in document order, so the page is
 *     fully readable without typing and fully crawlable. Search-as-navigation
 *     usually fails the SEO test; this does not.
 *
 * The empty state was flagged at Gate 2 as the direction's single point of
 * failure. It is solved with real starting points drawn from the content
 * layer — not invented suggestions — so a first-time visitor always has
 * somewhere true to click.
 */

/**
 * Suggested queries. Every one of these is a literal string present in the
 * corpus, so none can return zero results — verified by scripts/verify-content.
 */
const STARTERS = ["MCP", "hackathon", "Swift", "TypeScript", "accessibility", "AWS"];

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  return (
    <>
      {text.split(re).map((part, i) =>
        terms.some((t) => part.toLowerCase().startsWith(t)) ? (
          <mark key={i} className="rounded-xs bg-match px-px text-ink">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function Retrieval({ docs }: { docs: Doc[] }) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(-1);

  const terms = useMemo(() => tokenize(q), [q]);
  const hits: Hit[] = useMemo(() => retrieve(docs, q), [docs, q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next =
        e.key === "ArrowDown" ? Math.min(cursor + 1, hits.length - 1) : Math.max(cursor - 1, -1);
      setCursor(next);
      if (next >= 0) {
        document
          .getElementById(`hit-${hits[next].doc.id}`)
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
      <div className="sticky top-0 z-20 border-b border-line bg-surface py-4">
        <label
          htmlFor="q"
          className="mb-2 block font-mono text-xs uppercase tracking-[0.09em] text-muted"
        >
          Query · lexical BM25 over {docs.length} documents
        </label>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(-1);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search everything on this site…"
          autoComplete="off"
          aria-describedby="q-hint"
          className="min-h-11 w-full rounded-(--radius) border border-line bg-raised px-3 py-2.5 font-mono text-[15px] text-ink outline-none placeholder:text-muted"
        />
        <p role="status" aria-live="polite" className="mt-2 font-mono text-xs text-muted">
          {terms.length
            ? `${hits.length} of ${docs.length} documents matched`
            : `Showing all ${hits.length} documents · no query`}
        </p>
        <p id="q-hint" className="font-mono text-xs text-muted">
          ↑↓ to walk results · esc to clear
        </p>
      </div>

      {/* The empty state. Real starting points, drawn from the corpus. */}
      {!terms.length && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">Try:</span>
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              data-target
              onClick={() => {
                setQ(s);
                setCursor(-1);
              }}
              className="rounded-(--radius) border border-line px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {hits.length === 0 ? (
        <p className="py-12 font-mono text-sm leading-relaxed text-muted">
          No document contains that term.
          <br />
          This is lexical matching, not semantic search — it finds words that are
          actually written, and nothing else.
        </p>
      ) : (
        <ul className="mt-6">
          {hits.map((h, i) => (
            <li
              key={h.doc.id}
              id={`hit-${h.doc.id}`}
              className={`scroll-mt-32 border-b border-line py-5 ${
                i === cursor ? "-ml-3 bg-raised pl-3 shadow-[inset_3px_0_0_var(--color-accent)]" : ""
              }`}
            >
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {h.score > 0 && (
                  <span className="tabular rounded-[3px] border border-line px-1.5 font-mono text-xs text-accent">
                    {h.score.toFixed(2)}
                  </span>
                )}
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
                  {h.doc.kind}
                </span>
                <h2 className="text-lg font-semibold">
                  <Link href={h.doc.href} className="text-ink no-underline hover:underline">
                    <Highlight text={h.doc.title} terms={terms} />
                  </Link>
                </h2>
              </div>

              <p className="mb-2 font-mono text-xs text-muted">
                <Highlight text={h.doc.meta} terms={terms} />
              </p>

              {/* Why it ranked — not just that it did. */}
              {terms.length > 0 && h.matched.length > 0 && (
                <p className="mb-2 font-mono text-xs tracking-wide text-accent">
                  matched in {h.matched.join(" · ")}
                </p>
              )}

              {h.doc.fields.map((f, j) => (
                <p
                  key={j}
                  className={`mb-1.5 text-sm leading-relaxed ${j === 0 ? "text-ink" : "text-muted"}`}
                >
                  <Highlight text={f} terms={terms} />
                </p>
              ))}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
