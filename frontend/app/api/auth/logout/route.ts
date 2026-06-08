import { NextResponse } from "next/server";
import { handleRoute } from "@/lib/api";
import { clearSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

/** POST /api/auth/logout — clears the session cookie. */
export const POST = handleRoute(async () => {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
});
