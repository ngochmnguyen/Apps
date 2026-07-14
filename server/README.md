# Voya server

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
- `src/ingest.js` — loads real, web-researched opportunity data (as opposed to
  the fictional seed data in `db/seed.sql`) into the same schema. Takes a JSON
  file (shape documented in a comment at the top of the file) and upserts,
  deduping on `source_url` so it's safe to re-run. See `ingest_batch_*.json`
  files in this directory for real examples. If an opportunity's destination
  country or currency isn't already in the `countries`/`currencies` tables,
  add it with a plain SQL INSERT first (see `db/seed.sql`'s "ADDITIONS FOR
  REAL SOURCED DATA" section for the pattern).

  There's a daily scheduled Routine (`Voya daily opportunity sourcing`)
  that runs this workflow automatically — see the caveats below.

## Note on the daily sourcing Routine

A Routine fires once a day into a fresh session in this environment, asking
Claude to search the web for new real opportunities, verify them as best it
can, and run `src/ingest.js`. Two things worth knowing:

- **This only works as long as this sandbox environment stays alive.** During
  development this container restarted three times in about twenty minutes —
  Postgres and the Express server die on every restart (though data on disk
  survives). A daily job depends on the environment being reachable at fire
  time; if you want this to be a real, dependable pipeline, it needs to move
  to persistent hosting (a managed Postgres like Neon/Supabase/RDS, and a
  server process that isn't a dev sandbox), not just a longer-lived version of
  this setup.
- **Verification is inherently softer than a human clicking through to the
  primary source.** `WebFetch` is blocked by this environment's egress policy,
  so the ingestion workflow relies on `WebSearch` summaries and
  cross-referencing multiple independent sources rather than opening each
  organization's own page directly. Treat `source_verification_status` on
  ingested rows accordingly — it reflects confidence, not certainty.

## Note on the Artifact preview

The published Artifact link only ever shows the old hardcoded-data version —
Artifacts run under a CSP that blocks all outbound network requests, so a
page that calls a real API can't be previewed that way. To see live data,
you need to run this server locally.
