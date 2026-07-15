-- Fixes opportunities whose source_url pointed to an aggregator, blog, or
-- unrelated third-party page instead of the organization's own official
-- website. ingest.js dedupes on source_url, so simply changing the URL in
-- the batch JSON and re-ingesting would create a *duplicate* row rather than
-- fixing the existing one -- this migration updates the already-ingested
-- rows in place, matched by their current (wrong) source_url.
-- Safe to re-run.

UPDATE opportunities
SET source_url = 'https://www.citeinternationaledesarts.fr/en/programme-de-residence/kota/',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://www2.fundsforngos.org/individuals/open-call-kota-residency-programme-for-artists-indonesia/';
