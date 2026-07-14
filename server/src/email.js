// Thin Resend wrapper. Every export is a no-op (logs and returns) when
// RESEND_API_KEY isn't set, and swallows its own send errors -- a broken or
// unconfigured email provider must never fail signup or interrupt the
// reminders cron's other sends.
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "Voya <onboarding@resend.dev>";

export async function sendWelcomeEmail(to) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set -- skipping welcome email to ${to}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Welcome to Voya',
      html: `
        <p>Welcome to Voya!</p>
        <p>You're in -- browse paid travel opportunities filtered to your profile, save the ones you're going after, and track your applications from your My Trips page.</p>
        <p>Good luck out there.</p>
      `,
    });
  } catch (err) {
    console.error("Welcome email failed:", err);
  }
}

export async function sendDeadlineReminder(to, opportunityTitle, daysLeft) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set -- skipping ${daysLeft}-day reminder to ${to}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left to apply: ${opportunityTitle}`,
      html: `
        <p>The application deadline for <strong>${opportunityTitle}</strong> is in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.</p>
        <p>Log in to Voya and check your My Trips page for the details and your checklist.</p>
      `,
    });
  } catch (err) {
    console.error("Deadline reminder email failed:", err);
  }
}
