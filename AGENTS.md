# Overview
This project is a web-based for Rainbow Stream church management. It's very simple web application using LINE LIFF framework to enable best experience on LINE application.

# Features
- **Member Management**: Add, edit, and delete member information.
- **Check-in System**: Attendees scan QR code at the event to check in.
- **Authentication**: Login with LINE account.
- **User Roles**: Have 2 levels - Pastor level and Member level.
- **Event Management**: Create and manage church events eg. fellowship meetings.

# Technology Stack
- **Frontend**: NextJS with TypeScript + Tailwind CSS + NPM + Line LIFF SDK
- **Database**: Firebase SQL Connect (PostgreSQL)
- **Backend**: We use proxy server of route handlers in NextJS API routes to handle database operations.
- **Deployment**: Vercel for frontend, Firebase for database

# Project Structure
- `frontend`: NextJS frontend application with LIFF SDK
- `dataconnect`: Firebase SQL Connect

# User Flow
- User scan QR code at the event to check in.
- If user is not logged in, they will be prompted to login with their LINE account and register their account, then it will check in automatically after registration.
- If user is already logged in, it will check in immediately after scanning the QR code.
- Once logged in, users can check-in and view their profile and check-in history.
- For each check in, users will earn 10 points. Points can be used to redeem rewards in the future (not implemented yet).
- For pastors, they can create and manage events, share QR code of the event, view check-in data, and manage member information.

# Context
- For Design go to @DESIGN.md
- For Database schema, check at @dataconnect/schema/schema.gql

# Security
- Only pastor role can create, update, delete events and view, update, delete check-in data.
- Members can only view and edit their own profile.
- We will manually create pastor inside the database.

# Operations
- **First pastor bootstrap**: role changes require an existing pastor, so promote the founding pastor manually — run `UPDATE users SET role = 'pastor' WHERE line_id = '<LINE userId>';` against the database (Firebase console → Data Connect for production, or the local emulator for dev). Everyone after that can be promoted in the app (จัดการสมาชิก).
- **Local dev**: `npx firebase-tools@latest emulators:start --only dataconnect` (older firebase-tools downgrade the emulator binary and fail to parse dataconnect.yaml) + `cd frontend && npm run dev`. `DATACONNECT_EMULATOR_HOST` in `.env.local` points the app at the emulator.
- **E2E smoke test**: with both running, `cd frontend && SESSION_SECRET=$(grep '^SESSION_SECRET=' .env.local | cut -d= -f2-) node scripts/e2e-smoke.mjs` exercises the whole user flow (auth, roles, check-in + points, duplicate 409, registration, event CRUD, cascade delete).

# Data Connect gotchas (verified against the emulator)
- UUID values are **emitted as 32-char hex without hyphens**; both hyphenated and dash-less forms are accepted as inputs. Validation must accept both (`lib/validation.ts`).
- The Firebase web SDK defaults queries to `PREFER_CACHE`, which serves stale reads inside the long-lived server process. All server-side queries must go through `frontend/lib/db.ts`, which pins `fetchPolicy: "SERVER_ONLY"`.

# References
- Firebase SQL Connect: https://firebase.google.com/docs/sql-connect
- LINE LIFF: https://developers.line.biz/en/docs/liff/
- LINE login: https://developers.line.biz/en/docs/line-login/

