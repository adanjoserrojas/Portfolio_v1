import assert from "node:assert/strict";
const origin = process.argv[2] || "http://localhost:3000";
const response = await fetch(`${origin}/api/board`);
assert.equal(
  response.status,
  200,
  "Public board must load in the normal development server",
);
const board = await response.json();
assert.ok(
  Array.isArray(board.projects),
  "Board response must contain projects",
);
assert.ok(
  board.projects.every(
    (p) => !("privateNotes" in p) && !("visible" in p) && !("archived" in p),
  ),
  "Private fields must not be exposed",
);
const page = await fetch(`${origin}/board`);
assert.equal(page.status, 200);
assert.ok(
  (await page.text()).includes("From idea to shipped."),
  "Board page must render instead of its unavailable state",
);
const privatePage = await fetch(`${origin}/admin`, { redirect: "manual" });
assert.ok(
  [302, 303, 307, 308].includes(privatePage.status),
  "Anonymous admin access must redirect",
);
assert.equal(
  new URL(privatePage.headers.get("location"), origin).pathname,
  "/login",
);
const login = await fetch(`${origin}/auth/login`, { redirect: "manual" });
assert.ok(
  [302, 303, 307, 308].includes(login.status),
  "Login must reach Cognito",
);
const destination = new URL(login.headers.get("location"));
assert.equal(
  destination.searchParams.get("redirect_uri"),
  `${origin}/auth/callback`,
  "Login must return to this development server",
);
const cognito = await fetch(destination);
assert.equal(
  cognito.status,
  200,
  "Cognito must accept the configured callback",
);
assert.ok(
  !/redirect_mismatch|invalid_request/.test(await cognito.text()),
  "Cognito must accept the login request",
);
console.log(
  `PASS: ${origin}: board renders (${board.projects.length} projects), private fields excluded, admin protected, Cognito callback accepted.`,
);
