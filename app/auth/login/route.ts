import { NextResponse } from "next/server";
import { random, seal, secure, origin } from "@/lib/project-dashboard/auth";
import { createHash } from "node:crypto";
export async function GET() {
  const state = random(),
    nonce = random(),
    verifier = random();
  const url = new URL(`${process.env.COGNITO_DOMAIN}/oauth2/authorize`);
  url.search = new URLSearchParams({
    client_id: process.env.COGNITO_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${origin()}/auth/callback`,
    scope: "openid email profile board/read board/write",
    state,
    nonce,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
  }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set(
    "buildlog-flow",
    await seal({ state, nonce, verifier }),
    {
      httpOnly: true,
      secure: secure(),
      sameSite: "lax",
      maxAge: 600,
      path: "/auth",
    },
  );
  return response;
}
