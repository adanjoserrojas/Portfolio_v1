import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt, createRemoteJWKSet, jwtVerify } from "jose";
import { GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./aws";
export const origin = () => process.env.APP_ORIGIN || "http://localhost:3100";
export const issuer = () =>
  `https://cognito-idp.${process.env.BOARD_AWS_REGION || "us-east-1"}.amazonaws.com/${process.env.COGNITO_POOL_ID}`;
export const secure = () => origin().startsWith("https:");
export const sessionName = "buildlog-session";
export const hash = (v: string) => createHash("sha256").update(v).digest("hex");
export const random = () => randomBytes(32).toString("base64url");
const secret = () => {
  if (!process.env.SESSION_SECRET)
    throw new Error("SESSION_SECRET not configured");
  return createHash("sha256").update(process.env.SESSION_SECRET).digest();
};
export async function seal(payload: Record<string, unknown>) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .encrypt(secret());
}
export async function unseal(value: string) {
  return (await jwtDecrypt(value, secret())).payload;
}
let jwks: ReturnType<typeof createRemoteJWKSet>;
export async function verifyId(token: string, nonce?: string) {
  jwks ||= createRemoteJWKSet(new URL(`${issuer()}/.well-known/jwks.json`));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: issuer(),
    audience: process.env.COGNITO_CLIENT_ID,
    algorithms: ["RS256"],
  });
  if (
    payload.token_use !== "id" ||
    (nonce && payload.nonce !== nonce) ||
    !Array.isArray(payload["cognito:groups"]) ||
    !payload["cognito:groups"].includes("admin")
  )
    throw new Error("Not authorized");
  return payload;
}
export type Session = {
  pk: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  ttl: number;
  email: string;
  sub: string;
};
export async function session(): Promise<Session | null> {
  const sid = (await cookies()).get(sessionName)?.value;
  if (!sid) return null;
  const { Item } = await db.send(
    new GetCommand({
      TableName: process.env.SESSION_TABLE,
      Key: { pk: hash(sid) },
      ConsistentRead: true,
    }),
  );
  if (!Item || Item.ttl <= Date.now() / 1000) return null;
  const value = Item as Session;
  if (value.expiresAt <= Date.now() / 1000 + 30) {
    const res = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.COGNITO_CLIENT_ID!,
        refresh_token: value.refreshToken,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const tokens = await res.json();
    await verifyId(tokens.id_token);
    value.accessToken = tokens.access_token;
    value.expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;
    await db.send(
      new PutCommand({ TableName: process.env.SESSION_TABLE, Item: value }),
    );
  }
  return value;
}
export async function destroySession() {
  const sid = (await cookies()).get(sessionName)?.value;
  if (sid)
    await db.send(
      new DeleteCommand({
        TableName: process.env.SESSION_TABLE,
        Key: { pk: hash(sid) },
      }),
    );
}
export function validOrigin(request: Request) {
  return request.headers.get("origin") === origin();
}
