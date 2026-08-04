"use client";

import { useEffect, useState } from "react";
import { togglePalette } from "./paletteStore";

export default function PaletteTrigger() {
  const [mac, setMac] = useState(false);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  return (
    <button
      type="button"
      data-target
      onClick={togglePalette}
      className="inline-flex h-8 items-center gap-2 rounded border border-line px-2 text-xs text-muted transition-colors hover:text-ink"
    >
      <span>Search</span>
      <kbd className="font-mono text-xs tracking-tight">{mac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}
