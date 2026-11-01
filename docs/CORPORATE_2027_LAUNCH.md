# LDMA January 2027 corporate launch checklist

## What this branch adds
- Dedicated `/for-business/` corporate training page with responsive navigation, four solution pathways, industry/audience content, training methodology, FAQs and a two-step lead form.
- `/api/corporate-enquiry` server-side form endpoint with basic validation, spam honeypot, and private Supabase storage.
- Email fallback for cases where the database endpoint is not ready.
- Main-site header, pillar and corporate section links to the new page.

## Required before enabling online submissions
1. Review and execute `supabase/corporate_enquiries.sql` **only in the correct LDMA Supabase project**.
2. Add `LDMA_SUPABASE_SERVICE_ROLE_KEY` as a **server-only** Vercel environment variable. Do not prefix with `VITE_`, paste it into source, or expose it to browsers. Configure `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `LDMA_RATE_LIMIT_SALT` as server-only secrets for fail-closed abuse protection. The endpoint will refuse submissions without them.
3. Confirm `VITE_SUPABASE_URL` points to the LDMA project. Redeploy the branch preview and test an enquiry using dummy data.
4. Set `VITE_CORPORATE_ENQUIRY_ENABLED=true` on the intended Vercel environment **only after** the private database, service role key and endpoint have been tested. Until then, the website opens a prefilled email draft.
5. Official LDMA corporate enquiry email confirmed: `info@ldmacademy.com`. Test that messages are actually received.
6. Test the server-side rate limits (5 per IP per hour; 200 global per day), honeypot, origin validation, error fallback and monitoring. Add email notifications or a protected admin queue before enabling online intake.
7. Confirm the production domain and update canonical and Open Graph URLs. The canonical URL is provisionally set to `https://ldmacademy.com/for-business/`.
8. Review privacy notice, data retention, consent language, and access to lead records.

## Feature activation safety
- The student portal is disabled by default. Enable `VITE_PORTAL_ENABLED=true` only after confirming the correct Supabase project, RLS and auth email delivery.
- The live product catalogue is disabled by default. Enable `VITE_CATALOGUE_ENABLED=true` only after verifying product tables, published records and RLS.
- Ask LDMA now uses genuine model-generated responses only. When offline it says AI is not connected rather than showing canned replies. Enable `VITE_ADVISER_AI_ENABLED=true` only after configuring the secure model endpoint, testing quality and distributed rate limits.
- Corporate enquiries remain email-first until `VITE_CORPORATE_ENQUIRY_ENABLED=true` is explicitly set after secure server-side testing.

## Proposed 2027 programme calendar
- Added `/calendar/` with six LDMA programmes, 20 proposed 2027 editions, indicative fees from ₦20,000 to ₦250,000, location areas, course formats and prefilled email enquiry links.
- Battleship: four proposed seven-Saturday cohorts, ₦250,000; the April edition skips 1 May.
- Dates, fees and locations are **planning proposals only**; do not activate checkout or call them confirmed without founder, venue and facilitator approval.
- The calendar is linked from the homepage, Battleship page, corporate footer and search sitemap.
- Programme assumptions and pricing rationale: `docs/LDMA_2027_PROGRAMME_PLAN.md`; structured data: `data/2027-programmes.json`.
- `tests/calendar-2027.test.mjs` checks date formats, tuition consistency, Saturday/weekday schedules, holiday break and collisions.

## Student applications and Ask LDMA AI
- Added `/apply/`: programme/cohort selection, applicant details, consent, review and email-first application handoff; no false submitted or payment claims.
- Prepared `api/student-application.js` and `supabase/student_applications_2027.sql`, both requiring private database access and secure activation before direct intake.
- Replaced Ask LDMA keyword-script fallback with genuine conversational AI via the server API. When no model is connected, it clearly reports offline status.
- Complete activation steps, staff notification and verified payment provider plan are in `docs/ADMISSIONS_2027_AND_ASK_LDMA.md`.

## Quality assurance
- Desktop, tablet and mobile navigation; keyboard tab order; mobile menu close on click; anchors and back links.
- Each solution tab updates the detail panel and preselects the training focus when visitors start an enquiry.
- First step validates organisation, contact name, email, industry and team size.
- Second step validates business challenge, training focus, delivery format and consent.
- In default email-first mode, the form opens a prefilled email and does **not** claim it was sent.
- When online intake is enabled, submit shows success only after the server confirms storage; failure exposes email fallback.
- No claim of guaranteed sales, ROI, employment, certification or client endorsement.
- Confirm real programmes, venue, dates, fees and availability before publication.
- Test Vercel preview builds and check for accessibility and layout issues.

## Suggested launch content
- A verifiable client-approved case study, anonymised if needed, showing problem, learning intervention and observable output.
- Authentic classroom and workshop photography with consent.
- Faculty and facilitator biographies.
- Detailed programme one-pagers with indicative learning outcomes, delivery requirements and sample agendas.
- Sector-specific pages for financial services, retail/e-commerce, SMEs and public organisations.
- A downloadable corporate training overview, without invented metrics or logos.
- SEO articles answering real buyer questions: corporate AI training in Nigeria; staff marketing skills assessment; digital marketing workshops for teams; how to measure marketing training effectiveness.
- Search Console, consent-aware analytics, and CRM lead-source tracking.

## Prelaunch commercial KPIs
- Enquiry submission rate by landing page and source.
- Qualified corporate enquiries, response time, and consultations booked.
- Proposal sent / accepted conversion.
- Training revenue and repeat business.
- Organic search impressions and enquiries for relevant corporate-intent searches.

Do not merge to production until the owner has approved copy, verified contact details and tested the backend.
