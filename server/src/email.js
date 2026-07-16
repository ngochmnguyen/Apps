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

export async function sendNewsletterEmail(to, unsubscribeUserId, opportunities, featuredReads) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set -- skipping newsletter to ${to}`);
    return;
  }
  if (!process.env.APP_URL) {
    console.log(`[email] APP_URL not set -- skipping newsletter to ${to} (unsubscribe link needs a real URL)`);
    return;
  }
  const appUrl = process.env.APP_URL;
  const oppRows = opportunities
    .map((o) => `<li><a href="${o.source_url}">${o.title}</a> -- ${o.org}, ${o.dest_name}</li>`)
    .join("");
  const readRows = (featuredReads || [])
    .map((r) => `<li><a href="${r.url}">${r.title}</a></li>`)
    .join("");
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "This month on Voya: new opportunities",
      html: `
        <p>Here's what's new on Voya this month:</p>
        <ul>${oppRows}</ul>
        ${readRows ? `<p>A few reads:</p><ul>${readRows}</ul>` : ""}
        <p><a href="${appUrl}">Browse all opportunities on Voya</a></p>
        <p style="font-size:12px;color:#888;">
          <a href="${appUrl}/api/newsletter/unsubscribe/${unsubscribeUserId}">Unsubscribe from this newsletter</a>
        </p>
      `,
    });
  } catch (err) {
    console.error(`Newsletter email to ${to} failed:`, err);
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
