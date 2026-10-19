import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleRoute, parseBody } from "@/lib/api";
import { isChurchCheckinCode, performChurchCheckIn } from "@/lib/checkin";
import { requireAuth } from "@/lib/auth";
import { checkinSchema } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * POST /api/checkins — check the current user into today's gathering.
 *
 * The body carries the scanned church QR `checkinCode` (CHURCH_CHECKIN_CODE),
 * never a raw `eventId`: otherwise anyone knowing an event UUID could check in
 * without attending. The check-in joins today's gathering, creating it on the
 * day's first scan; `performChurchCheckIn` awards the points atomically and
 * maps a repeat check-in to a 409.
 */
export const POST = handleRoute(async (req: NextRequest) => {
  const user = await requireAuth();
  const { checkinCode } = await parseBody(req, checkinSchema);

  if (!isChurchCheckinCode(checkinCode)) {
    throw new ApiError(404, "Invalid check-in code", "not_found");
  }

  const { checkinId, pointsAwarded, event } = await performChurchCheckIn(
    user.id,
  );
  return NextResponse.json(
    { checkin: { id: checkinId, eventId: event.id }, pointsAwarded, event },
    { status: 201 },
  );
});
