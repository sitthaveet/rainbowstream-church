import { NextRequest, NextResponse } from "next/server";
import { getUserByLineUid, createUser } from "@/lib/db";
import { handleRoute, parseBody, isUniqueViolation } from "@/lib/api";
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
  const { sub: lineUid } = await verifyLineIdToken(idToken);

  // Resolve, or auto-create on first login.
  let user = await getUserByLineUid(lineUid);
  if (!user) {
    try {
      user = await createUser(lineUid);
    } catch (err) {
      // Concurrent first-login: LIFF init can double-fire, so a second
      // createUser hits the line_uid UNIQUE constraint. Fall back to the row
      // the winning request just inserted.
      if (!isUniqueViolation(err, "line_uid")) throw err;
      user = await getUserByLineUid(lineUid);
      if (!user) throw err;
    }
  }

  await setSessionCookie({ userId: user.id, lineUid });

  return NextResponse.json({ user, registered: user.firstName != null });
});
