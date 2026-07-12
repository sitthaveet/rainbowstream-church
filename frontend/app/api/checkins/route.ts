import { NextRequest, NextResponse } from "next/server";
import { getEventByCheckinCode } from "@/lib/db";
import { ApiError, handleRoute, parseBody } from "@/lib/api";
import { performCheckIn } from "@/lib/checkin";
import { requireAuth } from "@/lib/auth";
import { checkinSchema } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * POST /api/checkins — check the current user into an event.
 *
 * The body carries the scanned QR `checkinCode`, never a raw `eventId`:
 * otherwise anyone knowing an event UUID could check in without attending.
 * `performCheckIn` awards the points atomically and maps a repeat check-in
 * to a 409.
 */
export const POST = handleRoute(async (req: NextRequest) => {
  const user = await requireAuth();
  const { checkinCode } = await parseBody(req, checkinSchema);

  const event = await getEventByCheckinCode(checkinCode);
  if (!event) {
    throw new ApiError(404, "Invalid check-in code", "not_found");
  }

  const { checkinId, pointsAwarded } = await performCheckIn(event.id, user.id);

  return NextResponse.json(
    { checkin: { id: checkinId, eventId: event.id }, pointsAwarded },
    { status: 201 },
  );
});
