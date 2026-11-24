import Link from "next/link";
import { ArrowRight, Clock, MapPin, MessageCircle, Plane } from "lucide-react";
import { locations } from "@/lib/locations";
import { routes, routeTitle } from "@/lib/routes";
import { waUrl } from "@/lib/contact";

const chip = {
  display: "inline-block",
  padding: "8px 16px",
  border: "1px solid #E4DEC6",
  borderRadius: "42px",
  backgroundColor: "#fff",
  color: "#184A27",
  fontSize: "14px",
  textDecoration: "none",
} as const;

/** Route cards driven by src/lib/routes.ts. */
export function PopularRoutes() {
  const featured = routes.filter((r) => r.group !== "GCC").slice(0, 8);
  return (
    <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ marginBottom: "14px" }}>Most Popular Private Transfer Routes</h2>
          <p style={{ fontSize: "17px", maxWidth: "560px", margin: "0 auto" }}>
            Distance and travel time for our most requested journeys. Open a route for tips and a fixed WhatsApp quote.
          </p>
        </div>
        <div className="rg-4" style={{ display: "grid", gap: "20px", marginBottom: "32px" }}>
          {featured.map((r) => (
            <Link key={r.slug} href={`/routes/${r.slug}/`} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "22px", textDecoration: "none", display: "block" }}>
              <h3 style={{ fontSize: "16.5px", color: "#17351F", marginBottom: "10px" }}>{routeTitle(r)}</h3>
              <div style={{ display: "grid", gap: "6px", fontSize: "13.5px", color: "#5C6B5A", marginBottom: "14px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><MapPin size={14} color="#8F6F25" /> {r.distance}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Clock size={14} color="#8F6F25" /> {r.duration}</span>
              </div>
              <span style={{ fontSize: "14px", color: "#8F6F25", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                {r.fromPrice ? `From ${r.fromPrice}` : "Get a quote"} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/routes/" className="btn-outline">View all routes</Link>
        </div>
      </div>
    </section>
  );
}

/** City cards driven by src/lib/locations.ts. */
export function ExploreLocations() {
  return (
    <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ marginBottom: "14px" }}>Mainly Umrah — and Taxi Service All Over Saudi Arabia</h2>
          <p style={{ fontSize: "17px", maxWidth: "700px", margin: "0 auto" }}>
            Umrah and Ziyarat transport in Makkah, Madinah and Jeddah is what we do most. We also drive pilgrims,
            tourists, business travelers and locals to other cities across the Kingdom, available 24/7.
          </p>
        </div>
        <div className="rg-4" style={{ display: "grid", gap: "20px", marginBottom: "28px" }}>
          {locations.map((l) => (
            <Link key={l.slug} href={`/locations/${l.slug}/`} style={{ border: "1px solid #E4DEC6", borderRadius: "8px", padding: "22px", backgroundColor: "#F4F1C6", textDecoration: "none", display: "block" }}>
              <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "6px" }}>{l.name}</h3>
              <p style={{ fontSize: "13.5px", lineHeight: 1.55, marginBottom: "10px" }}>{l.tagline}</p>
              {l.airport && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12.5px", color: "#5C6B5A" }}>
                  <Plane size={13} color="#8F6F25" /> {l.airport.code}
                </span>
              )}
            </Link>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: "15px", marginBottom: "20px" }}>
          Another city? Tell us your pickup and destination anywhere in Saudi Arabia and we&apos;ll send a fixed quote on WhatsApp.
        </p>
        <div style={{ textAlign: "center", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/locations/" className="btn-outline">View all locations</Link>
          <a href={waUrl("Salam, I need a private taxi")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle size={17} /> Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/** Travel agents / operators block. Makes no claims beyond what the site already says. */
export function PartnerSection() {
  const points = [
    "Group transport for Umrah operators and travel agents",
    "Vehicles from a 4-seat sedan to a 17-seat Coaster",
    "One point of contact on WhatsApp before and during the trip",
    "Quotes for repeat and multi-vehicle bookings on request",
  ];
  return (
    <section className="section-padding" style={{ backgroundColor: "#184A27" }}>
      <div className="container rg-2" style={{ display: "grid", gap: "40px", alignItems: "center" }}>
        <div>
          <h2 style={{ color: "#fff", marginBottom: "14px" }}>Transfers for Travel Agents &amp; Groups</h2>
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "17px" }}>
            Running Umrah groups or corporate travel? Tell us your dates, group size and routes and we&apos;ll put together a
            transport plan and quote.
          </p>
        </div>
        <div>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "10px", marginBottom: "24px" }}>
            {points.map((p) => (
              <li key={p} style={{ color: "#EDEAD3", fontSize: "15.5px", display: "flex", gap: "10px" }}>
                <span aria-hidden="true" style={{ color: "#D1B969" }}>✓</span> {p}
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/services/group-packages/" className="btn-primary" style={{ backgroundColor: "#fff", color: "#8F6F25" }}>Group Packages</Link>
            <a href={waUrl("Salam, I'm a travel agent / group organiser and need a transport quote")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <MessageCircle size={17} /> Talk to Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** SEO-friendly link clouds to every route and city page. */
export function LinkCloud() {
  return (
    <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6" }}>
      <div className="container">
        <h2 style={{ fontSize: "26px", marginBottom: "18px" }}>The most popular transfers</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "36px" }}>
          {routes.map((r) => (
            <Link key={r.slug} href={`/routes/${r.slug}/`} style={chip}>{routeTitle(r)}</Link>
          ))}
          <Link href="/routes/" style={{ ...chip, fontWeight: 600, color: "#8F6F25" }}>View all routes →</Link>
        </div>
        <h2 style={{ fontSize: "26px", marginBottom: "18px" }}>Where we operate</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {locations.map((l) => (
            <Link key={l.slug} href={`/locations/${l.slug}/`} style={chip}>Taxi in {l.name}</Link>
          ))}
          <Link href="/locations/" style={{ ...chip, fontWeight: 600, color: "#8F6F25" }}>View all locations →</Link>
        </div>
      </div>
    </section>
  );
}
