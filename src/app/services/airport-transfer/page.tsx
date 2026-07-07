import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Plane, CheckCircle, Clock, MessageCircle, ArrowRight, MapPin } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Umrah Airport Transfer — Jeddah KAIA & Madinah AMAA to Makkah/Madinah",
  description:
    "Reliable airport transfers from Jeddah King Abdulaziz Airport (KAIA) to Makkah and from Madinah Airport (AMAA) to Madinah city. 24/7 service, flight tracking, meet & greet. Book on WhatsApp +966 59 894 7503.",
  keywords: [
    "jeddah airport to makkah transfer",
    "king abdulaziz airport makkah transfer",
    "KAIA to makkah transport",
    "madinah airport transfer",
    "AMAA to madinah city transfer",
    "umrah airport pickup",
    "airport transfer saudi arabia pilgrims",
    "makkah hotel airport drop",
    "umrah arrival transfer",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/airport-transfer/" },
  openGraph: {
    title: "Umrah Airport Transfer — Jeddah & Madinah | Saudia Cabs",
    description: "24/7 airport pickup from Jeddah KAIA & Madinah AMAA. Flight tracking, meet & greet, all vehicle sizes. Book on WhatsApp.",
    url: "https://saudiacabs.com/services/airport-transfer/",
  },
};

const faqs = [
  { q: "Do you provide airport transfer from Jeddah Airport (KAIA) to Makkah?", a: "Yes. We provide 24/7 airport transfers from King Abdulaziz International Airport (KAIA) in Jeddah directly to your hotel in Makkah. The journey typically takes 1–1.5 hours depending on traffic." },
  { q: "Do you pick up from Madinah Airport (AMAA)?", a: "Yes. We offer transfers from Prince Mohammad Bin Abdulaziz Airport (AMAA) in Madinah directly to your hotel in Madinah city. Journey time is approximately 30–45 minutes." },
  { q: "What happens if my flight is delayed?", a: "We track all flights. If your flight is delayed, your driver will wait. You will not be charged extra for flight delays." },
  { q: "How do I book an airport transfer?", a: "Simply WhatsApp us at +966 59 894 7503 with your flight number, arrival date, number of passengers, and hotel name. We will confirm your booking within minutes." },
  { q: "Do you offer meet and greet service at the airport?", a: "Yes. Your driver will be waiting at the arrivals area holding a sign with your name. We also assist with luggage." },
];

export default function AirportTransferPage() {
  return (
    <>
      <ServiceSchema
        name="Umrah Airport Transfer — Jeddah KAIA & Madinah AMAA"
        description="24/7 airport transfers from Jeddah King Abdulaziz Airport to Makkah and from Madinah Airport to Madinah city for Umrah pilgrims."
        url="/services/airport-transfer/"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services/" },
        { name: "Airport Transfer", url: "/services/airport-transfer/" },
      ]} />
      <FAQSchema faqs={faqs} />
      <Header />
      <main>
        {/* Hero */}
        <section style={{ backgroundColor: "#15CD8E", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <Link href="/services/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Services</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Airport Transfer</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Plane size={28} color="#fff" />
              </div>
              <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: "700" }}>Umrah Airport Transfer</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "640px", lineHeight: "1.75" }}>
              24/7 airport pickups from <strong style={{ color: "#fff" }}>Jeddah KAIA</strong> to Makkah and
              from <strong style={{ color: "#fff" }}>Madinah AMAA</strong> to Madinah city.
              Flight tracking, meet &amp; greet, all vehicle sizes.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
              <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#25D366", color: "#fff", fontSize: "15px", fontWeight: "600", padding: "12px 28px", borderRadius: "4px", textDecoration: "none" }}>
                <MessageCircle size={17} /> Book on WhatsApp
              </a>
              <Link href="/contact/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "15px", fontWeight: "500", padding: "12px 28px", borderRadius: "4px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.4)" }}>
                Book Online <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Routes */}
        <section className="section-padding">
          <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "48px" }}>Airport Transfer Routes</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
              {[
                {
                  from: "Jeddah Airport (KAIA)",
                  to: "Makkah Al-Mukarramah",
                  time: "1 – 1.5 hours",
                  note: "King Abdulaziz International Airport → Makkah hotels",
                },
                {
                  from: "Madinah Airport (AMAA)",
                  to: "Madinah Al-Munawwarah",
                  time: "30 – 45 minutes",
                  note: "Prince Mohammad Bin Abdulaziz Airport → Madinah hotels",
                },
                {
                  from: "Makkah Hotels",
                  to: "Jeddah Airport (KAIA)",
                  time: "1 – 1.5 hours",
                  note: "Departure transfer — we ensure you arrive on time",
                },
                {
                  from: "Madinah Hotels",
                  to: "Madinah Airport (AMAA)",
                  time: "30 – 45 minutes",
                  note: "Departure transfer with luggage assistance",
                },
              ].map((r) => (
                <div key={r.from} style={{ backgroundColor: "#fff", border: "1px solid #e0dfde", borderRadius: "8px", padding: "28px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <MapPin size={20} color="#15CD8E" />
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#202124" }}>{r.from}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <ArrowRight size={20} color="#69727d" />
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#202124" }}>{r.to}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <Clock size={15} color="#69727d" />
                    <span style={{ fontSize: "14px", color: "#69727d" }}>Travel time: {r.time}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#9aa0a6" }}>{r.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ backgroundColor: "#F2F1F0", borderTop: "1px solid #e0dfde", padding: "64px 0" }}>
          <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "48px" }}>What is Included</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              {[
                { title: "Flight Tracking", desc: "We monitor your flight in real time. If it is delayed, your driver waits — no extra charge." },
                { title: "Meet & Greet", desc: "Your driver will be at arrivals with a name sign and assist with your luggage." },
                { title: "24/7 Availability", desc: "Early morning, late night, any time — we are always available for your airport transfer." },
                { title: "All Vehicle Sizes", desc: "From a solo traveller to a group of 17 — we have the right vehicle for you." },
                { title: "Direct Route", desc: "No unnecessary stops or detours. We take you directly to your hotel." },
                { title: "Fixed Price", desc: "Price agreed upfront before booking. No meters, no surprises at the end." },
              ].map(({ title, desc }) => (
                <div key={title} style={{ display: "flex", gap: "14px" }}>
                  <CheckCircle size={20} color="#15CD8E" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#202124", marginBottom: "6px" }}>{title}</div>
                    <p style={{ fontSize: "14px", color: "#69727d", lineHeight: "1.65" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding">
          <div className="container" style={{ maxWidth: "760px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "48px" }}>Frequently Asked Questions</h2>
            {faqs.map(({ q, a }) => (
              <div key={q} style={{ marginBottom: "28px", paddingBottom: "28px", borderBottom: "1px solid #e0dfde" }}>
                <h3 style={{ fontSize: "17px", color: "#202124", marginBottom: "10px" }}>{q}</h3>
                <p style={{ fontSize: "15px", color: "#69727d", lineHeight: "1.7" }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: "#15CD8E", padding: "56px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Book Your Airport Transfer Now</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", marginBottom: "32px" }}>WhatsApp us your flight details and we will confirm your booking in minutes.</p>
            <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", color: "#15CD8E", fontSize: "16px", fontWeight: "700", padding: "14px 40px", borderRadius: "4px", textDecoration: "none" }}>
              <MessageCircle size={18} /> +966 59 894 7503
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
