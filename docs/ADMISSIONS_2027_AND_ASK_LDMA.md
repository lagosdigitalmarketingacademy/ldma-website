# LDMA 2027 admissions and Ask LDMA AI — activation guide

**Prepared:** 1 November 2026. **Status:** developed on preview branch, not approved for production activation.

## 1. Student registration journey

**Public page:** `/apply/` (linked from the homepage, Battleship page, 2027 calendar and student portal).

The student:
1. Chooses one of six planned programmes and a proposed 2027 cohort.
2. Sees the tuition and training area. **Battleship ₦250,000 is agreed; other tuition figures and all 2027 dates are still proposals.**
3. Enters name, email, phone, background (optional) and learning goal; explicitly consents to contact.
4. Reviews the complete enquiry before sending.
5. **Default:** clicks **Prepare application email**, opens their own email app and **must press Send**. The site does not store the details, reserve a seat or claim to have submitted anything.
6. **Future secure mode:** after all checks below, `VITE_STUDENT_APPLICATION_ENABLED=true` submits to `/api/student-application`, which validates programme and cohort against the planning data, checks spam and distributed limits, and inserts privately. A reference appears only after a confirmed database write.
7. LDMA reviews the enquiry, confirms the actual dates, venue, fees, seat availability and programme requirements, and contacts the applicant.
8. Only after acceptance does LDMA issue a verified payment instruction or approved hosted checkout link. Payment completion must be verified **server-side**, not by a browser redirect or screenshot.
9. LDMA confirms the enrolment, sends a receipt and joining instructions, and updates the student portal after the portal has passed security testing.

**No checkout, payment link, deposit request, receipt generation, enrolment or seat reservation is live in this branch.**

### Before enabling online student applications

- Confirm correct LDMA Supabase project; never run migrations in another company's database.
- Review and apply `supabase/student_applications_2027.sql`. RLS denies all browser reads and writes; only the server's private service role may insert.
- Configure server-only `LDMA_SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `LDMA_RATE_LIMIT_SALT` and correct `VITE_SUPABASE_URL` in Vercel.
- Configure reliable staff notification or a secure admin review queue. A stored lead that nobody sees is not a usable enrolment system.
- Verify with test enquiries: success, duplicate clicks, invalid input, abuse, rate-limit failure, database outage, privacy notice, admin access, notification and actual follow-up.
- Review data retention, deletion, export, consent and staff permissions; avoid collecting financial details in the application.
- Then set `VITE_STUDENT_APPLICATION_ENABLED=true` only in the intended environment and redeploy.

### Payments (planned; not enabled)

Recommend using LDMA's **own verified Paystack merchant account** for NGN hosted checkout, if the owner approves the provider. Alternative: another verified Nigerian payment processor with signed webhook support. Do not invent or hard-code bank details.

Payment integration should:
- Create a payment attempt only for an approved, confirmed application and exact server-side tuition amount.
- Generate a checkout session server-side, never exposing secret keys in browser code.
- Receive and verify a signed provider webhook, check reference, amount, currency, status and idempotency.
- Record payment and create enrolment only after server-side verification. Reconcile duplicate webhooks safely.
- Issue an official receipt, notify the student and staff, and handle refund/cancellation policies.
- Support approved instalments only after LDMA decides on the policy.
- Require real end-to-end sandbox and live verification before any public payment button is enabled.

## 2. Ask LDMA: actual conversational AI, not scripted replies

**Previous issue:** the chat component used a `localResponse` keyword-matching function whenever AI was disabled or failed. It produced repetitive, fake-sounding answers.

**New behaviour:** the keyword fallback has been removed entirely. If AI is not configured, the chat says so, shows helpful programme/application/contact links and **does not pretend to answer as an AI**. When enabled, messages go to `/api/adviser` and only actual model-generated text is displayed. Failed calls show a clear error, not a fake answer.

The server:
- Supports **Vercel AI Gateway** using `AI_GATEWAY_MODEL` and Vercel-provided `VERCEL_OIDC_TOKEN` or a server-only `AI_GATEWAY_API_KEY`; this is preferred on Vercel. Confirm the exact provider/model slug from the Gateway model directory before setting it.
- Alternatively supports existing server-only `OPENAI_API_KEY` and `LDMA_AI_MODEL` (default `gpt-5-mini`), with the OpenAI Responses API.
- Uses recent chat turns for conversational context, never browser-supplied system messages.
- Grounds programme facts in `data/2027-programmes.json`, explains the agreed ₦250,000 Battleship fee, and clearly identifies tentative dates and other fees.
- Answers practical marketing questions instead of only pointing to courses.
- Uses fail-closed distributed limits: 12 requests/IP/hour, 500 requests globally/day.
- Requires server-side rate-limit variables `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `LDMA_RATE_LIMIT_SALT`.
- Never exposes provider credentials in the browser or stores chat content in the OpenAI Responses API (`store:false`).
- Requires `VITE_ADVISER_AI_ENABLED=true` in the intended preview environment after backend and budget tests.

### Before enabling live AI

1. Obtain access to the correct Vercel team/project environment. Do not paste credentials into chat or source.
2. Configure the Gateway model and credentials/OIDC or an OpenAI API key, plus distributed rate limiting.
3. Set a spend budget/alerts on the provider or gateway, then test a single live model request.
4. Test: beginner course selection; a multi-turn business problem; 2027 Battleship fee; tentative dates; registration; pricing uncertainties; unrelated marketing advice; prompt-injection attempts; empty and failed provider responses.
5. Confirm model response quality, latency, cost and correct source information. Only then enable the public chat flag and redeploy.

**Limitations:** this is a real model-powered chat, not a human consultant or a verified source of real-time seat availability. It cannot independently confirm course dates, process payments or accept applications.

## 3. Pending owner approvals

- Approve the 2027 calendar dates and fees other than the already agreed Battleship ₦250,000.
- Confirm training venues, cohort capacities and refund/cancellation rules.
- Approve a payment provider and connect LDMA's own merchant account.
- Grant the correct LDMA Supabase and Vercel environment access for final setup.
- Confirm staff enquiry notifications and response SLA.
- Complete mobile browser testing, privacy review and live inbox tests before production launch.

**Production branch remains unchanged until final approval.**
