import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CheckCircle, Star, Car, Shield, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Saudia Cabs",
  description: "Learn about Saudia Cabs — trusted Umrah transportation since 2016.",
};

const whyPoints = [
  { Icon: Shield, title: "Licensed & Experienced", desc: "All our drivers are licensed and trained for Umrah pilgrim transportation." },
  { Icon: Car, title: "Well-Maintained Fleet", desc: "Clean, AC vehicles regularly inspected for safety and comfort." },
  { Icon: Clock, title: "Always On Time", desc: "We track your schedule and ensure pickup is always punctual." },
  { Icon: Star, title: "5000+ Happy Pilgrims", desc: "Trusted by thousands of pilgrims from around the world since 2016." },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>

        {/* Page Header */}
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>About</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: "42px", fontWeight: "700", marginBottom: "16px" }}>About Saudia Cabs</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "560px", lineHeight: "1.7" }}>
              Trusted transportation for Umrah pilgrims since 2016.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding">
          <div className="container rg-2" style={{ display: "grid", gap: "80px", alignItems: "center" }}>
            <div>
              <h2 style={{ marginBottom: "20px" }}>Our Story</h2>
              <p style={{ fontSize: "17px", marginBottom: "20px" }}>
                Saudia Cabs was founded in 2016 with one simple mission — to make Umrah transportation
                stress-free, safe, and affordable for every pilgrim.
              </p>
              <p style={{ fontSize: "17px", marginBottom: "20px" }}>
                We know how sacred your Umrah journey is. Every detail matters — from the moment you
                land at the airport to your final prayer at the holy mosque. That is why we take
                transportation seriously so you can focus entirely on your worship.
              </p>
              <p style={{ fontSize: "17px" }}>
                With a fleet of 50+ vehicles ranging from 4-seater sedans to 17-seater coaches,
                and experienced drivers who know every corner of Makkah and Madinah, we are ready
                to serve you.
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#184A27",
                borderRadius: "12px",
                padding: "48px 40px",
                color: "#fff",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Car size={40} color="#fff" />
              </div>
              <h3 style={{ color: "#fff", fontSize: "26px", marginBottom: "24px" }}>By the Numbers</h3>
              {[
                { n: "2016", l: "Year Founded" },
                { n: "5000+", l: "Pilgrims Served" },
                { n: "50+", l: "Vehicles" },
                { n: "24/7", l: "Available" },
              ].map(({ n, l }) => (
                <div key={l} style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff" }}>{n}</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)" }}>{l}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginTop: "8px" }}>
                {[1,2,3,4,5].map((i) => <Star key={i} size={16} color="#D1B969" fill="#D1B969" />)}
              </div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", marginTop: "6px" }}>Rated 4.9 / 5</div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <h2 style={{ marginBottom: "16px" }}>Why Choose Us?</h2>
              <p style={{ fontSize: "17px", maxWidth: "520px", margin: "0 auto" }}>
                Here is what makes Saudia Cabs the preferred choice for thousands of pilgrims.
              </p>
            </div>
            <div className="rg-4" style={{ display: "grid", gap: "24px" }}>
              {whyPoints.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #E4DEC6",
                    borderRadius: "8px",
                    padding: "28px 24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      backgroundColor: "#F3E9D2",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <Icon size={24} color="#B5913D" />
                  </div>
                  <h3 style={{ fontSize: "17px", marginBottom: "10px", color: "#17351F" }}>{title}</h3>
                  <p style={{ fontSize: "14px", color: "#5C6B5A", lineHeight: "1.65" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="section-padding">
          <div className="container" style={{ maxWidth: "720px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "40px" }}>Our Commitment to You</h2>
            <div className="rg-2" style={{ display: "grid", gap: "16px" }}>
              {[
                "Licensed and insured drivers",
                "Clean, sanitized vehicles",
                "Fixed rates — no surprises",
                "On-time pickup, every time",
                "WhatsApp 24/7 support",
                "English & Arabic speaking drivers",
                "Airport flight tracking",
                "Child seats available on request",
              ].map((point) => (
                <div key={point} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle size={18} color="#B5913D" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "15px", color: "#17351F" }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: "#184A27", padding: "64px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Ready to Travel with Us?</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", marginBottom: "32px" }}>
              Book your ride today and experience the difference.
            </p>
            <Link
              href="/book-online/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#fff",
                color: "#B5913D",
                fontSize: "16px",
                fontWeight: "600",
                padding: "14px 36px",
                borderRadius: "42px",
                textDecoration: "none",
              }}
            >
              Book Now <ArrowRight size={18} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
