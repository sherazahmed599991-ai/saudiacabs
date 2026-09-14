-- Saudia Cabs — add customer email to booking_requests
-- Run this in the Supabase SQL Editor. Needed so the booking form can
-- send an automatic confirmation email to the customer, not just the
-- internal notification.

alter table public.booking_requests
  add column if not exists email text;
