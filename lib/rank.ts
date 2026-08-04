/**
 * Pure ranking. Client-safe by construction: this module imports NOTHING —
 * not the content layer, not zod. It receives documents and returns an order.
 *
 * That separation is the point. `lib/corpus.ts` builds the documents on the
 * server (and pulls in zod and every content module to do it); this file is
 * the only part that crosses into the browser, so the client bundle carries
 * ~1.5 KB of scoring instead of the whole validation stack (§5.3).
 */

export type Doc = {
  id: string;
  kind: "profile" | "role" | "project" | "skills" | "education";
  title: string;
  meta: string;
  fields: string[];
  href: string;
};

export type Hit = { doc: Doc; score: number; matched: string[] };

export const tokenize = (s: string): string[] =>
  s.toLowerCase().match(/[a-z0-9#+.]+/g) ?? [];

const K1 = 1.5;
const B = 0.75;

type Stats = { df: Map<string, number>; avgLen: number; n: number };

/** Computed once per document set, memoised by identity. */
const statsCache = new WeakMap<Doc[], Stats>();

function stats(docs: Doc[]): Stats {
  const cached = statsCache.get(docs);
  if (cached) return cached;

  const df = new Map<string, number>();
  let total = 0;
  for (const d of docs) {
    const toks = tokenize([d.title, d.meta, ...d.fields].join(" "));
    total += toks.length;
    for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const s: Stats = { df, avgLen: total / (docs.length || 1), n: docs.length };
  statsCache.set(docs, s);
  return s;
}

function score(doc: Doc, terms: string[], s: Stats): number {
  const text = tokenize([doc.title, doc.meta, ...doc.fields].join(" "));
  const len = text.length;
  let total = 0;
  for (const t of terms) {
    const tf = text.filter((w) => w === t || w.startsWith(t)).length;
    if (!tf) continue;
    const n = s.df.get(t) ?? 0;
    const idf = Math.log(1 + (s.n - n + 0.5) / (n + 0.5));
    total += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * len) / s.avgLen)));
  }
  return total;
}

/** Which named fields a term actually hit — so the ranking explains itself. */
function matchedFields(doc: Doc, terms: string[]): string[] {
  const hit = (text: string) => {
    const toks = tokenize(text);
    return terms.some((t) => toks.some((w) => w === t || w.startsWith(t)));
  };
  const out: string[] = [];
  if (hit(doc.title)) out.push("title");
  if (hit(doc.meta)) out.push("meta");
  if (doc.fields.some(hit)) out.push("body");
  return out;
}

/** Empty query returns the whole corpus in document order, unranked. */
export function retrieve(docs: Doc[], query: string): Hit[] {
  const terms = tokenize(query);
  if (!terms.length) return docs.map((doc) => ({ doc, score: 0, matched: [] }));
  const s = stats(docs);
  return docs
    .map((doc) => ({ doc, score: score(doc, terms, s), matched: matchedFields(doc, terms) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);
}
