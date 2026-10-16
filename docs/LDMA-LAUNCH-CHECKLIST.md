# LDMA Operational Launch Checklist

## Architecture
React + Vite frontend on Vercel; Supabase Auth + Postgres for individual LDMA student accounts and course/application records. The public course explorer is currently editorial/demo content independent from the database. My LDMA is guarded by missing environment variables and is disabled until a dedicated project is connected.

## Activate a dedicated LDMA backend
1. Create a **new** Supabase project in the approved organisation (do NOT reuse Exito, WAWO or Elyon).
2. Run `supabase/schema.sql` on the dedicated LDMA project. Review RLS and security advisors. Never run this migration on another organisation's database.
3. Set site URL and approved redirect URLs in Supabase Auth to the Vercel domain and future LDMA domain. Configure branded SMTP with acceptable rate limits and verify sender domain before public launch.
4. Put only the **project URL** and **publishable** key into Vercel's `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Never use service-role/secret API keys in client variables or GitHub.
5. Grant approved staff the `ldma_role: admin` claim in **app_metadata** using Supabase admin tools, not browser-facing forms; revoke access appropriately and require MFA for staff accounts.
6. Seed reviewed real courses (fee, schedule, duration, learning format, capacity). Publish only after approved. Empty public catalogue is expected until then.
7. Validate RLS using separate anon, student A, student B and admin sessions. Confirm student A cannot view student B's applications or enrolments, cannot create/edit courses, cannot change an application status; confirm admin can manage courses.
8. Test authentication rate limits, callback URL, link expiry, email deliverability and session handling; test user signout and mobile responsiveness.
9. Implement a verified server-to-server Paystack integration separately. Never accept payment status from the browser, never expose secrets, verify webhooks signatures and amounts, and idempotently fulfil payments. The current project does NOT take payments.
10. Complete privacy policy, legal policies, retention rules, consent texts, support contacts, official logo and Nigerian photography; perform vulnerability and accessibility reviews before advertising enrolment.

## Current limits
- Until LDMA-specific Supabase env variables are configured, student login and real enrolment are disabled.
- The homepage's initial learning-area content is demonstrative and should not be mistaken for scheduled classes.
- Corporate brief and enquiry draft tools copy text locally but do not send it or store it.
- Certificates and a learning-content portal are not yet implemented.
- Vercel/GitHub automatic build integration needs explicit GitHub repository permission.
