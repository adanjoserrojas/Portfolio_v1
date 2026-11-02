import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ContactSchema } from "@/lib/contactSchema";
import {
  allowedOrigin, ContactError, globalDailyLimit, readContactBody, turnstileSecret, unavailable,
} from "./security";

const SubmissionSchema = ContactSchema.extend({
  website: z.string().max(500).optional().default(""),
  turnstileToken: z.string().max(2048).optional().default(""),
});

type ContactMessage = z.infer<typeof ContactSchema>;
export type ContactDependencies = {
  hashedIp: (request: Request) => string;
  visitorId: () => Promise<string>;
  limit: (identifier: string, maximum: number, windowSeconds?: number) => Promise<boolean>;
  verify: (token: string, hostname: string, secret: string) => Promise<boolean>;
  publish: (message: ContactMessage, topicArn: string) => Promise<void>;
};

export async function handleContact(request: Request, deps: ContactDependencies): Promise<Response> {
  const requestId = randomUUID();
  const started = Date.now();
  let stage = "request";
  function reply(status: number, outcome: string, error?: string, retryAfter?: number) {
    // No submitted text, addresses, cookies, tokens, raw IPs, or AWS error messages.
    const entry = JSON.stringify({ event: "contact_submission", requestId, status, outcome, durationMs: Date.now() - started });
    if (status >= 500) console.error(entry);
    else console.info(entry);
    return Response.json({ success: status === 200, ...(error ? { error } : {}), requestId }, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
        ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
      },
    });
  }
  async function enforce(identifier: string, maximum: number, seconds = 86400) {
    stage = "rate_limit";
    if (!await deps.limit(identifier, maximum, seconds)) {
      const retryAfter = seconds - (Math.floor(Date.now() / 1000) % seconds);
      throw new ContactError(429, identifier.startsWith("GLOBAL#") ? "global_limit" : "rate_limited",
        "Too many messages. Please try again later.", retryAfter);
    }
  }

  try {
    if (process.env.CONTACT_FORM_ENABLED === "false") unavailable("disabled");
    const origin = allowedOrigin(request);
    const parsed = SubmissionSchema.safeParse(await readContactBody(request));
    if (!parsed.success) throw new ContactError(400, "invalid_fields", "Check your name, email address, and message.");
    if (parsed.data.website) return reply(200, "honeypot");

    const secret = turnstileSecret();
    const globalLimit = globalDailyLimit();
    const topicArn = process.env.CONTACT_TOPIC_ARN;
    if (!topicArn) unavailable("topic_not_configured");
    if (secret && !parsed.data.turnstileToken) {
      throw new ContactError(403, "verification_required", "Please complete the security check and try again.");
    }

    const ip = deps.hashedIp(request);
    // Bound challenge requests and rotating-cookie writes before visitor counters.
    await enforce(`IP_BURST#${ip}`, 3, 60);
    await enforce(`IP#${ip}`, 20);
    stage = "verification";
    if (secret && !await deps.verify(parsed.data.turnstileToken, origin.hostname, secret)) {
      throw new ContactError(403, "verification_failed", "Please complete a new security check and try again.");
    }
    await enforce(`VISITOR#${await deps.visitorId()}`, 10);
    await enforce("GLOBAL#CONTACT", globalLimit);
    const { name, contact, message } = parsed.data;
    stage = "publish";
    await deps.publish({ name, contact, message }, topicArn);
    return reply(200, "published");
  } catch (error) {
    if (error instanceof ContactError) return reply(error.status, error.code, error.message, error.retryAfter);
    return reply(503, `${stage}_failure`, "Could not send your message. Please try again later.");
  }
}
