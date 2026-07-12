import { NextRequest, NextResponse } from "next/server";
import { getEventById, getUserById, listEventCheckins } from "@/lib/db";
import { ApiError, handleRoute, parseBody } from "@/lib/api";
import { performCheckIn } from "@/lib/checkin";
import { requirePastor } from "@/lib/auth";
import { adminCheckinSchema, assertUuid } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/events/[id]/checkins — attendance for an event (pastor only). */
export const GET = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "event id");
  await requirePastor();

  const event = await getEventById(id);
  if (!event) {
    throw new ApiError(404, "Event not found", "not_found");
  }

  const checkins = await listEventCheckins(id);
  return NextResponse.json({ checkins });
});

/**
 * POST /api/events/[id]/checkins — pastor checks a member in on their behalf.
 *
 * Unlike the self-serve POST /api/checkins (which demands the scanned QR
 * `checkinCode` as proof of attendance), this takes the event id from the URL:
 * the caller is a pastor running the event, already trusted with the code.
 * Same `performCheckIn` underneath, so the member still earns points
 * atomically and a repeat check-in becomes a 409.
 */
export const POST = handleRoute(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "event id");
  await requirePastor();
  const { userId } = await parseBody(req, adminCheckinSchema);

  const [event, member] = await Promise.all([
    getEventById(id),
    getUserById(userId),
  ]);
  if (!event) {
    throw new ApiError(404, "Event not found", "not_found");
  }
  if (!member) {
    throw new ApiError(404, "Member not found", "not_found");
  }

  const { checkinId, pointsAwarded } = await performCheckIn(id, userId);

  return NextResponse.json(
    { checkin: { id: checkinId, eventId: id, userId }, pointsAwarded },
    { status: 201 },
  );
});
