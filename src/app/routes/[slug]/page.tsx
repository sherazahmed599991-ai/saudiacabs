import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Clock, MapPin, MessageCircle, Car } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getRoute, routes, routeTitle } from "@/lib/routes";
import { getLocation } from "@/lib/locations";
import { waUrl } from "@/lib/contact";

export const dynamicParams = false;

export function generateStaticParams() {
  return routes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) return {};

  const name = routeTitle(route);
  const title = `${name} Private Transfer`;
  return buildMetadata({
    title,
    // Titles over 46 chars skip the " | Saudia Cabs" suffix to stay near 60.
    absoluteTitle: title.length > 46 ? title : undefined,
    description: `Private taxi from ${route.from} to ${route.to}: ${route.distance}, ${route.duration}. Fixed quote on WhatsApp, available 24/7.`,
    path: `/routes/${route.slug}/`,
    keywords: [`${route.from} to ${route.to}`, `${route.from} to ${route.to} taxi`, `${route.to} private transfer`],
  });
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) notFound();

  const name = routeTitle(route);
  const quoteMsg = `Salam, I need a quote for a private transfer from ${route.from} to ${route.to}.`;
  const cities = route.locationSlugs.map(getLocation).filter((l): l is NonNullable<typeof l> => !!l);

  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Routes", url: "/routes/" },
        { name: name, url: `/routes/${route.slug}/` },
      ]} />
      <FAQSchema faqs={route.faqs} />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", fontSize: "14px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.75)" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
              <Link href="/routes/" style={{ color: "rgba(255,255,255,0.75)" }}>Routes</Link>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
              <span style={{ color: "#fff" }}>{name}</span>
            </div>
            <h1 style={{ color: "#fff", marginBottom: "16px" }}>{name} Private Transfer</h1>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "18px", maxWidth: "680px", lineHeight: 1.75, marginBottom: "24px" }}>
              {route.summary}
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
          <div className="container" style={{ maxWidth: "860px" }}>
            <div className="rg-3" style={{ display: "grid", gap: "16px", marginBottom: "40px" }}>
              {[
                { Icon: MapPin, label: "Distance", value: route.distance },
                { Icon: Clock, label: "Travel time", value: route.duration },
                { Icon: Car, label: "Price", value: route.fromPrice ? `From ${route.fromPrice}` : "Fixed quote on WhatsApp" },
              ].map(({ Icon, label, value }) => (
                <div key={label} style={{ border: "1px solid #E4DEC6", borderRadius: "8px", padding: "18px", backgroundColor: "#F4F1C6" }}>
                  <Icon size={18} color="#8F6F25" />
                  <div style={{ fontSize: "13px", color: "#5C6B5A", margin: "8px 0 2px" }}>{label}</div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#17351F" }}>{value}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "13.5px", marginBottom: "36px" }}>
              Distances and times are approximate road figures and vary with traffic, season and the exact pickup and drop-off points.
            </p>

            <h2 style={{ fontSize: "26px", marginBottom: "16px" }}>Tips for this journey</h2>
            <div style={{ display: "grid", gap: "12px", marginBottom: "36px" }}>
              {route.tips.map((t) => (
                <div key={t} style={{ display: "flex", gap: "12px" }}>
                  <CheckCircle size={20} color="#8F6F25" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "15.5px" }}>{t}</p>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: "26px", marginBottom: "12px" }}>Choosing a vehicle</h2>
            <p style={{ marginBottom: "12px" }}>{route.vehicleAdvice}</p>
            <p style={{ marginBottom: "36px" }}>
              See the <Link href="/fleet/" style={{ color: "#8F6F25", fontWeight: 600, textDecoration: "underline" }}>full fleet</Link> and tell us your group size and luggage when you ask for a quote.
            </p>

            {(route.related?.length || cities.length) ? (
              <>
                <h2 style={{ fontSize: "26px", marginBottom: "12px" }}>Related</h2>
                <ul style={{ paddingLeft: "20px", marginBottom: "12px", display: "grid", gap: "8px" }}>
                  {route.related?.map((r) => (
                    <li key={r.href}><Link href={r.href} style={{ color: "#8F6F25", fontWeight: 600, textDecoration: "underline" }}>{r.label}</Link></li>
                  ))}
                  {cities.map((c) => (
                    <li key={c.slug}><Link href={`/locations/${c.slug}/`} style={{ color: "#8F6F25", fontWeight: 600, textDecoration: "underline" }}>Taxi service in {c.name}</Link></li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </section>

        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "64px 0" }}>
          <div className="container" style={{ maxWidth: "760px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "40px" }}>Frequently Asked Questions</h2>
            {route.faqs.map(({ q, a }) => (
              <div key={q} style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #E4DEC6" }}>
                <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "8px" }}>{q}</h3>
                <p style={{ fontSize: "15px", lineHeight: 1.7 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ backgroundColor: "#184A27", padding: "56px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "14px" }}>Book {name}</h2>
            <p style={{ color: "rgba(255,255,255,0.88)", marginBottom: "28px" }}>Send your date, passengers and luggage and we&apos;ll reply with a fixed quote.</p>
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
