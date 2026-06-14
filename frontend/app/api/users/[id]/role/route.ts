import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUserRole, countPastors } from "@/lib/db";
import { UserRole } from "@/lib/types";
import { ApiError, handleRoute, parseBody } from "@/lib/api";
import { requirePastor } from "@/lib/auth";
import { updateRoleSchema, assertUuid } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/users/[id]/role — promote/demote a member (pastor only). */
export const PATCH = handleRoute(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "user id");
  await requirePastor();
  const { role } = await parseBody(req, updateRoleSchema);

  const target = await getUserById(id);
  if (!target) {
    throw new ApiError(404, "User not found", "not_found");
  }

  // Demoting a pastor must leave at least one. TOCTOU-racy — acceptable here.
  if (target.role === UserRole.pastor && role === UserRole.member) {
    if ((await countPastors()) <= 1) {
      throw new ApiError(409, "At least one pastor must remain", "conflict");
    }
  }

  const updated = await updateUserRole(id, role);
  if (!updated) {
    throw new ApiError(404, "User not found", "not_found");
  }
  return NextResponse.json({ user: updated });
});
