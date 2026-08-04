/**
 * shoot.mjs — screenshot pass.
 *
 * "Before finishing any phase, look at a screenshot. A picture catches what a
 *  diff can't." — Appendix B
 *
 * Captures every route at desktop (1440×900) and mobile (390×844), in both
 * light and dark, plus a reduced-motion pass so the no-animation rendering is
 * checked rather than assumed.
 *
 * Usage: npm run build && npx next start -p 3200 &  →  node scripts/shoot.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:3200";
const OUT = join(process.cwd(), "screenshots");

const ROUTES = [
  ["home", "/"],
  ["projects", "/projects"],
  ["project-ipalo", "/projects/ipalo"],
  ["project-knight-finder", "/projects/knight-finder"],
  ["experience", "/experience"],
  ["experience-publix", "/experience/publix"],
  ["skills", "/skills"],
  ["about", "/about"],
  ["404", "/does-not-exist"],
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let shot = 0;
let failed = 0;

for (const [name, path] of ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const scheme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        colorScheme: scheme,
      });
      const page = await context.newPage();
      try {
        await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30_000 });
        await page.waitForTimeout(700);
        await page.screenshot({
          path: join(OUT, `${name}-${vp.name}-${scheme}.png`),
          fullPage: true,
        });
        shot++;
      } catch (err) {
        failed++;
        console.error(`  ✗ ${name} ${vp.name} ${scheme} — ${err.message}`);
      }
      await context.close();
    }
  }
}

// §4.3 — the reduced-motion rendering must be checked, not assumed.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const [name, path] of [
    ["home", "/"],
    ["experience", "/experience"],
    ["skills", "/skills"],
  ]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(OUT, `${name}-reduced-motion.png`), fullPage: true });
    shot++;
  }
  await context.close();
}

// The ⌘K palette, open.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(400);
  await page.keyboard.type("mcp");
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "palette-open.png") });
  shot++;
  await context.close();
}

// A live query on the homepage — the direction's whole argument.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.fill("#q", "tailwind");
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, "home-query-tailwind.png"), fullPage: true });
  shot++;
  await context.close();
}

await browser.close();
console.log(`${shot} screenshots written to screenshots/, ${failed} failed.`);
if (failed) process.exit(1);
