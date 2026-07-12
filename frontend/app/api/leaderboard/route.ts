import { NextResponse } from "next/server";
import { listLeaderboard } from "@/lib/db";
import { handleRoute } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

/** GET /api/leaderboard — top 10 members by points, names + points only
 *  (no user ids, so the client can't link entries to profiles). */
export const GET = handleRoute(async () => {
  await requireAuth();
  const leaderboard = await listLeaderboard();
  return NextResponse.json({ leaderboard });
});
