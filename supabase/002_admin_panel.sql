-- Saudia Cabs — Admin panel: quotations, invoices, receipts
-- Run this in the Supabase SQL Editor AFTER schema.sql has already been applied.

-- ─────────────────────────────────────────────
-- Sequential, human-friendly document numbers
-- ─────────────────────────────────────────────
create sequence if not exists quotation_number_seq;
create sequence if not exists invoice_number_seq;
create sequence if not exists receipt_number_seq;

-- ─────────────────────────────────────────────
-- Quotations
-- ─────────────────────────────────────────────
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  booking_request_id uuid references public.booking_requests(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  service_description text not null,
  amount numeric(10, 2) not null,
  status text not null default 'draft', -- draft | sent | accepted | declined | expired
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_quotation_number()
returns trigger as $$
begin
  if new.number is null then
    new.number := 'QUO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('quotation_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_quotation_number on public.quotations;
create trigger trg_quotation_number
  before insert on public.quotations
  for each row execute function public.set_quotation_number();

-- ─────────────────────────────────────────────
-- Invoices
-- ─────────────────────────────────────────────
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  quotation_id uuid references public.quotations(id) on delete set null,
  booking_request_id uuid references public.booking_requests(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  line_items jsonb not null default '[]'::jsonb, -- [{ description, quantity, unit_price }]
  total numeric(10, 2) not null,
  status text not null default 'draft', -- draft | sent | paid | cancelled
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_invoice_number()
returns trigger as $$
begin
  if new.number is null then
    new.number := 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_invoice_number on public.invoices;
create trigger trg_invoice_number
  before insert on public.invoices
  for each row execute function public.set_invoice_number();

-- ─────────────────────────────────────────────
-- Receipts (always derived from a paid invoice)
-- ─────────────────────────────────────────────
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount_paid numeric(10, 2) not null,
  payment_method text not null default 'cash', -- cash | card | bank_transfer | other
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace function public.set_receipt_number()
returns trigger as $$
begin
  if new.number is null then
    new.number := 'RCT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('receipt_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_receipt_number on public.receipts;
create trigger trg_receipt_number
  before insert on public.receipts
  for each row execute function public.set_receipt_number();

create index if not exists quotations_created_at_idx on public.quotations (created_at desc);
create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists receipts_created_at_idx on public.receipts (created_at desc);

-- ─────────────────────────────────────────────
-- Row Level Security
-- Only logged-in Supabase Auth admin users (role: authenticated) may
-- read/write these tables — never the public anon role.
-- ─────────────────────────────────────────────
alter table public.quotations enable row level security;
alter table public.invoices enable row level security;
alter table public.receipts enable row level security;

create policy "Admins manage quotations" on public.quotations
  for all to authenticated using (true) with check (true);

create policy "Admins manage invoices" on public.invoices
  for all to authenticated using (true) with check (true);

create policy "Admins manage receipts" on public.receipts
  for all to authenticated using (true) with check (true);

-- booking_requests previously only allowed anon INSERT (the public booking
-- form). Admins now also need to read the leads and update their status.
create policy "Admins view booking requests" on public.booking_requests
  for select to authenticated using (true);

create policy "Admins update booking requests" on public.booking_requests
  for update to authenticated using (true) with check (true);
