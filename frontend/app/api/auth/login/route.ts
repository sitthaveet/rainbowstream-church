import { NextRequest, NextResponse } from "next/server";
import {
  getUserByLineId,
  getUserById,
  createUser,
} from "@dataconnect/generated";
import { dc } from "@/lib/dataconnect";
import { ApiError, handleRoute, parseBody, isUniqueViolation } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { verifyLineIdToken } from "@/lib/line";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

/**
 * POST /api/auth/login
 * Verifies a LINE ID token, resolves (or auto-creates) the account, and
 * issues a session cookie. Returns the full user plus a `registered` flag.
 */
export const POST = handleRoute(async (req: NextRequest) => {
  const { idToken } = await parseBody(req, loginSchema);
  const { sub: lineId } = await verifyLineIdToken(idToken);

  // Resolve, or auto-create on first login.
  let userId: string;
  const existing = await getUserByLineId(dc, { lineId });
  if (existing.data.users.length > 0) {
    userId = existing.data.users[0].id;
  } else {
    try {
      const created = await createUser(dc, { lineId });
      userId = created.data.user_insert.id;
    } catch (err) {
      // Concurrent first-login: LIFF init can double-fire, so a second
      // createUser hits the line_id UNIQUE constraint. Fall back to the row
      // the winning request just inserted.
      if (!isUniqueViolation(err, "line_id")) throw err;
      const retry = await getUserByLineId(dc, { lineId });
      const row = retry.data.users[0];
      if (!row) throw err;
      userId = row.id;
    }
  }

  // createUser returns only { id } — fetch the full user for the response.
  const { data } = await getUserById(dc, { id: userId });
  const user = data.user;
  if (!user) throw new ApiError(500, "User not found after login");

  await setSessionCookie({ userId: user.id, lineId });

  return NextResponse.json({ user, registered: user.firstName != null });
});
