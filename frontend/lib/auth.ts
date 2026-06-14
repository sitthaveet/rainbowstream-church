import type { User } from "./types";
import { getUserById } from "./db";
import { readSession, clearSessionCookie } from "./session";
import { ApiError } from "./api";

/** The authenticated user. */
export type SessionUser = User;

/**
 * Resolves the current user from the session cookie. The role is read fresh
 * from the DB on every call, so a promotion/demotion or account deletion
 * takes effect on the very next request. Returns null when unauthenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await readSession();
  if (!session) return null;
  return getUserById(session.userId);
}

/** Requires a valid session; throws 401 otherwise. Clears a stale cookie
 *  (valid JWT but the user row is gone). */
export async function requireAuth(): Promise<SessionUser> {
  const session = await readSession();
  if (!session) {
    throw new ApiError(401, "Not authenticated", "unauthorized");
  }
  const user = await getUserById(session.userId);
  if (!user) {
    await clearSessionCookie().catch(() => {});
    throw new ApiError(401, "Session is no longer valid", "unauthorized");
  }
  return user;
}

/** Requires the caller to be a pastor; throws 401/403 otherwise. */
export async function requirePastor(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "pastor") {
    throw new ApiError(403, "Pastor role required", "forbidden");
  }
  return user;
}

/** Requires the caller to be the user `id` themselves, or a pastor. */
export async function requireSelfOrPastor(id: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.id !== id && user.role !== "pastor") {
    throw new ApiError(403, "Not allowed to access this resource", "forbidden");
  }
  return user;
}
