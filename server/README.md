# Wayfarer server

Small Express API backing `prototype/index.html` with real Postgres data and
cookie-based auth, replacing the hardcoded mock array the frontend used before.

## Setup

1. Load the schema and seed data into a Postgres database:
   ```
   createdb wayfarer_dev
   psql -d wayfarer_dev -f ../db/schema.sql
   psql -d wayfarer_dev -f ../db/seed.sql
   ```
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (must point at the
   database from step 1) and a random `JWT_SECRET`.
3. Install and run:
   ```
   npm install
   npm start
   ```
4. Open http://localhost:3001 — this serves `prototype/index.html` directly
   and proxies its API calls to `/api/*` on the same origin.

## What's here

- `src/db.js` — Postgres connection pool.
- `src/auth.js` — password hashing (bcrypt) and JWT session cookies.
- `src/routes/auth.js` — signup, login, logout, session check, profile update.
- `src/routes/meta.js` — countries and currencies lookup data.
- `src/routes/opportunities.js` — the main listing endpoint: computes
  eligibility, deadline urgency, and distance-from-home against the signed-in
  profile (or query params, for anonymous browsing), mirroring the logic that
  used to live entirely in the frontend.

## Note on the Artifact preview

The published Artifact link only ever shows the old hardcoded-data version —
Artifacts run under a CSP that blocks all outbound network requests, so a
page that calls a real API can't be previewed that way. To see live data,
you need to run this server locally.
