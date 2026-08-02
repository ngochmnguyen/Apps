import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db.js";
import { requireAdmin, verifyAdminPassword, issueAdminSession, clearAdminSession } from "../adminAuth.js";
import { upsertOpportunity } from "../ingest.js";

export const adminRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again." },
});

adminRouter.post("/login", loginLimiter, (req, res) => {
  if (!verifyAdminPassword(req.body.password)) {
    return res.status(401).json({ error: "Incorrect password." });
  }
  issueAdminSession(res);
  res.json({ ok: true });
});

adminRouter.post("/logout", (req, res) => {
  clearAdminSession(res);
  res.json({ ok: true });
});

adminRouter.get("/session", requireAdmin, (req, res) => res.json({ admin: true }));

// Every route below is moderation-only -- gate the whole rest of the router.
adminRouter.use(requireAdmin);

const REPORT_STATUSES = new Set(["open", "reviewed", "dismissed"]);

adminRouter.get("/reports", async (req, res) => {
  const status = REPORT_STATUSES.has(req.query.status) ? req.query.status : "open";
  const { rows } = await pool.query(
    `SELECT r.id, r.reason, r.status, r.created_at, r.user_id,
            o.id AS opportunity_id, o.title AS opportunity_title, o.organization_name AS opportunity_org,
            o.is_archived AS opportunity_archived
     FROM opportunity_reports r
     JOIN opportunities o ON o.id = r.opportunity_id
     WHERE r.status = $1
     ORDER BY r.created_at DESC`,
    [status]
  );
  res.json({ results: rows });
});

adminRouter.patch("/reports/:id", async (req, res) => {
  if (!REPORT_STATUSES.has(req.body.status)) return res.status(400).json({ error: "Invalid status." });
  const { rows } = await pool.query(
    "UPDATE opportunity_reports SET status = $2 WHERE id = $1 RETURNING id",
    [req.params.id, req.body.status]
  );
  if (!rows.length) return res.status(404).json({ error: "Report not found." });
  res.json({ ok: true });
});

adminRouter.get("/submissions", async (req, res) => {
  const status = REPORT_STATUSES.has(req.query.status) ? req.query.status : "open";
  const { rows } = await pool.query(
    `SELECT id, title, organization_name AS org, source_url, notes, submitter_email, status, created_at
     FROM opportunity_submissions WHERE status = $1 ORDER BY created_at DESC`,
    [status]
  );
  res.json({ results: rows });
});

adminRouter.patch("/submissions/:id", async (req, res) => {
  if (!REPORT_STATUSES.has(req.body.status)) return res.status(400).json({ error: "Invalid status." });
  const { rows } = await pool.query(
    "UPDATE opportunity_submissions SET status = $2 WHERE id = $1 RETURNING id",
    [req.params.id, req.body.status]
  );
  if (!rows.length) return res.status(404).json({ error: "Submission not found." });
  res.json({ ok: true });
});

// Lightweight list for browsing/searching every listing (reported or not,
// archived or not) to pick one to edit -- deliberately not BASE_QUERY from
// opportunities.js, since that hard-excludes archived rows and the dashboard
// needs to see (and restore) those too.
adminRouter.get("/opportunities", async (req, res) => {
  const search = (req.query.search || "").trim();
  const archived = req.query.archived === "true" ? true : req.query.archived === "false" ? false : null;
  const conditions = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(o.title ILIKE $${params.length} OR o.organization_name ILIKE $${params.length})`);
  }
  if (archived !== null) {
    params.push(archived);
    conditions.push(`o.is_archived = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT o.id, o.title, o.organization_name AS org, o.opportunity_type AS type,
            o.primary_destination_code AS dest, o.application_deadline AS deadline,
            o.is_archived, o.source_verification_status AS verification, o.source_url
     FROM opportunities o
     ${where}
     ORDER BY o.updated_at DESC
     LIMIT 200`,
    params
  );
  res.json({ results: rows });
});

// Full detail in the same shape ingest.js/upsertOpportunity expects, so the
// edit form can round-trip: GET fills the form, PATCH sends the same shape back.
const DETAIL_QUERY = `
  SELECT
    o.id, o.title, o.description, o.organization_name AS org, o.opportunity_type AS type,
    o.primary_destination_code AS dest, o.application_deadline AS deadline,
    o.compensation_type AS "compType", o.covers_flight AS flight, o.covers_lodging AS lodging, o.covers_meals AS meals,
    o.stipend_min AS "stipendMin", o.stipend_max AS "stipendMax", o.currency_code AS currency,
    o.requires_work_visa_for_payment AS "requiresWorkVisa", o.payment_visa_notes AS "visaNote",
    o.min_age AS "minAge", o.max_age AS "maxAge", o.requires_grad_student_status AS "gradOnly",
    o.english_level_required AS english,
    o.duration_category AS duration, o.is_recurring AS "isRecurring",
    o.application_effort AS "effortLabel", o.estimated_application_minutes AS "effortMin",
    o.source_verification_status AS verification, o.source_url AS "sourceUrl",
    o.is_archived, o.archived_at, o.verification_notes, o.link_broken, o.created_at, o.updated_at,
    coalesce(edu.levels, ARRAY[]::text[]) AS education,
    coalesce(car.stages, ARRAY[]::text[]) AS career,
    coalesce(emp.statuses, ARRAY[]::text[]) AS employment,
    coalesce(nat_inc.codes, ARRAY[]::text[]) AS nationality_include,
    coalesce(nat_exc.codes, ARRAY[]::text[]) AS nationality_exclude,
    coalesce(tags.keys, ARRAY[]::text[]) AS "softTags",
    coalesce(fow.fields, ARRAY[]::text[]) AS "fieldsOfWork"
  FROM opportunities o
  LEFT JOIN (SELECT opportunity_id, array_agg(education_level::text) levels FROM opportunity_education_levels GROUP BY opportunity_id) edu ON edu.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(career_stage::text) stages FROM opportunity_career_stages GROUP BY opportunity_id) car ON car.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(employment_status::text) statuses FROM opportunity_employment_statuses GROUP BY opportunity_id) emp ON emp.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(country_code) codes FROM opportunity_nationality_rules WHERE rule_type = 'include' GROUP BY opportunity_id) nat_inc ON nat_inc.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(country_code) codes FROM opportunity_nationality_rules WHERE rule_type = 'exclude' GROUP BY opportunity_id) nat_exc ON nat_exc.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(tag_key) keys FROM opportunity_soft_tags GROUP BY opportunity_id) tags ON tags.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(field::text) fields FROM opportunity_fields_of_work GROUP BY opportunity_id) fow ON fow.opportunity_id = o.id
  WHERE o.id = $1
`;

function toNationalityShape(row) {
  if (row.nationality_include.length) return { type: "include", list: row.nationality_include };
  if (row.nationality_exclude.length) return { type: "exclude", list: row.nationality_exclude };
  return { type: null, list: [] };
}

adminRouter.get("/opportunities/:id", async (req, res) => {
  const { rows } = await pool.query(DETAIL_QUERY, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Opportunity not found." });
  const row = rows[0];
  const { nationality_include, nationality_exclude, ...rest } = row;
  res.json({ opportunity: { ...rest, nationality: toNationalityShape(row) } });
});

adminRouter.patch("/opportunities/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM opportunities WHERE id = $1", [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ error: "Opportunity not found." });

    await client.query("BEGIN");
    await upsertOpportunity(client, req.body, req.params.id);
    await client.query("COMMIT");
    const { rows } = await client.query(DETAIL_QUERY, [req.params.id]);
    const row = rows[0];
    const { nationality_include, nationality_exclude, ...rest } = row;
    res.json({ opportunity: { ...rest, nationality: toNationalityShape(row) } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(400).json({ error: err.message || "Could not save changes." });
  } finally {
    client.release();
  }
});

adminRouter.delete("/opportunities/:id", async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE opportunities SET is_archived = TRUE, archived_at = now() WHERE id = $1 RETURNING id",
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Opportunity not found." });
  res.json({ ok: true });
});

adminRouter.post("/opportunities/:id/restore", async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE opportunities SET is_archived = FALSE, archived_at = NULL WHERE id = $1 RETURNING id",
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Opportunity not found." });
  res.json({ ok: true });
});

// Counts only, computed on read -- no separate rollup table to keep in sync.
// DISTINCT session_id under pageview approximates unique visitors without
// needing real user accounts (most visitors haven't signed up yet).
adminRouter.get("/analytics/summary", async (req, res) => {
  const [totals, daily] = await Promise.all([
    pool.query(`
      SELECT
        event_type,
        COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '7 days') AS last_7d,
        COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days') AS last_30d,
        COUNT(DISTINCT session_id) FILTER (WHERE created_at >= now() - INTERVAL '7 days') AS unique_sessions_7d,
        COUNT(DISTINCT session_id) FILTER (WHERE created_at >= now() - INTERVAL '30 days') AS unique_sessions_30d
      FROM analytics_events
      GROUP BY event_type
      ORDER BY event_type
    `),
    pool.query(`
      SELECT date_trunc('day', created_at)::date AS day, event_type, COUNT(*) AS count
      FROM analytics_events
      WHERE created_at >= now() - INTERVAL '14 days'
      GROUP BY 1, 2
      ORDER BY 1 DESC, 2
    `),
  ]);
  res.json({ totals: totals.rows, daily: daily.rows });
});
