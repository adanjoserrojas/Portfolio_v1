import "server-only";

import { cookies } from "next/headers";
import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { unavailable } from "@/lib/contact/security";

const VISITOR_COOKIE = "visitor_id";

function hashIdentifier(value: string, type: "visitor" | "ip") {
  const secret = process.env.RATE_LIMIT_SECRET;

  if (!secret) {
    throw new Error("RATE_LIMIT_SECRET is not configured");
  }

  return createHmac("sha256", secret)
    .update(`${type}:${value}`)
    .digest("hex");
}

export async function getHashedVisitorId() {
  const cookieStore = await cookies();

  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;

  if (!visitorId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId)) {
    visitorId = randomUUID();

    cookieStore.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return hashIdentifier(visitorId, "visitor");
}

export function getHashedIp(request: Request) {
  // Local requests share a bucket; arbitrary headers can't select a new IP.
  if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") {
    return hashIdentifier("127.0.0.1", "ip");
  }
  const header = process.env.VERCEL === "1"
    ? "x-vercel-forwarded-for"
    : process.env.CONTACT_TRUSTED_IP_HEADER;
  if (!header || !["x-vercel-forwarded-for", "x-forwarded-for", "x-real-ip"].includes(header)) {
    return unavailable("ip_proxy_not_configured");
  }
  const raw = request.headers.get(header)?.split(",")[0]?.trim();
  if (!raw || !isIP(raw)) return unavailable("ip_unavailable");
  const ip = isIP(raw) === 6 ? new URL(`http://[${raw}]/`).hostname : raw;
  return hashIdentifier(ip, "ip");
}
