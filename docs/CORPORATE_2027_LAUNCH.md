# LDMA January 2027 corporate launch checklist

## What this branch adds
- Dedicated `/for-business/` corporate training page with responsive navigation, four solution pathways, industry/audience content, training methodology, FAQs and a two-step lead form.
- `/api/corporate-enquiry` server-side form endpoint with basic validation, spam honeypot, and private Supabase storage.
- Email fallback for cases where the database endpoint is not ready.
- Main-site header, pillar and corporate section links to the new page.

## Required before enabling online submissions
1. Review and execute `supabase/corporate_enquiries.sql` **only in the correct LDMA Supabase project**.
2. Add `LDMA_SUPABASE_SERVICE_ROLE_KEY` as a **server-only** Vercel environment variable. Do not prefix with `VITE_`, paste it into source, or expose it to browsers.
3. Confirm `VITE_SUPABASE_URL` points to the LDMA project. Redeploy the branch preview and test an enquiry using dummy data.
4. Confirm the official LDMA corporate enquiry email. The fallback currently uses `info@ldmacademy.com` as a proposed address; replace it with a verified inbox before public launch.
5. Implement rate limiting, abuse monitoring and an email notification or admin queue before production.
6. Confirm the production domain and update canonical and Open Graph URLs. The canonical URL is provisionally set to `https://ldmacademy.com/for-business/`.
7. Review privacy notice, data retention, consent language, and access to lead records.

## Quality assurance
- Desktop, tablet and mobile navigation; keyboard tab order; mobile menu close on click; anchors and back links.
- Each solution tab updates the detail panel and preselects the training focus when visitors start an enquiry.
- First step validates organisation, contact name, email, industry and team size.
- Second step validates business challenge, training focus, delivery format and consent.
- Submit shows success only after server confirms storage; failure exposes email fallback.
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
