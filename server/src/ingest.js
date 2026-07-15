// Loads structured opportunity data (as produced by web research) into Postgres.
// Usage: node src/ingest.js <path-to-json-file>
//
// Input is a JSON array of objects shaped like:
// {
//   "title": "...", "description": "...", "org": "...",
//   "type": "conference|contest_competition|scholarship_fellowship|internship|
//            work_study_exchange|research_residency|volunteer_travel_stipend|work_stay",
//   "dest": "XX",                              // ISO country code, must exist in countries table
//   "compType": "cash|in_kind_only|cash_and_in_kind",
//   "flight": bool, "lodging": bool, "meals": bool,
//   "stipendMin": number|null, "stipendMax": number|null, "currency": "USD|EUR|AED"|null,
//   "requiresWorkVisa": bool, "visaNote": string|null,
//   "minAge": number, "maxAge": number|null,
//   "gradOnly": bool,
//   "education": ["masters_completed", ...],   // [] = open to all
//   "career": ["early_career", ...],           // [] = open to all
//   "employment": [],                          // [] = open to all
//   "english": "b1|b2|c1|c2|native_or_fluent",
//   "nationality": { "type": "include"|"exclude"|null, "list": ["XX", ...] },
//   "softTags": ["non_conventional_destination", ...],
//   "fieldsOfWork": ["education", "international_relations", "government_public_policy",
//                    "literature_writing", "arts_culture", "finance_economics",
//                    "business_entrepreneurship", "science_technology", "health_medicine",
//                    "law", "journalism_media", "environment_sustainability",
//                    "social_impact_development"],   // [] = open to all / not domain-specific
//   "deadline": "YYYY-MM-DD" | null,          // null = rolling admission, no fixed deadline
//   "duration": "single_day|weekend|one_to_two_weeks|three_to_four_weeks|one_to_three_months|semester_or_longer",
//   "isRecurring": bool,
//   "effortLabel": "quick|moderate|high|extensive", "effortMin": number,
//   "verification": "official_source|aggregator_verified|user_submitted_unverified",
//   "sourceUrl": "https://..."
// }
//
// Dedupes on source_url: if a row with the same source_url already exists, it's
// updated in place rather than duplicated, so re-running ingestion (e.g. from a
// daily research pass) is safe.

import "dotenv/config";
import fs from "node:fs";
import { pool } from "./db.js";

// Product decision, not an oversight: this app does not list opportunities
// destined for Israel. Israel is also absent from the countries table, so
// this would fail on the primary_destination_code FK anyway -- this check
// just makes the rule explicit and gives a clear error instead of a raw
// constraint violation.
const EXCLUDED_DESTINATIONS = new Set(["IL"]);

async function ingestOne(client, o) {
  if (EXCLUDED_DESTINATIONS.has(o.dest)) {
    throw new Error(`destination '${o.dest}' is not supported by this app`);
  }

  const existing = await client.query("SELECT id FROM opportunities WHERE source_url = $1", [o.sourceUrl]);
  let id = existing.rows[0]?.id;

  const values = [
    o.title, o.description, o.org, o.type, o.dest,
    o.compType, !!o.flight, !!o.lodging, !!o.meals,
    o.stipendMin ?? null, o.stipendMax ?? null, o.currency ?? null,
    !!o.requiresWorkVisa, o.visaNote ?? null,
    o.minAge, o.maxAge ?? null, !!o.gradOnly, o.english,
    o.deadline ?? null, o.duration, !!o.isRecurring, o.effortLabel, o.effortMin,
    o.verification, o.sourceUrl,
  ];

  if (id) {
    await client.query(
      `UPDATE opportunities SET
         title=$1, description=$2, organization_name=$3, opportunity_type=$4, primary_destination_code=$5,
         compensation_type=$6, covers_flight=$7, covers_lodging=$8, covers_meals=$9,
         stipend_min=$10, stipend_max=$11, currency_code=$12,
         requires_work_visa_for_payment=$13, payment_visa_notes=$14,
         min_age=$15, max_age=$16, requires_grad_student_status=$17, english_level_required=$18,
         application_deadline=$19, duration_category=$20, is_recurring=$21,
         application_effort=$22, estimated_application_minutes=$23,
         source_verification_status=$24, source_url=$25, updated_at=now()
       WHERE id = $26`,
      [...values, id]
    );
    await client.query("DELETE FROM opportunity_education_levels WHERE opportunity_id = $1", [id]);
    await client.query("DELETE FROM opportunity_career_stages WHERE opportunity_id = $1", [id]);
    await client.query("DELETE FROM opportunity_employment_statuses WHERE opportunity_id = $1", [id]);
    await client.query("DELETE FROM opportunity_nationality_rules WHERE opportunity_id = $1", [id]);
    await client.query("DELETE FROM opportunity_soft_tags WHERE opportunity_id = $1", [id]);
    await client.query("DELETE FROM opportunity_fields_of_work WHERE opportunity_id = $1", [id]);
  } else {
    const inserted = await client.query(
      `INSERT INTO opportunities (
         title, description, organization_name, opportunity_type, primary_destination_code,
         compensation_type, covers_flight, covers_lodging, covers_meals,
         stipend_min, stipend_max, currency_code,
         requires_work_visa_for_payment, payment_visa_notes,
         min_age, max_age, requires_grad_student_status, english_level_required,
         application_deadline, duration_category, is_recurring,
         application_effort, estimated_application_minutes,
         source_verification_status, source_url
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       RETURNING id`,
      values
    );
    id = inserted.rows[0].id;
  }

  for (const level of o.education || []) {
    await client.query("INSERT INTO opportunity_education_levels (opportunity_id, education_level) VALUES ($1, $2)", [id, level]);
  }
  for (const stage of o.career || []) {
    await client.query("INSERT INTO opportunity_career_stages (opportunity_id, career_stage) VALUES ($1, $2)", [id, stage]);
  }
  for (const status of o.employment || []) {
    await client.query("INSERT INTO opportunity_employment_statuses (opportunity_id, employment_status) VALUES ($1, $2)", [id, status]);
  }
  if (o.nationality?.type) {
    for (const code of o.nationality.list) {
      await client.query(
        "INSERT INTO opportunity_nationality_rules (opportunity_id, country_code, rule_type) VALUES ($1, $2, $3)",
        [id, code, o.nationality.type]
      );
    }
  }
  for (const tag of o.softTags || []) {
    await client.query("INSERT INTO opportunity_soft_tags (opportunity_id, tag_key) VALUES ($1, $2)", [id, tag]);
  }
  for (const field of o.fieldsOfWork || []) {
    await client.query("INSERT INTO opportunity_fields_of_work (opportunity_id, field) VALUES ($1, $2)", [id, field]);
  }

  return { id, wasUpdate: !!existing.rows[0] };
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: node src/ingest.js <path-to-json-file>");
    process.exit(1);
  }
  const items = JSON.parse(fs.readFileSync(path, "utf8"));
  const client = await pool.connect();
  let created = 0, updated = 0;
  try {
    for (const o of items) {
      await client.query("BEGIN");
      try {
        const { wasUpdate } = await ingestOne(client, o);
        await client.query("COMMIT");
        wasUpdate ? updated++ : created++;
        console.log(`${wasUpdate ? "updated" : "created"}: ${o.title}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`failed: ${o.title} — ${err.message}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
  console.log(`\nDone. ${created} created, ${updated} updated.`);
}

main();
