import { NextResponse } from "next/server";
import {
  destroySession,
  origin,
  validOrigin,
  sessionName,
  session,
} from "@/lib/project-dashboard/auth";
export async function POST(request: Request) {
  if (!validOrigin(request)) return new Response("Forbidden", { status: 403 });
  const current = await session();
  await destroySession();
  if (current)
    await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.COGNITO_CLIENT_ID!,
        token: current.refreshToken,
      }),
    }).catch(() => {});
  const url = new URL(`${process.env.COGNITO_DOMAIN}/logout`);
  url.search = new URLSearchParams({
    client_id: process.env.COGNITO_CLIENT_ID!,
    logout_uri: `${origin()}/login`,
  }).toString();
  const response = NextResponse.redirect(url, 303);
  response.cookies.set(sessionName, "", { path: "/", maxAge: 0 });
  return response;
}
