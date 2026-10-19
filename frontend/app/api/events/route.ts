import { NextRequest, NextResponse } from "next/server";
import { listEvents, createEvent } from "@/lib/db";
import { handleRoute, parseBody } from "@/lib/api";
import { requireAuth, requirePastor } from "@/lib/auth";
import { createEventSchema } from "@/lib/validation";

export const runtime = "nodejs";

/** GET /api/events — all events, soonest first. */
export const GET = handleRoute(async () => {
  await requireAuth();
  const events = await listEvents();
  return NextResponse.json({ events });
});

/** POST /api/events — create an event (pastor only). */
export const POST = handleRoute(async (req: NextRequest) => {
  const pastor = await requirePastor();
  const body = await parseBody(req, createEventSchema);

  const event = await createEvent({
    title: body.title,
    description: body.description,
    location: body.location,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    createdById: pastor.id, // from the session — never the request body
  });

  return NextResponse.json({ event }, { status: 201 });
});
