/**
 * The data-access layer — the single boundary between the app's camelCase
 * domain types (lib/types.ts) and Postgres' snake_case columns.
 *
 * Every function here speaks snake_case SQL to Postgres (Neon, via lib/pg.ts)
 * and returns camelCase domain objects, so route handlers, lib/client.ts, and
 * the components never see a raw row. Reads/writes/RPC all live here; the
 * route handlers call these functions and never touch the pool directly.
 */
import { query } from "./pg";
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
} from "./types";

// ─── Column lists ────────────────────────────────────────────────────────────

const USER_COLS =
  "id, line_uid, first_name, last_name, nickname, birthdate, email, " +
  "phone_number, address, sex_at_birth, identity_orientation, " +
  "identity_orientation_other, christian_duration, church, " +
  "self_introduction, points, role, registered_at, created_at, updated_at";

const MEMBER_COLS =
  "id, first_name, last_name, nickname, email, phone_number, points, role, " +
  "created_at, updated_at";

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
    updatedAt: r.updated_at,
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

/**
 * Builds `col1 = $2, col2 = $3, …` from a payload row, skipping `undefined`
 * values — an absent field leaves the column untouched, while an explicit
 * `null` clears it. `$1` is reserved for the row id. Column names come from
 * our own literal payload objects above, never from user input.
 */
function setClause(row: Record<string, unknown>): {
  sets: string;
  values: unknown[];
} {
  const entries = Object.entries(row).filter(([, v]) => v !== undefined);
  return {
    sets: entries.map(([col], i) => `${col} = $${i + 2}`).join(", "),
    values: entries.map(([, v]) => v),
  };
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserByLineUid(lineUid: string): Promise<User | null> {
  const { rows } = await query(
    `select ${USER_COLS} from users where line_uid = $1`,
    [lineUid],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await query(`select ${USER_COLS} from users where id = $1`, [
    id,
  ]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function listUsers(): Promise<MemberSummary[]> {
  const { rows } = await query(
    `select ${MEMBER_COLS} from users order by created_at desc`,
  );
  return rows.map(toMemberSummary);
}

/** Auto-creates an account on first LINE login (only line_uid is known). */
export async function createUser(lineUid: string): Promise<User> {
  const { rows } = await query(
    `insert into users (line_uid) values ($1) returning ${USER_COLS}`,
    [lineUid],
  );
  return toUser(rows[0]);
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
  const { sets, values } = setClause(row);
  const { rows } = await query(
    `update users set ${sets} where id = $1 returning ${USER_COLS}`,
    [id, ...values],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

/** Returns true if a row was deleted, false if the id did not exist. */
export async function deleteUser(id: string): Promise<boolean> {
  const { rows } = await query(`delete from users where id = $1 returning id`, [
    id,
  ]);
  return rows.length > 0;
}

/**
 * Counts users currently holding the pastor role — backs the "at least one
 * pastor must remain" guard. `::int` keeps the count a number (bigint would
 * arrive as a string).
 */
export async function countPastors(): Promise<number> {
  const { rows } = await query(
    `select count(*)::int as count from users where role = 'pastor'`,
  );
  return rows[0]?.count ?? 0;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function listEvents(): Promise<EventSummary[]> {
  const { rows } = await query(
    `select ${EVENT_SUMMARY_COLS} from events order by starts_at desc`,
  );
  return rows.map(toEventSummary);
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  const { rows } = await query(
    `select ${EVENT_COLS} from events where id = $1`,
    [id],
  );
  return rows[0] ? toEventDetail(rows[0]) : null;
}

export async function getEventByCheckinCode(
  checkinCode: string,
): Promise<EventByCode | null> {
  const { rows } = await query(
    `select ${EVENT_BY_CODE_COLS} from events where checkin_code = $1`,
    [checkinCode],
  );
  return rows[0] ? toEventByCode(rows[0]) : null;
}

export async function createEvent(
  input: CreateEventInput,
): Promise<EventDetail> {
  const { rows } = await query(
    `insert into events (title, description, location, starts_at, ends_at, created_by)
     values ($1, $2, $3, $4, $5, $6)
     returning ${EVENT_COLS}`,
    [
      input.title,
      input.description ?? null,
      input.location ?? null,
      input.startsAt,
      input.endsAt ?? null,
      input.createdById,
    ],
  );
  return toEventDetail(rows[0]);
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput,
): Promise<EventDetail | null> {
  const { sets, values } = setClause({
    title: input.title,
    description: input.description,
    location: input.location,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
  });
  const { rows } = await query(
    `update events set ${sets} where id = $1 returning ${EVENT_COLS}`,
    [id, ...values],
  );
  return rows[0] ? toEventDetail(rows[0]) : null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const { rows } = await query(
    `delete from events where id = $1 returning id`,
    [id],
  );
  return rows.length > 0;
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
  const { rows } = await query(`select check_in($1, $2) as id`, [
    eventId,
    userId,
  ]);
  return { id: rows[0].id as string };
}

export async function listEventCheckins(
  eventId: string,
): Promise<EventCheckin[]> {
  // json_build_object keeps the nested shape the old PostgREST embed returned,
  // so the row mappers stay identical.
  const { rows } = await query(
    `select c.id, c.checked_in_at,
            json_build_object('id', u.id, 'first_name', u.first_name,
                              'last_name', u.last_name, 'nickname', u.nickname)
              as "user"
       from checkins c
       join users u on u.id = c.user_id
      where c.event_id = $1
      order by c.checked_in_at asc`,
    [eventId],
  );
  return rows.map((r: any) => ({
    id: r.id,
    checkedInAt: r.checked_in_at,
    user: toUserBrief(r.user),
  }));
}

export async function listUserCheckins(
  userId: string,
): Promise<UserCheckin[]> {
  const { rows } = await query(
    `select c.id, c.checked_in_at,
            json_build_object('id', e.id, 'title', e.title,
                              'location', e.location, 'starts_at', e.starts_at)
              as "event"
       from checkins c
       join events e on e.id = c.event_id
      where c.user_id = $1
      order by c.checked_in_at desc`,
    [userId],
  );
  return rows.map((r: any) => ({
    id: r.id,
    checkedInAt: r.checked_in_at,
    event: toEventBrief(r.event),
  }));
}
