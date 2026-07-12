-- Travel Opportunities App — core schema
-- Postgres 14+

-- =========================================================
-- ENUMS
-- =========================================================

-- Grad school is the floor; no undergrad/high-school tiers.
CREATE TYPE education_level AS ENUM (
  'bachelors_completed',
  'masters_in_progress',
  'masters_completed',
  'phd_in_progress',
  'phd_completed',
  'professional_degree',
  'no_formal_degree'
);

CREATE TYPE career_stage AS ENUM (
  'grad_student',
  'recent_grad',
  'early_career',
  'mid_career',
  'senior_career',
  'career_changer'
);

CREATE TYPE employment_status AS ENUM (
  'unemployed',
  'employed_full_time',
  'employed_part_time',
  'self_employed',
  'between_jobs',
  'student'
);

CREATE TYPE english_level AS ENUM ('b1', 'b2', 'c1', 'c2', 'native_or_fluent');

CREATE TYPE opportunity_type AS ENUM (
  'conference',
  'contest_competition',
  'scholarship_fellowship',
  'internship',
  'work_study_exchange',
  'research_residency',
  'volunteer_travel_stipend',
  'work_stay'
);

-- Coarse bucket for quick filtering; exact coverage lives in the boolean columns on opportunities.
CREATE TYPE compensation_type AS ENUM ('cash', 'in_kind_only', 'cash_and_in_kind');

CREATE TYPE duration_category AS ENUM (
  'single_day',
  'weekend',
  'one_to_two_weeks',
  'three_to_four_weeks',
  'one_to_three_months',
  'semester_or_longer'
);

CREATE TYPE application_effort AS ENUM ('quick', 'moderate', 'high', 'extensive');

CREATE TYPE source_verification_status AS ENUM (
  'official_source',
  'aggregator_verified',
  'user_submitted_unverified'
);

CREATE TYPE eligibility_rule_type AS ENUM ('include', 'exclude');

CREATE TYPE visa_requirement_type AS ENUM (
  'visa_free',
  'visa_on_arrival',
  'e_visa',
  'sponsorship_required',
  'not_available',
  'unknown'
);

-- =========================================================
-- LOOKUP TABLES
-- =========================================================

CREATE TABLE countries (
  code                        CHAR(2) PRIMARY KEY,   -- ISO 3166-1 alpha-2
  name                        TEXT NOT NULL,
  region                      TEXT NOT NULL,
  subregion                   TEXT,
  is_non_conventional_dest    BOOLEAN NOT NULL DEFAULT FALSE,
  is_gulf                     BOOLEAN NOT NULL DEFAULT FALSE,
  -- capital-or-centroid approximation; good enough for "how far is this from
  -- home" distance sorting, not for navigation
  latitude                    NUMERIC(7,4),
  longitude                   NUMERIC(7,4)
);

CREATE TABLE fields_of_study (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL UNIQUE,
  category TEXT
);

CREATE TABLE currencies (
  code    CHAR(3) PRIMARY KEY,   -- ISO 4217, e.g. USD, EUR, AED
  name    TEXT NOT NULL
);

-- Keyed by (passport, destination) rather than living on the user profile,
-- since the same nationality can face different visa regimes per destination.
CREATE TABLE passport_visa_requirements (
  passport_country_code    CHAR(2) NOT NULL REFERENCES countries(code),
  destination_country_code CHAR(2) NOT NULL REFERENCES countries(code),
  requirement_type         visa_requirement_type NOT NULL DEFAULT 'unknown',
  notes                    TEXT,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (passport_country_code, destination_country_code)
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (
  user_id                   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nationality_country_code  CHAR(2) REFERENCES countries(code),
  residence_country_code    CHAR(2) REFERENCES countries(code),
  date_of_birth             DATE NOT NULL CHECK (date_of_birth <= (CURRENT_DATE - INTERVAL '18 years')),
  education_level           education_level NOT NULL,
  field_of_study_id         INTEGER REFERENCES fields_of_study(id),
  career_stage              career_stage NOT NULL,
  employment_status         employment_status NOT NULL,
  english_level             english_level NOT NULL,
  disability_status          BOOLEAN NOT NULL DEFAULT FALSE,
  gender                    TEXT,  -- optional, used only for soft-tag matching, never a hard gate
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A user can hold more than one passport/citizenship.
CREATE TABLE user_citizenships (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country_code  CHAR(2) NOT NULL REFERENCES countries(code),
  PRIMARY KEY (user_id, country_code)
);

-- =========================================================
-- OPPORTUNITIES
-- =========================================================

CREATE TABLE opportunities (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                       TEXT NOT NULL,
  description                 TEXT NOT NULL,
  organization_name           TEXT NOT NULL,
  opportunity_type            opportunity_type NOT NULL,

  -- geography
  primary_destination_code    CHAR(2) NOT NULL REFERENCES countries(code),
  is_remote_first_stage       BOOLEAN NOT NULL DEFAULT FALSE,

  -- compensation
  compensation_type           compensation_type NOT NULL,
  covers_flight                BOOLEAN NOT NULL DEFAULT FALSE,
  covers_lodging               BOOLEAN NOT NULL DEFAULT FALSE,
  covers_meals                  BOOLEAN NOT NULL DEFAULT FALSE,
  stipend_min                  NUMERIC(12,2),
  stipend_max                  NUMERIC(12,2),
  currency_code                CHAR(3) REFERENCES currencies(code),
  requires_work_visa_for_payment BOOLEAN NOT NULL DEFAULT FALSE,
  payment_visa_notes           TEXT,

  -- eligibility (scalar; multi-valued eligibility lives in junction tables below)
  min_age                      INTEGER NOT NULL DEFAULT 18,
  max_age                      INTEGER,
  requires_grad_student_status BOOLEAN NOT NULL DEFAULT FALSE,
  english_level_required       english_level,

  -- timing / logistics
  application_deadline         DATE NOT NULL,
  program_start_date            DATE,
  program_end_date              DATE,
  duration_category              duration_category NOT NULL,
  is_recurring                    BOOLEAN NOT NULL DEFAULT FALSE,
  application_effort             application_effort NOT NULL,
  estimated_application_minutes  INTEGER,

  -- trust / verification
  source_verification_status     source_verification_status NOT NULL DEFAULT 'user_submitted_unverified',
  source_url                     TEXT NOT NULL,

  created_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (stipend_min IS NULL OR stipend_max IS NULL OR stipend_min <= stipend_max)
);

-- Multi-city / multi-leg programs beyond the primary destination.
CREATE TABLE opportunity_destinations (
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  country_code    CHAR(2) NOT NULL REFERENCES countries(code),
  PRIMARY KEY (opportunity_id, country_code)
);

-- =========================================================
-- OPPORTUNITY ELIGIBILITY (multi-valued -> junction tables)
-- Absence of rows for an opportunity means "open to all" for that dimension.
-- =========================================================

CREATE TABLE opportunity_education_levels (
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  education_level education_level NOT NULL,
  PRIMARY KEY (opportunity_id, education_level)
);

CREATE TABLE opportunity_career_stages (
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  career_stage    career_stage NOT NULL,
  PRIMARY KEY (opportunity_id, career_stage)
);

CREATE TABLE opportunity_employment_statuses (
  opportunity_id     UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  employment_status   employment_status NOT NULL,
  PRIMARY KEY (opportunity_id, employment_status)
);

CREATE TABLE opportunity_fields_of_study (
  opportunity_id    UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  field_of_study_id  INTEGER NOT NULL REFERENCES fields_of_study(id),
  PRIMARY KEY (opportunity_id, field_of_study_id)
);

-- Nationality/residence rules: if any 'include' rows exist for an opportunity,
-- treat it as a whitelist; 'exclude' rows always subtract regardless of include rows.
CREATE TABLE opportunity_nationality_rules (
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  country_code    CHAR(2) NOT NULL REFERENCES countries(code),
  rule_type       eligibility_rule_type NOT NULL,
  PRIMARY KEY (opportunity_id, country_code, rule_type)
);

CREATE TABLE opportunity_residence_rules (
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  country_code    CHAR(2) NOT NULL REFERENCES countries(code),
  rule_type       eligibility_rule_type NOT NULL,
  PRIMARY KEY (opportunity_id, country_code, rule_type)
);

-- Soft, non-gating badges — e.g. 'women_in_tech_priority', 'disability_friendly',
-- 'non_conventional_destination', 'gulf_funded'. Free-form key, no enum, so new
-- badges don't require a migration.
CREATE TABLE opportunity_soft_tags (
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  tag_key         TEXT NOT NULL,
  PRIMARY KEY (opportunity_id, tag_key)
);

-- =========================================================
-- REVIEWS / TRUST SIGNALS
-- =========================================================

CREATE TABLE reviews (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id          UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating                  SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment                 TEXT,
  verified_participant     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, user_id)
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_opportunities_deadline ON opportunities (application_deadline);
CREATE INDEX idx_opportunities_type ON opportunities (opportunity_type);
CREATE INDEX idx_opportunities_destination ON opportunities (primary_destination_code);
CREATE INDEX idx_opportunities_compensation ON opportunities (compensation_type);
CREATE INDEX idx_nationality_rules_country ON opportunity_nationality_rules (country_code);
CREATE INDEX idx_residence_rules_country ON opportunity_residence_rules (country_code);
CREATE INDEX idx_passport_visa_dest ON passport_visa_requirements (destination_country_code);

-- =========================================================
-- DEADLINE URGENCY (derived, not stored — recompute on read so it never goes stale)
-- =========================================================

CREATE VIEW opportunities_with_urgency AS
SELECT
  o.*,
  CASE
    WHEN o.application_deadline < CURRENT_DATE THEN 'closed'
    WHEN o.application_deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'closing_soon'
    WHEN o.application_deadline <= CURRENT_DATE + INTERVAL '30 days' THEN 'this_month'
    ELSE 'open'
  END AS deadline_urgency
FROM opportunities o;
