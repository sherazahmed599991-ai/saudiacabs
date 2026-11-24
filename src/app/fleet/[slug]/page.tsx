import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, MessageCircle, Sparkles, Users, Wind } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { fleet, getVehicle } from "@/lib/fleet";
import { getRoute, routeTitle } from "@/lib/routes";
import { waUrl } from "@/lib/contact";

export const dynamicParams = false;

export function generateStaticParams() {
  return fleet.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getVehicle(slug);
  if (!v) return {};
  return buildMetadata({
    title: `${v.name} (${v.seats} Seats) for Hire`,
    description: `Private ${v.name} with ${v.seats} seats for Umrah and Saudi Arabia transfers. Air-conditioned, clean, driver included. Get a fixed quote on WhatsApp.`,
    path: `/fleet/${v.slug}/`,
    keywords: [`${v.name.toLowerCase()} hire saudi arabia`, `${v.name.toLowerCase()} umrah`, `${v.seats} seater umrah transport`],
  });
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVehicle(slug);
  if (!v) notFound();

  const quoteMsg = `Salam, I want a quote for the ${v.name} (${v.seats} seats).`;
  const routes = v.routeSlugs.map(getRoute).filter((r): r is NonNullable<typeof r> => !!r);

  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Fleet", url: "/fleet/" },
        { name: v.name, url: `/fleet/${v.slug}/` },
      ]} />
      <FAQSchema faqs={v.faqs} />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <section style={{ backgroundColor: "#184A27", padding: "56px 0" }}>
          <div className="container rg-2" style={{ display: "grid", gap: "40px", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", fontSize: "14px" }}>
                <Link href="/" style={{ color: "rgba(255,255,255,0.75)" }}>Home</Link>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
                <Link href="/fleet/" style={{ color: "rgba(255,255,255,0.75)" }}>Fleet</Link>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
                <span style={{ color: "#fff" }}>{v.name}</span>
              </div>
              <h1 style={{ color: "#fff", marginBottom: "14px" }}>{v.name} — {v.seats} Seats</h1>
              <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "18px", lineHeight: 1.7, marginBottom: "22px" }}>{v.desc}</p>
              <div style={{ display: "flex", gap: "18px", color: "#EDEAD3", fontSize: "15px", marginBottom: "26px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><Users size={16} /> {v.seats} seats</span>
                <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><Wind size={16} /> Air-conditioned</span>
                <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><Sparkles size={16} /> Clean &amp; serviced</span>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a href={waUrl(quoteMsg)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <MessageCircle size={17} /> Get a Fixed Quote
                </a>
                <Link href={`/book-online/?vehicle=${encodeURIComponent(v.name)}`} className="btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.7)" }}>
                  Book Online
                </Link>
              </div>
            </div>
            <div style={{ position: "relative", height: "300px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#F4F1C6" }}>
              <Image src={v.src} alt={`${v.name} — ${v.seats} seat vehicle for Umrah transport`} fill priority style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container" style={{ maxWidth: "860px" }}>
            <h2 style={{ fontSize: "26px", marginBottom: "16px" }}>Ideal for</h2>
            <div className="rg-2" style={{ display: "grid", gap: "14px", marginBottom: "40px" }}>
              {v.idealFor.map((item) => (
                <div key={item} style={{ display: "flex", gap: "12px" }}>
                  <CheckCircle size={20} color="#8F6F25" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "15.5px" }}>{item}</p>
                </div>
              ))}
            </div>

            {routes.length > 0 && (
              <>
                <h2 style={{ fontSize: "26px", marginBottom: "16px" }}>Popular routes for the {v.name}</h2>
                <ul style={{ paddingLeft: "20px", display: "grid", gap: "8px", marginBottom: "12px" }}>
                  {routes.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/routes/${r.slug}/`} style={{ color: "#8F6F25", fontWeight: 600, textDecoration: "underline" }}>{routeTitle(r)}</Link>
                      <span style={{ color: "#5C6B5A" }}> — {r.distance}, {r.duration}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "64px 0" }}>
          <div className="container" style={{ maxWidth: "760px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "40px" }}>Frequently Asked Questions</h2>
            {v.faqs.map(({ q, a }) => (
              <div key={q} style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #E4DEC6" }}>
                <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "8px" }}>{q}</h3>
                <p style={{ fontSize: "15px", lineHeight: 1.7 }}>{a}</p>
              </div>
            ))}
            <p style={{ textAlign: "center", marginTop: "32px" }}>
              <Link href="/fleet/" style={{ color: "#8F6F25", fontWeight: 600, textDecoration: "underline" }}>See the full fleet</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
