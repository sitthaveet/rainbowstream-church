/**
 * The data-access layer — the single boundary between the app's camelCase
 * domain types (lib/types.ts) and Postgres' snake_case columns.
 *
 * Every function here speaks snake_case to Supabase and returns camelCase
 * domain objects, so route handlers, lib/client.ts, and the components never
 * see a raw row. Reads/writes/RPC all live here; the route handlers call these
 * functions and never touch the Supabase client directly.
 */
import { supabase } from "./supabase";
import type {
  User,
  MemberSummary,
  ProfileFields,
  EventDetail,
  EventSummary,
  EventByCode,
  EventCheckin,
  UserCheckin,
  UserBrief,
  EventBrief,
  CreateEventInput,
  UpdateEventInput,
  UserRole,
} from "./types";

// ─── Column lists ────────────────────────────────────────────────────────────

const USER_COLS =
  "id, line_uid, first_name, last_name, nickname, birthdate, email, " +
  "phone_number, address, sex_at_birth, identity_orientation, " +
  "identity_orientation_other, christian_duration, church, " +
  "self_introduction, points, role, registered_at, created_at, updated_at";

const MEMBER_COLS =
  "id, first_name, last_name, nickname, email, phone_number, points, role, created_at";

// EVENT_COLS is the summary list plus updated_at — derive one from the other
// so the shared columns never drift.
const EVENT_SUMMARY_COLS =
  "id, title, description, location, starts_at, ends_at, checkin_code, " +
  "created_by, created_at";

const EVENT_COLS = EVENT_SUMMARY_COLS + ", updated_at";

const EVENT_BY_CODE_COLS =
  "id, title, description, location, starts_at, ends_at";

// ─── Row → domain mappers ──────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */

function toUser(r: any): User {
  return {
    id: r.id,
    lineUid: r.line_uid,
    firstName: r.first_name,
    lastName: r.last_name,
    nickname: r.nickname,
    birthdate: r.birthdate,
    email: r.email,
    phoneNumber: r.phone_number,
    address: r.address,
    sexAtBirth: r.sex_at_birth,
    identityOrientation: r.identity_orientation,
    identityOrientationOther: r.identity_orientation_other,
    christianDuration: r.christian_duration,
    church: r.church,
    selfIntroduction: r.self_introduction,
    points: r.points,
    role: r.role,
    registeredAt: r.registered_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toMemberSummary(r: any): MemberSummary {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    nickname: r.nickname,
    email: r.email,
    phoneNumber: r.phone_number,
    points: r.points,
    role: r.role,
    createdAt: r.created_at,
  };
}

function toEventDetail(r: any): EventDetail {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    location: r.location,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    checkinCode: r.checkin_code,
    createdById: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toEventSummary(r: any): EventSummary {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    location: r.location,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    checkinCode: r.checkin_code,
    createdById: r.created_by,
    createdAt: r.created_at,
  };
}

function toEventByCode(r: any): EventByCode {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    location: r.location,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
  };
}

/** Nested-row mappers for the check-in joins. */
function toUserBrief(r: any): UserBrief {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    nickname: r.nickname,
  };
}

function toEventBrief(r: any): EventBrief {
  return {
    id: r.id,
    title: r.title,
    location: r.location,
    startsAt: r.starts_at,
  };
}

/** Maps the snake_case ProfileFields back to a Postgres update payload. */
function profileToRow(f: ProfileFields) {
  return {
    first_name: f.firstName,
    last_name: f.lastName,
    nickname: f.nickname,
    birthdate: f.birthdate,
    email: f.email,
    phone_number: f.phoneNumber,
    address: f.address,
    sex_at_birth: f.sexAtBirth,
    identity_orientation: f.identityOrientation,
    identity_orientation_other: f.identityOrientationOther,
    christian_duration: f.christianDuration,
    church: f.church,
    self_introduction: f.selfIntroduction,
  };
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserByLineUid(lineUid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select(USER_COLS)
    .eq("line_uid", lineUid)
    .maybeSingle();
  if (error) throw error;
  return data ? toUser(data) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select(USER_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toUser(data) : null;
}

export async function listUsers(): Promise<MemberSummary[]> {
  const { data, error } = await supabase
    .from("users")
    .select(MEMBER_COLS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toMemberSummary);
}

/** Auto-creates an account on first LINE login (only line_uid is known). */
export async function createUser(lineUid: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({ line_uid: lineUid })
    .select(USER_COLS)
    .single();
  if (error) throw error;
  return toUser(data);
}

/**
 * Full-row profile write. Returns the updated row, or null if the id is gone.
 * Pass `markRegistered` on the first submit to stamp `registered_at` (the flag
 * the app keys "registered" off — see schema.sql). The caller decides, since it
 * already holds the existing row and knows whether registered_at was unset.
 */
export async function updateUserProfile(
  id: string,
  fields: ProfileFields,
  opts: { markRegistered?: boolean } = {},
): Promise<User | null> {
  const row: Record<string, unknown> = profileToRow(fields);
  if (opts.markRegistered) row.registered_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("users")
    .update(row)
    .eq("id", id)
    .select(USER_COLS)
    .maybeSingle();
  if (error) throw error;
  return data ? toUser(data) : null;
}

export async function updateUserRole(
  id: string,
  role: UserRole,
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", id)
    .select(USER_COLS)
    .maybeSingle();
  if (error) throw error;
  return data ? toUser(data) : null;
}

/** Returns true if a row was deleted, false if the id did not exist. */
export async function deleteUser(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data != null;
}

/**
 * Counts users currently holding the pastor role — backs the "at least one
 * pastor must remain" guard. Uses a head/count query so no rows are fetched.
 */
export async function countPastors(): Promise<number> {
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "pastor");
  if (error) throw error;
  return count ?? 0;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function listEvents(): Promise<EventSummary[]> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SUMMARY_COLS)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toEventSummary);
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toEventDetail(data) : null;
}

export async function getEventByCheckinCode(
  checkinCode: string,
): Promise<EventByCode | null> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_BY_CODE_COLS)
    .eq("checkin_code", checkinCode)
    .maybeSingle();
  if (error) throw error;
  return data ? toEventByCode(data) : null;
}

export async function createEvent(
  input: CreateEventInput,
): Promise<EventDetail> {
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description,
      location: input.location,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      created_by: input.createdById,
    })
    .select(EVENT_COLS)
    .single();
  if (error) throw error;
  return toEventDetail(data);
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput,
): Promise<EventDetail | null> {
  const { data, error } = await supabase
    .from("events")
    .update({
      title: input.title,
      description: input.description,
      location: input.location,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
    })
    .eq("id", id)
    .select(EVENT_COLS)
    .maybeSingle();
  if (error) throw error;
  return data ? toEventDetail(data) : null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data != null;
}

// ─── Check-ins ───────────────────────────────────────────────────────────────

/**
 * Atomically check a member in and award points, via the `check_in` Postgres
 * function (one transaction). A repeat check-in trips UNIQUE(event_id, user_id)
 * → SQLSTATE 23505, which rolls back the whole function (including the points
 * increment); the route maps that to 409.
 */
export async function checkInUser(
  eventId: string,
  userId: string,
): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("check_in", {
    p_event_id: eventId,
    p_user_id: userId,
  });
  if (error) throw error;
  return { id: data as string };
}

export async function listEventCheckins(
  eventId: string,
): Promise<EventCheckin[]> {
  const { data, error } = await supabase
    .from("checkins")
    .select("id, checked_in_at, user:users(id, first_name, last_name, nickname)")
    .eq("event_id", eventId)
    .order("checked_in_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    checkedInAt: r.checked_in_at,
    user: toUserBrief(r.user),
  }));
}

export async function listUserCheckins(
  userId: string,
): Promise<UserCheckin[]> {
  const { data, error } = await supabase
    .from("checkins")
    .select("id, checked_in_at, event:events(id, title, location, starts_at)")
    .eq("user_id", userId)
    .order("checked_in_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    checkedInAt: r.checked_in_at,
    event: toEventBrief(r.event),
  }));
}
