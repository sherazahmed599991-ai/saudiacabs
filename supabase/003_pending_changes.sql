-- Saudia Cabs — pending changes (not yet applied to the live database)
-- Run this whole file once in the Supabase SQL Editor, AFTER 002_admin_panel.sql
-- has already been applied (it has, per the existing admin panel). Combines
-- two independent fixes into one script so there's only one thing to paste
-- and run:
--   PART 1 — scope admin-panel RLS to actual admins (was "any authenticated
--            Supabase user").
--   PART 2 — drop the driver system's DB structure (app code for it has
--            already been removed; you manage drivers over WhatsApp).
-- Both parts use "if exists"/"or replace" guards, so this is safe to run
-- even if parts of it were already applied.

-- ═══════════════════════════════════════════════════════════════
-- PART 1 — scope admin-panel RLS to actual admins
-- ═══════════════════════════════════════════════════════════════
--
-- 002_admin_panel.sql granted quotations/invoices/receipts/booking_requests
-- to "to authenticated using (true)" — i.e. ANY signed-in Supabase user,
-- not just the people your app calls admins. Combined with self-signup
-- being on by default for new Supabase projects, that means anyone who
-- creates an account could read/write these tables directly via the public
-- anon key + their own session, bypassing the app's admin login entirely.

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Deliberately no policies here: admin_users is never queried directly by
-- anon/authenticated roles, only read inside the SECURITY DEFINER function
-- below (which runs with the privileges of the function owner).

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where email = (auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins manage quotations" on public.quotations;
create policy "Admins manage quotations" on public.quotations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage invoices" on public.invoices;
create policy "Admins manage invoices" on public.invoices
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage receipts" on public.receipts;
create policy "Admins manage receipts" on public.receipts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins view booking requests" on public.booking_requests;
create policy "Admins view booking requests" on public.booking_requests
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins update booking requests" on public.booking_requests;
create policy "Admins update booking requests" on public.booking_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- One-time setup — do this after running this file: insert every admin's
-- login email here (must match their Supabase Auth email exactly,
-- lowercase). Keep this list in sync with the ADMIN_EMAILS env var used by
-- the app's login/API-route checks.
-- insert into public.admin_users (email) values ('you@yourdomain.com');

-- ═══════════════════════════════════════════════════════════════
-- PART 2 — remove the driver system (roster + onboarding)
-- ═══════════════════════════════════════════════════════════════
--
-- The app used to have two things built on a `drivers` table: a simple
-- approval roster (fed a "pick from approved drivers" dropdown in
-- /admin/bookings and /admin/contracts) and a self-service onboarding/
-- verification wizard (documents, vehicle photos, a public directory) that
-- had a mass-assignment bug letting a driver self-approve. You manage
-- drivers yourself over WhatsApp, so both are being removed. The
-- driver_name / driver_phone / driver_plate / commission_rate fields on
-- individual bookings, and preferred_driver on contracts, are plain text
-- fields on those tables — they are NOT touched by this migration and
-- keep working exactly as before (just typed in manually).

drop table if exists public.driver_documents;
drop table if exists public.driver_services;
drop table if exists public.driver_locations;
drop table if exists public.driver_vehicles;
drop table if exists public.drivers;

-- Storage buckets used only by the driver onboarding system — delete
-- manually via Supabase Dashboard → Storage (empty each bucket first, then
-- delete it): driver-profile-photos, driver-vehicle-photos, driver-documents
