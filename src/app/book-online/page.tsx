import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import { LocalBusinessSchema, BreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Book Online — Saudia Cabs Umrah Transportation",
  description:
    "Book your Umrah transportation online. Airport transfers, Ziyarat tours and Makkah–Madinah transfers — submit your trip details and we confirm on WhatsApp within minutes.",
  keywords: [
    "book umrah ride online",
    "umrah transport booking",
    "book taxi makkah madinah",
    "online booking umrah taxi",
    "book airport transfer saudi",
  ],
  alternates: { canonical: "https://saudiacabs.com/book-online/" },
  openGraph: {
    title: "Book Your Umrah Ride Online — Saudia Cabs",
    description: "Submit your trip details online and we confirm on WhatsApp within minutes.",
    url: "https://saudiacabs.com/book-online/",
  },
};

export default function BookOnlinePage() {
  return (
    <>
      <LocalBusinessSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Book Online", url: "/book-online/" }]} />
      <Header />
      <main>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Book Online</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: "42px", fontWeight: "700", marginBottom: "16px" }}>Book Your Ride</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "560px", lineHeight: "1.7" }}>
              Fill in your trip details below and we&apos;ll confirm on WhatsApp within minutes — no payment needed online.
            </p>
          </div>
        </section>
        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
