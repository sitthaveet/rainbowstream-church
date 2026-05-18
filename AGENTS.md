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
- If user is not logged in, they will be prompted to login with their LINE account.
- After login, they can check-in and view their profile and check-in history.
- For each check in, users will earn 10 points. Points can be used to redeem rewards in the future (not implemented yet).
- For pastors, they can create and manage events, share QR code of the event, view check-in data, and manage member information.

# Context
- For Design go to @DESIGN.md
- For Database schema go to @SCHEMA.md

# Security
- Only pastor role can create, update, delete events and view, update, delete check-in data.
- Members can only view and edit their own profile.

# References
- Firebase SQL Connect: https://firebase.google.com/docs/sql-connect
- LINE LIFF: https://developers.line.biz/en/docs/liff/
- LINE login: https://developers.line.biz/en/docs/line-login/

