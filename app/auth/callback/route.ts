import { NextRequest, NextResponse } from "next/server";
import {
  unseal,
  verifyId,
  random,
  hash,
  origin,
  secure,
  sessionName,
} from "@/lib/project-dashboard/auth";
import { db } from "@/lib/project-dashboard/aws";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
export async function GET(request: NextRequest) {
  try {
    const flow = await unseal(
      request.cookies.get("buildlog-flow")?.value || "",
    );
    if (flow.state !== request.nextUrl.searchParams.get("state"))
      throw new Error("Invalid login state");
    const code = request.nextUrl.searchParams.get("code");
    if (!code) throw new Error("Missing code");
    const res = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.COGNITO_CLIENT_ID!,
        code,
        redirect_uri: `${origin()}/auth/callback`,
        code_verifier: String(flow.verifier),
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Login failed");
    const tokens = await res.json();
    const user = await verifyId(tokens.id_token, String(flow.nonce));
    const sid = random(),
      now = Math.floor(Date.now() / 1000);
    await db.send(
      new PutCommand({
        TableName: process.env.SESSION_TABLE,
        Item: {
          pk: hash(sid),
          sub: user.sub,
          email: user.email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: now + tokens.expires_in,
          ttl: now + 28800,
        },
      }),
    );
    const response = NextResponse.redirect(`${origin()}/admin`);
    response.cookies.set(sessionName, sid, {
      httpOnly: true,
      secure: secure(),
      sameSite: "lax",
      maxAge: 28800,
      path: "/",
    });
    response.cookies.set("buildlog-flow", "", { path: "/auth", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.redirect(`${origin()}/login?error=1`);
  }
}
