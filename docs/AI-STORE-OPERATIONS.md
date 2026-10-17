# LDMA Store + AI Adviser — Activation Guide
Current state: Supabase `ldma_products` is installed with RLS. Store and guided adviser have working UI. Seven LDMA product drafts have been prepared in the dedicated Supabase project. None are published. Some are proposed products, not existing saleable items. Checkout is not enabled.

## Publishing store products
1. Sign in as a verified staff account with Supabase `app_metadata.ldma_role = "admin"`.
2. In My LDMA, create product drafts with approved title, slug, category, summary, type, availability and fee.
3. Confirm intellectual property and delivery before publishing digital downloads; they are not implemented yet.
4. Never mark digital products "available" until download delivery and validated receipts exist. For services, use `enquiry`.
5. Review exact fee and product details before publication.

## Activating genuine AI responses
1. Obtain a separate **OpenAI API** key under an account with an approved spending limit (ChatGPT subscriptions are not API credits).
2. Set `OPENAI_API_KEY` as encrypted/sensitive **server-only** Vercel project environment variable; never `VITE_OPENAI_API_KEY`.
3. The serverless `/api/adviser` function uses the Responses API and retrieves only **published** product facts from Supabase. The website switches to actual AI responses once configured.
4. Until then the public chat provides limited scripted guidance and explicitly says AI is pending.
5. The adviser endpoint now requires an Upstash Redis REST connection with `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and a private `LDMA_RATE_LIMIT_SALT`. Until these are configured the paid AI endpoint fails closed. Rate limits: 12 requests/hour per IP and 500/day for the site, subject to testing; forwarded-IP handling and abuse monitoring should be reviewed before launch.\n6. Configure API usage budget and alerts, human handoff, FAQ and policy content, and privacy/retention rules before a public marketing launch.
7. Verify with questions about known and unknown prices, unpublished products, discounts and certificate/job guarantees. The bot must decline to invent these.

## Payments
Paystack/Flutterwave payment capture is NOT implemented. Never infer payment success from a browser-side event. A verified provider webhook, idempotent payment records and refund/reconciliation rules are required.

## Initial unpublished drafts (17 October 2026)
- LDMA Battleship Digital Marketing Training — historical programme; schedule and tuition need reconfirmation.
- LDMA TikTok Marketing Masterclass — historical programme; schedule and tuition need reconfirmation.
- LDMA One-Day Digital Marketing Workshop — historical programme; schedule and tuition need reconfirmation.
- AI for Marketing and Business Workshop — proposed product; curriculum and availability not approved.
- LDMA Digital Marketing Planning Toolkit — proposed digital asset; no finished download yet.
- LDMA AI Marketing Prompt Toolkit — proposed digital asset; no finished download yet.
- LDMA Corporate Digital Skills Training — service pathway; proposed catalogue description needs review.

All seven records have `is_published=false` and `availability=draft`. Admins can review and edit drafts in My LDMA. These records are not visible to the public or sent to the AI as saleable products.
