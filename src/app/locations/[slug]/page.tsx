import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Clock, MapPin, MessageCircle, Plane } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getLocation, locations } from "@/lib/locations";
import { getRoutesForLocation, routeTitle } from "@/lib/routes";
import { waUrl } from "@/lib/contact";

export const dynamicParams = false;

export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = getLocation(slug);
  if (!loc) return {};

  return buildMetadata({
    title: `Taxi Service in ${loc.name}`,
    description: `Private taxi and chauffeur service in ${loc.name}${loc.airport ? `, including ${loc.airport.code} airport pickups` : ""}. Fixed quotes on WhatsApp, available 24/7.`,
    path: `/locations/${loc.slug}/`,
    keywords: [`taxi ${loc.name.toLowerCase()}`, `private taxi ${loc.name.toLowerCase()}`, `${loc.name.toLowerCase()} chauffeur`],
  });
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = getLocation(slug);
  if (!loc) notFound();

  const related = getRoutesForLocation(loc.slug);
  const quoteMsg = `Salam, I need a private taxi in ${loc.name}.`;

  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Locations", url: "/locations/" },
        { name: loc.name, url: `/locations/${loc.slug}/` },
      ]} />
      <FAQSchema faqs={loc.faqs} />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", fontSize: "14px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.75)" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
              <Link href="/locations/" style={{ color: "rgba(255,255,255,0.75)" }}>Locations</Link>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
              <span style={{ color: "#fff" }}>{loc.name}</span>
            </div>
            <h1 style={{ color: "#fff", marginBottom: "16px" }}>Taxi Service in {loc.name}</h1>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "18px", maxWidth: "680px", lineHeight: 1.75, marginBottom: "24px" }}>
              {loc.summary}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href={waUrl(quoteMsg)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <MessageCircle size={17} /> Get a Fixed Quote
              </a>
              <Link href="/book-online/" className="btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.7)" }}>
                Book Online
              </Link>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container" style={{ maxWidth: "900px" }}>
            {loc.airport && (
              <div style={{ border: "1px solid #E4DEC6", borderRadius: "8px", padding: "20px", backgroundColor: "#F4F1C6", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", marginBottom: "40px" }}>
                <Plane size={22} color="#8F6F25" />
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ fontWeight: 600, color: "#17351F" }}>{loc.airport.name} ({loc.airport.code})</div>
                  <div style={{ fontSize: "14px", color: "#5C6B5A" }}>Send your flight number and we&apos;ll arrange the pickup.</div>
                </div>
                {loc.airportPage && (
                  <Link href={loc.airportPage} style={{ color: "#8F6F25", fontWeight: 600, textDecoration: "underline" }}>
                    Airport transfer details
                  </Link>
                )}
              </div>
            )}

            <h2 style={{ fontSize: "26px", marginBottom: "16px" }}>What we cover in {loc.name}</h2>
            <div className="rg-2" style={{ display: "grid", gap: "14px", marginBottom: "40px" }}>
              {loc.highlights.map((h) => (
                <div key={h} style={{ display: "flex", gap: "12px" }}>
                  <CheckCircle size={20} color="#8F6F25" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "15.5px" }}>{h}</p>
                </div>
              ))}
            </div>

            {related.length > 0 && (
              <>
                <h2 style={{ fontSize: "26px", marginBottom: "16px" }}>Popular routes from {loc.name}</h2>
                <div className="rg-2" style={{ display: "grid", gap: "14px", marginBottom: "24px" }}>
                  {related.map((r) => (
                    <Link key={r.slug} href={`/routes/${r.slug}/`} style={{ display: "block", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "16px", textDecoration: "none", backgroundColor: "#fff" }}>
                      <div style={{ fontWeight: 600, color: "#17351F", marginBottom: "6px" }}>{routeTitle(r)}</div>
                      <div style={{ display: "flex", gap: "14px", fontSize: "13.5px", color: "#5C6B5A", flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><MapPin size={13} color="#8F6F25" /> {r.distance}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock size={13} color="#8F6F25" /> {r.duration}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "64px 0" }}>
          <div className="container" style={{ maxWidth: "760px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "40px" }}>Frequently Asked Questions</h2>
            {loc.faqs.map(({ q, a }) => (
              <div key={q} style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #E4DEC6" }}>
                <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "8px" }}>{q}</h3>
                <p style={{ fontSize: "15px", lineHeight: 1.7 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ backgroundColor: "#184A27", padding: "56px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "14px" }}>Book a Taxi in {loc.name}</h2>
            <p style={{ color: "rgba(255,255,255,0.88)", marginBottom: "28px" }}>Send your pickup, destination and date and we&apos;ll reply with a fixed quote.</p>
            <a href={waUrl(quoteMsg)} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ backgroundColor: "#fff", color: "#8F6F25", display: "inline-flex", gap: "8px", alignItems: "center" }}>
              <MessageCircle size={18} /> WhatsApp +966 59 894 7503
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
