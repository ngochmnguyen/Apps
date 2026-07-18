import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "wayfarer_session";
const TOKEN_TTL = "30d";

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// secure:true is required in production (Render terminates TLS in front of
// the app) so the session cookie is never sent over plain HTTP; disabled
// locally since localhost dev usually isn't served over HTTPS.
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function issueSessionCookie(res, userId) {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });
  return token;
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

// Attaches req.userId when a valid session cookie or Authorization: Bearer
// token is present; never rejects the request, since most routes (browsing
// opportunities) work the same either way. Cookie takes precedence since it's
// the primary path for the web client; the bearer header is what lets a
// native client (no cookie jar, can't read httpOnly cookies) authenticate.
export function attachUser(req, _res, next) {
  const bearer = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const token = req.cookies?.[COOKIE_NAME] || bearer;
  if (token) {
    try {
      req.userId = jwt.verify(token, process.env.JWT_SECRET).sub;
    } catch {
      // expired or tampered token — treat as logged out rather than erroring
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: "Not signed in." });
  next();
}
