import { NextRequest, NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";
import { UserRole } from "@/lib/types";
import { ApiError, handleRoute, parseBody } from "@/lib/api";
import { requireAuth, requirePastor } from "@/lib/auth";
import { updateEventSchema, assertUuid } from "@/lib/validation";
import { stripCheckinCode } from "@/lib/serialize";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/events/[id] — a single event. `checkinCode` stripped for non-pastors. */
export const GET = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "event id");
  const caller = await requireAuth();

  const event = await getEventById(id);
  if (!event) throw new ApiError(404, "Event not found", "not_found");

  return NextResponse.json({
    event: caller.role === UserRole.pastor ? event : stripCheckinCode(event),
  });
});

/**
 * PATCH /api/events/[id] — edit an event (pastor only).
 * `UpdateEvent` is a full-row replacement (PUT): the body carries every
 * editable field. A missing id returns null → 404.
 */
export const PATCH = handleRoute(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "event id");
  await requirePastor();
  const body = await parseBody(req, updateEventSchema);

  const event = await updateEvent(id, {
    title: body.title,
    description: body.description,
    location: body.location,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
  });
  if (!event) {
    throw new ApiError(404, "Event not found", "not_found");
  }
  return NextResponse.json({ event });
});

/** DELETE /api/events/[id] — delete an event (pastor only). Checkins cascade. */
export const DELETE = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "event id");
  await requirePastor();

  const deleted = await deleteEvent(id);
  if (!deleted) {
    throw new ApiError(404, "Event not found", "not_found");
  }
  return NextResponse.json({ ok: true });
});
