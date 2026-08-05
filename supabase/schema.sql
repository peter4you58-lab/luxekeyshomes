-- ============================================================================
-- LuxeKeys Homes — Supabase schema  (run once in the SQL Editor)
-- Real Postgres + Auth + Row-Level Security. The investor-grade trust pipeline:
--   * the public can see ONLY verified listings
--   * anyone may submit a listing / tenant / message — it lands as "pending"
--   * only authenticated STAFF can verify or reject, and every decision is
--     written as an auditable row (who, when, decision, note, evidence)
-- ============================================================================

-- 1. PROFILES — one row per auth user, carries the staff role -----------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'member',
    -- member | superadmin | moderator | verification | support | finance | marketing
  created_at timestamptz not null default now()
);

-- auto-create a profile row on every new signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: is the caller a staff member (any non-member role)?
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role <> 'member');
$$;

-- 2. LISTINGS -----------------------------------------------------------------
create table if not exists public.listings (
  id         text primary key,
  owner      uuid references auth.users(id) on delete set null,
  status     text not null default 'pending',   -- pending | in_review | verified | rejected | needs_info
  deal_type  text not null default 'rent',
  state      text,
  verified   boolean not null default false,
  inspected  boolean not null default false,
  created_at timestamptz not null default now(),
  data       jsonb not null default '{}'::jsonb  -- the full listing object your app uses
);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_state_idx  on public.listings (state);

-- 3. VERIFICATIONS — the audit trail that makes "verified" provable ----------
create table if not exists public.verifications (
  id         uuid primary key default gen_random_uuid(),
  listing_id text references public.listings(id) on delete cascade,
  inspector  uuid references auth.users(id) on delete set null,
  decision   text not null,                       -- verified | rejected | needs_info
  note       text default '',
  evidence   jsonb default '{}'::jsonb,            -- photo urls / geotag / checklist
  created_at timestamptz not null default now()
);
create index if not exists verifications_listing_idx on public.verifications (listing_id);

-- 4. TENANTS — screening profiles --------------------------------------------
create table if not exists public.tenants (
  id         text primary key,
  owner      uuid references auth.users(id) on delete set null,
  status     text not null default 'pending',
  created_at timestamptz not null default now(),
  data       jsonb not null default '{}'::jsonb
);

-- 5. MESSAGES — contact form --------------------------------------------------
create table if not exists public.messages (
  id         text primary key,
  name       text,
  email      text,
  message    text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.listings      enable row level security;
alter table public.verifications enable row level security;
alter table public.tenants       enable row level security;
alter table public.messages      enable row level security;

-- profiles
create policy "profiles self read"   on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "profiles self update" on public.profiles for update using (id = auth.uid());

-- listings: public sees only verified; owner sees own; staff see all
create policy "listings read verified" on public.listings for select
  using (status = 'verified' or owner = auth.uid() or public.is_staff());
create policy "listings submit pending" on public.listings for insert
  with check (status = 'pending' and verified = false and inspected = false);
create policy "listings staff update" on public.listings for update using (public.is_staff());
create policy "listings staff delete" on public.listings for delete using (public.is_staff());

-- verifications: staff only
create policy "verifications staff read"  on public.verifications for select using (public.is_staff());
create policy "verifications staff write" on public.verifications for insert with check (public.is_staff());

-- tenants: anyone submits (pending); owner/staff read; staff update
create policy "tenants submit"       on public.tenants for insert with check (status = 'pending');
create policy "tenants read"         on public.tenants for select using (public.is_staff() or owner = auth.uid());
create policy "tenants staff update" on public.tenants for update using (public.is_staff());

-- messages: anyone sends; staff read/update
create policy "messages send"        on public.messages for insert with check (true);
create policy "messages staff read"  on public.messages for select using (public.is_staff());
create policy "messages staff update" on public.messages for update using (public.is_staff());

-- ============================================================================
-- STORAGE — public bucket for listing photos
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "listing photos public read" on storage.objects
  for select using (bucket_id = 'listing-photos');
create policy "listing photos anyone upload" on storage.objects
  for insert with check (bucket_id = 'listing-photos');

-- ============================================================================
-- SEED DATA (same listings your app ships with)
-- ============================================================================
-- Auto-generated from src/data/seed.js — same listings your app ships with.
insert into public.listings (id, owner, status, deal_type, state, verified, inspected, created_at, data) values
  ('seed-1', null, 'verified', 'rent', 'Lagos', true, true, now(), '{"id":"seed-1","title":"2-bedroom flat, tiled, all rooms ensuite","type":"2-bedroom flat","dealType":"rent","state":"Lagos","area":"Yaba","rentPerYear":1800000,"agreementFee":0,"bedrooms":2,"bathrooms":2,"parking":"2 cars","furnishing":"Semi-furnished","description":"Newly built 2-bedroom flat in a gated compound. Prepaid meter, water running, tiled throughout. Rent is direct to the landlord — no agent fee, no agreement wahala.","preferredTenant":{"nonSmoker":true,"occupation":"Working professional","maxOccupants":3,"paymentTerms":"Annual, one year upfront"},"houseRules":"No loud parties after 10pm. Keep the shared compound clean. Visitors sign in at the gate.","landlord":{"name":"Mrs. Adeyemi","verified":true,"idVerified":true,"since":"2024"},"status":"verified","verified":true,"inspected":true,"photos":["/images/prop-1.jpg"],"videoUrl":""}'::jsonb),
  ('seed-2', null, 'verified', 'rent', 'FCT - Abuja', true, true, now(), '{"id":"seed-2","title":"Self-contained, clean, secure estate","type":"Self-contained","dealType":"rent","state":"FCT - Abuja","area":"Lugbe","rentPerYear":700000,"agreementFee":0,"bedrooms":1,"bathrooms":1,"parking":"1 car","furnishing":"Unfurnished","description":"Neat self-con in a quiet estate with security at the gate. Constant power band A. Perfect for a young professional. Landlord lives on-site.","preferredTenant":{"nonSmoker":true,"occupation":"Young professional or student","maxOccupants":1,"paymentTerms":"Annual"},"houseRules":"Single occupancy. No pets. Gate closes 11pm.","landlord":{"name":"Mr. Bello","verified":true,"idVerified":true,"since":"2023"},"status":"verified","verified":true,"inspected":true,"photos":["/images/prop-2.jpg"],"videoUrl":""}'::jsonb),
  ('seed-3', null, 'verified', 'rent', 'Enugu', true, true, now(), '{"id":"seed-3","title":"3-bedroom bungalow with parking space","type":"3-bedroom flat","dealType":"rent","state":"Enugu","area":"Independence Layout","rentPerYear":1200000,"agreementFee":0,"bedrooms":3,"bathrooms":3,"parking":"3 cars","furnishing":"Unfurnished","description":"Spacious family bungalow, compound fits three cars. Borehole water, good road access. Verified landlord, direct dealing only.","preferredTenant":{"nonSmoker":false,"occupation":"Family","maxOccupants":5,"paymentTerms":"Annual, negotiable to 6-month"},"houseRules":"Family-friendly compound. Tenants share borehole maintenance.","landlord":{"name":"Mrs. Adeyemi","verified":true,"idVerified":true,"since":"2022"},"status":"verified","verified":true,"inspected":true,"photos":["/images/prop-3.jpg"],"videoUrl":""}'::jsonb),
  ('seed-4', null, 'verified', 'rent', 'Delta', true, true, now(), '{"id":"seed-4","title":"Mini flat (room & parlour), serviced","type":"Mini flat (Room & Parlour)","dealType":"rent","state":"Delta","area":"Asaba","rentPerYear":650000,"agreementFee":0,"bedrooms":1,"bathrooms":1,"parking":"1 car","furnishing":"Semi-furnished","description":"Room and parlour self-contained in central Asaba. Close to shops and transport. Landlord verified on LuxeKeys.","preferredTenant":{"nonSmoker":true,"occupation":"Working professional","maxOccupants":2,"paymentTerms":"Annual"},"houseRules":"Quiet hours after 10pm. No subletting.","landlord":{"name":"Ms. Ibim","verified":true,"idVerified":true,"since":"2025"},"status":"verified","verified":true,"inspected":true,"photos":["/images/prop-4.jpg"],"videoUrl":""}'::jsonb),
  ('seed-5', null, 'verified', 'buy', 'Lagos', true, true, now(), '{"id":"seed-5","title":"Newly built 4-bedroom duplex, all ensuite","type":"Duplex","dealType":"buy","state":"Lagos","area":"Lekki Phase 1","rentPerYear":185000000,"agreementFee":0,"bedrooms":4,"bathrooms":5,"parking":"4 cars","furnishing":"Fully fitted kitchen","description":"Fully detached 4-bedroom duplex with BQ for sale. Fitted kitchen, ample parking, 24/7 estate security. Direct from owner — no agent markup.","preferredTenant":{},"houseRules":"","landlord":{"name":"Mr. & Mrs. Cole","verified":true,"idVerified":true,"since":"2023"},"status":"verified","verified":true,"inspected":true,"photos":["/images/prop-5.jpg"],"videoUrl":""}'::jsonb),
  ('seed-6', null, 'verified', 'land', 'Enugu', true, true, now(), '{"id":"seed-6","title":"600sqm residential land, dry, fenced","type":"Land","dealType":"land","state":"Enugu","area":"Nsukka","rentPerYear":9500000,"agreementFee":0,"bedrooms":0,"bathrooms":0,"parking":"","furnishing":"","description":"Dry, fenced 600sqm plot with registered survey and deed. Buildable immediately. Direct from the family owner, C-of-O in progress.","preferredTenant":{},"houseRules":"","landlord":{"name":"Dr. Eze","verified":true,"idVerified":true,"since":"2024"},"status":"verified","verified":true,"inspected":true,"photos":["/images/prop-6.jpg"],"videoUrl":""}'::jsonb),
  ('seed-7', null, 'pending', 'rent', 'Delta', false, false, now(), '{"id":"seed-7","title":"Brand new 2-bedroom, awaiting verification","type":"2-bedroom flat","dealType":"rent","state":"Delta","area":"Warri","rentPerYear":850000,"agreementFee":0,"bedrooms":2,"bathrooms":2,"parking":"2 cars","furnishing":"Unfurnished","description":"Freshly painted 2-bedroom flat in a calm neighbourhood. Landlord just joined LuxeKeys and is going through identity and ownership checks.","preferredTenant":{"nonSmoker":true,"occupation":"Working professional","maxOccupants":3,"paymentTerms":"Annual"},"houseRules":"No commercial use of the flat.","landlord":{"name":"Alhaji Musa","verified":false,"idVerified":false,"since":"2026"},"status":"pending","verified":false,"inspected":false,"photos":["/images/prop-7.jpg"],"videoUrl":"","reviewNote":"","reviewedBy":"","reviewedAt":"","createdAt":"2026-07-06T09:00:00Z"}'::jsonb),
  ('seed-8', null, 'pending', 'rent', 'Lagos', false, false, now(), '{"id":"seed-8","title":"2-bedroom flat submitted by supply-partner agent","type":"2-bedroom flat","dealType":"rent","state":"Lagos","area":"Surulere","rentPerYear":1500000,"agreementFee":0,"bedrooms":2,"bathrooms":2,"parking":"1 car","furnishing":"Unfurnished","description":"Submitted by a LuxeKeys supply-partner agent. Cannot go live until our field team independently confirms ownership with the landlord — agents never self-verify.","preferredTenant":{},"houseRules":"","landlord":{"name":"Owner (pending contact)","verified":false,"idVerified":false,"since":"2026"},"agentSubmitted":true,"agentName":"Tunde Balogun","commissionPct":10,"status":"pending","verified":false,"inspected":false,"photos":["/images/prop-8.jpg"],"videoUrl":"","reviewNote":"","reviewedBy":"","reviewedAt":"","createdAt":"2026-07-05T14:00:00Z"}'::jsonb)
on conflict (id) do nothing;

