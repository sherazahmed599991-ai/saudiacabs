"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { MessageCircle, Send } from "lucide-react";
import { submitBookingRequest } from "@/app/actions";
import type { BookingFormState } from "@/app/actions";

const initialBookingState: BookingFormState = { status: "idle", message: "" };

const inputStyle = { width: "100%", padding: "11px 14px", fontSize: "15px", border: "1px solid #E4DEC6", borderRadius: "4px", outline: "none", color: "#17351F" };
const labelStyle = { display: "block", fontSize: "14px", fontWeight: "500", color: "#17351F", marginBottom: "8px" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: pending ? "#D9C695" : "#B5913D",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "600",
        padding: "14px",
        borderRadius: "42px",
        border: "none",
        cursor: pending ? "not-allowed" : "pointer",
        width: "100%",
      }}
    >
      <Send size={17} /> {pending ? "Sending..." : "Send Booking Request"}
    </button>
  );
}

export default function BookingForm() {
  const [state, formAction] = useActionState(submitBookingRequest, initialBookingState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="section-padding">
      <div className="container" style={{ maxWidth: "600px" }}>
        <h2 style={{ marginBottom: "8px", fontSize: "28px", textAlign: "center" }}>Send a Booking Request</h2>
        <p style={{ marginBottom: "32px", fontSize: "15px", color: "#5C6B5A", textAlign: "center" }}>
          We&apos;ll email you a confirmation and follow up on WhatsApp within minutes.
        </p>
        <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="rg-2" style={{ display: "grid", gap: "20px" }}>
            <div>
              <label htmlFor="fullName" style={labelStyle}>Full Name</label>
              <input id="fullName" name="fullName" type="text" required placeholder="Your full name" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="phone" style={labelStyle}>Phone / WhatsApp</label>
              <input id="phone" name="phone" type="tel" required placeholder="+966 xxx xxx xxx" style={inputStyle} />
            </div>
          </div>
          <div>
            <label htmlFor="email" style={labelStyle}>Email Address</label>
            <input id="email" name="email" type="email" required placeholder="you@example.com" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="passengers" style={labelStyle}>Number of Passengers</label>
            <select id="passengers" name="passengers" style={{ ...inputStyle, backgroundColor: "#fff" }}>
              <option value="">Select passengers</option>
              <option>1 – 4 Passengers</option>
              <option>5 – 7 Passengers</option>
              <option>8 – 11 Passengers</option>
              <option>12 – 17 Passengers</option>
              <option>17+ Passengers (multiple vehicles)</option>
            </select>
          </div>
          <div>
            <label htmlFor="serviceType" style={labelStyle}>Service Type</label>
            <select id="serviceType" name="serviceType" required defaultValue="" style={{ ...inputStyle, backgroundColor: "#fff" }}>
              <option value="" disabled>Select a service</option>
              <option>Airport Transfer — Jeddah (KAIA)</option>
              <option>Airport Transfer — Madinah (AMAA)</option>
              <option>Ziyarat Tour — Makkah</option>
              <option>Ziyarat Tour — Madinah</option>
              <option>Makkah to Madinah</option>
              <option>Madinah to Makkah</option>
              <option>Group Package</option>
            </select>
          </div>
          <div>
            <label htmlFor="travelDate" style={labelStyle}>Travel Date</label>
            <input id="travelDate" name="travelDate" type="date" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="message" style={labelStyle}>Message (optional)</label>
            <textarea id="message" name="message" rows={4} placeholder="Pickup location, flight number, special requests..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          </div>

          {state.status !== "idle" && (
            <p
              role="status"
              aria-live="polite"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                padding: "12px 16px",
                borderRadius: "6px",
                backgroundColor: state.status === "success" ? "#E3EEE5" : "#fde8e8",
                color: state.status === "success" ? "#184A27" : "#c0392b",
              }}
            >
              {state.message}
            </p>
          )}

          <SubmitButton />
        </form>

        <a
          href="https://wa.me/966598947503"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "20px", color: "#25D366", fontSize: "14.5px", fontWeight: "600", textDecoration: "none" }}
        >
          <MessageCircle size={17} /> Prefer WhatsApp? Chat with us directly
        </a>
      </div>
    </section>
  );
}
