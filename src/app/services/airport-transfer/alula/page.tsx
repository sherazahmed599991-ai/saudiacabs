import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Plane, CheckCircle, MessageCircle, ArrowRight } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "AlUla Airport Taxi — Private Transfers | Saudia Cabs",
  description:
    "Private taxi transfers from AlUla Airport to your hotel or destination in the city. 24/7 service, fixed price, professional drivers. Book on WhatsApp +966 59 894 7503.",
  keywords: [
    "alula airport taxi",
    "alula airport transfer",
    "private taxi alula",
    "alula airport pickup",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/airport-transfer/alula/" },
  openGraph: {
    title: "AlUla Airport Taxi — Saudia Cabs",
    description: "Private airport transfers in AlUla. 24/7, fixed price, professional drivers. Book on WhatsApp.",
    url: "https://saudiacabs.com/services/airport-transfer/alula/",
  },
};

const faqs = [
  { q: "Do you provide taxi service from AlUla Airport?", a: "Yes. We provide private transfers from AlUla Airport to your hotel or destination in the city. WhatsApp us your flight details and passenger count for a fixed quote." },
  { q: "How do I book an AlUla Airport transfer?", a: "WhatsApp us at +966 59 894 7503 with your flight number, arrival date, number of passengers and destination — we confirm within minutes." },
  { q: "What vehicles are available in AlUla?", a: "We offer the same fleet available across our other cities — from a 4-seater sedan to a 17-seater coaster — depending on your group size." },
  { q: "Are your AlUla Airport prices fixed?", a: "Yes. We agree the price with you upfront on WhatsApp before booking — no meters, no hidden charges." },
];

export default function AlUlaAirportTransferPage() {
  return (
    <>
      <ServiceSchema
        name="AlUla Airport Taxi"
        description="Private taxi transfers from AlUla Airport to hotels and destinations across the city."
        url="/services/airport-transfer/alula/"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services/" },
        { name: "Airport Transfer", url: "/services/airport-transfer/" },
        { name: "AlUla Airport", url: "/services/airport-transfer/alula/" },
      ]} />
      <FAQSchema faqs={faqs} />
      <Header />
      <main>
        {/* Hero */}
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <Link href="/services/airport-transfer/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Airport Transfer</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>AlUla Airport</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Plane size={28} color="#fff" />
              </div>
              <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: "700" }}>AlUla Airport Taxi</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "640px", lineHeight: "1.75" }}>
              Private transfers from AlUla Airport to your hotel or destination in the city.
              Flight tracking, meet &amp; greet, fixed price — available 24/7.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
              <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#25D366", color: "#fff", fontSize: "15px", fontWeight: "600", padding: "12px 28px", borderRadius: "4px", textDecoration: "none" }}>
                <MessageCircle size={17} /> Book on WhatsApp
              </a>
              <Link href="/contact/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "15px", fontWeight: "500", padding: "12px 28px", borderRadius: "42px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.4)" }}>
                Book Online <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding">
          <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "48px" }}>What is Included</h2>
            <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
              {[
                { title: "Flight Tracking", desc: "We monitor your flight in real time. If it is delayed, your driver waits — no extra charge." },
                { title: "Meet & Greet", desc: "Your driver will be at arrivals with a name sign and assist with your luggage." },
                { title: "24/7 Availability", desc: "Early morning, late night, any time — we are always available for your airport transfer." },
                { title: "All Vehicle Sizes", desc: "From a solo traveller to a group of 17 — we have the right vehicle for you." },
                { title: "Direct Route", desc: "No unnecessary stops or detours. We take you directly to your destination." },
                { title: "Fixed Price", desc: "Price agreed upfront on WhatsApp before booking. No meters, no surprises." },
              ].map(({ title, desc }) => (
                <div key={title} style={{ display: "flex", gap: "14px" }}>
                  <CheckCircle size={20} color="#B5913D" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#17351F", marginBottom: "6px" }}>{title}</div>
                    <p style={{ fontSize: "14px", color: "#5C6B5A", lineHeight: "1.65" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "64px 0" }}>
          <div className="container" style={{ maxWidth: "760px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "48px" }}>Frequently Asked Questions</h2>
            {faqs.map(({ q, a }) => (
              <div key={q} style={{ marginBottom: "28px", paddingBottom: "28px", borderBottom: "1px solid #E4DEC6" }}>
                <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "10px" }}>{q}</h3>
                <p style={{ fontSize: "15px", color: "#5C6B5A", lineHeight: "1.7" }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: "#184A27", padding: "56px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Book Your AlUla Airport Transfer</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", marginBottom: "32px" }}>WhatsApp us your flight details and we will confirm your booking in minutes.</p>
            <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", color: "#B5913D", fontSize: "16px", fontWeight: "700", padding: "14px 40px", borderRadius: "42px", textDecoration: "none" }}>
              <MessageCircle size={18} /> +966 59 894 7503
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
