"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, MessageCircle } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services/" },
  { label: "Fleet", href: "/fleet/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e0dfde",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#15CD8E",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            SC
          </div>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>
            Saudia <span style={{ color: "#15CD8E" }}>Cabs</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="hidden-mobile">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || pathname === item.href.replace(/\/$/, "");
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontSize: "15px",
                  fontWeight: "500",
                  color: isActive ? "#15CD8E" : "#5E5E5E",
                  padding: "8px 14px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  backgroundColor: isActive ? "rgba(21,205,142,0.08)" : "transparent",
                  borderBottom: isActive ? "2px solid #15CD8E" : "2px solid transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}

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
              fontSize: "14px",
              fontWeight: "500",
              padding: "9px 16px",
              borderRadius: "42px",
              textDecoration: "none",
              marginLeft: "8px",
            }}
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
          <a
            href="tel:+966598947503"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#15CD8E",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "500",
              padding: "9px 16px",
              borderRadius: "42px",
              textDecoration: "none",
              marginLeft: "4px",
            }}
          >
            <Phone size={16} />
            Book Now
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="show-mobile"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: "#202124",
            display: "none",
          }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e0dfde", padding: "16px 24px" }}>
          {navLinks.map((item) => {
            const isActive = pathname === item.href || pathname === item.href.replace(/\/$/, "");
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: isActive ? "#15CD8E" : "#1a1a1a",
                  padding: "12px 0",
                  borderBottom: "1px solid #e0dfde",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <a
              href="https://wa.me/966598947503"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#25D366",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                padding: "11px",
                borderRadius: "42px",
                textDecoration: "none",
              }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href="tel:+966598947503"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#15CD8E",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                padding: "11px",
                borderRadius: "42px",
                textDecoration: "none",
              }}
            >
              <Phone size={16} /> Call Us
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </header>
  );
}
