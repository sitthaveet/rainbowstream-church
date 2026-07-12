import { z } from "zod";
import { SexAtBirth, IdentityOrientation } from "@/lib/types";
import { ApiError } from "./api";

/** A loose ISO date-time / timestamp string accepted by the API. */
const timestamp = z
  .string()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Expected an ISO date-time");

/**
 * True only for a real calendar date in `YYYY-MM-DD` form. The regex guards the
 * shape; this rejects impossible values the regex lets through (2026-13-45,
 * 2026-02-30, 2026-00-01) so they fail as a clean 400 here instead of an opaque
 * 500 from Postgres. UTC is used so the check is timezone-independent.
 */
function isRealCalendarDate(s: string): boolean {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * Validates a UUID path param (event id, user id, check-in code). Without this,
 * a malformed id flows straight to Postgres, which rejects it as an opaque 500;
 * here it is a clean 400 instead.
 *
 * Both the canonical hyphenated form and a 32-char dash-less hex form are
 * accepted: Postgres emits hyphenated UUIDs, but scanned QR codes or older
 * clients may echo back either and Postgres parses both — so z.uuid() alone
 * would be needlessly strict.
 */
const UUID_RE =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32})$/i;
const uuid = z.string().regex(UUID_RE, "Invalid UUID");
export function assertUuid(value: string, label = "id"): void {
  if (!uuid.safeParse(value).success) {
    throw new ApiError(400, `Invalid ${label}`, "bad_request");
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.strictObject({
  idToken: z.string().min(1),
});

// ─── User profile ────────────────────────────────────────────────────────────

/**
 * Profile fields a user may set. All optional — the route does a
 * read-modify-write merge, so a partial body only touches the fields it
 * carries. `role` and `points` are intentionally absent: they are not
 * user-editable here.
 *
 * `christianDuration` is a non-negative integer (0 = not a Christian). The
 * enums reuse the domain enum types from lib/types.ts so they can't drift.
 */
export const profileSchema = z
  .strictObject({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    nickname: z.string().min(1).max(100),
    birthdate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
      .refine(isRealCalendarDate, "Not a real calendar date"),
    email: z.email().max(255),
    phoneNumber: z.string().min(1).max(50),
    address: z.string().min(1),
    sexAtBirth: z.enum(SexAtBirth),
    identityOrientation: z.enum(IdentityOrientation),
    identityOrientationOther: z.string(),
    christianDuration: z.number().int().min(0),
    church: z.string().max(255),
    selfIntroduction: z.string(),
  })
  .partial();

export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Cross-field rule checked on the MERGED user (not the patch): when
 * `identityOrientation` is "other", `identityOrientationOther` must be filled.
 * Run after the read-modify-write merge so a partial edit cannot leave the row
 * inconsistent.
 */
export function assertIdentityConsistency(merged: {
  identityOrientation?: IdentityOrientation | null;
  identityOrientationOther?: string | null;
}): void {
  if (
    merged.identityOrientation === IdentityOrientation.other &&
    !merged.identityOrientationOther?.trim()
  ) {
    throw new ApiError(
      400,
      "identityOrientationOther is required when identityOrientation is 'other'",
      "validation_error",
    );
  }
}

// ─── Events ──────────────────────────────────────────────────────────────────

/**
 * Create/update events use full-object (PUT) shapes — `title` and `startsAt`
 * are always required. The `endsAt >= startsAt` refinement keeps a bad range a
 * clean 400 rather than storing an inconsistent row.
 */
const eventFields = {
  title: z.string().min(1).max(255),
  description: z.string().nullish(),
  location: z.string().nullish(),
  startsAt: timestamp,
  endsAt: timestamp.nullish(),
};

const endsAfterStarts = (d: { startsAt: string; endsAt?: string | null }) =>
  !d.endsAt || Date.parse(d.endsAt) >= Date.parse(d.startsAt);
const endsAfterStartsMsg = {
  message: "endsAt must be on or after startsAt",
  path: ["endsAt"] as PropertyKey[],
};

export const createEventSchema = z
  .strictObject(eventFields)
  .refine(endsAfterStarts, endsAfterStartsMsg);

export const updateEventSchema = z
  .strictObject(eventFields)
  .refine(endsAfterStarts, endsAfterStartsMsg);

export type EventInput = z.infer<typeof createEventSchema>;

// ─── Check-in ────────────────────────────────────────────────────────────────

export const checkinSchema = z.strictObject({
  checkinCode: uuid,
});

/**
 * Pastor checking a member in from the admin event page. Carries the target
 * `userId` (the event comes from the URL) — pastor-only, so no `checkinCode`
 * proof-of-attendance is needed here.
 */
export const adminCheckinSchema = z.strictObject({
  userId: uuid,
});
