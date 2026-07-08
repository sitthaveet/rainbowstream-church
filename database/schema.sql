-- ════════════════════════════════════════════════════════════════════════════
-- Rainbow Stream Church — database schema (Neon Postgres)
-- Run in the Neon SQL editor or via `psql "$NEON_CONNECTION" -f schema.sql`.
-- The whole script is idempotent — every statement is guarded (do-block enums,
-- `if not exists`, `or replace`) so re-running it on an existing database is
-- safe and, crucially, NEVER aborts partway: an early "type already exists"
-- used to kill the batch before it reached check_in() at the bottom, leaving
-- the app with a missing function.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Enums ──────────────────────────────────────────────────────────────────
-- Native Postgres ENUM types, mirroring the GraphQL enums (act like a CHECK).
-- Postgres has no `create type if not exists`, so each is wrapped in a do-block
-- that swallows the duplicate_object error on re-run.

do $$ begin
  create type user_role as enum ('pastor', 'member');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type sex_at_birth as enum ('male', 'female', 'intersex');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type identity_orientation as enum (
    'gay_lesbian',
    'bisexual',
    'straight',
    'transgender',
    'other'
  );
exception when duplicate_object then null;
end $$;

-- ─── updated_at trigger helper ──────────────────────────────────────────────
-- Data Connect set updated_at via `request.time` on every mutation. A trigger
-- reproduces that automatically so the app doesn't have to remember to set it.

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── users ──────────────────────────────────────────────────────────────────

create table if not exists users (
  id                          uuid primary key default gen_random_uuid(),

  -- LINE identity: the LIFF userId (sub), known at first login. The only field
  -- populated when an account is auto-created; the rest is filled in later via
  -- the registration form.
  line_uid                    varchar(100) not null unique,

  -- Profile fields below are NULL until the user completes registration.

  -- Basic identity
  first_name                  varchar(100),
  last_name                   varchar(100),
  nickname                    varchar(100),
  birthdate                   date,

  -- Contact
  email                       varchar(255) unique,
  phone_number                varchar(50),
  address                     text,

  -- Personal profile
  sex_at_birth                sex_at_birth,
  identity_orientation        identity_orientation,
  identity_orientation_other  text,

  -- Christian background (christian_duration: years a Christian; 0 = not one)
  christian_duration          integer,
  church                      varchar(255),

  self_introduction           text,

  -- Gamification: points earned (e.g. via event check-ins).
  points                      integer not null default 0,

  -- Access role
  role                        user_role not null default 'member',

  -- Registration marker: set the first time the registration/profile form is
  -- submitted. NULL for an auto-created (login-only) account. The app keys the
  -- "registered" flag off this — NOT off any single profile field — because
  -- every profile field (incl. first/last name and nickname) is optional, so a
  -- field-presence heuristic would bounce a name-less registrant back forever.
  registered_at               timestamptz,

  -- System fields
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Backfill / add-column for projects created before registered_at existed.
-- `create table if not exists` above leaves an existing users table untouched,
-- so add the column here, then mark everyone who registered under the old rule
-- (first_name populated) as already registered — otherwise they'd be sent back
-- to the registration form after this deploy.
alter table users add column if not exists registered_at timestamptz;
update users
  set registered_at = coalesce(registered_at, updated_at)
  where first_name is not null and registered_at is null;

create or replace trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

-- ─── events ─────────────────────────────────────────────────────────────────

create table if not exists events (
  id            uuid primary key default gen_random_uuid(),

  -- Event details
  title         varchar(255) not null,
  description   text,
  location      text,

  -- Schedule
  starts_at     timestamptz not null,
  ends_at       timestamptz,

  -- Check-in: code embedded in the QR attendees scan at the event.
  checkin_code  uuid not null unique default gen_random_uuid(),

  -- Pastor who created the event. ON DELETE SET NULL: an event stands on its
  -- own and outlives the pastor who created it.
  created_by    uuid references users (id) on delete set null,

  -- System fields
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

-- Postgres does NOT auto-index FK columns (unlike Data Connect). Index the FK
-- so "events created by this pastor" lookups and SET NULL cascades stay fast.
create index if not exists events_created_by_idx on events (created_by);

-- ─── checkins ───────────────────────────────────────────────────────────────
-- An attendee can check in only once per event — enforced by the composite
-- unique constraint on (event_id, user_id). Deleting an event OR a user
-- cascade-deletes the related check-ins (both refs are required).

create table if not exists checkins (
  id             uuid primary key default gen_random_uuid(),

  event_id       uuid not null references events (id) on delete cascade,
  user_id        uuid not null references users (id) on delete cascade,

  checked_in_at  timestamptz not null default now(),

  unique (event_id, user_id)
);

-- The composite unique index covers (event_id) and (event_id, user_id) lookups.
-- Add a standalone index on user_id for "my check-in history" queries and for
-- the ON DELETE CASCADE when a user is removed.
create index if not exists checkins_user_id_idx on checkins (user_id);

-- ─── check_in() — atomic check-in + points award ────────────────────────────
-- Called from the app via `select check_in(...)` (lib/db.ts). A function body
-- runs in a single implicit transaction: a duplicate (event_id, user_id) raises
-- SQLSTATE 23505, which aborts the whole function so the points increment rolls
-- back too — the route handler maps that 23505 to a 409. Keep the `+ 10` in
-- sync with POINTS_PER_CHECKIN in app/api/checkins/route.ts.
create or replace function check_in(p_event_id uuid, p_user_id uuid)
returns uuid
language plpgsql
as $$
declare
  v_checkin_id uuid;
begin
  insert into checkins (event_id, user_id)
  values (p_event_id, p_user_id)
  returning id into v_checkin_id;

  update users set points = points + 10 where id = p_user_id;

  return v_checkin_id;
end;
$$;

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- RLS is intentionally left DISABLED (the Postgres default). The browser never
-- reaches Postgres directly — the Next.js route handlers proxy every query and
-- enforce authorization (lib/auth.ts) — so the server connects with full table
-- access (NEON_CONNECTION, server-only) and no per-row policies.