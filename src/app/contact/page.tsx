import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { LocalBusinessSchema, BreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Book Umrah Ride — Contact Saudia Cabs",
  description:
    "Book your Umrah transportation now. WhatsApp +966 59 894 7503 for airport transfers, Ziyarat tours and Makkah–Madinah transfers. We respond in minutes.",
  keywords: [
    "book umrah ride",
    "umrah transport booking",
    "whatsapp umrah taxi",
    "contact umrah ride service",
    "makkah transport booking",
  ],
  alternates: { canonical: "https://saudiacabs.com/contact/" },
  openGraph: {
    title: "Book Your Umrah Ride — Saudia Cabs",
    description: "WhatsApp us at +966 59 894 7503 to book airport transfers, Ziyarat tours, and intercity transport.",
    url: "https://saudiacabs.com/contact/",
  },
};

export default function ContactPage() {
  return (
    <>
      <LocalBusinessSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Contact", url: "/contact/" }]} />
      <Header />
      <main>
        <section style={{ backgroundColor: "#15CD8E", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Contact</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: "42px", fontWeight: "700", marginBottom: "16px" }}>Book Your Ride</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "560px", lineHeight: "1.7" }}>
              Fill in the form below or contact us directly on WhatsApp — we respond within minutes.
            </p>
          </div>
        </section>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
