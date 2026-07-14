// Confirms every opportunity's source_url still resolves. Run periodically
// (see .github/workflows/link-check.yml) against a database with normal
// internet access — this sandbox's egress policy blocks it.
//
// This is a floor, not a ceiling: a 200 response only proves the URL still
// loads, not that the opportunity is still real, open, or unchanged. It
// catches dead/redirected links; it doesn't replace human judgment or the
// "Report a problem" path for content that's wrong in ways a link check
// can't see.

import "dotenv/config";
import { pool } from "./db.js";

const TIMEOUT_MS = 10000;

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (res.status === 405 || res.status === 501) {
      // some servers don't support HEAD — retry with GET before concluding anything
      res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const { rows } = await pool.query("SELECT id, title, source_url FROM opportunities ORDER BY title");
  const broken = [];

  for (const o of rows) {
    const ok = await checkUrl(o.source_url);
    await pool.query(
      "UPDATE opportunities SET last_verified_at = now(), link_broken = $2 WHERE id = $1",
      [o.id, !ok]
    );
    console.log(`${ok ? "OK  " : "FAIL"}  ${o.title} — ${o.source_url}`);
    if (!ok) broken.push(o);
  }

  await pool.end();

  if (broken.length) {
    console.log(`\n${broken.length} broken link(s):`);
    broken.forEach((o) => console.log(`- ${o.title}: ${o.source_url}`));
    process.exit(1); // fail the workflow run so it surfaces as a GitHub notification
  }
  console.log(`\nAll ${rows.length} source links OK.`);
}

main();
