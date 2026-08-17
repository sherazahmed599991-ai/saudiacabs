import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeftRight, MessageCircle, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Makkah to Madinah Transfer — Intercity Umrah Transport | Saudia Cabs",
  description:
    "Safe and direct intercity transfer between Makkah and Madinah. 4–5 hour journey with AC vehicles, no unnecessary stops. Private transfers for 1 to 17 passengers. Book on WhatsApp +966 59 894 7503.",
  keywords: [
    "makkah to madinah transfer",
    "madinah to makkah transfer",
    "makkah madinah transport",
    "intercity umrah transfer",
    "makkah madinah private car",
    "umrah intercity transport saudi arabia",
    "makkah madinah bus alternative",
    "private transfer makkah madinah",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/makkah-madinah-transfer/" },
  openGraph: {
    title: "Makkah ↔ Madinah Transfer — Saudia Cabs",
    description: "Private intercity transfer between Makkah and Madinah. Direct route, AC vehicles, 1–17 passengers. Book on WhatsApp.",
    url: "https://saudiacabs.com/services/makkah-madinah-transfer/",
  },
};

const faqs = [
  { q: "How long does it take to travel from Makkah to Madinah?", a: "The journey from Makkah to Madinah takes approximately 4–5 hours by road depending on traffic. We take the most direct route with no unnecessary stops." },
  { q: "Do you offer direct transfer without stops?", a: "Yes. All our Makkah–Madinah transfers are direct private transfers. We only stop if you request it." },
  { q: "Can you pick me up from my hotel in Makkah?", a: "Yes. We pick up and drop off directly at your hotel or accommodation in both Makkah and Madinah." },
  { q: "What vehicles are available for Makkah–Madinah transfer?", a: "We offer Toyota Camry (4 seats), Hyundai Staria (7 seats), GMC Yukon (7 seats), Toyota Hiace (11 seats), and Toyota Coaster (17 seats)." },
  { q: "How do I book a Makkah to Madinah transfer?", a: "WhatsApp us at +966 59 894 7503 with your travel date, pickup location, number of passengers, and preferred vehicle. We will confirm and provide a fixed price." },
];

export default function MakkahMadinahTransferPage() {
  return (
    <>
      <ServiceSchema
        name="Makkah to Madinah Intercity Transfer"
        description="Private direct transfer between Makkah and Madinah for Umrah pilgrims. 4–5 hour journey with AC vehicles for 1 to 17 passengers."
        url="/services/makkah-madinah-transfer/"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services/" },
        { name: "Makkah–Madinah Transfer", url: "/services/makkah-madinah-transfer/" },
      ]} />
      <FAQSchema faqs={faqs} />
      <Header />
      <main>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <Link href="/services/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Services</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Makkah–Madinah Transfer</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ArrowLeftRight size={28} color="#fff" />
              </div>
              <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: "700" }}>Makkah ↔ Madinah Transfer</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "640px", lineHeight: "1.75" }}>
              Private, direct intercity transfers between <strong style={{ color: "#fff" }}>Makkah Al-Mukarramah</strong> and
              {" "}<strong style={{ color: "#fff" }}>Madinah Al-Munawwarah</strong> — for 1 to 17 passengers.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
              <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#25D366", color: "#fff", fontSize: "15px", fontWeight: "600", padding: "12px 28px", borderRadius: "42px", textDecoration: "none" }}>
                <MessageCircle size={17} /> Book on WhatsApp
              </a>
              <Link href="/contact/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "15px", fontWeight: "500", padding: "12px 28px", borderRadius: "42px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.4)" }}>
                Book Online <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Route info */}
        <section className="section-padding">
          <div className="container">
            <div className="rg-2" style={{ display: "grid", gap: "28px", marginBottom: "56px" }}>
              {[
                { route: "Makkah → Madinah", time: "4–5 hours", from: "Your hotel in Makkah", to: "Your hotel in Madinah" },
                { route: "Madinah → Makkah", time: "4–5 hours", from: "Your hotel in Madinah", to: "Your hotel in Makkah" },
              ].map((r) => (
                <div key={r.route} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "32px 28px", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: "#B5913D", marginBottom: "16px" }}>{r.route}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
                    <Clock size={16} color="#5C6B5A" />
                    <span style={{ fontSize: "15px", color: "#5C6B5A" }}>Travel time: {r.time}</span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#5C6B5A" }}>{r.from} → {r.to}</div>
                </div>
              ))}
            </div>

            <h2 style={{ marginBottom: "32px", textAlign: "center" }}>Why Choose Our Transfer?</h2>
            <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
              {[
                { title: "Private & Direct", desc: "No shared vehicles, no unnecessary stops. Your private vehicle goes directly to your destination." },
                { title: "Hotel to Hotel", desc: "We pick up from your hotel door in Makkah and drop you at your hotel door in Madinah." },
                { title: "All Vehicle Sizes", desc: "Camry for solo travellers, Hiace or Coaster for large groups — we have the right vehicle." },
                { title: "Fixed Price", desc: "Agreed price before your journey. No hidden charges, no meter surprises." },
                { title: "Experienced Drivers", desc: "Drivers who know both cities well and the best routes between them." },
                { title: "24/7 Available", desc: "We operate day and night — book a transfer at any time that suits your itinerary." },
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

        <section style={{ backgroundColor: "#184A27", padding: "56px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Book Your Transfer Now</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", marginBottom: "32px" }}>Tell us your travel date, group size and pickup location.</p>
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
