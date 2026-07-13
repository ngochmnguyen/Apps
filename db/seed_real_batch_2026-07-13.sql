-- Real, web-researched opportunities (see server/ingest_batch_2026-07-13.json
-- for the source-of-truth data and server/src/ingest.js for how this normally
-- gets loaded). This file exists only because this session's sandbox can't
-- reach Neon directly (raw TCP connections are blocked by its egress policy) —
-- run it via the Neon SQL Editor instead. Requires schema.sql and seed.sql
-- (including its "ADDITIONS FOR REAL SOURCED DATA" section) to already be loaded.

INSERT INTO opportunities (
  id, title, description, organization_name, opportunity_type, primary_destination_code,
  compensation_type, covers_flight, covers_lodging, covers_meals, stipend_min, stipend_max, currency_code,
  requires_work_visa_for_payment, payment_visa_notes,
  min_age, max_age, requires_grad_student_status, english_level_required,
  application_deadline, duration_category, is_recurring, application_effort, estimated_application_minutes,
  source_verification_status, source_url
) VALUES
  ('cdb1ffff-6c3e-492d-952b-08fa08708669', 'PIBBSS Winter Fellowship 2026–2027', 'Three-month interdisciplinary AI safety research fellowship pairing researchers from any field (not just computer science) with mentors working on AI risk, based primarily in Cape Town with remote participation available for exceptional candidates.', 'Principles of Intelligence (PIBBSS)', 'research_residency', 'ZA',
   'cash_and_in_kind', TRUE, TRUE, FALSE, 3000, 3000, 'USD',
   FALSE, NULL,
   21, NULL, FALSE, 'c1',
   '2026-07-20', 'one_to_three_months', TRUE, 'high', 120,
   'official_source', 'https://princint.ai/programs/fellowship/'),

  ('dbda9319-c7bd-4b5e-bff6-e5db9447130d', 'IOM Internship Programme', 'Six-month internship with the UN''s migration agency (extendable by 3 months); placement and stipend vary by duty station. Kazakhstan, Kyrgyzstan, and Mongolia were listed among IOM''s under-represented member states seeking applicants as of mid-2026. Some postings also cover travel and visa costs.', 'International Organization for Migration (IOM)', 'internship', 'KZ',
   'cash', FALSE, FALSE, FALSE, 967, 1693, 'USD',
   FALSE, NULL,
   20, 36, FALSE, 'b2',
   '2026-12-31', 'semester_or_longer', TRUE, 'high', 90,
   'official_source', 'https://www.iom.int/internship-programme'),

  ('d4fcc140-f108-4696-8499-802195813918', 'Chevening Scholarship 2027/2028', 'UK government scholarship funding a one-year master''s degree at any UK university, for future leaders and influencers worldwide. Applications for the next cohort open around August–September 2026.', 'UK Foreign, Commonwealth & Development Office (Chevening)', 'scholarship_fellowship', 'GB',
   'cash_and_in_kind', TRUE, TRUE, FALSE, NULL, NULL, 'GBP',
   FALSE, NULL,
   21, NULL, FALSE, 'c1',
   '2026-10-06', 'semester_or_longer', TRUE, 'extensive', 240,
   'official_source', 'https://www.chevening.org/apply/'),

  ('7d57de8a-14b1-43db-86d1-51478a12f012', 'Sunwing Canada''s Next Top Creators Contest', 'Content creator contest for Canadian residents; ten creators win two fully-funded all-inclusive Sunwing vacation packages (destination of the creator''s choosing among Sunwing routes) and compete for a $10,000 CAD grand prize.', 'Sunwing Vacations', 'contest_competition', 'MX',
   'cash_and_in_kind', TRUE, TRUE, TRUE, 10000, 10000, 'CAD',
   FALSE, NULL,
   18, NULL, FALSE, 'b2',
   '2026-08-07', 'weekend', TRUE, 'quick', 20,
   'aggregator_verified', 'https://www.sunwing.ca/en/canadas-next-top-creators'),

  ('4667b24d-9e8f-4a4b-a806-0ae79a6b9fa0', '421 Arts Campus Residency Program', 'Five-month multidisciplinary artist residency (visual arts, design, music, literary arts, performance, and more) at 421 Arts Campus in Abu Dhabi, open to creative practitioners from the Middle East, North Africa, and South Asia (MENASA) region. This round''s application window has closed, but the program runs recurring annual cycles.', '421 Arts Campus', 'research_residency', 'AE',
   'cash_and_in_kind', TRUE, TRUE, FALSE, NULL, NULL, 'AED',
   FALSE, NULL,
   21, NULL, FALSE, 'b2',
   '2026-01-04', 'semester_or_longer', TRUE, 'high', 150,
   'official_source', 'https://www.421.online/opportunities/residency-program-2026/'),

  ('008e88ed-a1b5-45e8-907e-4faeb86fd24d', 'OHCHR Fellowship Programme for People of African Descent', 'Three-week fellowship in Geneva (Nov 9–27, 2026) for people of African descent working on related human rights issues, delivered in English and Spanish. Covers a return economy flight, basic health insurance, and a stipend for modest accommodation and living expenses. The 2026 window has closed (deadline was May 15, 2026); the program runs annually.', 'UN Office of the High Commissioner for Human Rights (OHCHR)', 'scholarship_fellowship', 'CH',
   'cash_and_in_kind', TRUE, TRUE, FALSE, NULL, NULL, NULL,
   FALSE, NULL,
   21, NULL, FALSE, 'c1',
   '2026-05-15', 'three_to_four_weeks', TRUE, 'high', 90,
   'official_source', 'https://www.ohchr.org/en/about-us/fellowship-programmes/fellowship-programme-people-african-descent');
-- Note: no ON CONFLICT here — source_url has no unique constraint in schema.sql,
-- so this only works safely as a one-time load into a freshly-seeded database.
-- Re-running this file, or using it against a database that already has these
-- rows, will create duplicates. Use server/src/ingest.js for anything after
-- this first load — it dedupes properly by querying source_url first.

INSERT INTO opportunity_career_stages (opportunity_id, career_stage) VALUES
  ('dbda9319-c7bd-4b5e-bff6-e5db9447130d', 'recent_grad'),
  ('d4fcc140-f108-4696-8499-802195813918', 'early_career'),
  ('d4fcc140-f108-4696-8499-802195813918', 'mid_career')
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_education_levels (opportunity_id, education_level) VALUES
  ('d4fcc140-f108-4696-8499-802195813918', 'bachelors_completed')
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_nationality_rules (opportunity_id, country_code, rule_type) VALUES
  ('7d57de8a-14b1-43db-86d1-51478a12f012', 'CA', 'include')
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_soft_tags (opportunity_id, tag_key) VALUES
  ('cdb1ffff-6c3e-492d-952b-08fa08708669', 'non_conventional_destination'),
  ('dbda9319-c7bd-4b5e-bff6-e5db9447130d', 'non_conventional_destination'),
  ('4667b24d-9e8f-4a4b-a806-0ae79a6b9fa0', 'menasa_region_priority'),
  ('008e88ed-a1b5-45e8-907e-4faeb86fd24d', 'african_descent_priority')
ON CONFLICT DO NOTHING;
