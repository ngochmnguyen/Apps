import { Router } from "express";
import { pool } from "../db.js";

export const submissionsRouter = Router();

// Public "suggest an opportunity" form. Deliberately open to anonymous
// visitors (no auth) -- lowering the bar for tips is the point. Never
// auto-published: a human reviews these (see server/send-admin-digest.js)
// and adds legitimate ones via the normal ingest.js pipeline.
submissionsRouter.post("/", async (req, res) => {
  const { title, organizationName, sourceUrl, notes, submitterEmail } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "Please include at least a title or program name." });
  if (title.length > 300) return res.status(400).json({ error: "That title's a bit long — 300 characters max." });
  if (notes && notes.length > 3000) return res.status(400).json({ error: "That's a bit long — 3000 characters max." });

  await pool.query(
    `INSERT INTO opportunity_submissions (title, organization_name, source_url, notes, submitter_email)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      title.trim(),
      organizationName?.trim() || null,
      sourceUrl?.trim() || null,
      notes?.trim() || null,
      submitterEmail?.trim() || null,
    ]
  );
  res.status(201).json({ ok: true });
});
