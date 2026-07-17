// Daily summary of everything that needs a human decision: open "report a
// problem" flags, new "suggest an opportunity" submissions, and whatever
// expire-deadlines.js archived in the last day. Run daily, after
// expire-deadlines.js (see .github/workflows/send-admin-digest.yml).
//
// Nothing here is auto-actioned -- reports/submissions stay 'open' until
// someone updates their status directly in Neon after reviewing.

import "dotenv/config";
import { pool } from "./db.js";
import { sendAdminDigest } from "./email.js";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.log("ADMIN_EMAIL not set -- nowhere to send the digest, skipping.");
    await pool.end();
    return;
  }

  const [{ rows: reports }, { rows: submissions }, { rows: archived }] = await Promise.all([
    pool.query(
      `SELECT r.id, r.reason, r.created_at, o.id AS opportunity_id, o.title AS opportunity_title, u.email AS reporter_email
       FROM opportunity_reports r
       JOIN opportunities o ON o.id = r.opportunity_id
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.status = 'open'
       ORDER BY r.created_at DESC`
    ),
    pool.query(
      `SELECT id, title, organization_name, source_url, notes, submitter_email, created_at
       FROM opportunity_submissions
       WHERE status = 'open'
       ORDER BY created_at DESC`
    ),
    pool.query(
      `SELECT title, archived_at AS archived_deadline
       FROM opportunities
       WHERE is_archived AND archived_at > now() - interval '1 day'
       ORDER BY archived_at DESC`
    ),
  ]);

  console.log(`${reports.length} open report(s), ${submissions.length} open submission(s), ${archived.length} newly archived.`);
  await sendAdminDigest(adminEmail, { reports, submissions, archived });
  await pool.end();
}

main();
