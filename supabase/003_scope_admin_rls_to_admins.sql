-- Saudia Cabs — scope admin-panel RLS to actual admins
-- Run this in the Supabase SQL Editor AFTER 002_admin_panel.sql.
--
-- 002_admin_panel.sql granted quotations/invoices/receipts/booking_requests
-- to "to authenticated using (true)" — i.e. ANY signed-in Supabase user,
-- not just the people your app calls admins. Combined with self-signup
-- being on by default for new Supabase projects, that means anyone who
-- creates an account could read/write these tables directly via the public
-- anon key + their own session, bypassing the app's admin login entirely.
--
-- This migration adds an explicit admin allowlist table and rewrites those
-- policies to check membership in it, instead of just "authenticated".

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

-- ─────────────────────────────────────────────
-- One-time setup — do this after running the migration above:
-- Insert every admin's login email here (must match their Supabase Auth
-- email exactly, lowercase). Keep this list in sync with the ADMIN_EMAILS
-- env var used by the app's login/API-route checks.
-- ─────────────────────────────────────────────
-- insert into public.admin_users (email) values ('you@yourdomain.com');
