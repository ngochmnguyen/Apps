-- Adds the monthly newsletter: a generic (non-personalized) digest of new
-- opportunities added since the last send, plus an optional manually-curated
-- "featured reads" section (see server/newsletter_features.json).
--
-- newsletter_opt_out is a one-click unsubscribe, not a settings-page toggle --
-- there's no UI checkbox for it, just the link in the newsletter email
-- itself, which is the minimum needed to not be sending un-unsubscribable
-- bulk email.
-- Safe to re-run.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS newsletter_opt_out BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS newsletter_sends (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  opportunity_count  INTEGER NOT NULL,
  recipient_count    INTEGER NOT NULL
);
