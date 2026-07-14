import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../auth.js";

export const todosRouter = Router();
todosRouter.use(requireAuth);

todosRouter.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT t.id, t.title, t.due_date, t.is_done, t.created_at, t.opportunity_id,
            o.title AS opportunity_title, o.application_deadline AS opportunity_deadline
     FROM todo_items t LEFT JOIN opportunities o ON o.id = t.opportunity_id
     WHERE t.user_id = $1
     ORDER BY t.is_done ASC, t.due_date NULLS LAST, t.created_at ASC`,
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

todosRouter.patch("/:id", async (req, res) => {
  const sets = [];
  const values = [req.params.id, req.userId];
  if (req.body.isDone !== undefined) { values.push(!!req.body.isDone); sets.push(`is_done = $${values.length}`); }
  if (req.body.title !== undefined) { values.push(req.body.title.trim()); sets.push(`title = $${values.length}`); }
  if (req.body.dueDate !== undefined) { values.push(req.body.dueDate || null); sets.push(`due_date = $${values.length}`); }
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
