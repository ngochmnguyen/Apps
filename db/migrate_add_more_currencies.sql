-- Adds currencies needed for a large research batch of real scholarships,
-- fellowships, and residencies that pay stipends in the local currency
-- (Swiss, Chinese, Brazilian, Mexican, Indian, South Korean, Australian
-- programs), to an already-deployed database.
-- Safe to re-run.

INSERT INTO currencies (code, name) VALUES
  ('CHF', 'Swiss Franc'),
  ('CNY', 'Chinese Yuan'),
  ('BRL', 'Brazilian Real'),
  ('MXN', 'Mexican Peso'),
  ('INR', 'Indian Rupee'),
  ('KRW', 'South Korean Won'),
  ('AUD', 'Australian Dollar')
ON CONFLICT (code) DO NOTHING;
