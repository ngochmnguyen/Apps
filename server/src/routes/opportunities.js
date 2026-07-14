import { Router } from "express";
import { pool } from "../db.js";

export const opportunitiesRouter = Router();

const ENGLISH_RANK = { b1: 0, b2: 1, c1: 2, c2: 3, native_or_fluent: 4 };

const BASE_QUERY = `
  SELECT
    o.id, o.title, o.description, o.organization_name AS org, o.opportunity_type AS type,
    o.primary_destination_code AS dest, o.application_deadline AS deadline,
    o.compensation_type AS comp_type, o.covers_flight AS flight, o.covers_lodging AS lodging, o.covers_meals AS meals,
    o.stipend_min, o.stipend_max, o.currency_code AS currency,
    o.requires_work_visa_for_payment AS requires_work_visa, o.payment_visa_notes AS visa_note,
    o.min_age, o.max_age, o.requires_grad_student_status AS grad_only, o.english_level_required AS english,
    o.duration_category AS duration, o.application_effort AS effort_label, o.estimated_application_minutes AS effort_min,
    o.source_verification_status AS verification, o.source_url,
    dest.name AS dest_name, dest.is_non_conventional_dest AS dest_non_conventional,
    dest.latitude AS dest_lat, dest.longitude AS dest_lon,
    coalesce(edu.levels, ARRAY[]::text[]) AS education,
    coalesce(car.stages, ARRAY[]::text[]) AS career,
    coalesce(emp.statuses, ARRAY[]::text[]) AS employment,
    coalesce(nat_inc.codes, ARRAY[]::text[]) AS nationality_include,
    coalesce(nat_exc.codes, ARRAY[]::text[]) AS nationality_exclude,
    coalesce(tags.keys, ARRAY[]::text[]) AS soft_tags
  FROM opportunities o
  JOIN countries dest ON dest.code = o.primary_destination_code
  LEFT JOIN (SELECT opportunity_id, array_agg(education_level::text) levels FROM opportunity_education_levels GROUP BY opportunity_id) edu ON edu.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(career_stage::text) stages FROM opportunity_career_stages GROUP BY opportunity_id) car ON car.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(employment_status::text) statuses FROM opportunity_employment_statuses GROUP BY opportunity_id) emp ON emp.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(country_code) codes FROM opportunity_nationality_rules WHERE rule_type = 'include' GROUP BY opportunity_id) nat_inc ON nat_inc.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(country_code) codes FROM opportunity_nationality_rules WHERE rule_type = 'exclude' GROUP BY opportunity_id) nat_exc ON nat_exc.opportunity_id = o.id
  LEFT JOIN (SELECT opportunity_id, array_agg(tag_key) keys FROM opportunity_soft_tags GROUP BY opportunity_id) tags ON tags.opportunity_id = o.id
`;

function urgencyOf(deadline) {
  if (!deadline) return "rolling"; // no fixed deadline — contact the org directly
  const days = (new Date(deadline) - new Date(new Date().toDateString())) / 86400000;
  if (days < 0) return "closed";
  if (days <= 7) return "soon";
  if (days <= 30) return "month";
  return "open";
}

function eligibilityOf(o, profile) {
  const reasons = [];
  if (profile.age < o.min_age || (o.max_age != null && profile.age > o.max_age)) reasons.push("age");
  if (o.grad_only && profile.career !== "grad_student" && !["masters_in_progress", "phd_in_progress"].includes(profile.education)) {
    reasons.push("grad-student only");
  }
  if (o.education.length && !o.education.includes(profile.education)) reasons.push("education level");
  if (o.career.length && !o.career.includes(profile.career)) reasons.push("career stage");
  if (o.employment.length && !o.employment.includes(profile.employment)) reasons.push("employment status");
  if (ENGLISH_RANK[profile.english] < ENGLISH_RANK[o.english]) reasons.push("English level");
  if (o.nationality_include.length && !o.nationality_include.includes(profile.nationality)) reasons.push("nationality restricted");
  if (o.nationality_exclude.includes(profile.nationality)) reasons.push("nationality restricted");
  return { eligible: reasons.length === 0, reasons };
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function readProfile(query) {
  return {
    nationality: query.nationality || null,
    residenceCode: query.residence || null,
    age: parseInt(query.age, 10) || 0,
    education: query.education || "",
    career: query.career || "",
    employment: query.employment || "",
    english: query.english || "b1",
  };
}

const URGENCY_RANK = { soon: 0, month: 1, open: 2, rolling: 3, closed: 4 };

opportunitiesRouter.get("/hot", async (_req, res) => {
  const { rows } = await pool.query(BASE_QUERY);
  const withUrgency = rows.map((o) => ({ ...o, urgency: urgencyOf(o.deadline) }));
  const hot = withUrgency
    .filter((o) => o.urgency !== "closed")
    .sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || (b.stipend_max || 0) - (a.stipend_max || 0))
    .slice(0, 3);
  res.json({ results: hot });
});

opportunitiesRouter.get("/", async (req, res) => {
  const { rows } = await pool.query(BASE_QUERY);
  const profile = readProfile(req.query);

  let residenceCountry = null;
  if (profile.residenceCode) {
    const { rows: crows } = await pool.query("SELECT latitude, longitude FROM countries WHERE code = $1", [profile.residenceCode]);
    residenceCountry = crows[0] || null;
  }

  const enriched = rows.map((o) => {
    const urgency = urgencyOf(o.deadline);
    const elig = eligibilityOf(o, profile);
    const distanceKm = residenceCountry ? haversineKm(residenceCountry.latitude, residenceCountry.longitude, o.dest_lat, o.dest_lon) : null;
    return { ...o, urgency, eligible: elig.eligible, ineligibleReasons: elig.reasons, distanceKm };
  });

  const stats = {
    total: enriched.length,
    eligible: enriched.filter((o) => o.eligible).length,
    closingSoon: enriched.filter((o) => o.urgency === "soon").length,
  };

  const activeTypes = (req.query.types || "").split(",").filter(Boolean);
  const region = req.query.region || "all";
  const compensation = req.query.compensation || "all";
  const urgencyFilter = req.query.urgency || "all";
  const showClosed = req.query.showClosed === "true";
  const eligibleOnly = req.query.eligibleOnly === "true";
  const search = (req.query.search || "").trim().toLowerCase();
  const distanceFilter = req.query.distance || "any";
  const sort = req.query.sort || "deadline";

  let results = enriched.filter((o) => {
    if (o.urgency === "closed" && !showClosed) return false;
    if (urgencyFilter !== "all") {
      const matches = urgencyFilter === "later" ? (o.urgency === "open" || o.urgency === "rolling") : o.urgency === urgencyFilter;
      if (!matches) return false;
    }
    if (activeTypes.length && !activeTypes.includes(o.type)) return false;
    if (region === "nonconventional" && !o.dest_non_conventional) return false;
    if (region === "conventional" && o.dest_non_conventional) return false;
    if (compensation !== "all" && o.comp_type !== compensation) return false;
    if (eligibleOnly && !o.eligible) return false;
    if (distanceFilter !== "any" && residenceCountry && o.distanceKm > parseInt(distanceFilter, 10)) return false;
    if (search) {
      const haystack = `${o.title} ${o.org} ${o.dest_name}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const deadlineMs = (d) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER); // rolling sorts after dated listings
  results.sort((a, b) => {
    if (sort === "stipend") return (b.stipend_max || 0) - (a.stipend_max || 0);
    if (sort === "newest") return 0; // insertion order from the DB is our "newest" proxy
    if (sort === "distance" && residenceCountry) return a.distanceKm - b.distanceKm;
    return deadlineMs(a.deadline) - deadlineMs(b.deadline);
  });

  res.json({ stats, results });
});

// Anonymous reports are allowed (req.userId may be undefined) — the point is
// to lower the bar for flagging something that looks wrong, like a listing
// that turns out to be fabricated or asks for a payment.
opportunitiesRouter.post("/:id/report", async (req, res) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) return res.status(400).json({ error: "Please describe what's wrong." });
  if (reason.length > 2000) return res.status(400).json({ error: "That's a bit long — 2000 characters max." });

  const { rows } = await pool.query("SELECT id FROM opportunities WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Opportunity not found." });

  await pool.query(
    "INSERT INTO opportunity_reports (opportunity_id, user_id, reason) VALUES ($1, $2, $3)",
    [req.params.id, req.userId || null, reason.trim()]
  );
  res.status(201).json({ ok: true });
});
