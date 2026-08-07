/**
 * verify-contrast.ts — §4.1 / §8.
 *
 * "Body text ≥ 4.5:1, large text and UI borders ≥ 3:1, in both modes.
 *  Verify with a script, not by eye."
 *
 * Token values are parsed straight out of app/globals.css, so this cannot
 * drift from what actually ships. Run: npm run verify:contrast
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const CSS = readFileSync(join(__dirname, "..", "app", "globals.css"), "utf8");

function block(re: RegExp): Record<string, string> {
  const m = CSS.match(re);
  if (!m) throw new Error(`token block not found: ${re}`);
  const out: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const t = line.match(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/);
    if (t) out[t[1]] = t[2];
  }
  return out;
}

const light = block(/@theme\s*\{([\s\S]*?)\n\}/);
const dark = block(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/);

function srgb(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * srgb((n >> 16) & 255) +
    0.7152 * srgb((n >> 8) & 255) +
    0.0722 * srgb(n & 255)
  );
}

function ratio(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** [foreground, background, minimum, what it is] */
const PAIRS: [string, string, number, string][] = [
  ["ink", "surface", 4.5, "body text on page"],
  ["ink", "raised", 4.5, "body text on raised surface"],
  ["muted", "surface", 4.5, "secondary text on page"],
  ["muted", "raised", 4.5, "secondary text on raised surface"],
  ["accent", "surface", 4.5, "accent text / links on page"],
  ["accent", "raised", 4.5, "accent text on raised surface"],
  ["line", "surface", 1.2, "hairline separators (decorative, not UI state)"],
  // The calendar's one filled state: the selected day, and the "now" pill on
  // the day rail. Both put surface-coloured text on an accent fill, which is
  // the only place in the site where accent is a background rather than a
  // foreground — and so the only pair the list above did not already cover.
  ["surface", "accent", 4.5, "selected day / now marker — text on accent fill"],
  ["ink", "match", 4.5, "highlighted match text"],
  ["focus", "surface", 3, "focus ring against page"],
  ["focus", "raised", 3, "focus ring against raised surface"],
];

let failures = 0;

for (const [mode, tokens] of [
  ["light", light],
  ["dark", dark],
] as const) {
  console.log(`\n${mode}`);
  for (const [fg, bg, min, what] of PAIRS) {
    const a = tokens[fg];
    const b = tokens[bg];
    if (!a || !b) {
      console.error(`  ✗ missing token: --color-${!a ? fg : bg}`);
      failures++;
      continue;
    }
    const r = ratio(a, b);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(
      `  ${ok ? "✓" : "✗"} ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${fg} on ${bg} — ${what}`,
    );
  }
}

console.log(
  failures === 0
    ? "\nPASSED — every token pair meets its threshold in both modes."
    : `\nFAILED — ${failures} pair(s) below threshold.`,
);
process.exit(failures === 0 ? 0 : 1);
