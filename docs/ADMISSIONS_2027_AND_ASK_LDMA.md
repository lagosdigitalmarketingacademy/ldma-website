# LDMA 2027 admissions and Ask LDMA AI — activation guide

**Prepared:** 1 November 2026. **Status:** developed on preview branch, not approved for production activation.

### Live setup status — 1 November 2026

- Vercel team access has been approved and the LDMA project is accessible.\n- Configured preview-only `AI_GATEWAY_MODEL=openai/gpt-5-mini` (model ID verified against the Vercel Gateway catalogue).\n- Generated and stored encrypted preview-only `LDMA_RATE_LIMIT_SALT`. Do not copy the value into code.\n- **CONNECTED:** Upstash Redis was linked to LDMA's Vercel project. Vercel injected `KV_REST_API_URL` and `KV_REST_API_TOKEN` for Preview and Production. The AI backend and optional application backend now accept these real Marketplace names as well as direct `UPSTASH_REDIS_REST_*` names. Credentials are never copied into source.
- **DEPLOYED:** Updated Redis-compatible AI backend deployed to Preview; regression tests passed. Preview-only key is now present. A live Gateway model request failed on account card verification; the diagnostic endpoint has been removed from the feature branch.
- **LIVE MODEL VERIFIED (2 November 2026):** User completed Vercel card verification. Redis PING and Gateway `/v1/credits` succeeded; a real end-to-end request to `api/adviser.js` returned **HTTP 200** with `mode:'ai'` and a specific, useful Lagos clothing-store conversion diagnosis. `AI_GATEWAY_API_KEY` is Sensitive / Preview-only. A temporary one-use diagnostic endpoint was deleted immediately after the successful test. `VITE_ADVISER_AI_ENABLED=true` has been set for Preview only. Production remains unchanged. Review Gateway key spending budget and monitor early usage.\n- **BLOCKED:** Vercel Firewall API reports no Seawall configuration for this project; do not assume a WAF rule was applied.\n- **NOT ACTIVE:** `VITE_ADVISER_AI_ENABLED` is not enabled; visitors see a truthful offline state. No live provider call or end-to-end AI response has been verified yet.\n- **BUDGET:** Vercel AI Gateway spend limit / billing configuration has not been verified; set a small preview budget before enabling public use.\n- **GIT:** The Vercel project is not linked to the GitHub repository at the project-settings level. Preview deployments have been created explicitly from the GitHub feature branch. This also means Vercel does not allow branch-specific environment variables; use preview-only scope.

**Next step:** Deploy the feature branch to Preview after `VITE_ADVISER_AI_ENABLED=true` was saved, confirm the UI contains the active chat and `/api/adviser` is deployed, then ask the owner to try multi-turn questions. Confirm a small AI Gateway API-key spending budget (e.g. $5) and monitor initial usage. Do not activate Production or create payment flows without explicit approval.\n

## Trainee video testimonials — 2 November 2026

LDMA supplied **11 public Instagram Reel URLs** for its existing recorded trainee videos. We use canonical Instagram Reel IDs in `src/traineeReels.js`; we do not download or rehost videos, infer names/cohorts or invent testimonials, quotations or results.

- Homepage: `src/Testimonials.jsx` appears immediately after the programmes section, initially shows three branded preview cards, and allows visitors to reveal all 11.
- Battleship page: the same gallery is mounted in compact mode under the programme experience section, with a link to the full homepage gallery.
- The Instagram player is **loaded only when the visitor clicks PLAY VIDEO**, reducing third-party requests on initial load. Every card provides a direct Instagram link for browsers that block embeds, require cookies or require Instagram login.
- Ask LDMA can point visitors asking for trainee experiences to `/#trainee-stories` without claiming to have watched the videos or fabricating endorsements.
- No video descriptions, thumbnails, quotes or speaker names have been asserted: Instagram playback/content was not independently accessible for editorial review through the available tools. Add those details only after verifying each recording and confirming permission to feature the speakers.
- This is Preview-only, not a production launch. Regression tests verify all 11 IDs, both page placements, click-to-load player, Instagram fallback and AI link. Review mobile presentation and actual Instagram playback in a normal browser before approval.

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

## Ask LDMA training-adviser conversion journey — updated 2 November 2026

The AI is now instructed to follow **diagnose → demonstrate one useful action → identify skill gap → recommend one best-fit LDMA programme → invite next step** for relevant business and marketing questions. It should not deliver an unsolicited full marketing consultancy, nor manipulate visitors by withholding essential facts. An initial diagnosis aims for 80–130 words; detailed help remains available if explicitly requested.

Course matches are based on visitor intent: Battleship for broad strategy/conversion/positioning; Mini-Core or Ikorodu Intensive for beginner foundations; Content Creators Bootcamp for content; TikTok Ads Masterclass for TikTok paid campaigns; Practical AI for Business & Marketing for AI workflows; Corporate Training for teams. Links /battleship/, /calendar/, /for-business/ and /apply/ are rendered as clickable chat links. Battleship tuition ₦250,000 is confirmed; cohort dates and venues remain provisional; other programme prices are proposals.

A real preview AI test on 2 November 2026 returned HTTP 200, diagnosed a Lagos clothing retailer's Instagram view-to-sale problem, recommended Battleship with /battleship/ and linked /apply/. We tightened the initial reply length and clarified the fee after that test. The one-time QA endpoint was removed. The change is Preview-only pending user acceptance; production remains untouched.

## 2. Ask LDMA: actual conversational AI, not scripted replies

**Previous issue:** the chat component used a `localResponse` keyword-matching function whenever AI was disabled or failed. It produced repetitive, fake-sounding answers.

**New behaviour:** the keyword fallback has been removed entirely. If AI is not configured, the chat says so, shows helpful programme/application/contact links and **does not pretend to answer as an AI**. When enabled, messages go to `/api/adviser` and only actual model-generated text is displayed. Failed calls show a clear error, not a fake answer.

The server:
- Supports **Vercel AI Gateway** using `AI_GATEWAY_MODEL` and Vercel-provided `VERCEL_OIDC_TOKEN` or a server-only `AI_GATEWAY_API_KEY`; this is preferred on Vercel. Confirm the exact provider/model slug from the Gateway model directory before setting it.
- Alternatively supports existing server-only `OPENAI_API_KEY` and `LDMA_AI_MODEL` (default `gpt-5-mini`), with the OpenAI Responses API.
- Uses recent chat turns for conversational context, never browser-supplied system messages.
- Grounds programme facts in `data/2027-programmes.json`, explains the agreed ₦250,000 Battleship fee, and clearly identifies tentative dates and other fees.
- Answers practical marketing questions instead of only pointing to courses.
- Uses fail-closed distributed limits: 12 requests/IP/hour, 500 requests globally/day. Note that the global limit is a daily request-count ceiling, not a dollar spend cap. A separate provider budget is required.
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
