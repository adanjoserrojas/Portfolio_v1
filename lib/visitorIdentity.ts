import "server-only";

import { cookies } from "next/headers";
import { createHmac, randomUUID } from "node:crypto";

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

  if (!visitorId) {
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
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for");

  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  return hashIdentifier(ip, "ip");
}