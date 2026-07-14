-- Adds fact-checking infrastructure to an already-deployed database (schema.sql
-- alone won't apply this to Neon since the tables already exist there).
-- Safe to re-run.

ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS verification_notes TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS link_broken BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS opportunity_reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id     UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  reason              TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_reports_opportunity ON opportunity_reports (opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_reports_status ON opportunity_reports (status);
