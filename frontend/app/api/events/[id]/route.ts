import { NextRequest, NextResponse } from "next/server";
import { updateEvent, deleteEvent, UserRole } from "@dataconnect/generated";
import { getEventById } from "@/lib/db";
import { dc } from "@/lib/dataconnect";
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

  const { data } = await getEventById(dc, { id });
  if (!data.event) throw new ApiError(404, "Event not found", "not_found");

  const event =
    caller.role === UserRole.pastor
      ? data.event
      : stripCheckinCode(data.event);
  return NextResponse.json({ event });
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

  const res = await updateEvent(dc, {
    id,
    title: body.title,
    description: body.description,
    location: body.location,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
  });
  if (!res.data.event_update) {
    throw new ApiError(404, "Event not found", "not_found");
  }

  const { data } = await getEventById(dc, { id });
  return NextResponse.json({ event: data.event });
});

/** DELETE /api/events/[id] — delete an event (pastor only). Checkins cascade. */
export const DELETE = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "event id");
  await requirePastor();

  const res = await deleteEvent(dc, { id });
  if (!res.data.event_delete) {
    throw new ApiError(404, "Event not found", "not_found");
  }
  return NextResponse.json({ ok: true });
});
