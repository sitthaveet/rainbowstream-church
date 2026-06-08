import { NextRequest, NextResponse } from "next/server";
import {
  getUserById,
  listUsers,
  updateUserProfile,
  deleteUser,
  type UpdateUserProfileVariables,
} from "@dataconnect/generated";
import { dc } from "@/lib/dataconnect";
import { ApiError, handleRoute, parseBody, isUniqueViolation } from "@/lib/api";
import { requireSelfOrPastor, requirePastor } from "@/lib/auth";
import {
  profileSchema,
  assertIdentityConsistency,
  assertUuid,
} from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/users/[id] — a single user (self or pastor). */
export const GET = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "user id");
  await requireSelfOrPastor(id);

  const { data } = await getUserById(dc, { id });
  if (!data.user) throw new ApiError(404, "User not found", "not_found");
  return NextResponse.json({ user: data.user });
});

/**
 * PATCH /api/users/[id] — registration-form submit or profile edit.
 *
 * `UpdateUserProfile` is a full-row replacement: an omitted nullable variable
 * is written as NULL. So this does a read-modify-write — fetch the row, merge
 * the incoming fields, and send the complete object (plan issue #1).
 */
export const PATCH = handleRoute(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "user id");
  await requireSelfOrPastor(id);
  const patch = await parseBody(req, profileSchema);

  const before = await getUserById(dc, { id });
  const existing = before.data.user;
  if (!existing) throw new ApiError(404, "User not found", "not_found");

  const merged: UpdateUserProfileVariables = {
    id,
    firstName: patch.firstName ?? existing.firstName,
    lastName: patch.lastName ?? existing.lastName,
    nickname: patch.nickname ?? existing.nickname,
    birthdate: patch.birthdate ?? existing.birthdate,
    email: patch.email ?? existing.email,
    phoneNumber: patch.phoneNumber ?? existing.phoneNumber,
    address: patch.address ?? existing.address,
    sexAtBirth: patch.sexAtBirth ?? existing.sexAtBirth,
    identityOrientation:
      patch.identityOrientation ?? existing.identityOrientation,
    identityOrientationOther:
      patch.identityOrientationOther ?? existing.identityOrientationOther,
    christianDuration:
      patch.christianDuration ?? existing.christianDuration,
    church: patch.church ?? existing.church,
    selfIntroduction: patch.selfIntroduction ?? existing.selfIntroduction,
  };
  assertIdentityConsistency(merged);

  try {
    const res = await updateUserProfile(dc, merged);
    if (!res.data.user_update) {
      throw new ApiError(404, "User not found", "not_found");
    }
  } catch (err) {
    if (isUniqueViolation(err, "email")) {
      throw new ApiError(409, "Email is already in use", "conflict");
    }
    throw err;
  }

  const after = await getUserById(dc, { id });
  return NextResponse.json({ user: after.data.user });
});

/** DELETE /api/users/[id] — remove a member (pastor only). */
export const DELETE = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "user id");
  const caller = await requirePastor();
  if (caller.id === id) {
    throw new ApiError(409, "You cannot delete your own account", "conflict");
  }

  const target = await getUserById(dc, { id });
  if (!target.data.user) {
    throw new ApiError(404, "User not found", "not_found");
  }
  // Keep at least one pastor. TOCTOU-racy — acceptable for a single church.
  if (target.data.user.role === "pastor") {
    const { data } = await listUsers(dc);
    const pastors = data.users.filter((u) => u.role === "pastor");
    if (pastors.length <= 1) {
      throw new ApiError(409, "Cannot delete the last pastor", "conflict");
    }
  }

  const res = await deleteUser(dc, { id });
  if (!res.data.user_delete) {
    throw new ApiError(404, "User not found", "not_found");
  }
  return NextResponse.json({ ok: true });
});
