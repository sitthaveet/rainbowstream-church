import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "rsc_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Claims stored in the session cookie. Role is intentionally NOT stored — it
 *  is loaded fresh from the DB per request so changes take effect immediately. */
export interface SessionPayload {
  userId: string;
  lineId: string;
}

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(value);
}

async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, lineId: payload.lineId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.userId === "string" &&
      typeof payload.lineId === "string"
    ) {
      return { userId: payload.userId, lineId: payload.lineId };
    }
    return null;
  } catch {
    return null;
  }
}

/** Reads + verifies the session cookie. Returns null when absent or invalid. */
export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Issues a fresh signed session cookie (call from auth/login). */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    // LIFF runs inside LINE's in-app webview, where calls to our API can be a
    // cross-site context; SameSite=Lax would drop the cookie there and break
    // auth. SameSite=None keeps the session working, and browsers require
    // Secure alongside it. (localhost is a secure context, so http dev works.)
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Removes the session cookie (logout, or a stale cookie). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
