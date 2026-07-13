"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateBookingStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "");
  if (!status) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("booking_requests").update({ status }).eq("id", id);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export type BookingEditState = { status: "idle" | "success" | "error"; message: string };

export async function updateBooking(id: string, _prevState: BookingEditState, formData: FormData): Promise<BookingEditState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const passengers = String(formData.get("passengers") ?? "").trim();
  const serviceType = String(formData.get("serviceType") ?? "").trim();
  const travelDate = String(formData.get("travelDate") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!fullName || !phone || !serviceType) {
    return { status: "error", message: "Name, phone and service type are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("booking_requests")
    .update({
      full_name: fullName,
      phone,
      passengers: passengers || null,
      service_type: serviceType,
      travel_date: travelDate || null,
      message: message || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update booking:", error.message);
    return { status: "error", message: "Something went wrong saving the booking." };
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { status: "success", message: "" };
}

export async function deleteBooking(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("booking_requests").delete().eq("id", id);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}
