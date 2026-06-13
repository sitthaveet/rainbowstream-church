import { NextRequest, NextResponse } from "next/server";
import { getEventByCheckinCode } from "@/lib/db";
import { dc } from "@/lib/dataconnect";
import { ApiError, handleRoute } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { assertUuid } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ code: string }> };

/**
 * GET /api/events/by-code/[code]
 * Resolves a scanned QR check-in code to its event so the member can preview
 * the event before confirming the check-in.
 */
export const GET = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { code } = await ctx.params;
  assertUuid(code, "check-in code");
  await requireAuth();

  const { data } = await getEventByCheckinCode(dc, { checkinCode: code });
  const event = data.events[0];
  if (!event) {
    throw new ApiError(404, "Invalid check-in code", "not_found");
  }
  return NextResponse.json({ event });
});
