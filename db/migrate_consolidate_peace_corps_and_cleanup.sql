-- Same treatment as migrate_consolidate_fulbright_eta.sql, applied to Peace
-- Corps: consolidates the standard 2-year Peace Corps Volunteer program down
-- to a single entry instead of one row per country post. The surviving row
-- (originally the Ghana-specific entry, source_url unchanged) has been
-- rewritten to describe the program generally and name several of its ~60
-- country posts, matching the corresponding edit already made to
-- ingest_batch_2026-07-15f.json.
--
-- This does NOT touch "Peace Corps Response - Mexico" -- Peace Corps
-- Response is a distinct short-term (3-12 month) specialist placement
-- program for experienced professionals, structurally different from the
-- standard 27-month Volunteer program, the same way Fulbright FLTA is kept
-- separate from Fulbright ETA.
--
-- Also removes "FEEL: A Disruptive Futures Programme" (Dubai Future
-- Foundation) -- confirmed to actually be a paid program (participants pay
-- to attend), not a funded opportunity. This app only lists opportunities
-- that pay or cover costs for the applicant, never pay-to-participate
-- schemes, so this listing shouldn't have been included in the first place.
--
-- Safe to re-run.

DELETE FROM opportunities WHERE source_url IN (
  'https://www.peacecorps.gov/viet-nam/',
  'https://www.peacecorps.gov/fiji/',
  'https://www.peacecorps.gov/mongolia/',
  'https://www.peacecorps.gov/kyrgyz-republic/'
);

DELETE FROM opportunities WHERE source_url = 'https://www.dubaifuture.ae/feel-2026/';
