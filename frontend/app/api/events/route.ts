import { NextRequest, NextResponse } from "next/server";
import {
  listEvents,
  createEvent,
  getEventById,
  UserRole,
} from "@dataconnect/generated";
import { dc } from "@/lib/dataconnect";
import { handleRoute, parseBody } from "@/lib/api";
import { requireAuth, requirePastor } from "@/lib/auth";
import { createEventSchema } from "@/lib/validation";
import { stripCheckinCode } from "@/lib/serialize";

export const runtime = "nodejs";

/**
 * GET /api/events — all events, soonest first.
 * `checkinCode` (the QR secret) is stripped for non-pastors.
 */
export const GET = handleRoute(async () => {
  const caller = await requireAuth();
  const { data } = await listEvents(dc);
  const events =
    caller.role === UserRole.pastor
      ? data.events
      : data.events.map(stripCheckinCode);
  return NextResponse.json({ events });
});

/** POST /api/events — create an event (pastor only). */
export const POST = handleRoute(async (req: NextRequest) => {
  const pastor = await requirePastor();
  const body = await parseBody(req, createEventSchema);

  const created = await createEvent(dc, {
    title: body.title,
    description: body.description,
    location: body.location,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    createdById: pastor.id, // from the session — never the request body
  });

  const { data } = await getEventById(dc, { id: created.data.event_insert.id });
  return NextResponse.json({ event: data.event }, { status: 201 });
});
