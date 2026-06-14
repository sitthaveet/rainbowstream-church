/**
 * Domain types and enums for the app — the single source of truth now that the
 * generated Data Connect SDK is gone.
 *
 * Enums are runtime objects (not TS `enum`) so they double as values
 * (`IdentityOrientation.other`, `z.enum(SexAtBirth)` in lib/validation.ts) and
 * as string-literal-union types. All field names are camelCase: lib/db.ts is
 * the single boundary that maps Postgres snake_case rows ⇄ these shapes, so the
 * route handlers, lib/client.ts, and the components stay on camelCase.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export const UserRole = { pastor: "pastor", member: "member" } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SexAtBirth = {
  male: "male",
  female: "female",
  intersex: "intersex",
} as const;
export type SexAtBirth = (typeof SexAtBirth)[keyof typeof SexAtBirth];

export const IdentityOrientation = {
  gay_lesbian: "gay_lesbian",
  bisexual: "bisexual",
  straight: "straight",
  transgender: "transgender",
  other: "other",
} as const;
export type IdentityOrientation =
  (typeof IdentityOrientation)[keyof typeof IdentityOrientation];

// ─── Users ───────────────────────────────────────────────────────────────────

/** A full user row (profile fields are null until registration). */
export interface User {
  id: string;
  lineId: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  birthdate: string | null; // YYYY-MM-DD (Postgres `date`), passed through as-is
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  sexAtBirth: SexAtBirth | null;
  identityOrientation: IdentityOrientation | null;
  identityOrientationOther: string | null;
  christianDuration: number | null; // 0 = not a Christian, null = unanswered
  church: string | null;
  selfIntroduction: string | null;
  points: number;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** Member-list projection (pastor's member-management screen). */
export type MemberSummary = Pick<
  User,
  | "id"
  | "firstName"
  | "lastName"
  | "nickname"
  | "email"
  | "phoneNumber"
  | "points"
  | "role"
  | "createdAt"
>;

/** The profile fields a user may set — the write payload for updateUserProfile. */
export type ProfileFields = Pick<
  User,
  | "firstName"
  | "lastName"
  | "nickname"
  | "birthdate"
  | "email"
  | "phoneNumber"
  | "address"
  | "sexAtBirth"
  | "identityOrientation"
  | "identityOrientationOther"
  | "christianDuration"
  | "church"
  | "selfIntroduction"
>;

// ─── Events ──────────────────────────────────────────────────────────────────

/** A full event row, including the QR `checkinCode` secret. */
export interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  checkinCode: string;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Event-list projection (same as detail without `updatedAt`). */
export type EventSummary = Omit<EventDetail, "updatedAt">;

/** Minimal event returned when resolving a scanned QR code (no `checkinCode`). */
export type EventByCode = Pick<
  EventDetail,
  "id" | "title" | "description" | "location" | "startsAt" | "endsAt"
>;

export interface CreateEventInput {
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  createdById: string;
}

export type UpdateEventInput = Omit<CreateEventInput, "createdById">;

// ─── Check-ins ───────────────────────────────────────────────────────────────

export type UserBrief = Pick<User, "id" | "firstName" | "lastName" | "nickname">;
export type EventBrief = Pick<EventDetail, "id" | "title" | "location" | "startsAt">;

/** Attendance row for one event (pastor view). */
export interface EventCheckin {
  id: string;
  checkedInAt: string;
  user: UserBrief;
}

/** A member's own check-in history row. */
export interface UserCheckin {
  id: string;
  checkedInAt: string;
  event: EventBrief;
}
