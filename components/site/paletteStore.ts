"use client";

/**
 * A tiny pub/sub so the header trigger and the palette dialog can share
 * open/closed state without a context provider wrapping the whole tree —
 * which would turn every page into a client component and undo the point of
 * §5.3's "client boundary as low in the tree as possible".
 */
type Listener = (open: boolean) => void;

const listeners = new Set<Listener>();
let open = false;

export function setPaletteOpen(next: boolean) {
  open = next;
  listeners.forEach((l) => l(open));
}

export function togglePalette() {
  setPaletteOpen(!open);
}

export function subscribePalette(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
