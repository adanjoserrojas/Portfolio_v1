import assert from "node:assert/strict";

// Run against next dev, where asset filenames are reused after source edits.
const origin = process.argv[2] || "http://localhost:3000";
const page = await fetch(new URL("/board", origin));
assert.equal(page.status, 200, "The development board must be available");
const html = await page.text();
const assets = [...new Set(
  [...html.matchAll(new RegExp('(?:src|href)="([^"<>]*/_next/static/[^"<>]+)"', "g"))]
    .map((match) => match[1].replaceAll("&amp;", "&"))
    .filter((asset) => /\.(?:js|css)(?:\?|$)/.test(asset)),
)];
assert.ok(assets.length > 0, "Check the actual scripts and styles rendered by Next.js");
await Promise.all(assets.map(async (asset) => {
  const url = new URL(asset, origin);
  assert.equal(url.origin, new URL(origin).origin, "Only inspect this development server");
  const response = await fetch(url, { method: "HEAD" });
  assert.equal(response.status, 200, url.pathname);
  const policy = response.headers.get("cache-control") || "";
  assert.ok(
    /\bno-store\b|\bno-cache\b/.test(policy) &&
      !/\bimmutable\b|(?:^|[,\s])(?:s-maxage|max-age)=[1-9]\d*/.test(policy),
    `Development asset must not retain an old UI: ${url.pathname} (Cache-Control: ${policy})`,
  );
}));
console.log(`PASS: ${assets.length} development JavaScript/CSS assets cannot retain stale UI code.`);
