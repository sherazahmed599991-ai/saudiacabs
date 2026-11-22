import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import GeneralInquiryForm from "@/components/GeneralInquiryForm";
import { LocalBusinessSchema, BreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us — Umrah Transport Support",
  description:
    "Questions about Umrah transport? Reach Saudia Cabs on WhatsApp +966 59 894 7503, by phone, or send us a message. Support is available 24/7.",
  path: "/contact/",
  keywords: [
    "contact saudia cabs",
    "umrah transport support",
    "whatsapp umrah taxi contact",
    "saudia cabs phone number",
  ],
});

export default function ContactPage() {
  return (
    <>
      <LocalBusinessSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Contact", url: "/contact/" }]} />
      <Header />
      <main id="main-content">
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Contact</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: "42px", fontWeight: "700", marginBottom: "16px" }}>Contact Us</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "560px", lineHeight: "1.7" }}>
              Questions about our service, fleet, or coverage? Send us a message or reach out directly — we respond within minutes.
            </p>
          </div>
        </section>
        <GeneralInquiryForm />
      </main>
      <Footer />
    </>
  );
}
