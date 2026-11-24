import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { allFaqs, faqGroups } from "@/lib/faqs";
import { waUrl } from "@/lib/contact";

export const metadata: Metadata = buildMetadata({
  title: "FAQ — Booking, Airport & Umrah Transport",
  description:
    "Answers about booking, fixed quotes, airport pickups, Ziyarat and Miqat stops, vehicles and coverage across Saudi Arabia. Ask on WhatsApp for anything else.",
  path: "/faq/",
});

export default function FaqPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "FAQ", url: "/faq/" }]} />
      <FAQSchema faqs={allFaqs} />
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <PageHero
          title="Frequently Asked Questions"
          intro="Quick answers about booking, airport pickups, Umrah services and vehicles. Can't find yours? Message us on WhatsApp."
          crumbs={[{ label: "FAQ" }]}
        />
        <section className="section-padding">
          <div className="container" style={{ maxWidth: "820px" }}>
            {faqGroups.map((g) => (
              <div key={g.title} style={{ marginBottom: "44px" }}>
                <h2 style={{ fontSize: "26px", marginBottom: "20px" }}>{g.title}</h2>
                {g.items.map(({ q, a }) => (
                  <div key={q} style={{ marginBottom: "22px", paddingBottom: "22px", borderBottom: "1px solid #E4DEC6" }}>
                    <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "8px" }}>{q}</h3>
                    <p style={{ fontSize: "15.5px", lineHeight: 1.7 }}>{a}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "56px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "14px" }}>Still Have a Question?</h2>
            <p style={{ marginBottom: "26px" }}>We usually reply within minutes on WhatsApp.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href={waUrl("Salam, I have a question")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <MessageCircle size={17} /> Ask on WhatsApp
              </a>
              <Link href="/contact/" className="btn-outline">Contact Us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
