-- Cleans up accidental duplicate rows created by pushing corrected source_urls
-- (see migrate_fix_aggregator_urls.sql) before that migration had been run
-- against production. ingest.js dedupes by looking up the exact source_url;
-- since the old (wrong) URL was still the only one on file for these rows,
-- re-ingesting the batch JSON with the new (correct) URL created a second
-- row instead of updating the first.
--
-- IMPORTANT: run this BEFORE migrate_fix_aggregator_urls.sql. That migration
-- updates the original row's source_url to match the duplicate's -- if it
-- runs first, both rows end up with the identical URL and can no longer be
-- told apart by URL alone. Keying this cleanup on title (not URL) instead
-- makes it safe to re-run at any point regardless of that ordering, but the
-- intended order is: this file, then migrate_fix_aggregator_urls.sql.
--
-- Keeps the OLDER row (original creation, likely to hold any real
-- saved_opportunities/todo_items/opportunity_reports history) and deletes
-- the newer duplicate. Safe to re-run: if only one row remains for a title,
-- the self-join matches nothing.

DELETE FROM opportunities o
USING opportunities o2
WHERE o.title = o2.title
  AND o.created_at > o2.created_at
  AND o.title IN (
    'Karsh Journalism Fellowship (2027 Cohort)',
    'DAAD Study Scholarship (2027 Intake)',
    'K3 Choreography Residency 2027-28',
    'Camargo Fellowship 2027-28',
    'Gates Cambridge Scholarship',
    'Global Korea Scholarship (GKS)',
    'Commonwealth Shared Scholarships'
  );
