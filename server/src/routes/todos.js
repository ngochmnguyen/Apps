import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../auth.js";

export const todosRouter = Router();
todosRouter.use(requireAuth);

export const VALID_STATUSES = ["not_started", "started", "submitted", "accepted", "rejected"];

todosRouter.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT t.id, t.title, t.due_date, t.status, t.created_at, t.opportunity_id,
            o.title AS opportunity_title, o.application_deadline AS opportunity_deadline
     FROM todo_items t LEFT JOIN opportunities o ON o.id = t.opportunity_id
     WHERE t.user_id = $1
     ORDER BY (CASE t.status
                 WHEN 'not_started' THEN 0
                 WHEN 'started' THEN 0
                 WHEN 'submitted' THEN 1
                 ELSE 2
               END), t.due_date NULLS LAST, t.created_at ASC`,
    [req.userId]
  );
  res.json({ results: rows });
});

todosRouter.post("/", async (req, res) => {
  const { title, dueDate, opportunityId } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "A task needs a title." });
  if (title.length > 300) return res.status(400).json({ error: "Keep it under 300 characters." });
  if (opportunityId) {
    const { rows } = await pool.query("SELECT id FROM opportunities WHERE id = $1", [opportunityId]);
    if (!rows.length) return res.status(404).json({ error: "Linked opportunity not found." });
  }
  const { rows } = await pool.query(
    "INSERT INTO todo_items (user_id, opportunity_id, title, due_date) VALUES ($1, $2, $3, $4) RETURNING *",
    [req.userId, opportunityId || null, title.trim(), dueDate || null]
  );
  res.status(201).json({ todo: rows[0] });
});

// Bulk-creates todo items from a listing's application checklist -- this is
// what "+ Add to my to-do list" calls (alongside POST /api/saved/:id) so
// saving a listing and queuing its prep tasks happens in one action.
todosRouter.post("/bulk", async (req, res) => {
  const { opportunityId, items } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "No checklist items provided." });
  if (opportunityId) {
    const { rows } = await pool.query("SELECT id FROM opportunities WHERE id = $1", [opportunityId]);
    if (!rows.length) return res.status(404).json({ error: "Linked opportunity not found." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const created = [];
    for (const title of items.slice(0, 20)) {
      if (!title || !title.trim()) continue;
      const { rows } = await client.query(
        "INSERT INTO todo_items (user_id, opportunity_id, title) VALUES ($1, $2, $3) RETURNING *",
        [req.userId, opportunityId || null, title.trim().slice(0, 300)]
      );
      created.push(rows[0]);
    }
    await client.query("COMMIT");
    res.status(201).json({ todos: created });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not create tasks." });
  } finally {
    client.release();
  }
});

todosRouter.patch("/:id", async (req, res) => {
  const sets = [];
  const values = [req.params.id, req.userId];
  if (req.body.status !== undefined) {
    if (!VALID_STATUSES.includes(req.body.status)) return res.status(400).json({ error: "Invalid status." });
    values.push(req.body.status);
    sets.push(`status = $${values.length}`);
  }
  if (req.body.title !== undefined) {
    values.push(req.body.title.trim());
    sets.push(`title = $${values.length}`);
  }
  if (req.body.dueDate !== undefined) {
    values.push(req.body.dueDate || null);
    sets.push(`due_date = $${values.length}`);
  }
  if (!sets.length) return res.status(400).json({ error: "Nothing to update." });

  const { rows } = await pool.query(
    `UPDATE todo_items SET ${sets.join(", ")} WHERE id = $1 AND user_id = $2 RETURNING *`,
    values
  );
  if (!rows.length) return res.status(404).json({ error: "Task not found." });
  res.json({ todo: rows[0] });
});

todosRouter.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM todo_items WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
  res.json({ ok: true });
});
