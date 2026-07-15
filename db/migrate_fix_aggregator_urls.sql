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

UPDATE opportunities
SET source_url = 'https://www.oneyoungworld.com/scholarship/leading-scholarship-2026',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://opportunitiesforyouth.org/2026/03/18/how-to-attend-one-young-world-summit-2026-scholarships-lead2030-challenges-and-fully-funded-opportunities/';

UPDATE opportunities
SET source_url = 'https://karshfellowship.org/apply/',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://opportunitiesforyouth.org/2026/06/17/applications-open-for-the-2026-karsh-journalism-fellowship/';

UPDATE opportunities
SET source_url = 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50026200',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://daadscholarship.com/fully-funded-daad-scholarships-application-deadlines-2026-2027/';

UPDATE opportunities
SET source_url = 'https://k3-hamburg.de/en/professionals/residencyapplicationform',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://contemporaryperformance.com/2026/06/26/k3-choreography-residency-27-28/';

UPDATE opportunities
SET source_url = 'https://camargofoundation.org/current-calls/camargo-fellowship/',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://ilikenetworking.substack.com/p/fellowship-and-residencies-to-apply';

UPDATE opportunities
SET source_url = 'https://www.gatescambridge.org/apply/how-to-apply/',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://ugresearch.ucsd.edu/prestigious-scholarships/scholarship-pages/gates-cambridge.html';

UPDATE opportunities
SET source_url = 'https://www.niied.go.kr/web/niied/contents/niiedEng/eng_gksDegree',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://www.studyabroad.pk/news-event/gks-scholarship-2026-fully-funded-global-korea-scholarship-25127';

UPDATE opportunities
SET source_url = 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships-applications/',
    source_verification_status = 'official_source',
    updated_at = now()
WHERE source_url = 'https://universityadmissioninfo.com/commonwealth-shared-scholarship/';
