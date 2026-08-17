import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Plane, MapPin, ArrowLeftRight, Clock, Users, BadgeDollarSign, ArrowRight } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Umrah Transportation Services — Airport Transfer, Ziyarat Tours & More",
  description:
    "Complete Umrah transport services: airport transfers from Jeddah KAIA & Madinah AMAA, Ziyarat tours in Makkah & Madinah, Makkah–Madinah intercity transfers, and group packages. Book 24/7.",
  keywords: [
    "umrah transportation services",
    "airport transfer makkah",
    "airport transfer madinah",
    "ziyarat tour makkah madinah",
    "makkah madinah transfer service",
    "group umrah transport",
    "umrah taxi saudi arabia",
    "pilgrims transport service",
  ],
  alternates: { canonical: "https://saudiacabs.com/services/" },
  openGraph: {
    title: "Umrah Transportation Services — Saudia Cabs",
    description: "Airport transfers, Ziyarat tours, intercity transfers & group packages in Makkah, Madinah & Jeddah.",
    url: "https://saudiacabs.com/services/",
  },
};

const services = [
  {
    Icon: Plane,
    title: "Airport Transfer",
    href: "/services/airport-transfer/",
    description: "Comfortable and on-time airport pickup and drop-off at Jeddah (KAIA) and Madinah (AMAA) airports. We track your flight and adjust for delays.",
    features: ["Flight tracking", "Meet & greet service", "All hours available", "Luggage assistance"],
  },
  {
    Icon: MapPin,
    title: "Ziyarat Tours",
    href: "/services/ziyarat-tours/",
    description: "Guided visits to all major holy sites in Makkah and Madinah with experienced local drivers who know every sacred location.",
    features: ["Masjid al-Haram", "Masjid an-Nabawi", "Jabal Uhud", "Quba Mosque & more"],
  },
  {
    Icon: ArrowLeftRight,
    title: "Makkah ↔ Madinah Transfer",
    href: "/services/makkah-madinah-transfer/",
    description: "Safe and reliable intercity travel between Makkah and Madinah. Direct routes, no unnecessary stops, at affordable prices.",
    features: ["Direct route", "AC vehicles", "Flexible timings", "Door to door"],
  },
  {
    Icon: Clock,
    title: "24/7 Availability",
    href: "/contact/",
    description: "Our drivers are available around the clock so you never have to worry about your schedule — no matter what time you arrive.",
    features: ["Night pickups", "Early morning", "Instant confirmation", "WhatsApp response"],
  },
  {
    Icon: Users,
    title: "Group Packages",
    href: "/services/group-packages/",
    description: "Special packages for families and groups with spacious vehicles and a dedicated coordinator for the whole journey.",
    features: ["Up to 17 passengers", "Dedicated coordinator", "Group discounts", "Custom itinerary"],
  },
  {
    Icon: BadgeDollarSign,
    title: "Affordable Rates",
    href: "/contact/",
    description: "Transparent pricing with no hidden charges. Get the best value for your Umrah journey with upfront quotes.",
    features: ["Fixed pricing", "No hidden fees", "Upfront quotes", "Multiple payment options"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <ServiceSchema
        name="Umrah Transportation Services"
        description="Airport transfers, Ziyarat tours, Makkah–Madinah transfers and group packages for Umrah pilgrims."
        url="/services/"
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Services", url: "/services/" }]} />
      <Header />
      <main>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Services</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: "42px", fontWeight: "700", marginBottom: "16px" }}>Umrah Transportation Services</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "600px", lineHeight: "1.7" }}>
              Airport transfers, Ziyarat tours, intercity transfers and group packages — everything for a smooth Umrah journey.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container">
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              {services.map(({ Icon, title, href, description, features }) => (
                <div key={title} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "32px 28px" }}>
                  <div style={{ width: "52px", height: "52px", backgroundColor: "#F3E9D2", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                    <Icon size={26} color="#B5913D" />
                  </div>
                  <h2 style={{ fontSize: "20px", marginBottom: "12px", color: "#17351F" }}>{title}</h2>
                  <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#5C6B5A", marginBottom: "20px" }}>{description}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}>
                    {features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#17351F", marginBottom: "8px" }}>
                        <span style={{ width: "6px", height: "6px", backgroundColor: "#B5913D", borderRadius: "50%", flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#B5913D", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "64px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "16px" }}>Ready to Book?</h2>
            <p style={{ fontSize: "17px", color: "#5C6B5A", marginBottom: "32px" }}>Contact us now and we will arrange everything for you.</p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#B5913D", color: "#fff", fontSize: "16px", fontWeight: "600", padding: "14px 36px", borderRadius: "42px", textDecoration: "none" }}>
                Book Now <ArrowRight size={18} />
              </Link>
              <Link href="/fleet/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "transparent", color: "#B5913D", fontSize: "16px", fontWeight: "500", padding: "13px 35px", borderRadius: "42px", textDecoration: "none", border: "2px solid #B5913D" }}>
                View Our Fleet <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
