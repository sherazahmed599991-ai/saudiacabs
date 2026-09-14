"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { MessageCircle, Phone, MapPin, Clock, Send } from "lucide-react";
import { submitBookingRequest } from "@/app/actions";
import type { BookingFormState } from "@/app/actions";

const initialState: BookingFormState = { status: "idle", message: "" };

const contactInfo = [
  { Icon: MessageCircle, label: "WhatsApp", value: "+966 59 894 7503", href: "https://wa.me/966598947503", color: "#25D366" },
  { Icon: Phone, label: "Phone", value: "+966 59 894 7503", href: "tel:+966598947503", color: "#B5913D" },
  { Icon: MapPin, label: "Service Area", value: "Makkah, Madinah & Jeddah", href: null, color: "#fa7b17" },
  { Icon: Clock, label: "Availability", value: "24 hours / 7 days a week", href: null, color: "#34a853" },
];

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
      <Send size={17} /> {pending ? "Sending..." : "Send Message"}
    </button>
  );
}

// General questions, not a trip booking — same booking_requests pipeline
// (so it still shows up in /admin/leads) but with a fixed service type and
// none of the trip-specific fields (passengers, travel date).
export default function GeneralInquiryForm() {
  const [state, formAction] = useActionState(submitBookingRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="section-padding">
      <div className="container rg-2" style={{ display: "grid", gap: "60px", alignItems: "start" }}>
        {/* Form */}
        <div>
          <h2 style={{ marginBottom: "28px", fontSize: "28px" }}>Send Us a Message</h2>
          <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <input type="hidden" name="serviceType" value="General Inquiry" />
            <div>
              <label htmlFor="fullName" style={labelStyle}>Full Name</label>
              <input id="fullName" name="fullName" type="text" required placeholder="Your full name" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="phone" style={labelStyle}>Phone / WhatsApp</label>
              <input id="phone" name="phone" type="tel" required placeholder="+966 xxx xxx xxx" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="message" style={labelStyle}>Message</label>
              <textarea id="message" name="message" rows={5} required placeholder="How can we help?" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
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
        </div>

        {/* Contact Info */}
        <div>
          <h2 style={{ marginBottom: "28px", fontSize: "28px" }}>Reach Us Directly</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
            {contactInfo.map(({ Icon, label, value, href, color }) => (
              <div key={label} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "44px", height: "44px", backgroundColor: `${color}15`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: "#5C6B5A", marginBottom: "4px" }}>{label}</div>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ fontSize: "16px", fontWeight: "600", color: "#17351F", textDecoration: "none" }}>{value}</a>
                  ) : (
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#17351F" }}>{value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "#25D366", color: "#fff", fontSize: "17px", fontWeight: "600", padding: "16px", borderRadius: "8px", textDecoration: "none", marginBottom: "12px" }}>
            <MessageCircle size={22} /> Chat on WhatsApp
          </a>
          <a href="/book-online/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "#B5913D", color: "#fff", fontSize: "17px", fontWeight: "600", padding: "16px", borderRadius: "8px", textDecoration: "none" }}>
            Looking to book a ride instead?
          </a>
          <p style={{ fontSize: "13px", color: "#5C6B5A", marginTop: "16px", textAlign: "center" }}>We typically respond within 5 minutes on WhatsApp.</p>
        </div>
      </div>
    </section>
  );
}
