"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { LabData } from "../data";
import s from "./v1.module.css";

/**
 * v1 — the directory rail.
 *
 * Real tree semantics per §5.2: role="tree"/"group"/"treeitem",
 * aria-expanded, aria-selected, aria-level, and a ROVING TABINDEX — exactly
 * one tab stop for the whole tree. Keys: ↑/↓ move, ←/→ collapse/expand,
 * Home/End, Enter navigates, type-ahead by first letter.
 *
 * This is the only client component in v1. The content pane is rendered by
 * the server page and passed in as data.
 */

type Node = {
  id: string;
  label: string;
  level: number;
  dir?: boolean;
  parent?: string;
};

function buildNodes(data: LabData): Node[] {
  const out: Node[] = [{ id: "about", label: "about", level: 1 }];

  out.push({ id: "projects", label: "projects/", level: 1, dir: true });
  data.projects.forEach((p) =>
    out.push({ id: `projects/${p.slug}`, label: p.slug, level: 2, parent: "projects" }),
  );

  out.push({ id: "experience", label: "experience/", level: 1, dir: true });
  data.roles.forEach((r) =>
    out.push({ id: `experience/${r.slug}`, label: r.slug, level: 2, parent: "experience" }),
  );

  out.push({ id: "skills", label: "skills", level: 1 });
  return out;
}

export default function Tree({
  data,
  selected,
  onSelect,
}: {
  data: LabData;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const nodes = useMemo(() => buildNodes(data), [data]);
  const [open, setOpen] = useState<Record<string, boolean>>({
    projects: true,
    experience: true,
  });
  const [focused, setFocused] = useState(selected);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  /** Nodes currently reachable — a collapsed directory hides its children. */
  const visible = useMemo(
    () => nodes.filter((n) => !n.parent || open[n.parent]),
    [nodes, open],
  );

  const move = useCallback(
    (to: string) => {
      setFocused(to);
      refs.current[to]?.focus();
    },
    [],
  );

  const onKeyDown = (e: React.KeyboardEvent, node: Node) => {
    const i = visible.findIndex((n) => n.id === node.id);

    switch (e.key) {
      case "ArrowDown":
      case "j":
        e.preventDefault();
        move(visible[Math.min(i + 1, visible.length - 1)].id);
        return;
      case "ArrowUp":
      case "k":
        e.preventDefault();
        move(visible[Math.max(i - 1, 0)].id);
        return;
      case "ArrowRight":
        e.preventDefault();
        if (node.dir && !open[node.id]) setOpen((o) => ({ ...o, [node.id]: true }));
        else if (node.dir) move(visible[Math.min(i + 1, visible.length - 1)].id);
        return;
      case "ArrowLeft":
        e.preventDefault();
        if (node.dir && open[node.id]) setOpen((o) => ({ ...o, [node.id]: false }));
        else if (node.parent) move(node.parent);
        return;
      case "Home":
        e.preventDefault();
        move(visible[0].id);
        return;
      case "End":
        e.preventDefault();
        move(visible[visible.length - 1].id);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (node.dir) setOpen((o) => ({ ...o, [node.id]: !o[node.id] }));
        else onSelect(node.id);
        return;
    }

    // Type-ahead by first letter (§5.2).
    if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
      const from = visible.slice(i + 1).concat(visible.slice(0, i + 1));
      const hit = from.find((n) => n.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (hit) {
        e.preventDefault();
        move(hit.id);
      }
    }
  };

  const item = (n: Node) => (
    <li key={n.id} role="none">
      <button
        ref={(el) => {
          refs.current[n.id] = el;
        }}
        type="button"
        role="treeitem"
        aria-level={n.level}
        aria-selected={selected === n.id}
        aria-expanded={n.dir ? open[n.id] : undefined}
        aria-current={selected === n.id ? "page" : undefined}
        // Roving tabindex — exactly one tab stop for the whole tree.
        tabIndex={focused === n.id ? 0 : -1}
        className={`${s.node} ${n.dir ? s.dir : ""}`}
        onFocus={() => setFocused(n.id)}
        onKeyDown={(e) => onKeyDown(e, n)}
        onClick={() => (n.dir ? setOpen((o) => ({ ...o, [n.id]: !o[n.id] })) : onSelect(n.id))}
      >
        {n.label}
      </button>
      {n.dir && open[n.id] && (
        <ul role="group">{nodes.filter((c) => c.parent === n.id).map(item)}</ul>
      )}
    </li>
  );

  return (
    <ul className={s.tree} role="tree" aria-label="Site directory">
      {nodes.filter((n) => !n.parent).map(item)}
    </ul>
  );
}
