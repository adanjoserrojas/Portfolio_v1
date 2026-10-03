import "server-only";

export class ContactError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryAfter?: number,
  ) {
    super(message);
  }
}

export function unavailable(code: string): never {
  throw new ContactError(503, code, "The contact form is temporarily unavailable. Please try again later.");
}

export function allowedOrigin(request: Request): URL {
  const configured = process.env.CONTACT_ALLOWED_ORIGINS;
  const origins = configured?.split(",").map((origin) => origin.trim()).filter(Boolean) ??
    (process.env.NODE_ENV === "development" ? ["http://localhost:3000", "http://127.0.0.1:3000"] : []);
  if (!origins.length) unavailable("origin_not_configured");
  const origin = request.headers.get("origin");
  // Compare complete origins, never suffixes or client-controlled Host headers.
  if (!origin || !origins.includes(origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new ContactError(403, "origin_rejected", "This request is not allowed.");
  }
  try {
    const url = new URL(origin);
    if (url.origin !== origin || !["https:", "http:"].includes(url.protocol) ||
      (process.env.NODE_ENV === "production" && url.protocol !== "https:")) {
      unavailable("invalid_origin_configuration");
    }
    return url;
  } catch (error) {
    if (error instanceof ContactError) throw error;
    return unavailable("invalid_origin_configuration");
  }
}

export const MAX_CONTACT_BYTES = 32 * 1024;

export async function readContactBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json" ||
    ![null, "identity"].includes(request.headers.get("content-encoding"))) {
    throw new ContactError(415, "unsupported_content_type", "Send an uncompressed JSON request.");
  }
  const tooLarge = () => new ContactError(413, "body_too_large", "Your message is too large.");
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > MAX_CONTACT_BYTES) throw tooLarge();
  if (!request.body) throw new ContactError(400, "invalid_json", "Request body must contain valid JSON.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const deadline = Date.now() + 5000;
  try {
    while (true) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const next = await Promise.race([
        reader.read(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new ContactError(408, "body_timeout", "Request took too long.")),
            Math.max(0, deadline - Date.now()));
        }),
      ]).finally(() => clearTimeout(timer));
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_CONTACT_BYTES) throw tooLarge();
      chunks.push(next.value);
    }
    try {
      return JSON.parse(Buffer.concat(chunks, size).toString("utf8"));
    } catch {
      throw new ContactError(400, "invalid_json", "Request body must contain valid JSON.");
    }
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}

export function turnstileSecret(): string | undefined {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Local development may omit both keys. Production and partial setup fail closed.
  if (!secret && !siteKey && process.env.NODE_ENV === "development") return undefined;
  if (!secret || !siteKey) unavailable("turnstile_not_configured");
  // Cloudflare's public testing keys must never unlock production submissions.
  if (process.env.NODE_ENV === "production" &&
    (/^[123]x0{10}/.test(secret) || /^[123]x0{10}/.test(siteKey))) {
    unavailable("turnstile_test_key_in_production");
  }
  return secret;
}

export async function verifyTurnstile(token: string, hostname: string, secret: string): Promise<boolean> {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) return unavailable("turnstile_unavailable");
    const result: unknown = await response.json();
    if (!result || typeof result !== "object") return unavailable("turnstile_unavailable");
    const data = result as { success?: unknown; hostname?: unknown; action?: unknown };
    return data.success === true && data.hostname === hostname && data.action === "contact";
  } catch {
    return unavailable("turnstile_unavailable");
  }
}

export function globalDailyLimit(): number {
  const value = process.env.CONTACT_GLOBAL_DAILY_LIMIT ?? "100";
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    unavailable("invalid_global_limit");
  }
  return Number(value);
}
