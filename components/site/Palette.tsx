"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { retrieve, type Doc, type Hit } from "@/lib/rank";
import { setPaletteOpen, subscribePalette, togglePalette } from "./paletteStore";

/**
 * ⌘K / Ctrl-K palette — §5.2.
 *
 * Fuzzy-free by design: it runs the SAME lexical retrieval as the homepage,
 * so there is one ranking in the product rather than two. No search
 * dependency.
 *
 * Focus is trapped while open; Esc closes and restores focus to the trigger.
 */
export default function Palette({ docs }: { docs: Doc[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [hits, setHits] = useState<Hit[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const router = useRouter();

  useEffect(() => subscribePalette(setOpen), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        restoreTo.current = document.activeElement as HTMLElement;
        togglePalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setHits(retrieve(docs, ""));
      inputRef.current?.focus();
    } else {
      setQ("");
      setCursor(0);
      // Restore focus to whatever opened it (§5.2, §8).
      restoreTo.current?.focus();
    }
  }, [open, docs]);

  if (!open) return null;

  const close = () => setPaletteOpen(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, hits.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
      return;
    }
    if (e.key === "Enter" && hits[cursor]) {
      e.preventDefault();
      router.push(hits[cursor].doc.href);
      close();
      return;
    }
    // Focus trap: the dialog holds exactly one input and a list, so Tab has
    // nowhere legitimate to go.
    if (e.key === "Tab") e.preventDefault();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        className="w-full max-w-xl overflow-hidden rounded-lg border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setHits(retrieve(docs, e.target.value));
            setCursor(0);
          }}
          placeholder="Search projects, roles, skills…"
          aria-label="Search query"
          autoComplete="off"
          className="w-full border-b border-line bg-transparent px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-muted"
        />

        <p className="sr-only" role="status" aria-live="polite">
          {hits.length} results
        </p>

        <ul className="max-h-[52vh] overflow-y-auto py-1">
          {hits.length === 0 ? (
            <li className="px-4 py-6 font-mono text-xs text-muted">
              No document contains that term. This is lexical matching, not
              semantic search.
            </li>
          ) : (
            hits.map((h, i) => (
              <li key={h.doc.id}>
                <button
                  type="button"
                  onClick={() => {
                    router.push(h.doc.href);
                    close();
                  }}
                  onMouseEnter={() => setCursor(i)}
                  aria-current={i === cursor ? "true" : undefined}
                  className={`flex w-full items-baseline gap-3 px-4 py-2 text-left ${
                    i === cursor ? "bg-raised" : ""
                  }`}
                >
                  <span className="font-mono text-xs uppercase tracking-wider text-muted">
                    {h.doc.kind}
                  </span>
                  <span className="flex-1 truncate text-sm text-ink">{h.doc.title}</span>
                  {h.score > 0 && (
                    <span className="tabular font-mono text-xs text-accent">
                      {h.score.toFixed(2)}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        <p className="border-t border-line px-4 py-2 font-mono text-xs text-muted">
          ↑↓ navigate · ↵ open · esc close
        </p>
      </div>
    </div>
  );
}
