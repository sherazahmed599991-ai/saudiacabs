"use client";

import { MessageCircle, Phone, MapPin, Clock, Send } from "lucide-react";

const contactInfo = [
  { Icon: MessageCircle, label: "WhatsApp", value: "+966 59 894 7503", href: "https://wa.me/966598947503", color: "#25D366" },
  { Icon: Phone, label: "Phone", value: "+966 59 894 7503", href: "tel:+966598947503", color: "#15CD8E" },
  { Icon: MapPin, label: "Service Area", value: "Makkah, Madinah & Jeddah", href: null, color: "#fa7b17" },
  { Icon: Clock, label: "Availability", value: "24 hours / 7 days a week", href: null, color: "#34a853" },
];

export default function ContactForm() {
  return (
    <section className="section-padding">
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
        {/* Form */}
        <div>
          <h2 style={{ marginBottom: "28px", fontSize: "28px" }}>Send a Booking Request</h2>
          <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#202124", marginBottom: "8px" }}>Full Name</label>
                <input type="text" placeholder="Your full name" style={{ width: "100%", padding: "11px 14px", fontSize: "15px", border: "1px solid #e0dfde", borderRadius: "4px", outline: "none", color: "#202124" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#202124", marginBottom: "8px" }}>Phone / WhatsApp</label>
                <input type="tel" placeholder="+966 xxx xxx xxx" style={{ width: "100%", padding: "11px 14px", fontSize: "15px", border: "1px solid #e0dfde", borderRadius: "4px", outline: "none", color: "#202124" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#202124", marginBottom: "8px" }}>Number of Passengers</label>
              <select style={{ width: "100%", padding: "11px 14px", fontSize: "15px", border: "1px solid #e0dfde", borderRadius: "4px", outline: "none", color: "#202124", backgroundColor: "#fff" }}>
                <option value="">Select passengers</option>
                <option>1 – 4 Passengers</option>
                <option>5 – 7 Passengers</option>
                <option>8 – 11 Passengers</option>
                <option>12 – 17 Passengers</option>
                <option>17+ Passengers (multiple vehicles)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#202124", marginBottom: "8px" }}>Service Type</label>
              <select style={{ width: "100%", padding: "11px 14px", fontSize: "15px", border: "1px solid #e0dfde", borderRadius: "4px", outline: "none", color: "#202124", backgroundColor: "#fff" }}>
                <option value="">Select a service</option>
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
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#202124", marginBottom: "8px" }}>Travel Date</label>
              <input type="date" style={{ width: "100%", padding: "11px 14px", fontSize: "15px", border: "1px solid #e0dfde", borderRadius: "4px", outline: "none", color: "#202124" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#202124", marginBottom: "8px" }}>Message (optional)</label>
              <textarea rows={4} placeholder="Pickup location, flight number, special requests..." style={{ width: "100%", padding: "11px 14px", fontSize: "15px", border: "1px solid #e0dfde", borderRadius: "4px", outline: "none", color: "#202124", resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#15CD8E", color: "#fff", fontSize: "16px", fontWeight: "600", padding: "14px", borderRadius: "4px", border: "none", cursor: "pointer", width: "100%" }}>
              <Send size={17} /> Send Booking Request
            </button>
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
