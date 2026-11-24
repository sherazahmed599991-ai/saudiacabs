import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import GeneralInquiryForm from "@/components/GeneralInquiryForm";
import { BreadcrumbSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Partner With Us — Travel Agents & Groups",
  description:
    "Transport for Umrah operators, travel agents and corporate groups across Saudi Arabia. Tell us your dates and routes and we'll send a quote.",
  path: "/partners/",
});

const benefits = [
  "Group transport for Umrah operators and travel agents",
  "Vehicles from a 4-seat sedan to a 17-seat Coaster, with multiple vehicles for larger groups",
  "A single WhatsApp contact before and during the trip",
  "Quotes for repeat bookings and multi-day itineraries on request",
  "Airport pickups, Makkah–Madinah transfers, Ziyarat and Miqat stops",
];

export default function PartnersPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Partners", url: "/partners/" }]} />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <PageHero
          title="Partner With Saudia Cabs"
          intro="Running Umrah groups, a travel agency or corporate travel? Tell us about your trips and we'll put together a transport plan and quote."
          crumbs={[{ label: "Partners" }]}
        />
        <section className="section-padding" style={{ paddingBottom: 0 }}>
          <div className="container" style={{ maxWidth: "820px" }}>
            <h2 style={{ fontSize: "26px", marginBottom: "18px" }}>What we can do for your groups</h2>
            <div style={{ display: "grid", gap: "12px", marginBottom: "12px" }}>
              {benefits.map((b) => (
                <div key={b} style={{ display: "flex", gap: "12px" }}>
                  <CheckCircle size={20} color="#8F6F25" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "15.5px" }}>{b}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "20px" }}>
              Looking to drive with us instead? See <Link href="/partners/driver-registration/" style={{ color: "#8F6F25", fontWeight: 600, textDecoration: "underline" }}>driver registration</Link>.
            </p>
          </div>
        </section>
        <GeneralInquiryForm
          serviceType="Partner Inquiry"
          heading="Request Partner Pricing"
          messageLabel="Your trips"
          messagePlaceholder="Company name, group sizes, routes and dates you need transport for"
        />
      </main>
      <Footer />
    </>
  );
}
