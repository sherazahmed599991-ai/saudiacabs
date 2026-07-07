import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Users, MessageCircle, CheckCircle, ArrowRight } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Group Umrah Transport Packages — Families & Large Groups | Saudia Cabs",
  description:
    "Group Umrah transportation packages for families and large groups in Makkah & Madinah. Toyota Hiace (11 seats) and Toyota Coaster (17 seats) with dedicated coordinator. Book on WhatsApp +966 59 894 7503.",
  keywords: [
    "group umrah transport",
    "umrah group package makkah",
    "family umrah transport saudi arabia",
    "large group umrah vehicle",
    "coaster hire makkah",
    "hiace hire madinah",
    "group ziyarat tour",
    "umrah family package transport",
    "group transport makkah madinah",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/group-packages/" },
  openGraph: {
    title: "Group Umrah Transport Packages — Saudia Cabs",
    description: "Toyota Hiace & Coaster for groups of 8–17+ passengers. Airport transfers, Ziyarat tours & intercity travel for families.",
    url: "https://saudiacabs.com/services/group-packages/",
  },
};

const vehicles = [
  { name: "Toyota Hiace", seats: "11 Seater", best: "Medium groups & families", icon: "🚐" },
  { name: "Toyota Coaster", seats: "17 Seater", best: "Large groups & tour parties", icon: "🚌" },
  { name: "Multiple Vehicles", seats: "17+ Passengers", best: "Very large groups (convoy)", icon: "🚐🚐" },
];

const faqs = [
  { q: "What vehicles do you have for group Umrah transport?", a: "For groups we have Toyota Hiace (11 seats) and Toyota Coaster (17 seats). For groups larger than 17, we arrange multiple vehicles." },
  { q: "Do you offer group discounts?", a: "Yes. We offer special rates for groups. The larger the group, the better the rate per person. Contact us on WhatsApp for a group quote." },
  { q: "Can a group get a dedicated vehicle for the entire Umrah stay?", a: "Yes. We offer dedicated vehicle packages where the same vehicle and driver are assigned to your group for the duration of your stay in Makkah or Madinah." },
  { q: "Do you provide a coordinator for group tours?", a: "Yes. For larger group packages, we provide a dedicated coordinator to assist with scheduling, site visits, and logistics throughout your journey." },
  { q: "Can you arrange both Makkah and Madinah transport for a group?", a: "Yes. We handle the full journey — airport pickup in Jeddah, Ziyarat in Makkah, intercity transfer to Madinah, Ziyarat in Madinah, and departure from Madinah airport." },
];

export default function GroupPackagesPage() {
  return (
    <>
      <ServiceSchema
        name="Group Umrah Transport Packages"
        description="Group Umrah transport for families and large parties in Makkah and Madinah. Toyota Hiace and Coaster available with dedicated coordinator."
        url="/services/group-packages/"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services/" },
        { name: "Group Packages", url: "/services/group-packages/" },
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
              <span style={{ color: "#fff", fontSize: "14px" }}>Group Packages</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Users size={28} color="#fff" />
              </div>
              <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: "700" }}>Group Umrah Packages</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "640px", lineHeight: "1.75" }}>
              Special transport packages for <strong style={{ color: "#fff" }}>families and large groups</strong> — airport pickup, Ziyarat tours, intercity transfers, all in one.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
              <a href="https://wa.me/966598947503" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#25D366", color: "#fff", fontSize: "15px", fontWeight: "600", padding: "12px 28px", borderRadius: "42px", textDecoration: "none" }}>
                <MessageCircle size={17} /> Get Group Quote
              </a>
              <Link href="/fleet/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "15px", fontWeight: "500", padding: "12px 28px", borderRadius: "42px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.4)" }}>
                View Fleet <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Vehicles */}
        <section className="section-padding">
          <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "48px" }}>Group Vehicles</h2>
            <div className="rg-3" style={{ display: "grid", gap: "24px", marginBottom: "56px" }}>
              {vehicles.map((v) => (
                <div key={v.name} style={{ backgroundColor: "#fff", border: "1px solid #e0dfde", borderRadius: "8px", padding: "32px 28px", textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>{v.icon}</div>
                  <h3 style={{ fontSize: "20px", color: "#202124", marginBottom: "8px" }}>{v.name}</h3>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#15CD8E", marginBottom: "8px" }}>{v.seats}</div>
                  <p style={{ fontSize: "14px", color: "#69727d" }}>Best for: {v.best}</p>
                </div>
              ))}
            </div>

            <h2 style={{ marginBottom: "32px", textAlign: "center" }}>What is Included in Group Packages</h2>
            <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
              {[
                { title: "Airport Pickup", desc: "Group pickup from Jeddah KAIA or Madinah AMAA on arrival." },
                { title: "Ziyarat Tours", desc: "Group Ziyarat in Makkah and Madinah at your preferred schedule." },
                { title: "Makkah–Madinah Transfer", desc: "Intercity transfer for the whole group in one or more vehicles." },
                { title: "Dedicated Vehicle", desc: "Vehicle assigned exclusively to your group for the whole stay." },
                { title: "Group Discounts", desc: "Special rates for groups — the larger the group, the better the price." },
                { title: "Coordinator", desc: "Dedicated support coordinator for groups of 10+ passengers." },
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
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Get a Group Quote</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", marginBottom: "32px" }}>Tell us your group size, travel dates and services needed — we will send you a custom quote.</p>
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
