-- Saudia Cabs — booking_requests table
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  passengers text,
  service_type text not null,
  travel_date date,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists booking_requests_created_at_idx
  on public.booking_requests (created_at desc);

-- Row Level Security: public (anon) can INSERT only — never read/update/delete.
-- Only you, via the Supabase dashboard (or a service_role key), can view submissions.
alter table public.booking_requests enable row level security;

create policy "Allow public insert"
  on public.booking_requests
  for insert
  to anon
  with check (true);
