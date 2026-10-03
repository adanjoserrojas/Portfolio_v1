import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { handleContact, type ContactDependencies } from "../lib/contact/handler";
import { ContactError, MAX_CONTACT_BYTES, readContactBody, verifyTurnstile } from "../lib/contact/security";
import { getHashedIp } from "../lib/visitorIdentity";
import { checkRateLimit } from "../lib/rateLimit";
import { ddb } from "../lib/dynamo/dynamo";

const initialEnv = { ...process.env };
const fields = { name: "Visitor", contact: "visitor@example.com", message: "A private inquiry", turnstileToken: "valid-token" };
let events: string[] = [];

beforeEach(() => {
  Object.assign(process.env, {
    NODE_ENV: "production",
    CONTACT_ALLOWED_ORIGINS: "https://portfolio.example",
    CONTACT_FORM_ENABLED: "true",
    CONTACT_GLOBAL_DAILY_LIMIT: "100",
    CONTACT_TOPIC_ARN: "arn:aws:sns:us-east-1:123456789012:contact",
    CONTACT_TABLE_NAME: "ContactMessages",
    TURNSTILE_SECRET_KEY: "private-challenge-secret",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "public-challenge-key",
    RATE_LIMIT_SECRET: "test-only-hmac-secret",
    VERCEL: "1",
  });
  delete process.env.CONTACT_TRUSTED_IP_HEADER;
  events = [];
  mock.method(console, "info", (entry: string) => events.push(entry));
  mock.method(console, "error", (entry: string) => events.push(entry));
});

afterEach(() => {
  mock.restoreAll();
  for (const key of Object.keys(process.env)) if (!(key in initialEnv)) delete process.env[key];
  Object.assign(process.env, initialEnv);
});

function request(body: unknown = fields, headers: Record<string, string> = {}) {
  return new Request("https://portfolio.example/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://portfolio.example", ...headers },
    body: JSON.stringify(body),
  });
}

function fixture(overrides: Partial<ContactDependencies> = {}) {
  const calls: string[] = [];
  const deps: ContactDependencies = {
    hashedIp: () => { calls.push("ip"); return "hashed-ip"; },
    visitorId: async () => { calls.push("visitor"); return "hashed-visitor"; },
    limit: async (key) => { calls.push(key); return true; },
    verify: async () => { calls.push("verify"); return true; },
    publish: async (data, topic) => {
      calls.push("publish");
      assert.deepEqual(data, { name: fields.name, contact: fields.contact, message: fields.message });
      assert.equal(topic, process.env.CONTACT_TOPIC_ARN);
    },
    ...overrides,
  };
  return { deps, calls };
}

test("only a validated request publishes; client recipient fields are ignored", async () => {
  const { deps, calls } = fixture();
  const response = await handleContact(request({ ...fields, TopicArn: "attacker-topic", recipient: "other@example.com" }), deps);
  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["ip", "IP_BURST#hashed-ip", "IP#hashed-ip", "verify", "visitor", "VISITOR#hashed-visitor", "GLOBAL#CONTACT", "publish"]);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok(response.headers.get("x-request-id"));
  assert.equal((await response.json()).success, true);
});

for (const origin of ["https://portfolio.example.attacker.com", "https://attacker.example", "null", ""]) {
  test(`rejects untrusted or missing origin: ${origin}`, async () => {
    const { deps, calls } = fixture();
    assert.equal((await handleContact(request(fields, { Origin: origin }), deps)).status, 403);
    assert.deepEqual(calls, []);
  });
}

test("rejects cross-site fetch metadata even with an allowed origin", async () => {
  const { deps, calls } = fixture();
  assert.equal((await handleContact(request(fields, { "Sec-Fetch-Site": "cross-site" }), deps)).status, 403);
  assert.deepEqual(calls, []);
});

test("kill switch rejects before parsing or calling dependencies", async () => {
  process.env.CONTACT_FORM_ENABLED = "false";
  const { deps, calls } = fixture();
  assert.equal((await handleContact(request(), deps)).status, 503);
  assert.deepEqual(calls, []);
});

const unsupportedHeaders: Record<string, string>[] = [{ "Content-Type": "text/plain" }, { "Content-Encoding": "gzip" }];
for (const header of unsupportedHeaders) {
  test(`rejects unsupported request encoding ${JSON.stringify(header)}`, async () => {
    const { deps, calls } = fixture();
    assert.equal((await handleContact(request(fields, header), deps)).status, 415);
    assert.deepEqual(calls, []);
  });
}

test("rejects malformed JSON and overlong fields before database writes", async () => {
  const { deps, calls } = fixture();
  const malformed = new Request("https://portfolio.example/api/contact", {
    method: "POST", headers: { Origin: "https://portfolio.example", "Content-Type": "application/json" }, body: "{",
  });
  assert.equal((await handleContact(malformed, deps)).status, 400);
  assert.equal((await handleContact(request({ ...fields, message: "x".repeat(1601) }), deps)).status, 400);
  assert.equal((await handleContact(request({ ...fields, contact: "invalid" }), deps)).status, 400);
  assert.deepEqual(calls, []);
});

test("limits actual streamed bytes even when Content-Length lies", async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) { controller.enqueue(new Uint8Array(20000)); },
    cancel() { cancelled = true; },
  });
  const init: RequestInit & { duplex: string } = {
    method: "POST", duplex: "half", body: stream,
    headers: { "Content-Type": "application/json", "Content-Length": "1", Origin: "https://portfolio.example" },
  };
  const { deps, calls } = fixture();
  assert.equal((await handleContact(new Request("https://portfolio.example/api/contact", init), deps)).status, 413);
  assert.equal(cancelled, true);
  assert.deepEqual(calls, []);
});

test("enforces the byte limit on multibyte input without Content-Length", async () => {
  await assert.rejects(readContactBody(request({ message: "😀".repeat(MAX_CONTACT_BYTES / 4) })),
    (error: unknown) => error instanceof ContactError && error.status === 413);
});

test("slow request bodies time out and are cancelled", async () => {
  let cancelled = false;
  const init: RequestInit & { duplex: string } = {
    method: "POST", duplex: "half", headers: { "Content-Type": "application/json" },
    body: new ReadableStream({ cancel() { cancelled = true; } }),
  };
  await assert.rejects(readContactBody(new Request("https://portfolio.example/api/contact", init)),
    (error: unknown) => error instanceof ContactError && error.status === 408);
  assert.equal(cancelled, true);
});

test("invalid global limits fail closed before external work", async () => {
  process.env.CONTACT_GLOBAL_DAILY_LIMIT = "NaN";
  const { deps, calls } = fixture();
  assert.equal((await handleContact(request(), deps)).status, 503);
  assert.deepEqual(calls, []);
});

test("global budget prevents additional publishes", async () => {
  process.env.CONTACT_GLOBAL_DAILY_LIMIT = "2";
  const counts = new Map<string, number>();
  const { deps, calls } = fixture({ limit: async (key, maximum) => {
    const count = counts.get(key) ?? 0;
    if (count >= maximum) return false;
    counts.set(key, count + 1);
    return true;
  } });
  assert.equal((await handleContact(request(), deps)).status, 200);
  assert.equal((await handleContact(request(), deps)).status, 200);
  assert.equal((await handleContact(request(), deps)).status, 429);
  assert.equal(calls.filter((call) => call === "publish").length, 2);
});

test("honeypot submissions are discarded without database or SNS calls", async () => {
  const { deps, calls } = fixture();
  assert.equal((await handleContact(request({ ...fields, website: "spam.example" }), deps)).status, 200);
  assert.deepEqual(calls, []);
});

for (const missing of ["CONTACT_ALLOWED_ORIGINS", "TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "CONTACT_TOPIC_ARN"]) {
  test(`production fails closed without ${missing}`, async () => {
    delete process.env[missing];
    const { deps, calls } = fixture();
    assert.equal((await handleContact(request(), deps)).status, 503);
    assert.deepEqual(calls, []);
  });
}

test("rejects public Turnstile testing keys in production", async () => {
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
  const { deps, calls } = fixture();
  assert.equal((await handleContact(request(), deps)).status, 503);
  assert.deepEqual(calls, []);
});

test("missing token rejects before counters; invalid token never publishes or creates visitor counters", async () => {
  const { deps, calls } = fixture({ verify: async () => false });
  assert.equal((await handleContact(request({ ...fields, turnstileToken: "" }), deps)).status, 403);
  assert.deepEqual(calls, []);
  assert.equal((await handleContact(request(), deps)).status, 403);
  assert.deepEqual(calls, ["ip", "IP_BURST#hashed-ip", "IP#hashed-ip"]);
});

for (const denied of ["IP_BURST#hashed-ip", "IP#hashed-ip", "VISITOR#hashed-visitor", "GLOBAL#CONTACT"]) {
  test(`stops at the exhausted ${denied} counter`, async () => {
    const { deps, calls } = fixture({ limit: async (key) => key !== denied });
    const response = await handleContact(request(), deps);
    assert.equal(response.status, 429);
    assert.ok(Number(response.headers.get("retry-after")) > 0);
    assert.ok(!calls.includes("publish"));
    if (denied.startsWith("IP")) assert.ok(!calls.includes("visitor") && !calls.includes("verify"));
  });
}

test("database outages fail closed", async () => {
  const { deps, calls } = fixture({ limit: async () => { throw new Error("database unavailable"); } });
  assert.equal((await handleContact(request(), deps)).status, 503);
  assert.deepEqual(calls, ["ip"]);
});

test("SNS failure returns a generic error and logs no message, credentials or AWS error text", async () => {
  const { deps } = fixture({ publish: async () => { throw new Error("secret AWS credential details"); } });
  const response = await handleContact(request(), deps);
  assert.equal(response.status, 503);
  const allOutput = `${await response.text()} ${events.join(" ")}`;
  for (const secret of [fields.message, fields.contact, fields.turnstileToken, "secret AWS credential details", "private-challenge-secret"]) {
    assert.ok(!allOutput.includes(secret));
  }
});

test("Siteverify requires success, matching hostname and contact action", async () => {
  for (const result of [
    { success: false },
    { success: true, hostname: "attacker.example", action: "contact" },
    { success: true, hostname: "portfolio.example", action: "login" },
    { success: true, hostname: "portfolio.example", action: "contact" },
  ]) {
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json(result));
    assert.equal(await verifyTurnstile("token", "portfolio.example", "secret"), result.success && result.hostname === "portfolio.example" && result.action === "contact");
    fetchMock.mock.restore();
  }
});

test("Siteverify outage rejects instead of allowing submissions", async () => {
  mock.method(globalThis, "fetch", async () => { throw new Error("timeout"); });
  await assert.rejects(verifyTurnstile("token", "portfolio.example", "secret"),
    (error: unknown) => error instanceof ContactError && error.status === 503);
});

test("Vercel IP ignores spoofed fallback headers and refuses missing trusted IP", () => {
  const first = getHashedIp(request(fields, { "x-vercel-forwarded-for": "203.0.113.1", "x-forwarded-for": "198.51.100.1" }));
  const second = getHashedIp(request(fields, { "x-vercel-forwarded-for": "203.0.113.1", "x-forwarded-for": "198.51.100.2" }));
  assert.equal(first, second);
  assert.throws(() => getHashedIp(request(fields, { "x-forwarded-for": "198.51.100.1" })), ContactError);
  assert.throws(() => getHashedIp(request(fields, { "x-vercel-forwarded-for": "invalid" })), ContactError);
});

test("local development ignores spoofed IPs; unknown production proxies fail closed", () => {
  delete process.env.VERCEL;
  assert.throws(() => getHashedIp(request()), ContactError);
  Object.assign(process.env, { NODE_ENV: "development" });
  assert.equal(getHashedIp(request()), getHashedIp(request(fields, { "x-forwarded-for": "198.51.100.9" })));
});

test("local development can omit both challenge keys", async () => {
  Object.assign(process.env, { NODE_ENV: "development" });
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const { deps, calls } = fixture();
  assert.equal((await handleContact(request({ ...fields, turnstileToken: "" }), deps)).status, 200);
  assert.ok(!calls.includes("verify"));
});

test("daily counters preserve their keys and receive numeric TTL after their window", async () => {
  mock.method(Date, "now", () => Date.parse("2026-10-03T12:00:00Z"));
  const send = mock.method(ddb, "send", async () => ({}));
  assert.equal(await checkRateLimit("IP#hash", 20), true);
  const command = send.mock.calls[0].arguments[0];
  assert.ok(command instanceof UpdateCommand);
  assert.deepEqual(command.input.Key, { PK: "RATE#IP#hash#2026-10-03", SK: "DATE#2026-10-03" });
  assert.equal(command.input.ExpressionAttributeValues?.[":expiresAt"], Date.parse("2026-10-11T00:00:00Z") / 1000);
  assert.match(command.input.ConditionExpression ?? "", /#count < :limit/);
});

test("conditional counter rejection is a limit; infrastructure failures propagate", async () => {
  const send = mock.method(ddb, "send", async () => {
    throw new ConditionalCheckFailedException({ message: "limit", $metadata: {} });
  });
  assert.equal(await checkRateLimit("IP#hash", 20), false);
  send.mock.restore();
  mock.method(ddb, "send", async () => { throw new Error("offline"); });
  await assert.rejects(checkRateLimit("IP#hash", 20), /offline/);
});

test("minute counters change at the window boundary and expire after their window", async () => {
  const now = mock.method(Date, "now", () => Date.parse("2026-10-03T12:00:59Z"));
  const send = mock.method(ddb, "send", async () => ({}));
  await checkRateLimit("IP_BURST#hash", 3, 60);
  now.mock.mockImplementation(() => Date.parse("2026-10-03T12:01:00Z"));
  await checkRateLimit("IP_BURST#hash", 3, 60);
  const first = send.mock.calls[0].arguments[0];
  const second = send.mock.calls[1].arguments[0];
  assert.ok(first instanceof UpdateCommand && second instanceof UpdateCommand);
  assert.notEqual(first.input.Key?.PK, second.input.Key?.PK);
  assert.equal(first.input.ExpressionAttributeValues?.[":expiresAt"], Date.parse("2026-10-10T12:01:00Z") / 1000);
});
