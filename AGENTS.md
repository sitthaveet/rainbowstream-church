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
- **Database**: Supabase
- **Backend**: We use proxy server of route handlers in NextJS API routes to handle database operations.
- **Deployment**: Vercel for frontend, Supabase for database

# Project Structure
- `frontend`: NextJS frontend application with LIFF SDK
- `supabase`: Supabase Schema

# User Flow
- User scan QR code at the event to check in.
- If user is not logged in, they will be prompted to login with their LINE account and register their account, then it will check in automatically after registration.
- If user is already logged in, it will check in immediately after scanning the QR code.
- Once logged in, users can check-in and view their profile and check-in history.
- For each check in, users will earn 10 points. Points can be used to redeem rewards in the future (not implemented yet).
- For pastors, they can create and manage events, share QR code of the event, view check-in data, and manage member information.

# Context
- For Design go to @DESIGN.md
- For Database schema, check at @supabase/schema.sql

# Security
- Only pastor role can create, update, delete events and view, update, delete check-in data.
- Members can only view and edit their own profile.
- We will manually create pastor inside the database.

# Operations
- **Database**: the browser never talks to Supabase directly — all DB access is proxied through
  the Next.js route handlers (`frontend/app/api/**`), which enforce authorization (`lib/auth.ts`).
  The server uses the Supabase publishable key (`SUPABASE_PUBLIC_API_KEY`) with RLS disabled.
  `frontend/lib/db.ts` is the single boundary that maps snake_case columns ⇄ camelCase domain types.
- **Schema setup**: run `supabase/schema.sql` in the Supabase SQL editor (tables, enums, indexes,
  and the `check_in()` function for atomic check-in + points).
- **First pastor bootstrap**: role changes require an existing pastor, so promote the founding
  pastor manually in the Supabase SQL editor:
  `update users set role = 'pastor' where line_id = '<LINE userId>';`
  Everyone after that can be promoted in the app (จัดการสมาชิก).
- **Local dev**: `cd frontend && npm run dev` (Supabase is hosted; no local DB emulator).

# References
- Supabase: https://supabase.com/docs
- LINE LIFF: https://developers.line.biz/en/docs/liff/
- LINE login: https://developers.line.biz/en/docs/line-login/

