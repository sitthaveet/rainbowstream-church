import { checkInUser, churchCheckInUser } from "@/lib/db";
import { ApiError, isUniqueViolation } from "@/lib/api";
import type { CheckinEvent } from "@/lib/types";

/** Response-only; the actual award lives in the `check_in` SQL function
 *  (database/schema.sql). Keep the two in sync. */
export const POINTS_PER_CHECKIN = 10;

/** Whether a scanned code is the church-wide static QR — the only QR there is. */
export function isChurchCheckinCode(code: string): boolean {
  const churchCode = process.env.CHURCH_CHECKIN_CODE;
  return !!churchCode && code.toLowerCase() === churchCode.toLowerCase();
}

/** Maps a repeat check-in — UNIQUE(event_id, user_id) → 23505 — to a 409. */
async function mapAlreadyCheckedIn<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
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

/**
 * Check a member into a specific event — the pastor-assisted route (POST
 * /api/events/[id]/checkins): run the atomic `check_in` SQL function (insert + points award) and map a
 * repeat check-in to a 409. Authorization and event/member resolution stay in
 * the routes.
 */
export async function performCheckIn(
  eventId: string,
  userId: string,
): Promise<{ checkinId: string; pointsAwarded: number }> {
  const { id } = await mapAlreadyCheckedIn(() => checkInUser(eventId, userId));
  return { checkinId: id, pointsAwarded: POINTS_PER_CHECKIN };
}

/**
 * Check-in via the church-wide static QR: joins (or, on the day's first scan,
 * creates) today's gathering — see `church_check_in` in database/schema.sql.
 */
export async function performChurchCheckIn(
  userId: string,
): Promise<{ checkinId: string; pointsAwarded: number; event: CheckinEvent }> {
  const { id, event } = await mapAlreadyCheckedIn(() =>
    churchCheckInUser(userId),
  );
  return { checkinId: id, pointsAwarded: POINTS_PER_CHECKIN, event };
}
