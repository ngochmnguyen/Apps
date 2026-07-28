import crypto from "node:crypto";
import jwt from "jsonwebtoken";

// Deliberately separate from the user-session cookie/JWT in auth.js: this is
// a single shared operator password (ADMIN_PASSWORD env var), not a
// per-account role, so it gets its own cookie name and its own short-lived
// token rather than reusing signToken/attachUser's user-session semantics.
const ADMIN_COOKIE_NAME = "voya_admin_session";
const ADMIN_TOKEN_TTL = "12h";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export function verifyAdminPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== "string") return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  // timingSafeEqual requires equal-length buffers; a length mismatch is
  // already a safe, fast "no" (no secret-dependent branching on content).
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function issueAdminSession(res) {
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: ADMIN_TOKEN_TTL });
  res.cookie(ADMIN_COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: 12 * 60 * 60 * 1000 });
}

export function clearAdminSession(res) {
  res.clearCookie(ADMIN_COOKIE_NAME, COOKIE_OPTIONS);
}

export function requireAdmin(req, res, next) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (token) {
    try {
      if (jwt.verify(token, process.env.JWT_SECRET).admin === true) return next();
    } catch {
      // expired or tampered token -- fall through to 401
    }
  }
  res.status(401).json({ error: "Admin session required." });
}
