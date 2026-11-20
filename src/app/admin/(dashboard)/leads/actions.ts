"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { BOOKING_STATUSES, clean, isUuid, oneOf } from "@/lib/validation";

export async function updateBookingStatus(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = oneOf(String(formData.get("status") ?? ""), BOOKING_STATUSES);
  if (!isUuid(id) || !status) return;

  const { error } = await supabase.from("booking_requests").update({ status }).eq("id", id);
  if (error) console.error("Failed to update booking status:", error.message);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export type BookingEditState = { status: "idle" | "success" | "error"; message: string };

export async function updateBooking(id: string, _prevState: BookingEditState, formData: FormData): Promise<BookingEditState> {
  const { supabase } = await requireAdmin();

  const fullName = clean(formData.get("fullName"), 100);
  const phone = clean(formData.get("phone"), 25);
  const passengers = clean(formData.get("passengers"), 60);
  const serviceType = clean(formData.get("serviceType"), 100);
  const travelDate = clean(formData.get("travelDate"), 10);
  const message = clean(formData.get("message"), 2000, false);

  if (!isUuid(id)) return { status: "error", message: "Invalid booking." };
  if (!fullName || !phone || !serviceType) {
    return { status: "error", message: "Name, phone and service type are required." };
  }
  if (travelDate && (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || Number.isNaN(Date.parse(travelDate)))) {
    return { status: "error", message: "Please enter a valid travel date." };
  }

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

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { status: "success", message: "" };
}

export async function deleteBooking(id: string) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) return;

  const { error } = await supabase.from("booking_requests").delete().eq("id", id);
  if (error) console.error("Failed to delete booking:", error.message);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
