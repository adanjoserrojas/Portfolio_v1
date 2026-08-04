/**
 * shoot.mjs — Phase 2 screenshot pass (§3.4).
 *
 * Captures each prototype at desktop (1440×900) and mobile (390×844), in both
 * light and dark, and writes design-lab/vN-{desktop,mobile}-{light,dark}.png.
 *
 * "Before finishing any phase, look at a screenshot. A picture catches what a
 *  diff can't." — Appendix B
 *
 * Usage:
 *   npm run build && npm start &      # or: next dev
 *   node scripts/shoot.mjs [baseURL]
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const OUT = join(process.cwd(), "design-lab");

const DIRECTIONS = ["v1", "v2", "v3", "v4", "v5", "v6"];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const SCHEMES = ["light", "dark"];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let shot = 0;
let failed = 0;

for (const v of DIRECTIONS) {
  for (const vp of VIEWPORTS) {
    for (const scheme of SCHEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        colorScheme: scheme,
        // Screenshots must show the reduced-motion-safe rendering too, but
        // the default pass captures normal motion so entrances are visible.
        reducedMotion: "no-preference",
      });
      const page = await context.newPage();

      try {
        await page.goto(`${BASE}/lab/${v}`, { waitUntil: "networkidle", timeout: 30_000 });
        // Let next/font swap in and any entrance settle.
        await page.waitForTimeout(600);
        await page.screenshot({
          path: join(OUT, `${v}-${vp.name}-${scheme}.png`),
          fullPage: false,
        });
        // Full-page too — the fold hides most of the content on mobile.
        await page.screenshot({
          path: join(OUT, `${v}-${vp.name}-${scheme}-full.png`),
          fullPage: true,
        });
        shot += 2;
        console.log(`  ✓ ${v} ${vp.name} ${scheme}`);
      } catch (err) {
        failed++;
        console.error(`  ✗ ${v} ${vp.name} ${scheme} — ${err.message}`);
      }

      await context.close();
    }
  }
}

await browser.close();
console.log(`\n${shot} screenshots written to design-lab/, ${failed} failed.`);
if (failed) process.exit(1);
