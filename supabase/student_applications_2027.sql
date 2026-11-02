-- LDMA 2027 student application enquiries. Execute ONLY in the correct LDMA Supabase project.
-- Do not run on WAWO or any other client's database.
-- No payments or reservations are created by inserting an enquiry.
create table if not exists public.ldma_training_applications (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 programme_id text not null check (programme_id in ('battleship','mini','ikorodu','creator','tiktok','ai')),
 cohort_start date not null,
 applicant_name text not null,
 applicant_email text not null,
 applicant_phone text not null,
 occupation text,
 learning_goal text not null,
 consent_to_contact boolean not null check (consent_to_contact = true),
 source text not null default 'website_2027',
 status text not null default 'new' check (status in ('new','contacted','under_review','offer_sent','waitlisted','declined','withdrawn','enrolled')),
 notes text,
 reviewed_at timestamptz
);
alter table public.ldma_training_applications enable row level security;
revoke all on public.ldma_training_applications from anon, authenticated;
create index if not exists ldma_training_applications_created_idx on public.ldma_training_applications(created_at desc);
create index if not exists ldma_training_applications_status_idx on public.ldma_training_applications(status,created_at desc);
-- Only the trusted server-side service role can insert and read application enquiries.
-- Add a separately audited admin-only view or role-based API before opening an admin dashboard.
-- Payment records, payment instructions, receipts and enrolment are deliberately NOT created here.
