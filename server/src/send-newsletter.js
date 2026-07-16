// Sends the monthly newsletter: a generic digest of opportunities added since
// the last send, plus an optional "featured reads" section read from
// newsletter_features.json (a manually-maintained list -- see that file for
// the format). Run periodically (see .github/workflows/send-newsletter.yml)
// against a database with normal internet access -- this sandbox's egress
// policy blocks it.
//
// Not personalized (every subscriber gets the same content) and not
// opt-in/opt-out via a settings toggle -- newsletter_opt_out is set only via
// the one-click unsubscribe link in the email itself.

import "dotenv/config";
import fs from "node:fs";
import { pool } from "./db.js";
import { sendNewsletterEmail } from "./email.js";

const FEATURES_PATH = new URL("../newsletter_features.json", import.meta.url);

async function main() {
  const { rows: sends } = await pool.query("SELECT max(sent_at) AS last_sent FROM newsletter_sends");
  const since = sends[0].last_sent || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { rows: opportunities } = await pool.query(
    `SELECT o.title, o.organization_name AS org, o.source_url, c.name AS dest_name
     FROM opportunities o
     JOIN countries c ON c.code = o.primary_destination_code
     WHERE o.created_at > $1
     ORDER BY o.created_at DESC
     LIMIT 20`,
    [since]
  );

  if (!opportunities.length) {
    console.log(`No new opportunities since ${since.toISOString()} -- skipping this month's send.`);
    await pool.end();
    return;
  }

  let featuredReads = [];
  try {
    featuredReads = JSON.parse(fs.readFileSync(FEATURES_PATH, "utf8"));
  } catch {
    // newsletter_features.json missing or invalid -- newsletter still sends without this section
  }

  const { rows: recipients } = await pool.query(
    `SELECT u.id, u.email FROM users u
     JOIN user_profiles up ON up.user_id = u.id
     WHERE NOT up.newsletter_opt_out`
  );

  let sent = 0;
  for (const r of recipients) {
    await sendNewsletterEmail(r.email, r.id, opportunities, featuredReads);
    console.log(`SENT  ${r.email}`);
    sent++;
    await new Promise((resolve) => setTimeout(resolve, 150)); // stay under Resend's rate limit
  }

  await pool.query(
    "INSERT INTO newsletter_sends (opportunity_count, recipient_count) VALUES ($1, $2)",
    [opportunities.length, sent]
  );

  await pool.end();
  console.log(`\nSent to ${sent} recipient(s), featuring ${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"}.`);
}

main();
