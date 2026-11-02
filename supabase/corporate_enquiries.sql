-- Run after review in the LDMA Supabase project. Do not run in a different organisation's project.
-- Private lead data; public browser clients cannot read or insert records.
create table if not exists public.ldma_corporate_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  organisation text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  industry text not null,
  team_size text not null,
  training_focus text not null,
  business_challenge text not null,
  delivery_format text not null,
  preferred_timeline text,
  indicative_budget text,
  source text not null default 'corporate_landing_2027',
  status text not null default 'new' check (status in ('new','contacted','qualified','proposal_sent','won','lost'))
);
alter table public.ldma_corporate_enquiries enable row level security;
revoke all on public.ldma_corporate_enquiries from anon, authenticated;
create index if not exists ldma_corporate_enquiries_created_at_idx on public.ldma_corporate_enquiries (created_at desc);
-- Service role writes bypass RLS. Restrict admin access through your Supabase project permissions.
