import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Compass, CheckCircle, MessageCircle, ArrowRight } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Miqat Transfer Service — Private Taxi to the Miqat | Saudia Cabs",
  description:
    "Private transfer to the Miqat boundary point before entering Ihram for Umrah. Your driver waits while you change and prepares to continue directly to Makkah. Book on WhatsApp +966 59 894 7503.",
  keywords: [
    "miqat transfer",
    "miqat taxi",
    "dhul hulaifah taxi",
    "juhfah taxi",
    "qarn al manazil taxi",
    "yalamlam taxi",
    "ihram transfer saudi arabia",
    "miqat to makkah taxi",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/miqat-transfer/" },
  openGraph: {
    title: "Miqat Transfer Service — Saudia Cabs",
    description: "Private transfer to your Miqat boundary point, then directly on to Makkah. Book on WhatsApp.",
    url: "https://saudiacabs.com/services/miqat-transfer/",
  },
};

const miqatPoints = [
  { name: "Dhul Hulaifah (Abyar Ali)", desc: "Miqat for pilgrims coming from Madinah." },
  { name: "Al-Juhfah (Rabigh)", desc: "Miqat for pilgrims arriving from Syria, Egypt and North Africa." },
  { name: "Qarn al-Manazil (As-Sayl)", desc: "Miqat for pilgrims coming from Najd and the east." },
  { name: "Yalamlam", desc: "Miqat for pilgrims arriving from Yemen and the south." },
  { name: "Dhat Irq", desc: "Miqat for pilgrims coming from Iraq and the northeast." },
];

const faqs = [
  { q: "What is a Miqat?", a: "The Miqat is a designated boundary point where pilgrims must enter the state of Ihram before continuing their journey into Makkah for Umrah or Hajj. There are five main Miqat points around Makkah, each corresponding to the direction pilgrims are travelling from." },
  { q: "Do you stop at the Miqat on the way to Makkah?", a: "Yes. If you are travelling from Madinah or an airport before your Miqat, we stop at the correct Miqat point so you can change into Ihram, then continue directly to Makkah." },
  { q: "Can I request a specific Miqat point?", a: "Yes. Tell us your travel route on WhatsApp and we will confirm the correct Miqat for your journey, or accommodate a specific point you request." },
  { q: "How long does the stop take?", a: "We wait as long as you need to change into Ihram and perform your Niyyah — there is no extra charge for the stop." },
  { q: "How do I book a Miqat transfer?", a: "WhatsApp us at +966 59 894 7503 with your travel route, date and number of passengers — we will confirm the vehicle and a fixed price." },
];

export default function MiqatTransferPage() {
  return (
    <>
      <ServiceSchema
        name="Miqat Transfer Service"
        description="Private taxi transfer to the Miqat boundary point before entering Ihram, continuing directly to Makkah."
        url="/services/miqat-transfer/"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services/" },
        { name: "Miqat Transfer", url: "/services/miqat-transfer/" },
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
              <span style={{ color: "#fff", fontSize: "14px" }}>Miqat Transfer</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Compass size={28} color="#fff" />
              </div>
              <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: "700" }}>Miqat Transfer Service</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "640px", lineHeight: "1.75" }}>
              A private stop at your Miqat boundary point to enter Ihram, then a direct transfer
              on to Makkah — no rushing, no extra charge for the wait.
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

        {/* Miqat points */}
        <section className="section-padding">
          <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "14px" }}>Miqat Points We Cover</h2>
            <p style={{ fontSize: "16px", color: "#5C6B5A", textAlign: "center", maxWidth: "620px", margin: "0 auto 48px" }}>
              We stop at the Miqat that matches your travel route, so you can enter Ihram at the correct point before continuing to Makkah.
            </p>
            <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
              {miqatPoints.map(({ name, desc }) => (
                <div key={name} style={{ display: "flex", gap: "14px", padding: "20px", border: "1px solid #E4DEC6", borderRadius: "8px", backgroundColor: "#fff" }}>
                  <CheckCircle size={20} color="#B5913D" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#17351F", marginBottom: "4px" }}>{name}</div>
                    <p style={{ fontSize: "13.5px", color: "#5C6B5A", lineHeight: "1.6" }}>{desc}</p>
                  </div>
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
                { title: "Correct Miqat Stop", desc: "We identify and stop at the Miqat that matches your travel route." },
                { title: "No Rush", desc: "Your driver waits while you change into Ihram and perform your Niyyah — no extra charge." },
                { title: "Direct to Makkah", desc: "After the Miqat, we continue directly to your hotel in Makkah." },
                { title: "Experienced Drivers", desc: "Drivers familiar with Miqat locations and pilgrim travel." },
                { title: "Fixed Price", desc: "Price agreed upfront before booking. No hidden charges." },
                { title: "24/7 Available", desc: "Book a Miqat transfer at any time that suits your itinerary." },
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
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Book Your Miqat Transfer</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", marginBottom: "32px" }}>Tell us your travel route on WhatsApp and we will confirm your Miqat stop and fare.</p>
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
