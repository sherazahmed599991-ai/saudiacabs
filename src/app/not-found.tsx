import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <section className="section-padding">
          <div className="container" style={{ maxWidth: "620px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#8F6F25", letterSpacing: "0.08em", marginBottom: "12px" }}>
              ERROR 404
            </p>
            <h1 style={{ marginBottom: "16px" }}>We couldn&apos;t find that page</h1>
            <p style={{ marginBottom: "32px" }}>
              The page may have moved or the link may be wrong. You can head back to the homepage, browse our services,
              or message us on WhatsApp and we&apos;ll help right away.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" className="btn-primary">Back to Home</Link>
              <Link href="/services/" className="btn-outline">View Services</Link>
              <a
                href="https://wa.me/966598947503"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
