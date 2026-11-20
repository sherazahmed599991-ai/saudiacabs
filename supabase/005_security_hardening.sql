-- Saudia Cabs — security hardening
-- Run in the Supabase SQL Editor AFTER 002, 003 and 004. Safe to re-run.

-- ───────────────────────────────────────────────
-- 0. Make sure 004's column exists (the form inserts `email`, and the
--    policy below references it). No-op if 004 was already applied.
-- ───────────────────────────────────────────────
alter table public.booking_requests add column if not exists email text;

-- ───────────────────────────────────────────────
-- 1. Public booking form: constrain what anon may insert
-- ───────────────────────────────────────────────
-- The old policy was "with check (true)": anyone holding the public anon key
-- could insert arbitrary rows (any status, unlimited text). Now they can only
-- insert a plain "new" request with bounded field sizes.
drop policy if exists "Allow public insert" on public.booking_requests;
create policy "Allow public insert" on public.booking_requests
  for insert to anon
  with check (
    status = 'new'
    and char_length(full_name) between 1 and 100
    and char_length(phone) between 1 and 25
    and char_length(service_type) between 1 and 100
    and (passengers is null or char_length(passengers) <= 60)
    and (message is null or char_length(message) <= 2000)
    and (email is null or char_length(email) <= 254)
  );

-- ───────────────────────────────────────────────
-- 2. Admins could update/read but NOT delete booking requests
-- ───────────────────────────────────────────────
-- The admin "delete" button silently did nothing because no DELETE policy existed.
drop policy if exists "Admins delete booking requests" on public.booking_requests;
create policy "Admins delete booking requests" on public.booking_requests
  for delete to authenticated using (public.is_admin());

-- ───────────────────────────────────────────────
-- 3. Data integrity constraints
-- ───────────────────────────────────────────────
do $$ begin
  alter table public.booking_requests add constraint booking_requests_status_chk
    check (status in ('new','contacted','quoted','booked','completed','cancelled')) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.quotations add constraint quotations_status_chk
    check (status in ('draft','sent','accepted','declined','expired')) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.invoices add constraint invoices_status_chk
    check (status in ('draft','sent','paid','cancelled')) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.receipts add constraint receipts_method_chk
    check (payment_method in ('cash','card','bank_transfer','other')) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.quotations add constraint quotations_amount_chk check (amount > 0) not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.invoices add constraint invoices_total_chk check (total >= 0) not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.receipts add constraint receipts_amount_chk check (amount_paid > 0) not valid;
exception when duplicate_object then null; end $$;

-- One receipt per invoice (a double-click on "mark paid" used to create duplicates).
-- If this fails, you already have duplicate receipts: delete the extras first.
create unique index if not exists receipts_invoice_id_key on public.receipts (invoice_id);

-- Indexes for the admin dashboard's filters and joins.
create index if not exists booking_requests_status_idx on public.booking_requests (status);
create index if not exists quotations_booking_request_idx on public.quotations (booking_request_id);
create index if not exists invoices_quotation_idx on public.invoices (quotation_id);
create index if not exists invoices_booking_request_idx on public.invoices (booking_request_id);

-- ───────────────────────────────────────────────
-- 4. is_admin(): match case-insensitively
-- ───────────────────────────────────────────────
-- The app lowercases ADMIN_EMAILS; the SQL check was case-sensitive, so a
-- mixed-case Auth email would pass the app but fail RLS (or vice versa).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- ───────────────────────────────────────────────
-- 5. Keep updated_at honest
-- ───────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_quotations_touch on public.quotations;
create trigger trg_quotations_touch before update on public.quotations
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_invoices_touch on public.invoices;
create trigger trg_invoices_touch before update on public.invoices
  for each row execute function public.touch_updated_at();
