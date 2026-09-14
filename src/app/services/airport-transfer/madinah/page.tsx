import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Plane, CheckCircle, Clock, MessageCircle, ArrowRight, MapPin } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Madinah Airport (AMAA) Taxi — Transfers to Madinah & Makkah",
  description:
    "Private taxi from Prince Mohammad Bin Abdulaziz Airport (AMAA) to your Madinah hotel, plus intercity transfers to Makkah. 24/7, flight tracking, fixed price. Book on WhatsApp +966 59 894 7503.",
  keywords: [
    "madinah airport taxi",
    "AMAA taxi",
    "prince mohammad bin abdulaziz airport transfer",
    "madinah airport to hotel taxi",
    "madinah airport to makkah taxi",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/airport-transfer/madinah/" },
  openGraph: {
    title: "Madinah Airport (AMAA) Taxi — Saudia Cabs",
    description: "Private transfers from Madinah Airport to your hotel, and on to Makkah. 24/7, flight tracking, fixed price.",
    url: "https://saudiacabs.com/services/airport-transfer/madinah/",
  },
};

const routes = [
  { from: "Madinah Airport (AMAA)", to: "Madinah Al-Munawwarah", time: "30 – 45 minutes", note: "Prince Mohammad Bin Abdulaziz Airport → Madinah hotels" },
  { from: "Madinah Hotels", to: "Madinah Airport (AMAA)", time: "30 – 45 minutes", note: "Departure transfer with luggage assistance" },
  { from: "Madinah Airport (AMAA)", to: "Makkah Al-Mukarramah", time: "Approx. 4 hr 30 min", note: "Via Route 15 (Haramain Expressway) — around 450 km" },
];

const faqs = [
  { q: "Do you pick up from Madinah Airport (AMAA)?", a: "Yes. We offer transfers from Prince Mohammad Bin Abdulaziz Airport (AMAA) directly to your hotel in Madinah city. Journey time is approximately 30–45 minutes." },
  { q: "Can I go straight from Madinah Airport to Makkah?", a: "Yes. We can take you directly from Madinah Airport to Makkah — around a 4.5 hour drive via the Haramain Expressway — without stopping at a Madinah hotel first, if that suits your itinerary." },
  { q: "What happens if my flight is delayed?", a: "We track all flights. If your flight is delayed, your driver waits — no extra charge." },
  { q: "Do you offer meet and greet at Madinah Airport?", a: "Yes. Your driver waits at arrivals with a name sign and helps with your luggage." },
  { q: "How do I book a Madinah Airport transfer?", a: "WhatsApp us at +966 59 894 7503 with your flight number, arrival date, number of passengers and destination — we confirm within minutes." },
];

export default function MadinahAirportTransferPage() {
  return (
    <>
      <ServiceSchema
        name="Madinah Airport (AMAA) Taxi"
        description="Private taxi transfers from Prince Mohammad Bin Abdulaziz Airport (AMAA) to Madinah city and Makkah for Umrah pilgrims."
        url="/services/airport-transfer/madinah/"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services/" },
        { name: "Airport Transfer", url: "/services/airport-transfer/" },
        { name: "Madinah Airport", url: "/services/airport-transfer/madinah/" },
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
              <span style={{ color: "#fff", fontSize: "14px" }}>Madinah Airport</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Plane size={28} color="#fff" />
              </div>
              <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: "700" }}>Madinah Airport (AMAA) Taxi</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "640px", lineHeight: "1.75" }}>
              Private transfers from <strong style={{ color: "#fff" }}>Prince Mohammad Bin Abdulaziz Airport</strong> to
              your Madinah hotel, plus intercity transfers on to Makkah. Available 24/7.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
              <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#25D366", color: "#fff", fontSize: "15px", fontWeight: "600", padding: "12px 28px", borderRadius: "4px", textDecoration: "none" }}>
                <MessageCircle size={17} /> Book on WhatsApp
              </a>
              <Link href="/book-online/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "15px", fontWeight: "500", padding: "12px 28px", borderRadius: "42px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.4)" }}>
                Book Online <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Routes */}
        <section className="section-padding">
          <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "48px" }}>Madinah Airport Transfer Routes</h2>
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              {routes.map((r, i) => (
                <div key={i} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "28px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <MapPin size={20} color="#B5913D" />
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#17351F" }}>{r.from}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <ArrowRight size={20} color="#5C6B5A" />
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#17351F" }}>{r.to}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <Clock size={15} color="#5C6B5A" />
                    <span style={{ fontSize: "14px", color: "#5C6B5A" }}>Travel time: {r.time}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#5C6B5A" }}>{r.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "64px 0" }}>
          <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "48px" }}>What is Included</h2>
            <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
              {[
                { title: "Flight Tracking", desc: "We monitor your flight in real time. If it is delayed, your driver waits — no extra charge." },
                { title: "Meet & Greet", desc: "Your driver will be at arrivals with a name sign and assist with your luggage." },
                { title: "24/7 Availability", desc: "Early morning, late night, any time — we are always available for your airport transfer." },
                { title: "All Vehicle Sizes", desc: "From a solo traveller to a group of 17 — we have the right vehicle for you." },
                { title: "Direct Route", desc: "No unnecessary stops or detours. We take you directly to your destination." },
                { title: "Fixed Price", desc: "Price agreed upfront before booking. No meters, no surprises at the end." },
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
        <section className="section-padding">
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
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Book Your Madinah Airport Transfer</h2>
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
