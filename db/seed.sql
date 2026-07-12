-- Seed data mirroring the mock data in prototype/index.html, so the schema
-- can be checked against the same 16 listings the prototype demonstrates.
-- Run after schema.sql:
--   psql -d wayfarer_dev -f db/schema.sql
--   psql -d wayfarer_dev -f db/seed.sql

-- =========================================================
-- CURRENCIES
-- =========================================================

INSERT INTO currencies (code, name) VALUES
  ('USD', 'US Dollar'),
  ('EUR', 'Euro'),
  ('AED', 'UAE Dirham');

-- =========================================================
-- COUNTRIES
-- lat/lon are capital-or-centroid approximations, matching prototype/index.html
-- =========================================================

INSERT INTO countries (code, name, region, is_non_conventional_dest, is_gulf, latitude, longitude) VALUES
  ('KZ', 'Kazakhstan',            'Central Asia',    TRUE,  FALSE, 51.18,  71.45),
  ('GH', 'Ghana',                 'West Africa',     TRUE,  FALSE,  5.60,  -0.19),
  ('AE', 'United Arab Emirates',  'Middle East',      FALSE, TRUE,  24.45,  54.38),
  ('MN', 'Mongolia',              'East Asia',       TRUE,  FALSE, 47.89, 106.91),
  ('FJ', 'Fiji',                  'Pacific',         TRUE,  FALSE,-18.14, 178.44),
  ('DE', 'Germany',               'Western Europe',  FALSE, FALSE, 52.52,  13.40),
  ('UZ', 'Uzbekistan',            'Central Asia',    TRUE,  FALSE, 41.30,  69.24),
  ('KE', 'Kenya',                 'East Africa',     TRUE,  FALSE, -1.29,  36.82),
  ('AR', 'Argentina',             'South America',   TRUE,  FALSE,-34.60, -58.38),
  ('KR', 'South Korea',           'East Asia',       FALSE, FALSE, 37.57, 126.98),
  ('RW', 'Rwanda',                'East Africa',     TRUE,  FALSE, -1.94,  30.06),
  ('KG', 'Kyrgyzstan',            'Central Asia',    TRUE,  FALSE, 42.87,  74.57),
  ('CL', 'Chile',                 'South America',   TRUE,  FALSE,-33.45, -70.67),
  ('GB', 'United Kingdom',        'Northern Europe', FALSE, FALSE, 51.51,  -0.13),
  ('BO', 'Bolivia',               'South America',   TRUE,  FALSE,-16.50, -68.15),
  ('US', 'United States',         'North America',   FALSE, FALSE, 39.80, -98.58),
  ('FR', 'France',                'Western Europe',  FALSE, FALSE, 48.86,   2.35),
  ('CA', 'Canada',                'North America',   FALSE, FALSE, 56.13,-106.35),
  ('AU', 'Australia',             'Oceania',         FALSE, FALSE,-25.27, 133.78),
  ('IN', 'India',                 'South Asia',      FALSE, FALSE, 22.35,  78.60),
  ('NG', 'Nigeria',               'West Africa',     TRUE,  FALSE,  9.08,   7.40),
  ('BR', 'Brazil',                'South America',   FALSE, FALSE,-14.24, -51.93),
  ('MX', 'Mexico',                'North America',   FALSE, FALSE, 23.63,-102.55),
  ('PH', 'Philippines',           'Southeast Asia',  TRUE,  FALSE, 12.88, 121.77),
  ('PK', 'Pakistan',              'South Asia',      TRUE,  FALSE, 30.38,  69.35),
  ('EG', 'Egypt',                 'North Africa',    TRUE,  FALSE, 30.04,  31.24),
  ('VN', 'Vietnam',               'Southeast Asia',  TRUE,  FALSE, 14.06, 108.28);

-- =========================================================
-- OPPORTUNITIES
-- =========================================================

INSERT INTO opportunities (
  id, title, description, organization_name, opportunity_type, primary_destination_code,
  compensation_type, covers_flight, covers_lodging, covers_meals, stipend_min, stipend_max, currency_code,
  requires_work_visa_for_payment, payment_visa_notes,
  min_age, max_age, requires_grad_student_status, english_level_required,
  application_deadline, duration_category, application_effort, estimated_application_minutes,
  source_verification_status, source_url
) VALUES
  ('a67d04dc-bbc9-4ad4-8f4f-4592eaa6f18a', 'Central Asia Youth Climate Fellowship', 'Two-week policy fellowship pairing early-career climate researchers with Central Asian ministries on adaptation planning.', 'Steppe Climate Alliance', 'scholarship_fellowship', 'KZ',
   'cash_and_in_kind', TRUE, TRUE, FALSE, 1200, 1800, 'USD',
   FALSE, NULL,
   21, 35, FALSE, 'b2',
   '2026-07-16', 'one_to_two_weeks', 'high', 120,
   'official_source', 'https://example.org/opportunities/kz-climate'),

  ('242ba7c4-89ac-45d1-b762-e5106c6d20bb', 'West Africa Renewable Energy Conference', 'Three-day delegate pass to West Africa''s largest renewable energy and grid policy conference.', 'Accra Energy Forum', 'conference', 'GH',
   'in_kind_only', TRUE, TRUE, TRUE, NULL, NULL, NULL,
   FALSE, NULL,
   18, NULL, FALSE, 'b2',
   '2026-08-10', 'weekend', 'moderate', 45,
   'official_source', 'https://example.org/opportunities/gh-energy'),

  ('7120e61e-a73d-4bf3-8446-b387a5ab72cb', 'Gulf Innovation Summit — Speaker Track', 'Paid speaking slot at a state-backed innovation summit; honorarium disbursed in AED.', 'Abu Dhabi Future Council', 'conference', 'AE',
   'cash_and_in_kind', TRUE, TRUE, TRUE, 5000, 8000, 'AED',
   FALSE, NULL,
   25, NULL, FALSE, 'c1',
   '2026-07-20', 'single_day', 'high', 90,
   'official_source', 'https://example.org/opportunities/ae-gulf'),

  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'Mongolia Steppe Research Residency', 'Monthly stipend for grassland ecology fieldwork; regional priority given to nearby nationalities.', 'Ulaanbaatar Institute of Ecology', 'research_residency', 'MN',
   'cash_and_in_kind', TRUE, TRUE, TRUE, 2000, 2000, 'USD',
   FALSE, NULL,
   22, NULL, TRUE, 'b2',
   '2026-09-01', 'one_to_three_months', 'extensive', 180,
   'official_source', 'https://example.org/opportunities/mn-steppe'),

  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'Pacific Islands Ocean Policy Internship', 'Monthly stipend internship on fisheries and ocean-policy research; priority for regional applicants.', 'Suva Marine Policy Unit', 'internship', 'FJ',
   'cash', FALSE, FALSE, FALSE, 800, 800, 'USD',
   FALSE, NULL,
   21, 30, FALSE, 'b2',
   '2026-07-18', 'one_to_three_months', 'moderate', 45,
   'aggregator_verified', 'https://example.org/opportunities/fj-ocean'),

  ('482389b9-beb2-4d02-a2dd-68b24f456479', 'Berlin Fintech Hackathon', '48-hour hackathon with cash prizes; flight and lodging covered for finalist teams.', 'Berlin Builders Guild', 'contest_competition', 'DE',
   'cash_and_in_kind', TRUE, TRUE, FALSE, 1000, 3000, 'EUR',
   FALSE, NULL,
   18, NULL, FALSE, 'b2',
   '2026-07-25', 'weekend', 'quick', 15,
   'official_source', 'https://example.org/opportunities/de-fintech'),

  ('24794605-c84d-4e22-94c6-cd5560901c1c', 'Uzbekistan Silk Road Heritage Fellowship', 'Documentation fellowship on Silk Road heritage sites; open to all backgrounds and disciplines.', 'Samarkand Heritage Trust', 'scholarship_fellowship', 'UZ',
   'in_kind_only', TRUE, TRUE, FALSE, NULL, NULL, NULL,
   FALSE, NULL,
   18, NULL, FALSE, 'b1',
   '2026-10-05', 'one_to_two_weeks', 'moderate', 45,
   'official_source', 'https://example.org/opportunities/uz-heritage'),

  ('975ef492-d0b0-4f21-903d-7d3f04274017', 'Nairobi Impact Work-Study Exchange', 'Graduate-only exchange placing researchers inside Nairobi social-impact startups for a semester.', 'East Africa Impact Collective', 'work_study_exchange', 'KE',
   'cash_and_in_kind', FALSE, TRUE, FALSE, 600, 900, 'USD',
   FALSE, NULL,
   22, NULL, TRUE, 'b2',
   '2026-08-15', 'one_to_three_months', 'high', 90,
   'official_source', 'https://example.org/opportunities/ke-impact'),

  ('6b657c82-ccf8-410e-bc4d-b6031ceb4d27', 'Patagonia Trail Work Stay', 'Trail maintenance in exchange for lodging and meals; rolling admission, no cash stipend.', 'El Chaltén Trail Cooperative', 'work_stay', 'AR',
   'in_kind_only', FALSE, TRUE, TRUE, NULL, NULL, NULL,
   FALSE, NULL,
   18, NULL, FALSE, 'b1',
   '2026-12-01', 'one_to_three_months', 'quick', 10,
   'user_submitted_unverified', 'https://example.org/opportunities/ar-patagonia'),

  ('3a7aa758-2993-4b93-a8bb-a46bcca54cac', 'Seoul Semiconductor Brand Ambassador Contest', 'Social-content contest with a flown-in finale event and cash prize for the winning ambassador.', 'Hanview Electronics', 'contest_competition', 'KR',
   'cash_and_in_kind', TRUE, FALSE, FALSE, 2500, 2500, 'USD',
   FALSE, NULL,
   18, 34, FALSE, 'b2',
   '2026-07-14', 'single_day', 'quick', 20,
   'official_source', 'https://example.org/opportunities/kr-brand'),

  ('2831489d-e8b0-45e6-a7ae-93fa9d0a5e9b', 'UAE Government Fellows Program', 'One-year government fellowship placing senior professionals inside UAE ministries on strategic projects.', 'Ministry of Future Talent, UAE', 'scholarship_fellowship', 'AE',
   'cash_and_in_kind', TRUE, TRUE, FALSE, 10000, 10000, 'AED',
   TRUE, 'Stipend disbursement requires a UAE work permit sponsored by the ministry; processing adds 4–6 weeks before start date.',
   28, NULL, FALSE, 'c1',
   '2026-07-13', 'semester_or_longer', 'extensive', 240,
   'official_source', 'https://example.org/opportunities/ae-fellows'),

  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'Global South Women in Tech Conference', 'Delegate conference for women technologists across the Global South, with a small incidentals stipend.', 'Kigali Tech Women Network', 'conference', 'RW',
   'cash_and_in_kind', TRUE, TRUE, TRUE, 300, 300, 'USD',
   FALSE, NULL,
   18, NULL, FALSE, 'b2',
   '2026-08-20', 'weekend', 'quick', 30,
   'official_source', 'https://example.org/opportunities/rw-women'),

  ('dc9aedb4-f291-4948-b207-21634af221af', 'Bishkek Digital Nomad Work-Study', 'Remote-work coliving stipend for career changers relocating to Bishkek''s tech hub for a season.', 'Kyrgyz Tech Hub', 'work_study_exchange', 'KG',
   'cash_and_in_kind', FALSE, TRUE, FALSE, 400, 400, 'USD',
   FALSE, NULL,
   22, NULL, FALSE, 'b1',
   '2026-07-22', 'one_to_three_months', 'moderate', 45,
   'user_submitted_unverified', 'https://example.org/opportunities/kg-nomad'),

  ('7af1cb7c-677b-4434-acc0-bf1bd94bc0a9', 'Antarctica Gateway Research Support Program', 'Logistics-support residency for polar researchers staging through the Antarctic gateway city.', 'Punta Arenas Polar Institute', 'research_residency', 'CL',
   'cash_and_in_kind', TRUE, TRUE, TRUE, 3000, 3000, 'USD',
   FALSE, NULL,
   23, NULL, TRUE, 'b2',
   '2026-11-15', 'one_to_three_months', 'extensive', 240,
   'official_source', 'https://example.org/opportunities/cl-antarctica'),

  ('01840389-3a54-420a-b5de-fc920075f299', 'London Global Policy Fellowship', 'Fully funded policy fellowship for senior professionals transitioning into public affairs.', 'Westminster Policy Institute', 'scholarship_fellowship', 'GB',
   'cash_and_in_kind', TRUE, TRUE, FALSE, 2500, 2500, 'EUR',
   FALSE, NULL,
   30, NULL, FALSE, 'c2',
   '2026-07-13', 'one_to_two_weeks', 'high', 150,
   'official_source', 'https://example.org/opportunities/gb-policy'),

  ('70e6f30f-244b-42bf-9ba1-083d850f9635', 'Andean Highlands Teaching Fellowship', 'One-semester teaching placement in Andean highland schools; this round has closed.', 'La Paz Education Partners', 'scholarship_fellowship', 'BO',
   'cash_and_in_kind', TRUE, TRUE, FALSE, 500, 500, 'USD',
   FALSE, NULL,
   21, NULL, FALSE, 'b2',
   '2026-06-20', 'semester_or_longer', 'moderate', 60,
   'aggregator_verified', 'https://example.org/opportunities/bo-teaching');

-- ar-patagonia is rolling admission per its description
UPDATE opportunities SET is_recurring = TRUE WHERE id = '6b657c82-ccf8-410e-bc4d-b6031ceb4d27';

-- =========================================================
-- ELIGIBILITY JUNCTIONS
-- absent rows = open to all for that dimension (see schema.sql)
-- =========================================================

INSERT INTO opportunity_education_levels (opportunity_id, education_level) VALUES
  ('a67d04dc-bbc9-4ad4-8f4f-4592eaa6f18a', 'masters_in_progress'),
  ('a67d04dc-bbc9-4ad4-8f4f-4592eaa6f18a', 'masters_completed'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'phd_in_progress'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'phd_completed'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'bachelors_completed'),
  ('975ef492-d0b0-4f21-903d-7d3f04274017', 'masters_in_progress'),
  ('975ef492-d0b0-4f21-903d-7d3f04274017', 'masters_completed'),
  ('975ef492-d0b0-4f21-903d-7d3f04274017', 'phd_in_progress'),
  ('2831489d-e8b0-45e6-a7ae-93fa9d0a5e9b', 'masters_completed'),
  ('2831489d-e8b0-45e6-a7ae-93fa9d0a5e9b', 'phd_completed'),
  ('2831489d-e8b0-45e6-a7ae-93fa9d0a5e9b', 'professional_degree'),
  ('7af1cb7c-677b-4434-acc0-bf1bd94bc0a9', 'phd_in_progress'),
  ('7af1cb7c-677b-4434-acc0-bf1bd94bc0a9', 'phd_completed'),
  ('01840389-3a54-420a-b5de-fc920075f299', 'masters_completed'),
  ('01840389-3a54-420a-b5de-fc920075f299', 'phd_completed'),
  ('70e6f30f-244b-42bf-9ba1-083d850f9635', 'bachelors_completed');

INSERT INTO opportunity_career_stages (opportunity_id, career_stage) VALUES
  ('a67d04dc-bbc9-4ad4-8f4f-4592eaa6f18a', 'grad_student'),
  ('a67d04dc-bbc9-4ad4-8f4f-4592eaa6f18a', 'recent_grad'),
  ('242ba7c4-89ac-45d1-b762-e5106c6d20bb', 'early_career'),
  ('242ba7c4-89ac-45d1-b762-e5106c6d20bb', 'mid_career'),
  ('7120e61e-a73d-4bf3-8446-b387a5ab72cb', 'mid_career'),
  ('7120e61e-a73d-4bf3-8446-b387a5ab72cb', 'senior_career'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'grad_student'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'early_career'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'recent_grad'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'early_career'),
  ('482389b9-beb2-4d02-a2dd-68b24f456479', 'early_career'),
  ('482389b9-beb2-4d02-a2dd-68b24f456479', 'mid_career'),
  ('975ef492-d0b0-4f21-903d-7d3f04274017', 'grad_student'),
  ('3a7aa758-2993-4b93-a8bb-a46bcca54cac', 'early_career'),
  ('2831489d-e8b0-45e6-a7ae-93fa9d0a5e9b', 'mid_career'),
  ('2831489d-e8b0-45e6-a7ae-93fa9d0a5e9b', 'senior_career'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'recent_grad'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'early_career'),
  ('dc9aedb4-f291-4948-b207-21634af221af', 'career_changer'),
  ('dc9aedb4-f291-4948-b207-21634af221af', 'mid_career'),
  ('7af1cb7c-677b-4434-acc0-bf1bd94bc0a9', 'grad_student'),
  ('7af1cb7c-677b-4434-acc0-bf1bd94bc0a9', 'early_career'),
  ('01840389-3a54-420a-b5de-fc920075f299', 'mid_career'),
  ('01840389-3a54-420a-b5de-fc920075f299', 'senior_career'),
  ('70e6f30f-244b-42bf-9ba1-083d850f9635', 'recent_grad');

-- no opportunity in this seed set restricts by employment status (all leave it open)

INSERT INTO opportunity_nationality_rules (opportunity_id, country_code, rule_type) VALUES
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'KZ', 'include'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'UZ', 'include'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'KG', 'include'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'MN', 'include'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'IN', 'include'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'US', 'exclude'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'GB', 'exclude'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'DE', 'exclude'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'FR', 'exclude'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'CA', 'exclude'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'AU', 'exclude'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'US', 'exclude'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'GB', 'exclude'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'DE', 'exclude'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'FR', 'exclude'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'CA', 'exclude'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'AU', 'exclude');

INSERT INTO opportunity_soft_tags (opportunity_id, tag_key) VALUES
  ('a67d04dc-bbc9-4ad4-8f4f-4592eaa6f18a', 'non_conventional_destination'),
  ('242ba7c4-89ac-45d1-b762-e5106c6d20bb', 'non_conventional_destination'),
  ('7120e61e-a73d-4bf3-8446-b387a5ab72cb', 'gulf_funded'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'non_conventional_destination'),
  ('5e3b6bc7-d076-4096-9006-40794535bfb8', 'disability_friendly'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'non_conventional_destination'),
  ('3ecf5f95-cfe4-411b-94ab-4aabe6a751f1', 'women_in_tech_priority'),
  ('24794605-c84d-4e22-94c6-cd5560901c1c', 'non_conventional_destination'),
  ('975ef492-d0b0-4f21-903d-7d3f04274017', 'non_conventional_destination'),
  ('6b657c82-ccf8-410e-bc4d-b6031ceb4d27', 'non_conventional_destination'),
  ('2831489d-e8b0-45e6-a7ae-93fa9d0a5e9b', 'gulf_funded'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'non_conventional_destination'),
  ('c84e525f-9e1d-44bc-acf1-6f753d121609', 'women_in_tech_priority'),
  ('dc9aedb4-f291-4948-b207-21634af221af', 'non_conventional_destination'),
  ('7af1cb7c-677b-4434-acc0-bf1bd94bc0a9', 'non_conventional_destination'),
  ('70e6f30f-244b-42bf-9ba1-083d850f9635', 'non_conventional_destination');
