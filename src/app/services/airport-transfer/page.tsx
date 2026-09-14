import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Plane, CheckCircle, MessageCircle, ArrowRight, MapPin, Landmark, Mountain } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Airport Transfers in Saudi Arabia — Jeddah, Madinah, Riyadh & More",
  description:
    "Private airport transfers across Saudi Arabia — Jeddah KAIA, Madinah AMAA, Riyadh, AlUla and Taif. 24/7 service, flight tracking, meet & greet. Book on WhatsApp +966 59 894 7503.",
  keywords: [
    "airport transfer saudi arabia",
    "jeddah airport to makkah transfer",
    "madinah airport transfer",
    "riyadh airport taxi",
    "alula airport taxi",
    "taif airport taxi",
    "umrah airport pickup",
    "umrah arrival transfer",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/airport-transfer/" },
  openGraph: {
    title: "Airport Transfers in Saudi Arabia — Saudia Cabs",
    description: "24/7 airport pickup from Jeddah KAIA, Madinah AMAA, Riyadh, AlUla and Taif. Flight tracking, meet & greet, all vehicle sizes. Book on WhatsApp.",
    url: "https://saudiacabs.com/services/airport-transfer/",
  },
};

const airports = [
  { Icon: Plane, name: "Jeddah Airport (KAIA)", desc: "Transfers to Makkah and Madinah", href: "/services/airport-transfer/jeddah/" },
  { Icon: Plane, name: "Madinah Airport (AMAA)", desc: "Transfers to Madinah city and Makkah", href: "/services/airport-transfer/madinah/" },
  { Icon: Landmark, name: "Riyadh Airport", desc: "Private city transfers", href: "/services/airport-transfer/riyadh/" },
  { Icon: Mountain, name: "AlUla Airport", desc: "Private city transfers", href: "/services/airport-transfer/alula/" },
  { Icon: MapPin, name: "Taif Airport", desc: "Private city transfers", href: "/services/airport-transfer/taif/" },
];

const faqs = [
  { q: "Which airports do you serve?", a: "We provide private transfers from Jeddah (KAIA), Madinah (AMAA), Riyadh, AlUla and Taif airports. See each airport's page for its specific routes and journey times." },
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
        name="Airport Transfers in Saudi Arabia"
        description="24/7 private airport transfers from Jeddah, Madinah, Riyadh, AlUla and Taif airports for Umrah pilgrims and travellers."
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
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
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
              <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: "700" }}>Airport Transfers in Saudi Arabia</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "640px", lineHeight: "1.75" }}>
              Private, 24/7 airport pickups across <strong style={{ color: "#fff" }}>Jeddah, Madinah, Riyadh, AlUla and Taif</strong>.
              Flight tracking, meet &amp; greet, all vehicle sizes.
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

        {/* Airports */}
        <section className="section-padding">
          <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "14px" }}>Choose Your Airport</h2>
            <p style={{ fontSize: "16px", color: "#5C6B5A", textAlign: "center", maxWidth: "560px", margin: "0 auto 48px" }}>
              Each airport page has its own routes, journey times and FAQs.
            </p>
            <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
              {airports.map(({ Icon, name, desc, href }) => (
                <Link key={name} href={href} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "28px 24px", textDecoration: "none", display: "block" }}>
                  <div style={{ width: "48px", height: "48px", backgroundColor: "#F3E9D2", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={24} color="#B5913D" />
                  </div>
                  <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "6px" }}>{name}</h3>
                  <p style={{ fontSize: "14px", color: "#5C6B5A", marginBottom: "12px" }}>{desc}</p>
                  <span style={{ fontSize: "14px", color: "#B5913D", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                    View transfer details <ArrowRight size={14} />
                  </span>
                </Link>
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
                { title: "Direct Route", desc: "No unnecessary stops or detours. We take you directly to your hotel." },
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
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Book Your Airport Transfer Now</h2>
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
