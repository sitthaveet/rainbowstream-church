import { NextRequest, NextResponse } from "next/server";
import { getEventById, listEventCheckins } from "@dataconnect/generated";
import { dc } from "@/lib/dataconnect";
import { ApiError, handleRoute } from "@/lib/api";
import { requirePastor } from "@/lib/auth";
import { assertUuid } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/events/[id]/checkins — attendance for an event (pastor only). */
export const GET = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "event id");
  await requirePastor();

  const event = await getEventById(dc, { id });
  if (!event.data.event) {
    throw new ApiError(404, "Event not found", "not_found");
  }

  const { data } = await listEventCheckins(dc, { eventId: id });
  return NextResponse.json({ checkins: data.checkins });
});
