import { NextRequest, NextResponse } from "next/server";
import { getEventByCheckinCode, checkInUser } from "@/lib/db";
import { ApiError, handleRoute, parseBody, isUniqueViolation } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { checkinSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Response-only; the actual award lives in the `check_in` SQL function. Keep in sync.
const POINTS_PER_CHECKIN = 10;

/**
 * POST /api/checkins — check the current user into an event.
 *
 * The body carries the scanned QR `checkinCode`, never a raw `eventId`:
 * otherwise anyone knowing an event UUID could check in without attending.
 * `checkInUser` calls the `check_in` Postgres function, which awards 10 points
 * atomically; a repeat check-in trips the UNIQUE(event_id, user_id) → 409.
 */
export const POST = handleRoute(async (req: NextRequest) => {
  const user = await requireAuth();
  const { checkinCode } = await parseBody(req, checkinSchema);

  const event = await getEventByCheckinCode(checkinCode);
  if (!event) {
    throw new ApiError(404, "Invalid check-in code", "not_found");
  }

  let checkinId: string;
  try {
    const res = await checkInUser(event.id, user.id);
    checkinId = res.id;
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ApiError(
        409,
        "You have already checked in to this event",
        "already_checked_in",
      );
    }
    throw err;
  }

  return NextResponse.json(
    {
      checkin: { id: checkinId, eventId: event.id },
      pointsAwarded: POINTS_PER_CHECKIN,
    },
    { status: 201 },
  );
});
