import { getUserById, type GetUserByIdData } from "@dataconnect/generated";
import { dc } from "./dataconnect";
import { readSession, clearSessionCookie } from "./session";
import { ApiError } from "./api";

/** The authenticated user, as returned by `GetUserById`. */
export type SessionUser = NonNullable<GetUserByIdData["user"]>;

/**
 * Resolves the current user from the session cookie. The role is read fresh
 * from the DB on every call, so a promotion/demotion or account deletion
 * takes effect on the very next request. Returns null when unauthenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await readSession();
  if (!session) return null;
  const { data } = await getUserById(dc, { id: session.userId });
  return data.user ?? null;
}

/** Requires a valid session; throws 401 otherwise. Clears a stale cookie
 *  (valid JWT but the user row is gone). */
export async function requireAuth(): Promise<SessionUser> {
  const session = await readSession();
  if (!session) {
    throw new ApiError(401, "Not authenticated", "unauthorized");
  }
  const { data } = await getUserById(dc, { id: session.userId });
  if (!data.user) {
    await clearSessionCookie().catch(() => {});
    throw new ApiError(401, "Session is no longer valid", "unauthorized");
  }
  return data.user;
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
