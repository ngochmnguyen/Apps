// Sends deadline-reminder emails for saved opportunities, 7 and 2 days before
// application_deadline. Run periodically (see .github/workflows/send-reminders.yml)
// against a database with normal internet access -- this sandbox's egress
// policy blocks it.
//
// sent_reminders is inserted *before* sending (not after), so a mid-run crash
// can only under-send, never double-send -- and ON CONFLICT DO NOTHING makes
// re-running the whole script the same day safe too.

import "dotenv/config";
import { pool } from "./db.js";
import { sendDeadlineReminder } from "./email.js";

async function main() {
  const { rows } = await pool.query(`
    SELECT u.id AS user_id, u.email, o.id AS opportunity_id, o.title,
           (o.application_deadline - CURRENT_DATE) AS days_left
    FROM saved_opportunities so
    JOIN users u ON u.id = so.user_id
    JOIN opportunities o ON o.id = so.opportunity_id
    WHERE o.application_deadline IS NOT NULL
      AND (o.application_deadline - CURRENT_DATE) IN (7, 2)
  `);

  let sent = 0;
  for (const row of rows) {
    const reminderType = row.days_left === 7 ? "7_day" : "2_day";
    const { rowCount } = await pool.query(
      "INSERT INTO sent_reminders (user_id, opportunity_id, reminder_type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [row.user_id, row.opportunity_id, reminderType]
    );
    if (rowCount === 0) {
      console.log(`SKIP (already sent)  ${row.email} — ${row.title} (${reminderType})`);
      continue;
    }
    await sendDeadlineReminder(row.email, row.title, row.days_left);
    console.log(`SENT  ${row.email} — ${row.title} (${reminderType})`);
    sent++;
  }

  await pool.end();
  console.log(`\nSent ${sent} reminder(s) out of ${rows.length} candidate(s).`);
}

main();
