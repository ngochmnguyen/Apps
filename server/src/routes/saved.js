import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../auth.js";
import { BASE_QUERY, urgencyOf, URGENCY_RANK, eligibilityOf } from "./opportunities.js";
import { fetchProfile } from "./auth.js";

export const savedRouter = Router();
savedRouter.use(requireAuth);

const deadlineMs = (d) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER);

savedRouter.get("/", async (req, res) => {
  const [{ rows }, profile] = await Promise.all([
    pool.query(`${BASE_QUERY} AND o.id IN (SELECT opportunity_id FROM saved_opportunities WHERE user_id = $1)`, [req.userId]),
    fetchProfile(pool, req.userId),
  ]);
  const results = rows
    .map((o) => {
      const elig = profile ? eligibilityOf(o, profile) : { eligible: true, reasons: [] };
      return { ...o, urgency: urgencyOf(o.deadline), saved: true, eligible: elig.eligible, ineligibleReasons: elig.reasons, distanceKm: null };
    })
    .sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || deadlineMs(a.deadline) - deadlineMs(b.deadline));
  res.json({ results });
});

savedRouter.post("/:opportunityId", async (req, res) => {
  const { rows } = await pool.query("SELECT id FROM opportunities WHERE id = $1", [req.params.opportunityId]);
  if (!rows.length) return res.status(404).json({ error: "Opportunity not found." });
  await pool.query(
    "INSERT INTO saved_opportunities (user_id, opportunity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [req.userId, req.params.opportunityId]
  );
  res.status(201).json({ ok: true });
});

savedRouter.delete("/:opportunityId", async (req, res) => {
  await pool.query(
    "DELETE FROM saved_opportunities WHERE user_id = $1 AND opportunity_id = $2",
    [req.userId, req.params.opportunityId]
  );
  res.json({ ok: true });
});
