-- Saudia Cabs — remove the entire driver system (roster + onboarding)
-- Run this in the Supabase SQL Editor once you're sure you don't need any
-- of this data — it deletes data, not just structure.
--
-- Context: the app used to have two things built on a `drivers` table:
--   1. A simple approval roster (full_name, phone_number, email, city,
--      vehicle_model, status, admin_notes, commission_rate) that fed a
--      "pick from approved drivers" dropdown in /admin/bookings and
--      /admin/contracts.
--   2. A self-service onboarding/verification wizard (documents, vehicle
--      photos, service areas, a public driver-directory profile) that had
--      no reachable public page anywhere in the app and a mass-assignment
--      bug letting a driver self-approve.
-- You manage drivers yourself over WhatsApp, so both are being removed.
-- The app code for both has already been deleted from the repo; the
-- driver_name / driver_phone / driver_plate / commission_rate fields on
-- individual bookings, and preferred_driver on contracts, are plain text
-- fields on those tables — they are NOT touched by this migration and
-- keep working exactly as before (just typed in manually now).

-- Onboarding satellite tables.
drop table if exists public.driver_documents;
drop table if exists public.driver_services;
drop table if exists public.driver_locations;
drop table if exists public.driver_vehicles;

-- The roster table itself — nothing in the app reads or writes it anymore.
drop table if exists public.drivers;

-- Storage buckets used only by the onboarding system — delete manually via
-- Supabase Dashboard → Storage (empty the bucket first, then delete it):
--   driver-profile-photos, driver-vehicle-photos, driver-documents
