"use client";

import Image from "next/image";
import { MessageCircle, Phone, MapPin, Heart, ChevronRight } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services/" },
  { label: "Fleet", href: "/fleet/" },
  { label: "About Us", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];
const services = [
  { label: "Airport Transfer", href: "/services/airport-transfer/" },
  { label: "Ziyarat Tours", href: "/services/ziyarat-tours/" },
  { label: "Makkah ↔ Madinah", href: "/services/makkah-madinah-transfer/" },
  { label: "Miqat Transfer", href: "/services/miqat-transfer/" },
  { label: "Group Packages", href: "/services/group-packages/" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0F2A18", color: "#FCFBEA", padding: "48px 0 24px" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "48px",
            marginBottom: "40px",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  position: "relative",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Image src="/logo.jpeg" alt="Saudia Cabs logo" fill style={{ objectFit: "cover" }} sizes="40px" />
              </div>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#FCFBEA" }}>
                Saudia Cabs
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
              <MapPin size={16} color="#A9B7A5" style={{ marginTop: "3px", flexShrink: 0 }} />
              <p style={{ fontSize: "14px", color: "#A9B7A5", lineHeight: "1.6" }}>
                Serving Makkah, Madinah & Jeddah — Kingdom of Saudi Arabia
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <a
                href="https://wa.me/966598947503"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#25D366",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "9px 16px",
                  borderRadius: "42px",
                  textDecoration: "none",
                }}
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
              <a
                href="tel:+966598947503"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#B5913D",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "500",
                  padding: "9px 16px",
                  borderRadius: "42px",
                  textDecoration: "none",
                }}
              >
                <Phone size={15} />
                +966 59 894 7503
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "#FCFBEA", fontSize: "15px", fontWeight: "600", marginBottom: "16px" }}>
              Quick Links
            </h4>
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "14px",
                  color: "#A9B7A5",
                  marginBottom: "10px",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D1B969")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A9B7A5")}
              >
                <ChevronRight size={14} />
                {link.label}
              </a>
            ))}
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: "#FCFBEA", fontSize: "15px", fontWeight: "600", marginBottom: "16px" }}>
              Services
            </h4>
            {services.map((service) => (
              <a
                key={service.label}
                href={service.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "14px",
                  color: "#A9B7A5",
                  marginBottom: "10px",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D1B969")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A9B7A5")}
              >
                <ChevronRight size={14} />
                {service.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid #1F4A2C",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "13px", color: "#A9B7A5" }}>
            © {new Date().getFullYear()} Saudia Cabs. All rights reserved.
          </p>
          <p style={{ fontSize: "13px", color: "#A9B7A5", display: "flex", alignItems: "center", gap: "4px" }}>
            Made with <Heart size={13} color="#e8453c" fill="#e8453c" /> for Umrah pilgrims
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}
