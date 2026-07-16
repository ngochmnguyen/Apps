import { Router } from "express";
import { pool } from "../db.js";

export const newsletterRouter = Router();

// Clicked directly from an email link, so this returns a plain HTML page,
// not JSON -- and it's a GET (not requireAuth-gated) since the user isn't
// necessarily logged in on the device/browser where they read their email.
newsletterRouter.get("/unsubscribe/:userId", async (req, res) => {
  await pool.query(
    "UPDATE user_profiles SET newsletter_opt_out = TRUE WHERE user_id = $1",
    [req.params.userId]
  );
  res.type("html").send(`
    <!doctype html>
    <html><body style="font-family: sans-serif; max-width: 480px; margin: 80px auto; text-align: center;">
      <h2>You're unsubscribed</h2>
      <p>You won't get the Voya monthly newsletter anymore. You'll still get deadline reminders for opportunities you've saved.</p>
    </body></html>
  `);
});
