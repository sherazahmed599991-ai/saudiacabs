import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Users, Wind, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { ServiceSchema, BreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Umrah Vehicle Fleet — Toyota Camry, Hiace, Coaster, GMC & Staria",
  description:
    "Choose from our clean AC fleet: Toyota Camry (4 seats), Hyundai Staria (7 seats), GMC Yukon (7 seats), Toyota Hiace (11 seats), Toyota Coaster (17 seats). Book on WhatsApp.",
  keywords: [
    "umrah car rental makkah",
    "umrah vehicle fleet saudi arabia",
    "toyota hiace umrah",
    "toyota coaster group transport",
    "gmc umrah luxury car",
    "camry airport transfer makkah",
    "staria umrah madinah",
    "11 seater makkah transport",
    "17 seater group umrah vehicle",
  ],
  alternates: { canonical: "https://saudiacabs.com/fleet/" },
  openGraph: {
    title: "Umrah Vehicle Fleet — Saudia Cabs",
    description: "Toyota Camry, Staria, GMC, Hiace & Coaster — 4 to 17 seats, clean AC vehicles for Umrah pilgrims.",
    url: "https://saudiacabs.com/fleet/",
  },
};

const fleet = [
  { src: "/camry.webp", name: "Toyota Camry", seats: "4 Seater", tag: "Economy", h2: "Book 4-seater Camry for Umrah Taxi Service in Saudi Arabia", desc: "Perfect for individuals or couples. Comfortable, fuel-efficient, and easy to navigate through the holy city." },
  { src: "/staria.webp", name: "Hyundai Staria", seats: "7 Seater", tag: "Premium", h2: "Book 7-seater Staria for Umrah Taxi Service in Saudi Arabia", desc: "Spacious premium MPV ideal for small families. Modern interior with wide seats and ample legroom." },
  { src: "/Gmc.webp", name: "GMC Yukon", seats: "7 Seater", tag: "Luxury", h2: "Book 7-seater GMC for Umrah Taxi Service in Saudi Arabia", desc: "Full-size luxury SUV for those who want a premium experience with extra comfort and style." },
  { src: "/hiace 11 seator.webp", name: "Toyota Hiace", seats: "11 Seater", tag: "Group", h2: "Book 11-seater Hiace for Umrah Taxi Service in Saudi Arabia", desc: "Popular choice for medium-sized groups. Reliable, spacious, and great for Ziyarat tours." },
  { src: "/coaster 17 seator.webp", name: "Toyota Coaster", seats: "17 Seater", tag: "Large Group", h2: "Book 17-seater Coaster for Umrah Taxi Service in Saudi Arabia", desc: "Best for large families or group packages. Comfortable bus-style seating with AC throughout." },
];

const tagColors: Record<string, string> = {
  Economy: "#34a853",
  Premium: "#B5913D",
  Luxury: "#9334e6",
  Group: "#fa7b17",
  "Large Group": "#e8453c",
};

export default function FleetPage() {
  return (
    <>
      <ServiceSchema
        name="Umrah Vehicle Fleet"
        description="Clean AC vehicles from 4 to 17 seats for Umrah pilgrims — Toyota Camry, Hyundai Staria, GMC Yukon, Toyota Hiace, Toyota Coaster."
        url="/fleet/"
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Fleet", url: "/fleet/" }]} />
      <Header />
      <main>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Fleet</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: "42px", fontWeight: "700", marginBottom: "16px" }}>Our Umrah Vehicle Fleet</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "580px", lineHeight: "1.7" }}>
              Toyota Camry, Staria, GMC, Hiace & Coaster — clean AC vehicles from 4 to 17 seats for every group size.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container">
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              {fleet.slice(0, 3).map((car) => (
                <article key={car.name} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ position: "relative", height: "220px", backgroundColor: "#F4F1C6" }}>
                    <Image src={car.src} alt={`${car.name} — ${car.seats} Umrah Vehicle`} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 33vw" />
                    <div style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: tagColors[car.tag] ?? "#B5913D", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "20px" }}>
                      {car.tag}
                    </div>
                  </div>
                  <div style={{ padding: "24px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#B5913D", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{car.name}</p>
                    <h2 style={{ fontSize: "14px", color: "#17351F", marginBottom: "10px", fontWeight: "700", lineHeight: "1.45" }}>{car.h2}</h2>
                    <p style={{ fontSize: "13.5px", color: "#5C6B5A", marginBottom: "16px", lineHeight: "1.65" }}>{car.desc}</p>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#5C6B5A" }}><Users size={14} color="#B5913D" /> {car.seats}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#5C6B5A" }}><Wind size={14} color="#B5913D" /> AC</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#5C6B5A" }}><Sparkles size={14} color="#B5913D" /> Clean</span>
                    </div>
                    <a href={`https://wa.me/966598947503?text=Salam,%20I%20want%20to%20book%20the%20${encodeURIComponent(car.name)}%20(${encodeURIComponent(car.seats)})%20for%20Umrah%20transport`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#25D366", color: "#fff", fontSize: "14px", fontWeight: "600", padding: "10px 22px", borderRadius: "42px", textDecoration: "none" }}>
                      <MessageCircle size={15} /> Book This Car
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="rg-2" style={{ display: "grid", gap: "28px", maxWidth: "760px", margin: "28px auto 0" }}>
              {fleet.slice(3).map((car) => (
                <article key={car.name} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ position: "relative", height: "220px", backgroundColor: "#F4F1C6" }}>
                    <Image src={car.src} alt={`${car.name} — ${car.seats} Umrah Vehicle`} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" />
                    <div style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: tagColors[car.tag] ?? "#B5913D", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "20px" }}>
                      {car.tag}
                    </div>
                  </div>
                  <div style={{ padding: "24px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#B5913D", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{car.name}</p>
                    <h2 style={{ fontSize: "14px", color: "#17351F", marginBottom: "10px", fontWeight: "700", lineHeight: "1.45" }}>{car.h2}</h2>
                    <p style={{ fontSize: "13.5px", color: "#5C6B5A", marginBottom: "16px", lineHeight: "1.65" }}>{car.desc}</p>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#5C6B5A" }}><Users size={14} color="#B5913D" /> {car.seats}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#5C6B5A" }}><Wind size={14} color="#B5913D" /> AC</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#5C6B5A" }}><Sparkles size={14} color="#B5913D" /> Clean</span>
                    </div>
                    <a href={`https://wa.me/966598947503?text=Salam,%20I%20want%20to%20book%20the%20${encodeURIComponent(car.name)}%20(${encodeURIComponent(car.seats)})%20for%20Umrah%20transport`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#25D366", color: "#fff", fontSize: "14px", fontWeight: "600", padding: "10px 22px", borderRadius: "42px", textDecoration: "none" }}>
                      <MessageCircle size={15} /> Book This Car
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "64px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "16px" }}>Not Sure Which Vehicle to Pick?</h2>
            <p style={{ fontSize: "17px", color: "#5C6B5A", marginBottom: "32px" }}>WhatsApp us and we will recommend the best vehicle for your group size.</p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://wa.me/966598947503?text=Salam,%20I%20need%20help%20choosing%20the%20right%20vehicle%20for%20my%20group" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#25D366", color: "#fff", fontSize: "16px", fontWeight: "600", padding: "14px 36px", borderRadius: "42px", textDecoration: "none" }}>
                <MessageCircle size={18} /> Ask on WhatsApp
              </a>
              <Link href="/book-online/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#B5913D", color: "#fff", fontSize: "16px", fontWeight: "600", padding: "14px 36px", borderRadius: "42px", textDecoration: "none" }}>
                Book Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
