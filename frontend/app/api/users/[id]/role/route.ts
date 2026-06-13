import { NextRequest, NextResponse } from "next/server";
import { updateUserRole, UserRole } from "@dataconnect/generated";
import { getUserById, listUsers } from "@/lib/db";
import { dc } from "@/lib/dataconnect";
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

  const target = await getUserById(dc, { id });
  if (!target.data.user) {
    throw new ApiError(404, "User not found", "not_found");
  }

  // Demoting a pastor must leave at least one. TOCTOU-racy — acceptable here.
  if (target.data.user.role === UserRole.pastor && role === UserRole.member) {
    const { data } = await listUsers(dc);
    const pastors = data.users.filter((u) => u.role === UserRole.pastor);
    if (pastors.length <= 1) {
      throw new ApiError(409, "At least one pastor must remain", "conflict");
    }
  }

  const res = await updateUserRole(dc, { id, role });
  if (!res.data.user_update) {
    throw new ApiError(404, "User not found", "not_found");
  }

  const after = await getUserById(dc, { id });
  return NextResponse.json({ user: after.data.user });
});
