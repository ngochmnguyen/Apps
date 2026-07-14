-- Two small schema changes, needed for a batch of real opportunities that
-- don't fit the original assumptions:
--
-- 1. Some real programs (leadership exchanges, language-school internships)
--    don't publish a fixed application deadline at all — you just reach out
--    directly and they process requests on a rolling basis. The original
--    schema required application_deadline on every row, which forced either
--    fabricating a plausible-looking date (bad — exactly the kind of made-up
--    detail the fact-check work was meant to prevent) or leaving out
--    otherwise-legitimate opportunities. Made nullable; NULL means "rolling,
--    contact the organization directly," not "unknown."
--
-- 2. Saudi Arabia wasn't in the countries table yet; a legitimate opportunity
--    (KSGAAL Arabic immersion program) is destined there.
--
-- Run this in Neon's SQL Editor against the production database, the same
-- way migrate_add_verification_and_reports.sql was run.

ALTER TABLE opportunities ALTER COLUMN application_deadline DROP NOT NULL;

CREATE OR REPLACE VIEW opportunities_with_urgency AS
SELECT
  o.*,
  CASE
    WHEN o.application_deadline IS NULL THEN 'rolling'
    WHEN o.application_deadline < CURRENT_DATE THEN 'closed'
    WHEN o.application_deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'closing_soon'
    WHEN o.application_deadline <= CURRENT_DATE + INTERVAL '30 days' THEN 'this_month'
    ELSE 'open'
  END AS deadline_urgency
FROM opportunities o;

INSERT INTO countries (code, name, region, is_non_conventional_dest, is_gulf, latitude, longitude) VALUES
  ('SA', 'Saudi Arabia', 'Middle East', FALSE, TRUE, 24.7136, 46.6753)
ON CONFLICT (code) DO NOTHING;
