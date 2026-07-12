# Overview
This project is a web-based for Rainbow Stream church management. It's very simple web application using LINE LIFF framework to enable best experience on LINE application.

# Features
- **Member Management**: Add, edit, and delete member information.
- **Check-in System**: Attendees scan QR code at the event to check in.
- **Authentication**: Login with LINE account.
- **User Roles**: Have 2 levels - Pastor level and Member level.
- **Event Management**: Create and manage church events eg. fellowship meetings.

# Technology Stack
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4, with the LINE LIFF SDK (`@line/liff`). NPM for packages.
- **Database**: Neon Serverless Postgres
- **Backend**: Next.js route handlers (`frontend/app/api/**`) proxy every DB operation and enforce authorization. Request bodies are validated with Zod.
- **Auth/session**: a server-signed JWT session cookie (`jose`), bridged from the LINE ID token (see Authentication).
- **Other libs**: `qrcode.react` (event QR codes), `motion` (Framer Motion v12, animations).
- **Deployment**: Vercel for frontend,  Neon for database.

# Project Structure
- `frontend`: Next.js app (App Router) with the LIFF SDK.
  - `app/`: pages (`/`, `/checkin`, `/register`, `/profile`, `/history`, `/admin/events`, `/admin/members`) and the API route handlers under `app/api/**`.
  - `lib/`: the server/client boundary — `db.ts` (the only place that talks to Postgres; maps snake_case ⇄ camelCase), `pg.ts` (server-side connection pool), `auth.ts` (session → user + role checks), `session.ts` (JWT cookie), `line.ts` (ID-token verification), `validation.ts` (Zod schemas), `api.ts` (route error handling), `client.ts` (the browser's typed API client), `types.ts` (domain types/enums).
  - `providers/`: client context — `liff-providers.tsx` (`liff.init()`) and `auth-provider.tsx` (session bootstrap).
  - `components/`: UI components, with primitives under `components/ui/`.
- `database`: `schema.sql` — the full database schema (tables, enums, indexes, `check_in()` function); the database now lives on Neon.

# User Flow
- User scan QR code at the event to check in.
- If user is not logged in, they will be prompted to login with their LINE account and register their account, then it will check in automatically after registration.
- If user is already logged in, it will check in immediately after scanning the QR code.
- Once logged in, users can check-in and view their profile and check-in history.
- For each check in, users will earn 10 points. Points can be used to redeem rewards in the future (not implemented yet).
- For pastors, they can create and manage events, share QR code of the event, view check-in data, and manage member information.

# Context
- For Design go to @DESIGN.md
- For Database schema, check at @database/schema.sql

# Security
- Only pastor role can create, update, delete events and view, update, delete check-in data.
- Members can only view and edit their own profile.
- We will manually create pastor inside the database.

# Authentication
- **Login flow**: `LIFFProvider` runs `liff.init()`; `AuthProvider` then bootstraps the session — it
  first tries `GET /api/auth/me` (an existing cookie wins, which also lets the app run in a plain
  browser during dev), otherwise it reads the LINE ID token from LIFF and `POST`s it to
  `/api/auth/login`.
- **Server side**: `/api/auth/login` verifies the ID token against LINE's `oauth2/v2.1/verify`
  endpoint (audience = `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID`, the LINE Login channel ID — NOT the
  LIFF ID), resolves or auto-creates the user by `line_uid`, and issues a signed JWT session cookie
  (`rsc_session`; HttpOnly + Secure + SameSite=None, 7-day expiry). SameSite=None is required
  because LIFF runs inside LINE's in-app webview.
- **Roles**: the role is NOT stored in the cookie — `lib/auth.ts` reads it fresh from the DB on
  every request (`requireAuth` / `requirePastor` / `requireSelfOrPastor`), so a promotion,
  demotion, or account deletion takes effect on the next request. `components/guard.tsx`
  (`AuthBoundary` / `RequireRegistered` / `RequirePastor`) mirrors this on the client for UX, but
  the server checks are the real enforcement.
- **Registration**: a profile is "registered" once `users.registered_at` is set (NOT keyed off any
  single profile field); the `registered` flag on the auth responses drives the `/register` redirect.

# Operations
- **Database**: the browser never talks to Postgres directly — all DB access is proxied through
  the Next.js route handlers (`frontend/app/api/**`), which enforce authorization (`lib/auth.ts`).
  The server connects to Neon with `pg` via a shared pool (`frontend/lib/pg.ts`) using the
  `NEON_CONNECTION` string; there is no row-level security, so the connection string must stay
  server-only. `frontend/lib/db.ts` is the single boundary that maps snake_case columns ⇄
  camelCase domain types.
- **Schema setup**: run `database/schema.sql` in the Neon SQL editor or via
  `psql "$NEON_CONNECTION" -f database/schema.sql` (tables, enums, indexes,
  and the `check_in()` function for atomic check-in + points).
- **Roles**: there is no in-app role UI — promote (or demote) pastors directly in the Neon SQL
  editor:
  `update users set role = 'pastor' where line_uid = '<LINE userId>';`
- **Environment variables** (`frontend/.env.local`):
  - `NEON_CONNECTION` — Postgres connection string for Neon (keep server-only; use the
    pooled `-pooler` endpoint in production).
  - `SESSION_SECRET` — signs the JWT session cookie.
  - `NEXT_PUBLIC_LIFF_ID` — passed to `liff.init()`.
  - `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID` — LINE Login channel ID, used to verify ID tokens.
- **Local dev**: `cd frontend && npm run dev` (Neon is hosted; no local DB emulator).

# References
- Neon: https://neon.com/docs
- LINE LIFF: https://developers.line.biz/en/docs/liff/
- LINE login: https://developers.line.biz/en/docs/line-login/

