import { NextRequest, NextResponse } from "next/server";
import { getEventById, listEventCheckins } from "@/lib/db";
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

  const event = await getEventById(id);
  if (!event) {
    throw new ApiError(404, "Event not found", "not_found");
  }

  const checkins = await listEventCheckins(id);
  return NextResponse.json({ checkins });
});
