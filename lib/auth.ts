import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getAdminAuthSecrets } from "./env";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  login: string;
  exp: number;
};

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function sign(payloadB64: string): string {
  const { adminPassword } = getAdminAuthSecrets();
  return createHmac("sha256", adminPassword)
    .update(payloadB64)
    .digest("base64url");
}

export function verifyCredentials(login: string, password: string): boolean {
  const secrets = getAdminAuthSecrets();
  return (
    safeEqual(login, secrets.adminLogin) &&
    safeEqual(password, secrets.adminPassword)
  );
}

export function createSessionToken(login: string): string {
  const payload: SessionPayload = {
    login,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (
      typeof payload.login !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }
    const { adminLogin } = getAdminAuthSecrets();
    if (!safeEqual(payload.login, adminLogin)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdminSession(): Promise<SessionPayload | null> {
  return getAdminSession();
}

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSec,
  };
}
