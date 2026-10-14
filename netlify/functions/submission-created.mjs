// Runs automatically on Netlify each time a verified form submission arrives.
// Emails "request" enquiries to the Vestrium inbox via Resend (https://resend.com).
//
// Environment variables (Netlify → Site configuration → Environment variables):
//   RESEND_API_KEY  required to send email
//   ENQUIRY_TO      inbox that receives enquiries (defaults to the address below)
//   ENQUIRY_FROM    verified sender, e.g. "Vestrium Global <enquiries@yourdomain.com>"

const DEFAULT_TO = "chantelle.houareau@vis10nholdings.com";

const esc = (v = "") =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const FIELDS = [
  ["name", "Name"],
  ["email", "Email"],
  ["sport", "Sport"],
  ["stage", "Where they are"],
  ["school", "School or team"],
  ["intro", "Introduced by"],
  ["team", "Already on their team"],
  ["msg", "What they want to build"],
];

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body || "{}");
  if (!payload || payload.form_name !== "request") return { statusCode: 200, body: "ignored" };

  const d = payload.data || {};
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set. Submission is stored in Netlify Forms but no email was sent.");
    return { statusCode: 200, body: "stored" };
  }

  const rows = FIELDS.filter(([k]) => d[k]).map(([k, label]) => [label, d[k]]);
  const text = rows.map(([l, v]) => `${l}: ${v}`).join("\n");
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;color:#111">
    <p style="font:11px monospace;letter-spacing:.2em;text-transform:uppercase;color:#0061F3">Vestrium Global · New conversation request</p>
    <table cellpadding="8" style="border-collapse:collapse">${rows
      .map(([l, v]) => `<tr><td style="color:#666;vertical-align:top;white-space:nowrap">${esc(l)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`)
      .join("")}</table></div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM || "Vestrium Global <onboarding@resend.dev>",
      to: [process.env.ENQUIRY_TO || DEFAULT_TO],
      reply_to: d.email || undefined,
      subject: `Conversation request: ${d.name || "New enquiry"}${d.sport ? ` (${d.sport})` : ""}`,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return { statusCode: 502, body: "email failed" };
  }
  return { statusCode: 200, body: "sent" };
};
