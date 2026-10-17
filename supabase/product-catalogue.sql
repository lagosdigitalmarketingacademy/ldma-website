-- LDMA product catalogue; publish only verified items. No sample sales listings are inserted.
create table if not exists public.ldma_products (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(btrim(title)) between 3 and 160),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 product_type text not null check(product_type in ('training','digital','corporate','event')),
 category text not null default 'General',
 summary text not null default '',
 description text not null default '',
 price_kobo bigint check(price_kobo is null or price_kobo>=0),
 price_label text,
 image_url text,
 delivery_mode text,
 availability text not null default 'draft' check(availability in ('draft','coming_soon','enquiry','available')),
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint ldma_product_ready check (not is_published or (char_length(btrim(summary))>=20 and availability <> 'draft' and (price_kobo is not null or availability in ('coming_soon','enquiry'))))
);
create index if not exists ldma_products_public on public.ldma_products(is_published,product_type);
alter table public.ldma_products enable row level security;
create policy "ldma products public published only" on public.ldma_products for select to anon,authenticated using(is_published=true);
create policy "ldma products admin read" on public.ldma_products for select to authenticated using ((auth.jwt()->'app_metadata'->>'ldma_role')='admin');
create policy "ldma products admin insert" on public.ldma_products for insert to authenticated with check ((auth.jwt()->'app_metadata'->>'ldma_role')='admin');
create policy "ldma products admin update" on public.ldma_products for update to authenticated using ((auth.jwt()->'app_metadata'->>'ldma_role')='admin') with check ((auth.jwt()->'app_metadata'->>'ldma_role')='admin');
create policy "ldma products admin delete" on public.ldma_products for delete to authenticated using ((auth.jwt()->'app_metadata'->>'ldma_role')='admin');
grant select on public.ldma_products to anon;
grant select,insert,update,delete on public.ldma_products to authenticated;