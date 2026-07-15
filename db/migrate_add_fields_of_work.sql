-- Adds a high-level "field of work / practice" taxonomy (Education,
-- International Relations, Government, Literature, Finance, ...) so people
-- can filter opportunities by professional domain, distinct from the
-- existing (currently unused) academic fields_of_study lookup table.
-- Safe to re-run.

DO $$ BEGIN
  CREATE TYPE field_of_work AS ENUM (
    'education',
    'international_relations',
    'government_public_policy',
    'literature_writing',
    'arts_culture',
    'finance_economics',
    'business_entrepreneurship',
    'science_technology',
    'health_medicine',
    'law',
    'journalism_media',
    'environment_sustainability',
    'social_impact_development'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS opportunity_fields_of_work (
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  field           field_of_work NOT NULL,
  PRIMARY KEY (opportunity_id, field)
);
CREATE INDEX IF NOT EXISTS idx_opportunity_fields_of_work_field ON opportunity_fields_of_work (field);
