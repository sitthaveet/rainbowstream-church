import { NextResponse } from "next/server";
import { handleRoute } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/auth/me
 * Returns the current user and a `registered` flag so the LIFF client can
 * route unregistered users to the registration form.
 */
export const GET = handleRoute(async () => {
  const user = await requireAuth();
  return NextResponse.json({ user, registered: user.firstName != null });
});
