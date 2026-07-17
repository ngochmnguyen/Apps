-- Adds deadline-expiry archival and public opportunity submissions to an
-- already-deployed database. Safe to re-run.

ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS opportunity_submissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  organization_name   TEXT,
  source_url          TEXT,
  notes                TEXT,
  submitter_email      TEXT,
  status               TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_archived ON opportunities (is_archived);
CREATE INDEX IF NOT EXISTS idx_opportunity_submissions_status ON opportunity_submissions (status);
