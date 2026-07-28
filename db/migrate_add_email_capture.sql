-- Lets a visitor hand over just an email address before browsing, without
-- creating a full account yet. That's a `users` row with a NULL password_hash
-- and no matching user_profiles row; POST /api/auth/signup later "completes"
-- that same row (sets the password, inserts the profile) instead of erroring
-- on the duplicate email.
--
-- Safe to re-run.

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
