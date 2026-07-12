import { checkInUser } from "@/lib/db";
import { ApiError, isUniqueViolation } from "@/lib/api";

/** Response-only; the actual award lives in the `check_in` SQL function
 *  (database/schema.sql). Keep the two in sync. */
export const POINTS_PER_CHECKIN = 10;

/**
 * The check-in mechanism shared by the self-serve scan route (POST
 * /api/checkins) and the pastor-assisted route (POST /api/events/[id]/checkins):
 * run the atomic `check_in` SQL function (insert + points award) and map a
 * repeat check-in — UNIQUE(event_id, user_id) → 23505 — to a 409. Authorization
 * and event/member resolution stay in the routes.
 */
export async function performCheckIn(
  eventId: string,
  userId: string,
): Promise<{ checkinId: string; pointsAwarded: number }> {
  try {
    const { id } = await checkInUser(eventId, userId);
    return { checkinId: id, pointsAwarded: POINTS_PER_CHECKIN };
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ApiError(
        409,
        "Already checked in to this event",
        "already_checked_in",
      );
    }
    throw err;
  }
}
