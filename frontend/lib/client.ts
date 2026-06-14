/**
 * Client-side API helper — the browser's only doorway to the route handlers.
 *
 * Types are derived from the domain types in `@/lib/types` with `import type`
 * only. The route JSON carries plain strings, and the events endpoints strip
 * `checkinCode` for non-pastors, so the list/detail event types widen it back
 * to optional here.
 */
import type {
  User,
  UserRole,
  SexAtBirth,
  IdentityOrientation,
  EventSummary as EventSummaryRow,
  EventDetail as EventDetailRow,
  EventByCode,
  MemberSummary,
  UserCheckin,
  EventCheckin,
} from "@/lib/types";

// Browser-facing names for the domain enums. Aliased (not re-typed) so they
// can't drift from lib/types.ts; the route JSON carries them as plain strings.
export type Role = UserRole;
export type SexAtBirthValue = SexAtBirth;
export type OrientationValue = IdentityOrientation;

/** The user as serialized to the browser (enums are already string unions). */
export type ApiUser = User;

/** Events from list/detail endpoints: `checkinCode` is stripped for members. */
export type EventSummary = Omit<EventSummaryRow, "checkinCode"> & {
  checkinCode?: string;
};
export type EventDetail = Omit<EventDetailRow, "checkinCode"> & {
  checkinCode?: string;
};

export type { EventByCode, MemberSummary, UserCheckin, EventCheckin };

/** Mirrors the server's profileSchema (lib/validation.ts) — all optional. */
export interface ProfilePatch {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  birthdate?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  sexAtBirth?: SexAtBirthValue;
  identityOrientation?: OrientationValue;
  identityOrientationOther?: string;
  christianDuration?: number;
  church?: string;
  selfIntroduction?: string;
}

/** Mirrors the server's createEventSchema — PUT semantics, full object. */
export interface EventInput {
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
}

export class ClientApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let code = "error";
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error?.code) code = data.error.code;
      if (data?.error?.message) message = data.error.message;
    } catch {
      // non-JSON error body — keep the defaults
    }
    throw new ClientApiError(res.status, code, message);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResult {
  user: ApiUser;
  registered: boolean;
}

export const apiLogin = (idToken: string) =>
  request<AuthResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

export const apiMe = () => request<AuthResult>("/api/auth/me");

export const apiLogout = () =>
  request<{ ok: true }>("/api/auth/logout", { method: "POST" });

// ─── Check-in ────────────────────────────────────────────────────────────────

export const getEventByCode = (code: string) =>
  request<{ event: EventByCode }>(`/api/events/by-code/${code}`);

export const checkIn = (checkinCode: string) =>
  request<{ checkin: { id: string; eventId: string }; pointsAwarded: number }>(
    "/api/checkins",
    { method: "POST", body: JSON.stringify({ checkinCode }) },
  );

// ─── Users ───────────────────────────────────────────────────────────────────

export const getUser = (id: string) =>
  request<{ user: ApiUser }>(`/api/users/${id}`);

export const updateProfile = (id: string, patch: ProfilePatch) =>
  request<{ user: ApiUser }>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const listUserCheckins = (id: string) =>
  request<{ checkins: UserCheckin[] }>(`/api/users/${id}/checkins`);

export const listMembers = () => request<{ users: MemberSummary[] }>("/api/users");

export const updateRole = (id: string, role: Role) =>
  request<{ user: ApiUser }>(`/api/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const deleteMember = (id: string) =>
  request<{ ok: true }>(`/api/users/${id}`, { method: "DELETE" });

// ─── Events ──────────────────────────────────────────────────────────────────

export const listEvents = () =>
  request<{ events: EventSummary[] }>("/api/events");

export const getEvent = (id: string) =>
  request<{ event: EventDetail }>(`/api/events/${id}`);

export const createEvent = (input: EventInput) =>
  request<{ event: EventDetail }>("/api/events", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateEvent = (id: string, input: EventInput) =>
  request<{ event: EventDetail }>(`/api/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deleteEvent = (id: string) =>
  request<{ ok: true }>(`/api/events/${id}`, { method: "DELETE" });

export const listEventCheckins = (id: string) =>
  request<{ checkins: EventCheckin[] }>(`/api/events/${id}/checkins`);

// ─── Error display ───────────────────────────────────────────────────────────

/** Thai user-facing message for a thrown error. */
export function errorMessage(err: unknown): string {
  if (err instanceof ClientApiError) {
    switch (err.code) {
      case "already_checked_in":
        return "คุณได้เช็คอินกิจกรรมนี้ไปแล้ว";
      case "not_found":
        return "ไม่พบข้อมูลที่ต้องการ";
      case "unauthorized":
        return "กรุณาเข้าสู่ระบบใหม่อีกครั้ง";
      case "forbidden":
        return "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้";
      case "conflict":
        return "ข้อมูลซ้ำกับที่มีอยู่แล้ว (เช่น อีเมลถูกใช้แล้ว)";
      case "validation_error":
      case "bad_request":
        return `ข้อมูลไม่ถูกต้อง: ${err.message}`;
      default:
        return err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
    }
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
