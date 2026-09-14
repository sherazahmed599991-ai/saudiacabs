"use server";

import { getSupabaseClient } from "@/lib/supabase";
import { sendBookingNotificationEmail } from "@/lib/mail";

export type BookingFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function submitBookingRequest(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const passengers = String(formData.get("passengers") ?? "").trim();
  const serviceType = String(formData.get("serviceType") ?? "").trim();
  const travelDate = String(formData.get("travelDate") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!fullName || !phone || !serviceType) {
    return {
      status: "error",
      message: "Please fill in your name, phone number, and service type.",
    };
  }

  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("booking_requests").insert({
      full_name: fullName,
      phone,
      passengers: passengers || null,
      service_type: serviceType,
      travel_date: travelDate || null,
      message: message || null,
    });

    if (error) {
      console.error("Supabase booking insert failed:", error.message);
      return {
        status: "error",
        message: "Something went wrong sending your request. Please try WhatsApp instead.",
      };
    }
  } catch (err) {
    console.error("Booking request failed:", err);
    return {
      status: "error",
      message: "Something went wrong sending your request. Please try WhatsApp instead.",
    };
  }

  // Booking is already saved in Supabase at this point — the email is a
  // best-effort notification, so a failure here must not fail the request.
  try {
    await sendBookingNotificationEmail({
      fullName,
      phone,
      passengers: passengers || null,
      serviceType,
      travelDate: travelDate || null,
      message: message || null,
    });
  } catch (err) {
    console.error("Booking notification email failed:", err);
  }

  return {
    status: "success",
    message: "Thanks! We've received your request — we'll get back to you on WhatsApp shortly.",
  };
}
