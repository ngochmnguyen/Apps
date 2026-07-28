import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db.js";
import { hashPassword, verifyPassword, issueSessionCookie, clearSessionCookie, requireAuth } from "../auth.js";
import { sendWelcomeEmail, sendEmailCaptureWelcome } from "../email.js";

export const authRouter = Router();

// Credential-guessing protection: signup/login are the two endpoints where a
// brute-force or account-enumeration attempt would actually pay off.
const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again." },
});

const PROFILE_FIELDS = ["nationality", "residence", "age", "education", "career", "employment", "english", "disability"];

function validateProfile(body) {
  for (const field of PROFILE_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return `Missing profile field: ${field}`;
    }
  }
  if (!Number.isInteger(body.age) || body.age < 18) return "Age must be a whole number, 18 or older.";
  return null;
}

export async function fetchProfile(client, userId) {
  const { rows } = await client.query(
    `SELECT nationality_country_code AS nationality, residence_country_code AS residence,
            EXTRACT(YEAR FROM age(date_of_birth))::int AS age,
            education_level AS education, career_stage AS career, employment_status AS employment,
            english_level AS english, disability_status AS disability
     FROM user_profiles WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The pre-browsing email gate: just an email address, no password or profile
// yet. Creates a `users` row with a NULL password_hash if one doesn't already
// exist for this address -- POST /signup later completes it. Idempotent and
// silent on repeat/duplicate submission (including for addresses that already
// have a full account) so this can't be used to probe which emails are
// registered.
authRouter.post("/capture-email", authAttemptLimiter, async (req, res) => {
  const email = (req.body.email || "").trim();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });

  try {
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, NULL) ON CONFLICT (email) DO NOTHING RETURNING id",
      [email]
    );
    // rows.length is empty on a repeat submission (ON CONFLICT DO NOTHING) --
    // only send the welcome email the first time this address is captured.
    if (rows.length) sendEmailCaptureWelcome(email); // fire-and-forget, must never delay or fail this request
    res.status(201).json({ ok: true });
  } catch (err) {
    // Most likely cause: db/migrate_add_email_capture.sql (which makes
    // password_hash nullable) hasn't been run against this database yet, so
    // the NULL insert above violates the old NOT NULL constraint. Surfacing
    // that as JSON here (instead of letting it fall through to Express's
    // default HTML error page) is what stops the frontend from choking on
    // "<!DOCTYPE..." when it tries to JSON.parse the response.
    console.error("capture-email failed:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

authRouter.post("/signup", authAttemptLimiter, async (req, res) => {
  const { email, password, ...profile } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
  const profileError = validateProfile(profile);
  if (profileError) return res.status(400).json({ error: profileError });

  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id, password_hash FROM users WHERE email = $1", [email]);
    // A row with a NULL password_hash was created by the pre-signup email
    // gate (POST /capture-email) -- not a real account yet, so this signup
    // completes it in place instead of bouncing as a duplicate.
    const capturedRow = existing.rows[0] && !existing.rows[0].password_hash ? existing.rows[0] : null;
    if (existing.rows.length && !capturedRow) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    await client.query("BEGIN");
    const passwordHash = await hashPassword(password);
    let userId;
    if (capturedRow) {
      userId = capturedRow.id;
      await client.query("UPDATE users SET password_hash = $2 WHERE id = $1", [userId, passwordHash]);
    } else {
      const userResult = await client.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
        [email, passwordHash]
      );
      userId = userResult.rows[0].id;
    }

    await client.query(
      `INSERT INTO user_profiles
         (user_id, nationality_country_code, residence_country_code, date_of_birth,
          education_level, career_stage, employment_status, english_level, disability_status)
       VALUES ($1, $2, $3, (CURRENT_DATE - ($4 || ' years')::interval)::date, $5, $6, $7, $8, $9)`,
      [userId, profile.nationality, profile.residence, profile.age,
       profile.education, profile.career, profile.employment, profile.english, !!profile.disability]
    );
    await client.query(
      "INSERT INTO user_citizenships (user_id, country_code) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, profile.nationality]
    );
    await client.query("COMMIT");

    const token = issueSessionCookie(res, userId);
    sendWelcomeEmail(email); // fire-and-forget -- must never delay or fail signup
    res.status(201).json({ user: { id: userId, email }, profile: await fetchProfile(client, userId), token });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not create account." });
  } finally {
    client.release();
  }
});

authRouter.post("/login", authAttemptLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  const { rows } = await pool.query("SELECT id, password_hash FROM users WHERE email = $1", [email]);
  const user = rows[0];
  // A NULL password_hash means only the pre-signup email gate has run for
  // this address -- there's no account to log into yet, same as not found.
  if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const token = issueSessionCookie(res, user.id);
  res.json({ user: { id: user.id, email }, profile: await fetchProfile(pool, user.id), token });
});

authRouter.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", async (req, res) => {
  if (!req.userId) return res.json({ user: null, profile: null });
  const { rows } = await pool.query("SELECT id, email FROM users WHERE id = $1", [req.userId]);
  const user = rows[0];
  if (!user) return res.json({ user: null, profile: null });
  res.json({ user, profile: await fetchProfile(pool, req.userId) });
});

authRouter.put("/profile", requireAuth, async (req, res) => {
  const profileError = validateProfile(req.body);
  if (profileError) return res.status(400).json({ error: profileError });
  const p = req.body;

  await pool.query(
    `UPDATE user_profiles SET
       nationality_country_code = $2, residence_country_code = $3,
       date_of_birth = (CURRENT_DATE - ($4 || ' years')::interval)::date,
       education_level = $5, career_stage = $6, employment_status = $7,
       english_level = $8, disability_status = $9, updated_at = now()
     WHERE user_id = $1`,
    [req.userId, p.nationality, p.residence, p.age, p.education, p.career, p.employment, p.english, !!p.disability]
  );
  await pool.query(
    "INSERT INTO user_citizenships (user_id, country_code) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [req.userId, p.nationality]
  );
  res.json({ profile: await fetchProfile(pool, req.userId) });
});
