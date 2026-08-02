import { Router } from "express";
import { pool } from "../db.js";

export const analyticsRouter = Router();

// First-party event log -- no third-party script, no cookie banner needed
// since session_id is a random id the client keeps in localStorage (see
// prototype/index.html's ANALYTICS_SESSION_KEY), not tied to a person unless
// they're signed in (attachUser, applied globally in index.js, already
// populates req.userId from the session cookie/bearer token when present).
//
// event_type is restricted to a known allow-list rather than accepting
// arbitrary strings -- this endpoint is public and unauthenticated by design
// (it has to fire before someone has an account), so the allow-list is what
// keeps it from becoming a place to dump arbitrary junk.
const KNOWN_EVENTS = new Set([
  "pageview",
  "email_captured",
  "signup_completed",
  "login_completed",
  "wizard_step_completed",
  "filters_submitted",
  "account_nudge_shown",
  "opportunity_saved",
  "opportunity_detail_viewed",
]);

analyticsRouter.post("/event", async (req, res) => {
  const { event, sessionId, path: pagePath, meta } = req.body || {};
  if (!KNOWN_EVENTS.has(event)) return res.status(400).json({ error: "Unknown event type." });
  if (typeof sessionId !== "string" || !sessionId || sessionId.length > 100) {
    return res.status(400).json({ error: "Invalid session id." });
  }
  const safePath = typeof pagePath === "string" ? pagePath.slice(0, 300) : null;
  // Cap serialized size rather than validate shape -- meta is a free-form,
  // per-event debugging aid, not something other code reads back out.
  const safeMeta = meta && JSON.stringify(meta).length <= 2000 ? meta : null;

  try {
    await pool.query(
      `INSERT INTO analytics_events (event_type, session_id, user_id, path, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [event, sessionId, req.userId || null, safePath, safeMeta ? JSON.stringify(safeMeta) : null]
    );
  } catch (err) {
    console.error("Failed to record analytics event:", err);
  }
  // Always 204: a dropped analytics beacon should never surface as an error
  // to the visitor, and sendBeacon on the client doesn't read the response anyway.
  res.status(204).end();
});
