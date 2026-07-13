"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { MessageCircle, Phone, MapPin, Clock, Send } from "lucide-react";
import { submitBookingRequest } from "@/app/actions";
import type { BookingFormState } from "@/app/actions";

const initialBookingState: BookingFormState = { status: "idle", message: "" };

const contactInfo = [
  { Icon: MessageCircle, label: "WhatsApp", value: "+966 59 894 7503", href: "https://wa.me/966598947503", color: "#25D366" },
  { Icon: Phone, label: "Phone", value: "+966 59 894 7503", href: "tel:+966598947503", color: "#15CD8E" },
  { Icon: MapPin, label: "Service Area", value: "Makkah, Madinah & Jeddah", href: null, color: "#fa7b17" },
  { Icon: Clock, label: "Availability", value: "24 hours / 7 days a week", href: null, color: "#34a853" },
];

const inputStyle = { width: "100%", padding: "11px 14px", fontSize: "15px", border: "1px solid #e0dfde", borderRadius: "4px", outline: "none", color: "#202124" };
const labelStyle = { display: "block", fontSize: "14px", fontWeight: "500", color: "#202124", marginBottom: "8px" };

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
        backgroundColor: pending ? "#8fe3c6" : "#15CD8E",
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

export default function ContactForm() {
  const [state, formAction] = useActionState(submitBookingRequest, initialBookingState);
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
          <h2 style={{ marginBottom: "28px", fontSize: "28px" }}>Send a Booking Request</h2>
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
                  backgroundColor: state.status === "success" ? "#d6f7ee" : "#fde8e8",
                  color: state.status === "success" ? "#0fb87d" : "#c0392b",
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
          <h2 style={{ marginBottom: "28px", fontSize: "28px" }}>Contact Us Directly</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
            {contactInfo.map(({ Icon, label, value, href, color }) => (
              <div key={label} style={{ backgroundColor: "#fff", border: "1px solid #e0dfde", borderRadius: "8px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "44px", height: "44px", backgroundColor: `${color}15`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: "#69727d", marginBottom: "4px" }}>{label}</div>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ fontSize: "16px", fontWeight: "600", color: "#202124", textDecoration: "none" }}>{value}</a>
                  ) : (
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#202124" }}>{value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "#25D366", color: "#fff", fontSize: "17px", fontWeight: "600", padding: "16px", borderRadius: "8px", textDecoration: "none", marginBottom: "12px" }}>
            <MessageCircle size={22} /> Chat on WhatsApp
          </a>
          <a href="tel:+966598947503" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "#15CD8E", color: "#fff", fontSize: "17px", fontWeight: "600", padding: "16px", borderRadius: "8px", textDecoration: "none" }}>
            <Phone size={22} /> Call +966 59 894 7503
          </a>
          <p style={{ fontSize: "13px", color: "#69727d", marginTop: "16px", textAlign: "center" }}>We typically respond within 5 minutes on WhatsApp.</p>
        </div>
      </div>
    </section>
  );
}
