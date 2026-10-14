# Vestrium Global website

Static site (`index.html`) plus one Netlify function that emails enquiries.

## Deploy

1. Push this folder to GitHub and import the repo in Netlify. No build command is needed; publish directory is the repo root (already set in `netlify.toml`).
2. In Netlify → **Forms**, click **Enable form detection**, then redeploy. The form named `request` will appear.
3. In Netlify → **Site configuration → Environment variables**, add:

| Variable | Value |
|---|---|
| `ENQUIRY_TO` | `chantelle.houareau@vis10nholdings.com` (change any time; this is also the default in code) |
| `ENQUIRY_FROM` | e.g. `Vestrium Global <enquiries@vis10nholdings.com>` (must be a domain verified in Resend) |
| `RESEND_API_KEY` | API key from resend.com (free tier is enough) |

4. Redeploy, then send a test request from the live Work with us page.

## How enquiries flow

Form submit → Netlify Forms stores it (spam-filtered, with a honeypot) → the `submission-created` function emails it to `ENQUIRY_TO`, with Reply-To set to the athlete's email.

Every submission is also kept under Netlify → Forms → `request`, even if email fails.

**No Resend account yet?** Skip `RESEND_API_KEY`. Instead, use Netlify → Forms → **Form notifications → Add notification → Email notification** pointed at the same inbox. The function will simply log that it skipped sending.

## Changing the address later

Update `ENQUIRY_TO` in the Netlify UI and redeploy. No code change is needed.
