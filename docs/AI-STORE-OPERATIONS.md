# LDMA Store + AI Adviser — Activation Guide
Current state: Supabase `ldma_products` is installed with RLS. Store and guided adviser have working UI. No invented products have been inserted and no checkout is enabled.

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
5. Before a public marketing launch add durable per-IP/user rate limits, abuse monitoring, AI spend alerts, human-handoff process, approved LDMA FAQ/policy content and privacy/retention review.
6. Verify with questions about known and unknown prices, unpublished products, discounts and certificate/job guarantees. The bot must decline to invent these.

## Payments
Paystack/Flutterwave payment capture is NOT implemented. Never infer payment success from a browser-side event. A verified provider webhook, idempotent payment records and refund/reconciliation rules are required.
