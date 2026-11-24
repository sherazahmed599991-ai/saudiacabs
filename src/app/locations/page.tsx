import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Plane } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { locations, regions } from "@/lib/locations";
import { waUrl } from "@/lib/contact";

export const metadata: Metadata = buildMetadata({
  title: "Taxi Service Locations in Saudi Arabia",
  absoluteTitle: "Taxi Service Locations in Saudi Arabia | Saudia Cabs",
  description:
    "Private taxi and chauffeur service in Makkah, Madinah, Jeddah, Riyadh, Taif, AlUla, Abha and Tabuk. Airport pickups and intercity transfers, 24/7.",
  path: "/locations/",
});

export default function LocationsPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Locations", url: "/locations/" }]} />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", marginBottom: "16px" }}>Taxi Service Locations in Saudi Arabia</h1>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "18px", maxWidth: "680px", margin: "0 auto 28px", lineHeight: 1.75 }}>
              Umrah transport in Makkah, Madinah and Jeddah is our specialty. We also provide private taxi service in
              other cities across the Kingdom. Pick your city to see airport and route details.
            </p>
            <a href={waUrl("Salam, I need a private taxi")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <MessageCircle size={17} /> Ask for a Quote
            </a>
          </div>
        </section>

        {regions.map((region, i) => {
          const items = locations.filter((l) => l.region === region);
          if (items.length === 0) return null;
          return (
            <section key={region} className="section-padding" style={{ backgroundColor: i % 2 ? "#F4F1C6" : "#ffffff" }}>
              <div className="container">
                <h2 style={{ marginBottom: "24px" }}>{region} Region</h2>
                <div className="rg-3" style={{ display: "grid", gap: "20px" }}>
                  {items.map((l) => (
                    <Link
                      key={l.slug}
                      href={`/locations/${l.slug}/`}
                      style={{ display: "block", backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "22px", textDecoration: "none" }}
                    >
                      <h3 style={{ fontSize: "20px", marginBottom: "6px", color: "#17351F" }}>{l.name}</h3>
                      <p style={{ fontSize: "14.5px", marginBottom: "12px" }}>{l.tagline}</p>
                      {l.airport && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "#5C6B5A", marginBottom: "10px" }}>
                          <Plane size={14} color="#8F6F25" /> {l.airport.code} · {l.airport.name}
                        </div>
                      )}
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#8F6F25" }}>
                        View {l.name} <ArrowRight size={14} style={{ verticalAlign: "-2px" }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <section className="section-padding" style={{ backgroundColor: "#184A27" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "14px" }}>Another City?</h2>
            <p style={{ color: "rgba(255,255,255,0.88)", maxWidth: "560px", margin: "0 auto 28px" }}>
              Tell us where you need a ride anywhere in Saudi Arabia and we&apos;ll quote it.
            </p>
            <Link href="/routes/" className="btn-primary" style={{ backgroundColor: "#fff", color: "#8F6F25" }}>
              See Popular Routes
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
