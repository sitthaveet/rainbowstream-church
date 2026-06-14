import { NextRequest, NextResponse } from "next/server";
import {
  getUserById,
  updateUserProfile,
  deleteUser,
  countPastors,
} from "@/lib/db";
import type { ProfileFields } from "@/lib/types";
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

  const user = await getUserById(id);
  if (!user) throw new ApiError(404, "User not found", "not_found");
  return NextResponse.json({ user });
});

/**
 * PATCH /api/users/[id] — registration-form submit or profile edit.
 *
 * The profile write is a full-row replacement, so this does a read-modify-write:
 * fetch the row, merge the incoming fields (`??` keeps a real `christianDuration:
 * 0`), and send the complete object. The merged row is validated for identity
 * consistency before the write, and the write returns the updated row directly.
 */
export const PATCH = handleRoute(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "user id");
  await requireSelfOrPastor(id);
  const patch = await parseBody(req, profileSchema);

  const existing = await getUserById(id);
  if (!existing) throw new ApiError(404, "User not found", "not_found");

  const merged: ProfileFields = {
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
    christianDuration: patch.christianDuration ?? existing.christianDuration,
    church: patch.church ?? existing.church,
    selfIntroduction: patch.selfIntroduction ?? existing.selfIntroduction,
  };
  assertIdentityConsistency(merged);

  try {
    // First submit (registered_at still null) marks the account as registered.
    const updated = await updateUserProfile(id, merged, {
      markRegistered: existing.registeredAt == null,
    });
    if (!updated) throw new ApiError(404, "User not found", "not_found");
    return NextResponse.json({ user: updated });
  } catch (err) {
    if (isUniqueViolation(err, "email")) {
      throw new ApiError(409, "Email is already in use", "conflict");
    }
    throw err;
  }
});

/** DELETE /api/users/[id] — remove a member (pastor only). */
export const DELETE = handleRoute(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  assertUuid(id, "user id");
  const caller = await requirePastor();
  if (caller.id === id) {
    throw new ApiError(409, "You cannot delete your own account", "conflict");
  }

  const target = await getUserById(id);
  if (!target) {
    throw new ApiError(404, "User not found", "not_found");
  }
  // Keep at least one pastor. TOCTOU-racy — acceptable for a single church.
  if (target.role === "pastor") {
    if ((await countPastors()) <= 1) {
      throw new ApiError(409, "Cannot delete the last pastor", "conflict");
    }
  }

  const deleted = await deleteUser(id);
  if (!deleted) {
    throw new ApiError(404, "User not found", "not_found");
  }
  return NextResponse.json({ ok: true });
});
