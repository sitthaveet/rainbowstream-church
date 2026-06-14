import { NextRequest, NextResponse } from "next/server";
import { listUserCheckins } from "@/lib/db";
import { handleRoute } from "@/lib/api";
import { requireSelfOrPastor } from "@/lib/auth";
import { assertUuid } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/users/[id]/checkins — a member's check-in history (self or pastor). */
export const GET = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "user id");
  await requireSelfOrPastor(id);

  const checkins = await listUserCheckins(id);
  return NextResponse.json({ checkins });
});
