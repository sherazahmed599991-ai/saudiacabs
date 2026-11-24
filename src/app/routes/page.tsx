import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { routes, routeGroups, routeTitle } from "@/lib/routes";
import { waUrl } from "@/lib/contact";

export const metadata: Metadata = buildMetadata({
  title: "Private Taxi Routes Across Saudi Arabia",
  absoluteTitle: "Private Taxi Routes Across Saudi Arabia | Saudia Cabs",
  description:
    "Popular private transfer routes: Jeddah Airport to Makkah, Makkah to Madinah, Taif, AlUla, Riyadh and cross-border trips. Distance, time and instant quotes.",
  path: "/routes/",
});

const groupBlurb: Record<string, string> = {
  Umrah: "The journeys most pilgrims book: airport arrivals and the Makkah–Madinah run.",
  Intercity: "Shorter trips between cities in the western region.",
  "Long-distance": "Full-day road transfers for groups, families and business travellers.",
  GCC: "Cross-border chauffeur trips arranged on request.",
};

export default function RoutesPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Routes", url: "/routes/" }]} />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", marginBottom: "16px" }}>Private Taxi Routes Across Saudi Arabia</h1>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "18px", maxWidth: "680px", margin: "0 auto 28px", lineHeight: 1.75 }}>
              See distance and travel time for our most requested transfers, then get a fixed quote on WhatsApp.
              Don&apos;t see your route? We cover other journeys on request.
            </p>
            <a href={waUrl("Salam, I need a quote for a private transfer")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <MessageCircle size={17} /> Ask for a Quote
            </a>
          </div>
        </section>

        {routeGroups.map((group, i) => {
          const items = routes.filter((r) => r.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group} className="section-padding" style={{ backgroundColor: i % 2 ? "#F4F1C6" : "#ffffff" }}>
              <div className="container">
                <h2 style={{ marginBottom: "8px" }}>{group === "GCC" ? "Cross-Border (GCC) Routes" : `${group} Routes`}</h2>
                <p style={{ marginBottom: "28px" }}>{groupBlurb[group]}</p>
                <div className="rg-3" style={{ display: "grid", gap: "20px" }}>
                  {items.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/routes/${r.slug}/`}
                      style={{ display: "block", backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "22px", textDecoration: "none" }}
                    >
                      <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#17351F" }}>{routeTitle(r)}</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "14px", color: "#5C6B5A", marginBottom: "12px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><MapPin size={14} color="#8F6F25" /> {r.distance}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><Clock size={14} color="#8F6F25" /> {r.duration}</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#8F6F25" }}>
                        {r.fromPrice ? `From ${r.fromPrice}` : "Get a quote"} <ArrowRight size={14} style={{ verticalAlign: "-2px" }} />
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
            <h2 style={{ color: "#fff", marginBottom: "14px" }}>Need a Different Route?</h2>
            <p style={{ color: "rgba(255,255,255,0.88)", maxWidth: "560px", margin: "0 auto 28px" }}>
              Tell us where you&apos;re starting and where you&apos;re going, anywhere in the Kingdom, and we&apos;ll quote it.
            </p>
            <Link href="/book-online/" className="btn-primary" style={{ backgroundColor: "#fff", color: "#8F6F25" }}>
              Book Online
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
