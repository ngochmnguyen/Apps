-- First-party, self-hosted product analytics -- no third-party script, no
-- cookie banner needed since session_id is a random client-generated id
-- (see prototype/index.html's ANALYTICS_SESSION_KEY), not tied to a person
-- unless they're signed in. See server/src/routes/analytics.js.
--
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS analytics_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT NOT NULL,
  session_id    TEXT NOT NULL,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  path          TEXT,
  meta          JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events (event_type, created_at);
