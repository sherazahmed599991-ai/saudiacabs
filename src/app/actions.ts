"use server";

import { getSupabaseClient } from "@/lib/supabase";
import { sendBookingNotificationEmail, sendBookingConfirmationEmail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { clean, isEmail } from "@/lib/validation";

export type BookingFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_RE = /^[+\d][\d\s().-]{5,24}$/;

export async function submitBookingRequest(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  // Honeypot: real users never see or fill this field. Pretend success so
  // bots get no signal to adapt to.
  if (clean(formData.get("website"), 100)) {
    return { status: "success", message: "Thanks! We've received your request." };
  }

  const ip = await getClientIp();
  if (!checkRateLimit(`booking:${ip}`, 5, 10 * 60_000)) {
    return { status: "error", message: "Too many requests. Please wait a few minutes or contact us on WhatsApp." };
  }

  const fullName = clean(formData.get("fullName"), 100);
  const phone = clean(formData.get("phone"), 25);
  const email = clean(formData.get("email"), 254);
  const passengers = clean(formData.get("passengers"), 60);
  const serviceType = clean(formData.get("serviceType"), 100);
  const travelDate = clean(formData.get("travelDate"), 10);
  const message = clean(formData.get("message"), 2000, false);

  if (!fullName || !phone || !serviceType) {
    return {
      status: "error",
      message: "Please fill in your name, phone number, and service type.",
    };
  }

  if (!PHONE_RE.test(phone)) {
    return { status: "error", message: "Please enter a valid phone number." };
  }

  if (email && !isEmail(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  if (travelDate && (!DATE_RE.test(travelDate) || Number.isNaN(Date.parse(travelDate)))) {
    return { status: "error", message: "Please enter a valid travel date." };
  }

  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("booking_requests").insert({
      full_name: fullName,
      phone,
      email: email || null,
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

  // Booking is already saved in Supabase at this point — both emails
  // below are best-effort, so a failure here must not fail the request.
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

  if (email) {
    try {
      await sendBookingConfirmationEmail({ to: email, fullName, serviceType, travelDate: travelDate || null });
    } catch (err) {
      console.error("Booking confirmation email failed:", err);
    }
  }

  return {
    status: "success",
    message: email
      ? "Thanks! We've received your request — check your email for confirmation, and we'll follow up on WhatsApp shortly."
      : "Thanks! We've received your request — we'll get back to you on WhatsApp shortly.",
  };
}
