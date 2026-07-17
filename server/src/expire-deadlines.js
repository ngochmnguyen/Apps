// Archives opportunities whose application_deadline has passed. Run daily
// (see .github/workflows/expire-deadlines.yml).
//
// This is a soft delete, not a DELETE: archived rows stay in the database
// with is_archived = TRUE so a mistake (e.g. a deadline that was recorded
// wrong) is reversible, but BASE_QUERY excludes them so they disappear from
// the app immediately. Rolling-admission opportunities (application_deadline
// IS NULL) are never touched here.

import "dotenv/config";
import { pool } from "./db.js";

async function main() {
  const { rows } = await pool.query(
    `SELECT id, title, application_deadline
     FROM opportunities
     WHERE NOT is_archived
       AND application_deadline IS NOT NULL
       AND application_deadline < CURRENT_DATE`
  );

  if (!rows.length) {
    console.log("No expired opportunities to archive.");
    await pool.end();
    return;
  }

  await pool.query(
    `UPDATE opportunities
     SET is_archived = TRUE, archived_at = now()
     WHERE NOT is_archived
       AND application_deadline IS NOT NULL
       AND application_deadline < CURRENT_DATE`
  );

  console.log(`Archived ${rows.length} expired opportunit${rows.length === 1 ? "y" : "ies"}:`);
  rows.forEach((o) => console.log(`- ${o.title} (deadline was ${new Date(o.application_deadline).toISOString().slice(0, 10)})`));

  await pool.end();
}

main();
