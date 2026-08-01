// Thin Resend wrapper. Every export is a no-op (logs and returns) when
// RESEND_API_KEY isn't set, and swallows its own send errors -- a broken or
// unconfigured email provider must never fail signup or interrupt the
// reminders cron's other sends.
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "Voya <voya@minhngocn.com>";

// Same dark green as the web app's navbar (--navbar-bg / --navbar-ink in
// prototype/index.html) so the brand reads the same in an inbox as on the site.
const BRAND_BG = "#12241b";
const BRAND_INK = "#f3f5f2";

// Shared branded wrapper: dark header bar with the Voya mark, a white content
// card, and an optional pill-shaped CTA button. Table-based layout with inline
// styles, since that's what actually renders consistently across email
// clients (Gmail, Outlook, Apple Mail) -- a plain <div>-based layout mostly
// works too, but tables are the safe default for HTML email.
function emailShell({ contentHtml, ctaText, ctaUrl, footerHtml }) {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f0ece3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece3;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;max-width:600px;width:100%;">
            <tr>
              <td style="background:${BRAND_BG};padding:18px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:8px;">
                      <table role="presentation" width="26" height="26" cellpadding="0" cellspacing="0" style="border:1.5px solid ${BRAND_INK};border-radius:50%;">
                        <tr><td align="center" style="color:${BRAND_INK};font-size:13px;line-height:26px;">&#8599;</td></tr>
                      </table>
                    </td>
                    <td style="color:${BRAND_INK};font-size:14px;font-weight:700;letter-spacing:2px;">VOYA</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 8px;">
                ${contentHtml}
              </td>
            </tr>
            ${ctaUrl ? `
            <tr>
              <td style="padding:8px 40px 44px;text-align:center;">
                <a href="${ctaUrl}" style="display:inline-block;background:${BRAND_BG};color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:999px;font-size:15px;font-weight:600;">${ctaText ? ctaText + "&nbsp; " : ""}&#8594;</a>
              </td>
            </tr>` : ""}
            ${footerHtml ? `
            <tr>
              <td style="padding:0 40px 28px;text-align:center;font-size:12px;color:#8a8a8a;">
                ${footerHtml}
              </td>
            </tr>` : ""}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function heading(text) {
  return `<h1 style="margin:0 0 16px;font-size:26px;color:#1a1a1a;text-align:center;">${text}</h1>`;
}
function paragraph(html) {
  return `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3a3a3a;text-align:center;">${html}</p>`;
}

// Sent right when someone passes the pre-browsing email gate (POST
// /capture-email), before they've created a real account -- distinct from
// sendWelcomeEmail below, which fires once signup actually completes.
export async function sendEmailCaptureWelcome(to) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set -- skipping capture-welcome email to ${to}`);
    return;
  }
  const appUrl = process.env.APP_URL;
  const contentHtml = `
    ${heading("Thanks for dropping by!")}
    ${paragraph(`When you're ready, head back to the site and finish setting up your profile so we can start filtering paid travel opportunities to you.`)}
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#3a3a3a;text-align:center;">As an early user, you will also get:</p>
    <p style="margin:0;font-size:14px;line-height:1.8;color:#3a3a3a;text-align:center;">
      Occasional app development updates from me :)<br>
      Reflections and blogs about stories of cool travelers
    </p>
  `;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: "Welcome to Voya",
      html: emailShell({ contentHtml, ctaUrl: appUrl }),
    });
    // The SDK resolves normally (no throw) even on an API-level rejection --
    // it reports that via `error` on the resolved value instead, so a bare
    // try/catch here would silently swallow it with no log line at all.
    if (error) console.error("Capture-welcome email rejected by Resend:", error);
    else console.log(`[email] capture-welcome sent to ${to} (id ${data.id})`);
  } catch (err) {
    console.error("Capture-welcome email failed:", err);
  }
}

export async function sendWelcomeEmail(to) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set -- skipping welcome email to ${to}`);
    return;
  }
  const appUrl = process.env.APP_URL;
  const contentHtml = `
    ${heading("You're in!")}
    ${paragraph("Browse paid travel opportunities filtered to your profile, save the ones you're going after, and track your applications from your My Trips page.")}
    <p style="margin:0;font-size:14px;color:#3a3a3a;text-align:center;">Good luck out there.</p>
  `;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: "Welcome to Voya",
      html: emailShell({ contentHtml, ctaText: "Go to Voya", ctaUrl: appUrl }),
    });
    if (error) console.error("Welcome email rejected by Resend:", error);
    else console.log(`[email] welcome email sent to ${to} (id ${data.id})`);
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
    .map((o) => `<li style="margin-bottom:8px;"><a href="${o.source_url}" style="color:#12241b;">${o.title}</a> -- ${o.org}, ${o.dest_name}</li>`)
    .join("");
  const readRows = (featuredReads || [])
    .map((r) => `<li style="margin-bottom:8px;"><a href="${r.url}" style="color:#12241b;">${r.title}</a></li>`)
    .join("");
  const contentHtml = `
    ${heading("This month on Voya")}
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#3a3a3a;">New opportunities:</p>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#3a3a3a;text-align:left;">${oppRows}</ul>
    ${readRows ? `<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#3a3a3a;">A few reads:</p><ul style="margin:0;padding-left:20px;font-size:14px;color:#3a3a3a;text-align:left;">${readRows}</ul>` : ""}
  `;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: "This month on Voya: new opportunities",
      html: emailShell({
        contentHtml,
        ctaText: "Browse all opportunities",
        ctaUrl: appUrl,
        footerHtml: `<a href="${appUrl}/api/newsletter/unsubscribe/${unsubscribeUserId}" style="color:#8a8a8a;">Unsubscribe from this newsletter</a>`,
      }),
    });
    if (error) console.error(`Newsletter email to ${to} rejected by Resend:`, error);
    else console.log(`[email] newsletter sent to ${to} (id ${data.id})`);
  } catch (err) {
    console.error(`Newsletter email to ${to} failed:`, err);
  }
}

export async function sendAdminDigest(to, { reports, submissions, archived }) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set -- skipping admin digest to ${to}`);
    return;
  }
  if (!reports.length && !submissions.length && !archived.length) {
    console.log("[email] Nothing to report -- skipping today's admin digest.");
    return;
  }
  const appUrl = process.env.APP_URL;
  const reportRows = reports
    .map((r) => `<li style="margin-bottom:10px;"><strong>${r.opportunity_title}</strong> (id ${r.opportunity_id}) -- "${r.reason}"${r.reporter_email ? ` -- from ${r.reporter_email}` : " -- anonymous"}<br><span style="color:#8a8a8a;font-size:12px;">report id ${r.id}, filed ${new Date(r.created_at).toISOString().slice(0, 10)}</span></li>`)
    .join("");
  const submissionRows = submissions
    .map((s) => `<li style="margin-bottom:10px;"><strong>${s.title}</strong>${s.organization_name ? ` -- ${s.organization_name}` : ""}${s.source_url ? ` -- <a href="${s.source_url}" style="color:#12241b;">${s.source_url}</a>` : ""}${s.notes ? `<br>${s.notes}` : ""}${s.submitter_email ? `<br><span style="color:#8a8a8a;font-size:12px;">from ${s.submitter_email}</span>` : ""}<br><span style="color:#8a8a8a;font-size:12px;">submission id ${s.id}, sent ${new Date(s.created_at).toISOString().slice(0, 10)}</span></li>`)
    .join("");
  const archivedRows = archived
    .map((o) => `<li style="margin-bottom:6px;">${o.title} -- deadline was ${new Date(o.archived_deadline).toISOString().slice(0, 10)}</li>`)
    .join("");
  const contentHtml = `
    ${heading("Admin digest")}
    <p style="margin:0 0 20px;font-size:14px;color:#3a3a3a;text-align:center;">${reports.length} report${reports.length === 1 ? "" : "s"}, ${submissions.length} submission${submissions.length === 1 ? "" : "s"} to review.</p>
    ${reports.length ? `<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#3a3a3a;">Open reports (${reports.length})</p><ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#3a3a3a;text-align:left;">${reportRows}</ul>` : ""}
    ${submissions.length ? `<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#3a3a3a;">New submissions (${submissions.length})</p><ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#3a3a3a;text-align:left;">${submissionRows}</ul>` : ""}
    ${archived.length ? `<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#3a3a3a;">Auto-archived for expired deadline (${archived.length})</p><ul style="margin:0 0 8px;padding-left:20px;font-size:14px;color:#3a3a3a;text-align:left;">${archivedRows}</ul><p style="margin:0 0 24px;font-size:12px;color:#8a8a8a;">These are soft-deleted (is_archived = TRUE), not gone -- flip the flag back in Neon if one shouldn't have been archived.</p>` : ""}
    <p style="margin:0;font-size:12px;color:#8a8a8a;">Act on these directly in Neon's SQL editor, or from /admin.html -- update opportunity_reports.status / opportunity_submissions.status to 'reviewed' or 'dismissed' once handled.</p>
  `;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Voya admin digest: ${reports.length} report${reports.length === 1 ? "" : "s"}, ${submissions.length} submission${submissions.length === 1 ? "" : "s"}`,
      html: emailShell({
        contentHtml,
        ctaText: "Open admin dashboard",
        ctaUrl: appUrl ? `${appUrl}/admin.html` : null,
      }),
    });
    if (error) console.error("Admin digest email rejected by Resend:", error);
    else console.log(`[email] admin digest sent to ${to} (id ${data.id})`);
  } catch (err) {
    console.error("Admin digest email failed:", err);
  }
}

export async function sendDeadlineReminder(to, opportunityTitle, daysLeft) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set -- skipping ${daysLeft}-day reminder to ${to}`);
    return;
  }
  const appUrl = process.env.APP_URL;
  const contentHtml = `
    ${heading(`${daysLeft} day${daysLeft === 1 ? "" : "s"} left to apply`)}
    ${paragraph(`The application deadline for <strong>${opportunityTitle}</strong> is in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`)}
    <p style="margin:0;font-size:14px;color:#3a3a3a;text-align:center;">Check your My Trips page for the details and your checklist.</p>
  `;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left to apply: ${opportunityTitle}`,
      html: emailShell({ contentHtml, ctaText: "View my trips", ctaUrl: appUrl }),
    });
    if (error) console.error("Deadline reminder email rejected by Resend:", error);
    else console.log(`[email] deadline reminder sent to ${to} (id ${data.id})`);
  } catch (err) {
    console.error("Deadline reminder email failed:", err);
  }
}
