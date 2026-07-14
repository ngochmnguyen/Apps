-- Adds saved-opportunities bookmarking and a personal to-do list, so signed-in
-- users can bookmark trips and track application tasks/deadlines against them
-- (schema.sql alone won't apply this to Neon since it's an already-deployed DB).
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS saved_opportunities (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, opportunity_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_opportunity ON saved_opportunities (opportunity_id);

CREATE TABLE IF NOT EXISTS todo_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id  UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  due_date        DATE,
  is_done         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_todo_items_user ON todo_items (user_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_opportunity ON todo_items (opportunity_id);
