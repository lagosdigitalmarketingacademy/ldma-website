-- LDMA application database foundation (run ONLY in a dedicated LDMA Supabase project).
-- All client-accessible tables have row-level security.
create extension if not exists pgcrypto;

create table if not exists public.ldma_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  category text not null check (char_length(category) between 2 and 80),
  summary text not null default '',
  description text not null default '',
  fee_kobo bigint check (fee_kobo is null or fee_kobo >= 0),
  duration text,
  format text,
  starts_on date,
  capacity integer check (capacity is null or capacity > 0),
  is_published boolean not null default false,
  constraint ldma_published_course_complete check (
    not is_published or (
      char_length(btrim(summary)) >= 15 and
      format is not null and char_length(btrim(format)) >= 3 and
      starts_on is not null and fee_kobo is not null
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ldma_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text check (full_name is null or char_length(full_name) <= 150),
 phone text check (phone is null or char_length(phone) <= 40),
 created_at timestamptz not null default now()
);

create table if not exists public.ldma_applications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid not null references public.ldma_courses(id),
 goals text check (goals is null or char_length(goals) <= 2000),
 preferred_format text not null default 'Not sure yet' check (preferred_format in ('Not sure yet','Physical / in person','Online','Weekend','Hybrid')),
 status text not null default 'submitted' check (status in ('submitted','under_review','accepted','waitlisted','declined','cancelled')),
 submitted_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (user_id,course_id)
);

create table if not exists public.ldma_enrolments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid not null references public.ldma_courses(id),
 application_id uuid unique references public.ldma_applications(id),
 status text not null default 'pending' check (status in ('pending','active','completed','withdrawn')),
 joined_at timestamptz not null default now(),
 unique(user_id,course_id)
);

create index if not exists ldma_applications_owner_idx on public.ldma_applications(user_id,submitted_at desc);
create index if not exists ldma_enrolments_owner_idx on public.ldma_enrolments(user_id);
create index if not exists ldma_courses_published_idx on public.ldma_courses(is_published,starts_on);

alter table public.ldma_courses enable row level security;
alter table public.ldma_profiles enable row level security;
alter table public.ldma_applications enable row level security;
alter table public.ldma_enrolments enable row level security;

-- Never trust user_metadata, profile fields or a client-supplied 'role' for authorisation.
-- Assign admins using Supabase Auth admin tooling that sets app_metadata.ldma_role = admin.
create policy "ldma published courses visible" on public.ldma_courses
 for select to anon,authenticated using (is_published = true);
create policy "ldma admin sees courses" on public.ldma_courses
 for select to authenticated using ((auth.jwt()->'app_metadata'->>'ldma_role') = 'admin');
create policy "ldma admin inserts courses" on public.ldma_courses
 for insert to authenticated with check ((auth.jwt()->'app_metadata'->>'ldma_role') = 'admin');
create policy "ldma admin edits courses" on public.ldma_courses
 for update to authenticated
 using ((auth.jwt()->'app_metadata'->>'ldma_role') = 'admin')
 with check ((auth.jwt()->'app_metadata'->>'ldma_role') = 'admin');
create policy "ldma admin deletes courses" on public.ldma_courses
 for delete to authenticated using ((auth.jwt()->'app_metadata'->>'ldma_role') = 'admin');

create policy "ldma profile read own or admin" on public.ldma_profiles
 for select to authenticated using ((select auth.uid())=user_id or (auth.jwt()->'app_metadata'->>'ldma_role')='admin');
create policy "ldma profile create own" on public.ldma_profiles
 for insert to authenticated with check ((select auth.uid())=user_id);
create policy "ldma profile edit own" on public.ldma_profiles
 for update to authenticated using ((select auth.uid())=user_id)
 with check ((select auth.uid())=user_id);

create policy "ldma application read own or admin" on public.ldma_applications
 for select to authenticated using ((select auth.uid())=user_id or (auth.jwt()->'app_metadata'->>'ldma_role')='admin');
create policy "ldma application create own" on public.ldma_applications
 for insert to authenticated with check ((select auth.uid())=user_id and status='submitted'
 and exists (select 1 from public.ldma_courses c where c.id=course_id and c.is_published));
create policy "ldma admin updates applications" on public.ldma_applications
 for update to authenticated using ((auth.jwt()->'app_metadata'->>'ldma_role')='admin')
 with check ((auth.jwt()->'app_metadata'->>'ldma_role')='admin');

create policy "ldma enrolment read own or admin" on public.ldma_enrolments
 for select to authenticated using ((select auth.uid())=user_id or (auth.jwt()->'app_metadata'->>'ldma_role')='admin');
create policy "ldma admin creates enrolments" on public.ldma_enrolments
 for insert to authenticated with check ((auth.jwt()->'app_metadata'->>'ldma_role')='admin');
create policy "ldma admin edits enrolments" on public.ldma_enrolments
 for update to authenticated using ((auth.jwt()->'app_metadata'->>'ldma_role')='admin')
 with check ((auth.jwt()->'app_metadata'->>'ldma_role')='admin');

-- Explicit API privileges; RLS remains authoritative.
grant select on public.ldma_courses to anon;
grant select,insert,update,delete on public.ldma_courses to authenticated;
grant select,insert,update on public.ldma_profiles to authenticated;
grant select,insert,update on public.ldma_applications to authenticated;
grant select,insert,update on public.ldma_enrolments to authenticated;
-- Payments and webhook verification intentionally NOT implemented.
