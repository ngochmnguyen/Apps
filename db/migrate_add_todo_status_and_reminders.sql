-- Adds richer to-do status tracking and deadline-reminder-email support to an
-- already-deployed database (schema.sql alone won't apply this to Neon since
-- todo_items already exists there).
-- Safe to re-run.

ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started';
UPDATE todo_items SET status = 'submitted' WHERE is_done = TRUE AND status = 'not_started';
ALTER TABLE todo_items DROP COLUMN IF EXISTS is_done;

CREATE TABLE IF NOT EXISTS sent_reminders (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  reminder_type   TEXT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, opportunity_id, reminder_type)
);
