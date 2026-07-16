-- Consolidates the Fulbright English Teaching Assistant (ETA) Program down
-- to a single entry instead of one row per country post. The surviving row
-- (originally the Vietnam-specific entry, source_url unchanged) has been
-- rewritten to describe the program generally and name several of its ~80
-- country posts, matching the corresponding edit already made to
-- ingest_batch_2026-07-13b.json.
--
-- This does NOT touch "Fulbright Foreign Student Program" or "Fulbright
-- Foreign Language Teaching Assistant (FLTA) Program" -- those bring
-- non-US citizens TO the US and are different programs entirely, not part
-- of the U.S. Student Program.
-- Safe to re-run.

DELETE FROM opportunities WHERE source_url IN (
  'https://mn.usembassy.gov/fulbright-english-teaching-assistant-program/',
  'https://us.fulbrightonline.org/countries/south-and-central-asia/kazakhstan/1615',
  'https://fulbright.org.ph/',
  'https://us.fulbrightonline.org/countries/western-hemisphere/mexico/1646',
  'https://us.fulbrightonline.org/countries/western-hemisphere/brazil/1628',
  'https://us.fulbrightonline.org/countries/western-hemisphere/argentina/1766'
);
