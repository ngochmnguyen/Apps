-- FICTIONAL DEMO DATA — none of these 16 opportunities or organizations are
-- real. They exist only to exercise the schema and UI (filters, map,
-- eligibility engine) with realistic-looking values before any real content
-- existed. DO NOT load this file into a production/public-facing database —
-- local dev and automated testing only. Real, web-verified opportunities are
-- loaded separately via server/src/ingest.js (see server/README.md); those
-- carry a genuine source_url and source_verification_status that reflects
-- actual research, unlike everything below.
--
-- Run after schema.sql, in a local/dev database only:
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

-- =========================================================
-- ADDITIONS FOR REAL SOURCED DATA (see server/ingest_batch_*.json)
-- Countries/currencies needed by opportunities found through web research,
-- beyond the 27-country/3-currency baseline above. Add to this list — never
-- remove entries, since existing rows may already reference them.
-- =========================================================

INSERT INTO countries (code, name, region, is_non_conventional_dest, is_gulf, latitude, longitude) VALUES
  ('ZA', 'South Africa', 'Southern Africa', TRUE, FALSE, -25.7479, 28.2293),
  ('CH', 'Switzerland', 'Western Europe', FALSE, FALSE, 46.9480, 7.4474),
  ('SA', 'Saudi Arabia', 'Middle East', FALSE, TRUE, 24.7136, 46.6753),
  ('CN', 'China', 'East Asia', FALSE, FALSE, 39.9042, 116.4074)
ON CONFLICT (code) DO NOTHING;

-- Nationality/residence need every real country to be selectable, not just
-- the ~31 places this app happens to have travel opportunities to. See
-- migrate_add_all_countries.sql for the equivalent statement run against
-- the already-deployed database.
--
-- Israel is deliberately excluded -- product decision, not an oversight.
-- Its absence from this table is also what makes it structurally impossible
-- for any opportunity to list Israel as a destination (primary_destination_code
-- has a FK to countries.code) -- see ingest.js's explicit rejection of dest
-- = 'IL' for a second, self-documenting layer of the same rule.
INSERT INTO countries (code, name, region, is_non_conventional_dest, is_gulf, latitude, longitude) VALUES
  -- Africa (48)
  ('DZ', 'Algeria', 'North Africa', TRUE, FALSE, 36.75, 3.06),
  ('AO', 'Angola', 'Central Africa', TRUE, FALSE, -8.84, 13.23),
  ('BJ', 'Benin', 'West Africa', TRUE, FALSE, 6.50, 2.63),
  ('BW', 'Botswana', 'Southern Africa', TRUE, FALSE, -24.63, 25.92),
  ('BF', 'Burkina Faso', 'West Africa', TRUE, FALSE, 12.37, -1.52),
  ('BI', 'Burundi', 'East Africa', TRUE, FALSE, -3.43, 29.93),
  ('CV', 'Cabo Verde', 'West Africa', TRUE, FALSE, 14.93, -23.51),
  ('CM', 'Cameroon', 'Central Africa', TRUE, FALSE, 3.85, 11.50),
  ('CF', 'Central African Republic', 'Central Africa', TRUE, FALSE, 4.39, 18.56),
  ('TD', 'Chad', 'Central Africa', TRUE, FALSE, 12.13, 15.06),
  ('KM', 'Comoros', 'East Africa', TRUE, FALSE, -11.72, 43.25),
  ('CG', 'Republic of the Congo', 'Central Africa', TRUE, FALSE, -4.26, 15.24),
  ('CD', 'Democratic Republic of the Congo', 'Central Africa', TRUE, FALSE, -4.44, 15.27),
  ('DJ', 'Djibouti', 'East Africa', TRUE, FALSE, 11.57, 43.15),
  ('GQ', 'Equatorial Guinea', 'Central Africa', TRUE, FALSE, 3.75, 8.77),
  ('ER', 'Eritrea', 'East Africa', TRUE, FALSE, 15.32, 38.93),
  ('SZ', 'Eswatini', 'Southern Africa', TRUE, FALSE, -26.31, 31.14),
  ('ET', 'Ethiopia', 'East Africa', TRUE, FALSE, 9.03, 38.75),
  ('GA', 'Gabon', 'Central Africa', TRUE, FALSE, 0.42, 9.47),
  ('GM', 'Gambia', 'West Africa', TRUE, FALSE, 13.45, -16.58),
  ('GN', 'Guinea', 'West Africa', TRUE, FALSE, 9.64, -13.58),
  ('GW', 'Guinea-Bissau', 'West Africa', TRUE, FALSE, 11.86, -15.60),
  ('CI', 'Ivory Coast', 'West Africa', TRUE, FALSE, 6.83, -5.29),
  ('LS', 'Lesotho', 'Southern Africa', TRUE, FALSE, -29.32, 27.49),
  ('LR', 'Liberia', 'West Africa', TRUE, FALSE, 6.29, -10.76),
  ('LY', 'Libya', 'North Africa', TRUE, FALSE, 32.89, 13.19),
  ('MG', 'Madagascar', 'East Africa', TRUE, FALSE, -18.88, 47.51),
  ('MW', 'Malawi', 'East Africa', TRUE, FALSE, -13.96, 33.77),
  ('ML', 'Mali', 'West Africa', TRUE, FALSE, 12.64, -8.00),
  ('MR', 'Mauritania', 'West Africa', TRUE, FALSE, 18.07, -15.96),
  ('MU', 'Mauritius', 'East Africa', TRUE, FALSE, -20.16, 57.50),
  ('MA', 'Morocco', 'North Africa', TRUE, FALSE, 34.02, -6.84),
  ('MZ', 'Mozambique', 'East Africa', TRUE, FALSE, -25.97, 32.57),
  ('NA', 'Namibia', 'Southern Africa', TRUE, FALSE, -22.56, 17.07),
  ('NE', 'Niger', 'West Africa', TRUE, FALSE, 13.51, 2.11),
  ('ST', 'Sao Tome and Principe', 'Central Africa', TRUE, FALSE, 0.34, 6.73),
  ('SN', 'Senegal', 'West Africa', TRUE, FALSE, 14.72, -17.47),
  ('SC', 'Seychelles', 'East Africa', TRUE, FALSE, -4.62, 55.45),
  ('SL', 'Sierra Leone', 'West Africa', TRUE, FALSE, 8.47, -13.23),
  ('SO', 'Somalia', 'East Africa', TRUE, FALSE, 2.05, 45.32),
  ('SS', 'South Sudan', 'East Africa', TRUE, FALSE, 4.85, 31.58),
  ('SD', 'Sudan', 'North Africa', TRUE, FALSE, 15.50, 32.56),
  ('TZ', 'Tanzania', 'East Africa', TRUE, FALSE, -6.16, 35.75),
  ('TG', 'Togo', 'West Africa', TRUE, FALSE, 6.13, 1.22),
  ('TN', 'Tunisia', 'North Africa', TRUE, FALSE, 36.81, 10.18),
  ('UG', 'Uganda', 'East Africa', TRUE, FALSE, 0.35, 32.58),
  ('ZM', 'Zambia', 'East Africa', TRUE, FALSE, -15.39, 28.32),
  ('ZW', 'Zimbabwe', 'East Africa', TRUE, FALSE, -17.83, 31.05),

  -- Americas (28)
  ('AG', 'Antigua and Barbuda', 'Caribbean', TRUE, FALSE, 17.13, -61.85),
  ('BS', 'Bahamas', 'Caribbean', TRUE, FALSE, 25.03, -77.40),
  ('BB', 'Barbados', 'Caribbean', TRUE, FALSE, 13.11, -59.60),
  ('BZ', 'Belize', 'Central America', TRUE, FALSE, 17.25, -88.76),
  ('CR', 'Costa Rica', 'Central America', TRUE, FALSE, 9.93, -84.09),
  ('CU', 'Cuba', 'Caribbean', TRUE, FALSE, 23.11, -82.37),
  ('DM', 'Dominica', 'Caribbean', TRUE, FALSE, 15.31, -61.38),
  ('DO', 'Dominican Republic', 'Caribbean', TRUE, FALSE, 18.49, -69.93),
  ('SV', 'El Salvador', 'Central America', TRUE, FALSE, 13.69, -89.22),
  ('GD', 'Grenada', 'Caribbean', TRUE, FALSE, 12.06, -61.75),
  ('GT', 'Guatemala', 'Central America', TRUE, FALSE, 14.63, -90.51),
  ('HT', 'Haiti', 'Caribbean', TRUE, FALSE, 18.59, -72.31),
  ('HN', 'Honduras', 'Central America', TRUE, FALSE, 14.07, -87.19),
  ('JM', 'Jamaica', 'Caribbean', TRUE, FALSE, 17.97, -76.79),
  ('NI', 'Nicaragua', 'Central America', TRUE, FALSE, 12.14, -86.25),
  ('PA', 'Panama', 'Central America', TRUE, FALSE, 8.98, -79.52),
  ('KN', 'Saint Kitts and Nevis', 'Caribbean', TRUE, FALSE, 17.30, -62.72),
  ('LC', 'Saint Lucia', 'Caribbean', TRUE, FALSE, 14.01, -60.99),
  ('VC', 'Saint Vincent and the Grenadines', 'Caribbean', TRUE, FALSE, 13.16, -61.22),
  ('TT', 'Trinidad and Tobago', 'Caribbean', TRUE, FALSE, 10.65, -61.50),
  ('CO', 'Colombia', 'South America', TRUE, FALSE, 4.71, -74.07),
  ('EC', 'Ecuador', 'South America', TRUE, FALSE, -0.18, -78.47),
  ('GY', 'Guyana', 'South America', TRUE, FALSE, 6.80, -58.16),
  ('PY', 'Paraguay', 'South America', TRUE, FALSE, -25.26, -57.58),
  ('PE', 'Peru', 'South America', TRUE, FALSE, -12.05, -77.04),
  ('SR', 'Suriname', 'South America', TRUE, FALSE, 5.85, -55.20),
  ('UY', 'Uruguay', 'South America', TRUE, FALSE, -34.90, -56.16),
  ('VE', 'Venezuela', 'South America', TRUE, FALSE, 10.48, -66.90),

  -- Asia (37)
  ('AF', 'Afghanistan', 'South Asia', TRUE, FALSE, 34.56, 69.21),
  ('AM', 'Armenia', 'Middle East', TRUE, FALSE, 40.18, 44.50),
  ('AZ', 'Azerbaijan', 'Middle East', TRUE, FALSE, 40.41, 49.87),
  ('BH', 'Bahrain', 'Middle East', TRUE, TRUE, 26.23, 50.59),
  ('BD', 'Bangladesh', 'South Asia', TRUE, FALSE, 23.81, 90.41),
  ('BT', 'Bhutan', 'South Asia', TRUE, FALSE, 27.47, 89.63),
  ('BN', 'Brunei', 'Southeast Asia', TRUE, FALSE, 4.90, 114.94),
  ('KH', 'Cambodia', 'Southeast Asia', TRUE, FALSE, 11.56, 104.93),
  ('CY', 'Cyprus', 'Middle East', TRUE, FALSE, 35.19, 33.38),
  ('GE', 'Georgia', 'Middle East', TRUE, FALSE, 41.72, 44.83),
  ('ID', 'Indonesia', 'Southeast Asia', TRUE, FALSE, -6.21, 106.85),
  ('IR', 'Iran', 'Middle East', TRUE, FALSE, 35.69, 51.39),
  ('IQ', 'Iraq', 'Middle East', TRUE, FALSE, 33.32, 44.37),
  ('JP', 'Japan', 'East Asia', FALSE, FALSE, 35.68, 139.65),
  ('JO', 'Jordan', 'Middle East', TRUE, FALSE, 31.95, 35.93),
  ('KW', 'Kuwait', 'Middle East', TRUE, TRUE, 29.38, 47.98),
  ('LA', 'Laos', 'Southeast Asia', TRUE, FALSE, 17.98, 102.63),
  ('LB', 'Lebanon', 'Middle East', TRUE, FALSE, 33.89, 35.50),
  ('MY', 'Malaysia', 'Southeast Asia', TRUE, FALSE, 3.14, 101.69),
  ('MV', 'Maldives', 'South Asia', TRUE, FALSE, 4.18, 73.51),
  ('MM', 'Myanmar', 'Southeast Asia', TRUE, FALSE, 19.76, 96.08),
  ('NP', 'Nepal', 'South Asia', TRUE, FALSE, 27.72, 85.32),
  ('KP', 'North Korea', 'East Asia', TRUE, FALSE, 39.04, 125.76),
  ('OM', 'Oman', 'Middle East', TRUE, TRUE, 23.59, 58.41),
  ('QA', 'Qatar', 'Middle East', TRUE, TRUE, 25.29, 51.53),
  ('SG', 'Singapore', 'Southeast Asia', FALSE, FALSE, 1.35, 103.82),
  ('LK', 'Sri Lanka', 'South Asia', TRUE, FALSE, 6.93, 79.86),
  ('SY', 'Syria', 'Middle East', TRUE, FALSE, 33.51, 36.28),
  ('TW', 'Taiwan', 'East Asia', FALSE, FALSE, 25.03, 121.57),
  ('TJ', 'Tajikistan', 'Central Asia', TRUE, FALSE, 38.56, 68.79),
  ('TH', 'Thailand', 'Southeast Asia', TRUE, FALSE, 13.76, 100.50),
  ('TL', 'Timor-Leste', 'Southeast Asia', TRUE, FALSE, -8.56, 125.56),
  ('TR', 'Turkey', 'Middle East', TRUE, FALSE, 39.93, 32.86),
  ('TM', 'Turkmenistan', 'Central Asia', TRUE, FALSE, 37.96, 58.33),
  ('YE', 'Yemen', 'Middle East', TRUE, FALSE, 15.37, 44.19),
  ('PS', 'Palestine', 'Middle East', TRUE, FALSE, 31.90, 35.20),

  -- Europe (41)
  ('AL', 'Albania', 'Eastern Europe', TRUE, FALSE, 41.33, 19.82),
  ('AD', 'Andorra', 'Southern Europe', FALSE, FALSE, 42.51, 1.52),
  ('AT', 'Austria', 'Western Europe', FALSE, FALSE, 48.21, 16.37),
  ('BY', 'Belarus', 'Eastern Europe', TRUE, FALSE, 53.90, 27.56),
  ('BE', 'Belgium', 'Western Europe', FALSE, FALSE, 50.85, 4.35),
  ('BA', 'Bosnia and Herzegovina', 'Eastern Europe', TRUE, FALSE, 43.86, 18.41),
  ('BG', 'Bulgaria', 'Eastern Europe', TRUE, FALSE, 42.70, 23.32),
  ('HR', 'Croatia', 'Southern Europe', FALSE, FALSE, 45.82, 15.98),
  ('CZ', 'Czech Republic', 'Eastern Europe', TRUE, FALSE, 50.08, 14.44),
  ('DK', 'Denmark', 'Northern Europe', FALSE, FALSE, 55.68, 12.57),
  ('EE', 'Estonia', 'Northern Europe', FALSE, FALSE, 59.44, 24.75),
  ('FI', 'Finland', 'Northern Europe', FALSE, FALSE, 60.17, 24.94),
  ('GR', 'Greece', 'Southern Europe', FALSE, FALSE, 37.98, 23.73),
  ('HU', 'Hungary', 'Eastern Europe', TRUE, FALSE, 47.50, 19.04),
  ('IS', 'Iceland', 'Northern Europe', FALSE, FALSE, 64.15, -21.94),
  ('IE', 'Ireland', 'Northern Europe', FALSE, FALSE, 53.35, -6.26),
  ('IT', 'Italy', 'Southern Europe', FALSE, FALSE, 41.90, 12.50),
  ('LV', 'Latvia', 'Northern Europe', FALSE, FALSE, 56.95, 24.11),
  ('LI', 'Liechtenstein', 'Western Europe', FALSE, FALSE, 47.14, 9.52),
  ('LT', 'Lithuania', 'Northern Europe', FALSE, FALSE, 54.69, 25.28),
  ('LU', 'Luxembourg', 'Western Europe', FALSE, FALSE, 49.61, 6.13),
  ('MT', 'Malta', 'Southern Europe', FALSE, FALSE, 35.90, 14.51),
  ('MD', 'Moldova', 'Eastern Europe', TRUE, FALSE, 47.01, 28.86),
  ('MC', 'Monaco', 'Western Europe', FALSE, FALSE, 43.74, 7.42),
  ('ME', 'Montenegro', 'Eastern Europe', TRUE, FALSE, 42.43, 19.26),
  ('NL', 'Netherlands', 'Western Europe', FALSE, FALSE, 52.37, 4.90),
  ('MK', 'North Macedonia', 'Eastern Europe', TRUE, FALSE, 42.00, 21.43),
  ('NO', 'Norway', 'Northern Europe', FALSE, FALSE, 59.91, 10.75),
  ('PL', 'Poland', 'Eastern Europe', TRUE, FALSE, 52.23, 21.01),
  ('PT', 'Portugal', 'Southern Europe', FALSE, FALSE, 38.72, -9.14),
  ('RO', 'Romania', 'Eastern Europe', TRUE, FALSE, 44.43, 26.10),
  ('RU', 'Russia', 'Eastern Europe', TRUE, FALSE, 55.76, 37.62),
  ('SM', 'San Marino', 'Southern Europe', FALSE, FALSE, 43.94, 12.46),
  ('RS', 'Serbia', 'Eastern Europe', TRUE, FALSE, 44.79, 20.45),
  ('SK', 'Slovakia', 'Eastern Europe', TRUE, FALSE, 48.15, 17.11),
  ('SI', 'Slovenia', 'Southern Europe', FALSE, FALSE, 46.06, 14.51),
  ('ES', 'Spain', 'Southern Europe', FALSE, FALSE, 40.42, -3.70),
  ('SE', 'Sweden', 'Northern Europe', FALSE, FALSE, 59.33, 18.07),
  ('UA', 'Ukraine', 'Eastern Europe', TRUE, FALSE, 50.45, 30.52),
  ('VA', 'Vatican City', 'Southern Europe', FALSE, FALSE, 41.90, 12.45),
  ('XK', 'Kosovo', 'Eastern Europe', TRUE, FALSE, 42.66, 21.17),

  -- Oceania / Pacific (12)
  ('KI', 'Kiribati', 'Pacific', TRUE, FALSE, 1.34, 173.02),
  ('MH', 'Marshall Islands', 'Pacific', TRUE, FALSE, 7.12, 171.19),
  ('FM', 'Micronesia', 'Pacific', TRUE, FALSE, 6.92, 158.16),
  ('NR', 'Nauru', 'Pacific', TRUE, FALSE, -0.55, 166.92),
  ('NZ', 'New Zealand', 'Oceania', FALSE, FALSE, -41.29, 174.78),
  ('PW', 'Palau', 'Pacific', TRUE, FALSE, 7.50, 134.62),
  ('PG', 'Papua New Guinea', 'Pacific', TRUE, FALSE, -9.44, 147.18),
  ('WS', 'Samoa', 'Pacific', TRUE, FALSE, -13.85, -171.75),
  ('SB', 'Solomon Islands', 'Pacific', TRUE, FALSE, -9.43, 159.95),
  ('TO', 'Tonga', 'Pacific', TRUE, FALSE, -21.14, -175.20),
  ('TV', 'Tuvalu', 'Pacific', TRUE, FALSE, -8.52, 179.20),
  ('VU', 'Vanuatu', 'Pacific', TRUE, FALSE, -17.74, 168.32)
ON CONFLICT (code) DO NOTHING;

INSERT INTO currencies (code, name) VALUES
  ('GBP', 'British Pound'),
  ('CAD', 'Canadian Dollar')
ON CONFLICT (code) DO NOTHING;

INSERT INTO currencies (code, name) VALUES
  ('CHF', 'Swiss Franc'),
  ('CNY', 'Chinese Yuan'),
  ('BRL', 'Brazilian Real'),
  ('MXN', 'Mexican Peso'),
  ('INR', 'Indian Rupee'),
  ('KRW', 'South Korean Won'),
  ('AUD', 'Australian Dollar')
ON CONFLICT (code) DO NOTHING;
