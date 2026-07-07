import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { MapPin, MessageCircle, CheckCircle, ArrowRight } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Ziyarat Tours in Makkah & Madinah — Holy Sites Visit | Saudia Cabs",
  description:
    "Guided Ziyarat tours to all major holy sites in Makkah and Madinah. Visit Jabal Uhud, Quba Mosque, Masjid al-Qiblatayn, Jabal Noor, Jabal Thawr, and more. Book on WhatsApp +966 59 894 7503.",
  keywords: [
    "ziyarat tour makkah",
    "ziyarat tour madinah",
    "holy sites visit makkah",
    "jabal uhud tour",
    "quba mosque ziyarat",
    "jabal noor tour makkah",
    "madinah ziyarat places",
    "umrah ziyarat package",
    "makkah holy sites transport",
    "madinah holy sites transport",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/ziyarat-tours/" },
  openGraph: {
    title: "Ziyarat Tours Makkah & Madinah — Saudia Cabs",
    description: "Visit all major holy sites in Makkah & Madinah — Jabal Uhud, Quba, Jabal Noor, Ghaar-e-Hira and more. Book on WhatsApp.",
    url: "https://saudiacabs.com/services/ziyarat-tours/",
  },
};

const makkahSites = [
  { name: "Masjid al-Haram", desc: "The Grand Mosque surrounding the Holy Kaaba." },
  { name: "Jabal Noor (Cave of Hira)", desc: "Where the first revelation was received by Prophet Muhammad ﷺ." },
  { name: "Jabal Thawr", desc: "The cave where Prophet ﷺ took refuge during the Hijra." },
  { name: "Masjid al-Jinn", desc: "Site where the group of Jinn listened to the Quran." },
  { name: "Masjid Bilal", desc: "Mosque named after the famous companion Bilal ibn Rabah." },
  { name: "Jannat ul-Mualla", desc: "The blessed cemetery of Makkah where family of the Prophet ﷺ are buried." },
];

const madinahSites = [
  { name: "Masjid an-Nabawi", desc: "The Prophet's Mosque — second holiest mosque in Islam." },
  { name: "Jabal Uhud", desc: "Site of the Battle of Uhud and resting place of the martyrs." },
  { name: "Masjid Quba", desc: "The first mosque ever built in Islamic history." },
  { name: "Masjid al-Qiblatayn", desc: "Mosque of the Two Qiblas — where the direction of prayer changed." },
  { name: "Al-Baqi Cemetery", desc: "Historic cemetery in Madinah where many companions are buried." },
  { name: "Masjid al-Fath (Seven Mosques)", desc: "Site of the Battle of the Trench (Khandaq)." },
];

const faqs = [
  { q: "What is included in a Ziyarat tour?", a: "Our Ziyarat tours include a dedicated vehicle with an experienced driver who knows all the holy sites. We take you to all major locations in Makkah or Madinah based on your preference. Tours can be customized." },
  { q: "How long does a Makkah Ziyarat tour take?", a: "A standard Makkah Ziyarat tour takes approximately 4–6 hours depending on the number of sites visited and time spent at each location." },
  { q: "How long does a Madinah Ziyarat tour take?", a: "A standard Madinah Ziyarat tour takes approximately 4–5 hours, covering Jabal Uhud, Masjid Quba, Masjid al-Qiblatayn, Masjid al-Fath and other sites." },
  { q: "Can I customize my Ziyarat tour?", a: "Yes. You can tell us which specific sites you want to visit and we will plan the tour accordingly. All tours are private — just for you and your group." },
  { q: "Do you provide Ziyarat tours for groups?", a: "Yes. We have vehicles from 4 to 17 seats for group Ziyarat tours. We also offer group discounts." },
];

export default function ZiyaratToursPage() {
  return (
    <>
      <ServiceSchema
        name="Ziyarat Tours in Makkah and Madinah"
        description="Guided visits to all major holy sites in Makkah and Madinah including Jabal Uhud, Quba Mosque, Jabal Noor, and more."
        url="/services/ziyarat-tours/"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services/" },
        { name: "Ziyarat Tours", url: "/services/ziyarat-tours/" },
      ]} />
      <FAQSchema faqs={faqs} />
      <Header />
      <main>
        <section style={{ backgroundColor: "#15CD8E", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <Link href="/services/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Services</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Ziyarat Tours</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin size={28} color="#fff" />
              </div>
              <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: "700" }}>Ziyarat Tours</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "640px", lineHeight: "1.75" }}>
              Private guided tours to all major holy sites in <strong style={{ color: "#fff" }}>Makkah</strong> and
              {" "}<strong style={{ color: "#fff" }}>Madinah</strong> — with experienced local drivers who know every sacred location.
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

        {/* Sites */}
        <section className="section-padding">
          <div className="container">
            <div className="rg-2" style={{ display: "grid", gap: "60px" }}>
              <div>
                <h2 style={{ marginBottom: "28px", fontSize: "26px" }}>Ziyarat Sites in Makkah</h2>
                {makkahSites.map(({ name, desc }) => (
                  <div key={name} style={{ display: "flex", gap: "14px", marginBottom: "24px" }}>
                    <CheckCircle size={20} color="#15CD8E" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#202124", marginBottom: "4px" }}>{name}</div>
                      <p style={{ fontSize: "14px", color: "#69727d", lineHeight: "1.6" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h2 style={{ marginBottom: "28px", fontSize: "26px" }}>Ziyarat Sites in Madinah</h2>
                {madinahSites.map(({ name, desc }) => (
                  <div key={name} style={{ display: "flex", gap: "14px", marginBottom: "24px" }}>
                    <CheckCircle size={20} color="#15CD8E" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#202124", marginBottom: "4px" }}>{name}</div>
                      <p style={{ fontSize: "14px", color: "#69727d", lineHeight: "1.6" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: "#F2F1F0", borderTop: "1px solid #e0dfde", padding: "64px 0" }}>
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

        <section style={{ backgroundColor: "#15CD8E", padding: "56px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Book Your Ziyarat Tour</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", marginBottom: "32px" }}>WhatsApp us to customize your tour and confirm your booking.</p>
            <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", color: "#15CD8E", fontSize: "16px", fontWeight: "700", padding: "14px 40px", borderRadius: "42px", textDecoration: "none" }}>
              <MessageCircle size={18} /> +966 59 894 7503
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
