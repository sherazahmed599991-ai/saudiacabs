

import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Car, MapPin, Plane, Users, ArrowRight, Sparkles, Star, CheckCircle, Wind, Shield, HelpCircle, Calendar, MessageCircle, Clock, ShieldCheck, Info, BookOpen, Compass, BadgeCheck, Award } from "lucide-react";
import { LocalBusinessSchema } from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Saudia Cabs — Umrah Transport Makkah, Madinah & Jeddah | Book 24/7",
  description:
    "Saudia Cabs: #1 Umrah transport in Saudi Arabia. Airport transfers Jeddah KAIA & Madinah AMAA, Ziyarat tours, Makkah–Madinah transfers & group packages. Book via WhatsApp +966 59 894 7503.",
  keywords: [
    "umrah transportation makkah",
    "umrah transportation madinah",
    "airport transfer jeddah to makkah",
    "madinah airport to hotel transfer",
    "jeddah KAIA airport transfer",
    "ziyarat tour makkah",
    "ziyarat tour madinah",
    "makkah madinah private transfer",
    "umrah taxi service saudi arabia",
    "umrah car rental makkah",
    "group umrah transport",
    "umrah cab service",
    "saudia cabs",
    "umrah ride booking",
    "airport pickup jeddah umrah",
    "toyota coaster umrah",
    "toyota hiace makkah",
    "holy sites tour saudi arabia",
    "hajj transport saudi arabia",
    "umrah transport whatsapp",
  ],
  alternates: { canonical: "https://saudiacabs.com/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Saudia Cabs",
    title: "Saudia Cabs — #1 Umrah Transport in Makkah, Madinah & Jeddah",
    description:
      "Safe, affordable & reliable Umrah transportation. Airport transfers, Ziyarat tours, Makkah–Madinah transfers & group packages. Available 24/7. Book on WhatsApp.",
    url: "https://saudiacabs.com/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Saudia Cabs — Trusted Umrah Transportation in Saudi Arabia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saudia Cabs — Umrah Transport Makkah, Madinah & Jeddah",
    description:
      "Airport transfers, Ziyarat tours & Makkah–Madinah transfers. Available 24/7. Book on WhatsApp +966 59 894 7503.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const stats = [
  { number: "5000+", label: "Happy Pilgrims" },
  { number: "8+", label: "Years Experience" },
  { number: "50+", label: "Vehicles" },
  { number: "24/7", label: "Support" },
];

const quickLinks = [
  { Icon: Plane, title: "Airport Transfer", desc: "Jeddah & Madinah airports", href: "/services/airport-transfer/" },
  { Icon: MapPin, title: "Ziyarat Tours", desc: "Holy sites in Makkah & Madinah", href: "/services/ziyarat-tours/" },
  { Icon: Car, title: "Our Fleet", desc: "4 to 17 seater vehicles", href: "/fleet/" },
  { Icon: Users, title: "Group Packages", desc: "Families & large groups", href: "/services/group-packages/" },
];

const benefits = [
  { Icon: Clock, title: "Reliable Taxi Service Across Saudi Arabia", desc: "We provide dependable taxi services across major Saudi cities. Our drivers arrive on time and ensure a smooth travel experience." },
  { Icon: ShieldCheck, title: "Professional and Experienced Drivers", desc: "Our drivers are trained, polite, and familiar with local roads. English, Urdu, and Arabic speaking for your comfort." },
  { Icon: Wind, title: "Clean and Well-Maintained Vehicles", desc: "All vehicles are regularly cleaned and serviced for comfort and safety. A pleasant ride guaranteed every time." },
  { Icon: Star, title: "Fixed and Transparent Pricing", desc: "Clear pricing with no hidden charges or surprises. You know the full cost of your ride before confirming your booking." },
];

const fleet = [
  { src: "/camry.webp", name: "Toyota Camry", seats: "4 Seats", type: "Economy", desc: "Comfortable and efficient ride for small families or individuals." },
  { src: "/staria.webp", name: "Hyundai Staria", seats: "7 Seats", type: "Premium MPV", desc: "Futuristic multi-purpose vehicle with premium cabin spacing." },
  { src: "/Gmc.webp", name: "GMC Yukon", seats: "7 Seats", type: "Luxury SUV", desc: "Ultimate styling and luxurious ride for prestigious travel." },
  { src: "/hiace 11 seator.webp", name: "Toyota Hiace", seats: "11 Seats", type: "Group Van", desc: "Spacious passenger van ideal for medium family groups." },
];

const routesPricing = [
  { from: "Jeddah Airport (KAIA)", to: "Makkah Hotel" },
  { from: "Makkah", to: "Madinah" },
  { from: "Madinah", to: "Makkah" },
  { from: "Jeddah", to: "Makkah" },
  { from: "Makkah", to: "Jeddah" },
  { from: "Jeddah", to: "Madinah" },
  { from: "Madinah Airport (AMAA)", to: "Madinah Hotel" },
  { from: "Jeddah Airport (KAIA)", to: "Madinah" },
];

const travelInfo = [
  { route: "Jeddah to Makkah", dist: "85 km", time: "1 hr 15 mins", desc: "Direct route via Makkah First Ring Rd/Route 40." },
  { route: "Makkah to Madinah", dist: "450 km", time: "4 hr 30 mins", desc: "Direct path via Route 15 (Haramain Expressway)." },
  { route: "Jeddah to Madinah", dist: "410 km", time: "4 hr 10 mins", desc: "Mainly via Haramain Expressway Route 15." },
];

const commitments = [
  { Icon: BadgeCheck, title: "Fixed Price Guarantee", desc: "We guarantee that the price we confirm is the final price you pay. No exceptions." },
  { Icon: Award, title: "100% Punctuality", desc: "Our drivers arrive 15 minutes before the pickup time to ensure zero delays." },
  { Icon: Shield, title: "Safe & Sanitized Vehicles", desc: "Vehicles are deep cleaned, sanitized, and safety-checked before every single booking." },
];

const steps = [
  { step: "01", title: "Select Journey Details", desc: "Choose your pickup point, destination, dates, and preferred vehicle from our fleet catalog." },
  { step: "02", title: "Confirm on WhatsApp", desc: "Click our booking buttons to initiate direct chat. We confirm details instantly without credit cards." },
  { step: "03", title: "Meet Driver & Travel", desc: "Your driver tracks your flight and awaits you on-time. Pay directly to driver upon arrival." },
];

const testimonials = [
  { name: "Siddique Ahmed", country: "United Kingdom", text: "Exceptional service! The GMC Yukon was spotless, and the driver was extremely polite. Booking on WhatsApp was finished in less than 2 minutes.", stars: 5 },
  { name: "Zainab Bint Omar", country: "Indonesia", text: "We booked the Toyota Hiace for our family of 9. AC was excellent, and the driver knew all the Ziyarat locations perfectly. Highly recommended!", stars: 5 },
  { name: "Mustafa Kamal", country: "Turkey", text: "Fixed price, clean vehicle, and on-time arrival. Saudia Cabs made our journey between Makkah and Madinah stress-free.", stars: 5 },
];

const tips = [
  { title: "Jeddah Airport Ihram Guide", category: "Pilgrim Guide", readTime: "3 min read", desc: "Learn where to wear your Ihram, perform Niyyah, and handle immigration efficiently at KAIA terminal." },
  { title: "Choosing the Right Vehicle", category: "Fleet Tips", readTime: "2 min read", desc: "A comparison guide between Hyundai Staria and Toyota Hiace depending on baggage size and seating." },
  { title: "Top Ziyarat Sites in Makkah", category: "Holy Cities", readTime: "4 min read", desc: "A checklist of historic places to visit in Makkah, including Jabal al-Noor, Mount Arafat, and Mina." },
];

const faqs = [
  { q: "How do I meet my driver at Jeddah Airport (KAIA)?", a: "Your driver will track your flight arrival time. They will wait for you outside the arrival gate with a nameplate, and will coordinate with you via WhatsApp call/message as soon as you land." },
  { q: "Are the rates fixed or will they change?", a: "All our rates are fully fixed and agreed upon during booking. There are no hidden charges, surge pricing, or extra fees for airport parking or waiting times." },
  { q: "Do you provide baby car seats?", a: "Yes, we can arrange baby seats upon request. Please mention this during your WhatsApp booking confirmation so we can prepare the vehicle accordingly." },
  { q: "How far in advance should I book my ride?", a: "We recommend booking at least 24 hours in advance to guarantee your preferred vehicle size. However, we also cater to last-minute booking requests depending on fleet availability." },
  { q: "What is the average taxi fare from Makkah to Madinah?", a: "The taxi fare from Makkah to Madinah depends on the vehicle type and group size. For a private sedan, fares start from around SAR 450. For accurate pricing, WhatsApp us and we will provide an instant fixed quote for your group." },
  { q: "How to book a taxi in Saudi Arabia?", a: "Booking a taxi with Saudia Cabs is quick and easy. Click any 'Get Quote' or 'Book Now' button on our site to open a direct WhatsApp chat. Share your pickup location, destination, travel date, and preferred vehicle — we confirm within minutes. No credit card required." },
  { q: "What is the taxi fare from Jeddah airport to Makkah?", a: "The fare from Jeddah King Abdulaziz International Airport (KAIA) to Makkah hotels depends on your vehicle choice. We offer fixed, all-inclusive rates with no hidden charges. WhatsApp us for an instant quote based on your group size." },
  { q: "Who is the best Umrah taxi service provider in Saudi Arabia?", a: "Saudia Cabs is a top-rated Umrah taxi service operating since 2016. We specialize in airport transfers, Makkah–Madinah intercity routes, and Ziyarat tours with professional, multilingual drivers and a modern fleet of 50+ vehicles." },
  { q: "What is the fare of Madinah Ziyarat Taxi?", a: "Madinah Ziyarat taxi fares depend on the number of holy sites visited and your group size. We offer custom Ziyarat tour packages covering all major religious and historic sites in Madinah. Request a quote on WhatsApp for a tailored price." },
  { q: "How much does a taxi in KSA charge per hour?", a: "Hourly taxi rates in Saudi Arabia vary by vehicle type. For an accurate per-hour rate for your preferred vehicle (Camry, Staria, GMC, Hiace, or Coaster), please contact us on WhatsApp and we will send you a fixed, all-inclusive quote." },
];

export default function Home() {
  return (
    <>
      <LocalBusinessSchema />
      <Header />
      <main style={{ flex: 1 }}>

        {/* Hero */}
        <section
          className="hero-section"
          style={{
            background: "linear-gradient(135deg, #184A27 0%, #2D663A 100%)",
            color: "#fff",
            padding: "100px 0 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: "-60px", right: "-80px", width: "400px", height: "400px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "300px", height: "300px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
          <div className="container" style={{ position: "relative", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "14px", fontWeight: "500", padding: "6px 16px", borderRadius: "20px", marginBottom: "24px" }}>
              <Sparkles size={15} />
              Trusted Umrah Transportation Since 2016
            </div>
            <h1 className="hero-h1" style={{ color: "#ffffff", fontSize: "52px", fontWeight: "700", marginBottom: "20px", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              Umrah Transportation in <br />
              <span style={{ color: "#ffffff" }}>Makkah, Madinah & Jeddah</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", maxWidth: "620px", margin: "0 auto 40px", lineHeight: "1.75" }}>
              Saudia Cabs provides safe, reliable, and affordable private Umrah transport —
              airport transfers, Ziyarat tours, Makkah–Madinah transfers & group packages. Available 24/7.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="#book" className="btn-primary" style={{ backgroundColor: "#ffffff", color: "#B5913D", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Car size={18} /> Book a Ride
              </Link>
              <Link href="/services/" className="btn-outline" style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.7)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} /> Our Services
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ backgroundColor: "#F4F1C6", padding: "48px 0", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container rg-4" style={{ display: "grid", gap: "32px", textAlign: "center" }}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#B5913D", lineHeight: "1", marginBottom: "8px" }}>{stat.number}</div>
                <div style={{ fontSize: "15px", color: "#5C6B5A", fontWeight: "500" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ADDED SECTION 1: Why Choose Us (Key Benefits Grid) */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Why Choose Saudia Cabs Taxi Service</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A", maxWidth: "550px", margin: "0 auto" }}>
                We combine years of local experience with a modern fleet to provide the ultimate Umrah travel convenience.
              </p>
            </div>
            <div className="rg-4" style={{ display: "grid", gap: "24px" }}>
              {benefits.map(({ Icon, title, desc }) => (
                <div key={title} style={{ padding: "24px", border: "1px solid #E4DEC6", borderRadius: "8px", backgroundColor: "#F4F1C6" }}>
                  <div style={{ width: "40px", height: "40px", backgroundColor: "#F3E9D2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={20} color="#B5913D" />
                  </div>
                  <h3 style={{ fontSize: "16px", color: "#17351F", marginBottom: "8px", fontWeight: "600" }}>{title}</h3>
                  <p style={{ fontSize: "13.5px", color: "#5C6B5A", lineHeight: "1.6" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services quick links */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>#1 Umrah Taxi Services in Saudi Arabia</h2>
              <p style={{ fontSize: "17px", maxWidth: "520px", margin: "0 auto" }}>
                Complete private transport solutions for your sacred journey in Saudi Arabia.
              </p>
            </div>
            <div className="rg-4" style={{ display: "grid", gap: "20px" }}>
              {quickLinks.map(({ Icon, title, desc, href }) => (
                <Link key={title} href={href} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "28px 24px", textDecoration: "none", display: "block", transition: "transform 0.2s" }}>
                  <div style={{ width: "48px", height: "48px", backgroundColor: "#F3E9D2", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={24} color="#B5913D" />
                  </div>
                  <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "6px" }}>{title}</h3>
                  <p style={{ fontSize: "14px", color: "#5C6B5A", marginBottom: "12px" }}>{desc}</p>
                  <span style={{ fontSize: "14px", color: "#B5913D", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                    Learn more <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ backgroundColor: "#ffffff", padding: "80px 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <h2 style={{ marginBottom: "14px" }}>How To Book Your Ride</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>3 simple steps to secure comfortable transport for your pilgrimage.</p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "30px" }}>
              {steps.map(({ step, title, desc }) => (
                <div key={step} style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px", border: "1px solid #E4DEC6", position: "relative" }}>
                  <span style={{ position: "absolute", top: "24px", right: "24px", fontSize: "36px", fontWeight: "800", color: "rgba(181, 145, 61, 0.15)" }}>{step}</span>
                  <h3 style={{ fontSize: "18px", color: "#17351F", marginBottom: "12px" }}>{title}</h3>
                  <p style={{ fontSize: "14.5px", color: "#5C6B5A", lineHeight: "1.6" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Fleet Showroom */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Vehicles Available for Umrah Taxi in Saudi Arabia</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Select the perfect clean, fully air-conditioned ride matching your budget.</p>
            </div>
            <div className="rg-4" style={{ display: "grid", gap: "24px" }}>
              {fleet.map((car) => (
                <div key={car.name} style={{ border: "1px solid #E4DEC6", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
                  <div style={{ position: "relative", height: "180px", backgroundColor: "#F4F1C6" }}>
                    <Image src={car.src} alt={car.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "18px", color: "#17351F" }}>{car.name}</h3>
                      <span style={{ fontSize: "12px", backgroundColor: "#F3E9D2", color: "#8F6F25", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>{car.type}</span>
                    </div>
                    <p style={{ fontSize: "13.5px", color: "#5C6B5A", marginBottom: "16px", flex: 1 }}>{car.desc}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E4DEC6", paddingTop: "12px" }}>
                      <div>
                        <span style={{ fontSize: "12px", color: "#5C6B5A", display: "block" }}>Starting From</span>
                        <strong style={{ fontSize: "15px", color: "#B5913D" }}>Get Quote</strong>
                      </div>
                      <a href={`https://wa.me/966598947503?text=Salam,%20I%20want%20to%20get%20a%20quote%20for%20${encodeURIComponent(car.name)}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", gap: "4px", alignItems: "center", backgroundColor: "#25D366", color: "#ffffff", padding: "8px 12px", borderRadius: "42px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
                        <MessageCircle size={14} /> Book Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Link href="/fleet/" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                View Full Fleet Details <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ADDED SECTION 2: Popular Routes & Pricing Table */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container routes-container" style={{ maxWidth: "700px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Affordable Umrah Taxi Pricing</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Inquire about private transfers for these popular pilgrim routes.</p>
            </div>
            <div style={{ border: "1px solid #E4DEC6", borderRadius: "8px", overflow: "hidden" }}>
              {routesPricing.map((r, i) => (
                <div
                  key={i}
                  className="routes-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "16px 20px",
                    borderBottom: i === routesPricing.length - 1 ? "none" : "1px solid #E4DEC6",
                    backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafaf9",
                  }}
                >
                  <span style={{ fontSize: "14.5px", fontWeight: "600", color: "#17351F", flex: 1 }}>
                    {r.from} <span style={{ color: "#B5913D" }}>↔</span> {r.to}
                  </span>
                  <a
                    href={`https://wa.me/966598947503?text=Salam,%20I%20want%20to%20get%20a%20quote%20for%20transfer%20from%20${encodeURIComponent(r.from)}%20to%20${encodeURIComponent(r.to)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", gap: "4px", alignItems: "center", backgroundColor: "#25D366", color: "#ffffff", padding: "8px 16px", borderRadius: "42px", fontSize: "13px", fontWeight: "600", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    <MessageCircle size={14} /> Get Quote
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ADDED SECTION 3: Travel Distance & Duration Guide */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Route Distance & Duration Guide</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Estimate travel durations and plan your Umrah itinerary accurately.</p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              {travelInfo.map(({ route, dist, time, desc }) => (
                <div key={route} style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "8px", border: "1px solid #E4DEC6" }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#B5913D", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <Compass size={18} /> {route}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px", borderBottom: "1px solid #E4DEC6", paddingBottom: "12px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#5C6B5A", textTransform: "uppercase" }}>Distance</span>
                      <strong style={{ display: "block", fontSize: "16px", color: "#17351F" }}>{dist}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#5C6B5A", textTransform: "uppercase" }}>Avg. Time</span>
                      <strong style={{ display: "block", fontSize: "16px", color: "#17351F" }}>{time}</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: "13.5px", color: "#5C6B5A" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section style={{ backgroundColor: "#184A27", padding: "56px 0" }}>
          <div className="container rg-trust" style={{ display: "grid", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ color: "#fff", marginBottom: "16px" }}>Serving Umrah Pilgrims Since 2016</h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", lineHeight: "1.75", marginBottom: "28px" }}>
                With over 8 years of experience in Umrah transportation, we have helped thousands of pilgrims
                travel safely and comfortably through Makkah, Madinah and Jeddah.
              </p>
              {["Licensed & experienced drivers", "Fixed rates — no hidden charges", "On-time pickup, every time"].map((p) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <CheckCircle size={18} color="#ffffff" />
                  <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)" }}>{p}</span>
                </div>
              ))}
              <Link href="/about/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", color: "#B5913D", fontSize: "15px", fontWeight: "600", padding: "12px 28px", borderRadius: "42px", textDecoration: "none", marginTop: "24px" }}>
                About Us <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "40px", display: "inline-block" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "12px" }}>
                  {[1,2,3,4,5].map((i) => <Star key={i} size={28} color="#D1B969" fill="#D1B969" />)}
                </div>
                <div style={{ fontSize: "48px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>4.9 / 5</div>
                <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)" }}>Rated by 5000+ pilgrims</div>
              </div>
            </div>
          </div>
        </section>

        {/* ADDED SECTION 4: Our Commitments (Safety & Service Guarantees) */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Our Service Guarantees</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A", maxWidth: "500px", margin: "0 auto" }}>
                We believe in complete transparency and maximum satisfaction for our guests of Allah.
              </p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              {commitments.map(({ Icon, title, desc }) => (
                <div key={title} style={{ padding: "30px", border: "1px solid #E4DEC6", borderRadius: "8px", backgroundColor: "#F4F1C6", textAlign: "center" }}>
                  <div style={{ width: "48px", height: "48px", backgroundColor: "#F3E9D2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <Icon size={24} color="#B5913D" />
                  </div>
                  <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "10px", fontWeight: "600" }}>{title}</h3>
                  <p style={{ fontSize: "14px", color: "#5C6B5A", lineHeight: "1.6" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>What Our Customers Say About Our Taxi Services</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Read testimonials from pilgrims who traveled with Saudia Cabs.</p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              {testimonials.map(({ name, country, text, stars }) => (
                <div key={name} style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px", border: "1px solid #E4DEC6" }}>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                    {Array.from({ length: stars }).map((_, i) => <Star key={i} size={16} color="#D1B969" fill="#D1B969" />)}
                  </div>
                  <p style={{ fontSize: "14.5px", color: "#17351F", lineHeight: "1.6", fontStyle: "italic", marginBottom: "20px" }}>&ldquo;{text}&rdquo;</p>
                  <div>
                    <strong style={{ display: "block", fontSize: "15px", color: "#17351F" }}>{name}</strong>
                    <span style={{ fontSize: "12.5px", color: "#5C6B5A" }}>{country}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Areas — Working in Multiple Taxi Services */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Working in Multiple Taxi Services</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Serving pilgrims, tourists, and locals across major Saudi cities — available 24/7.</p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              <div style={{ border: "1px solid #E4DEC6", borderRadius: "8px", padding: "28px", backgroundColor: "#F4F1C6" }}>
                <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
                  <MapPin size={18} color="#B5913D" /> Online Taxi Service in Saudi Arabia Cities
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["Makkah Taxi Service", "Madinah Taxi Service", "Jeddah Taxi Service"].map((city) => (
                    <li key={city} style={{ fontSize: "14px", color: "#184A27", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle size={13} color="#B5913D" /> {city}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ border: "1px solid #E4DEC6", borderRadius: "8px", padding: "28px", backgroundColor: "#F4F1C6" }}>
                <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
                  <Compass size={18} color="#B5913D" /> Ziyarat Taxi Service in Saudi Arabia
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["Makkah Ziyarat Taxi", "Madinah Ziyarat Taxi", "Hajj & Umrah Tours"].map((z) => (
                    <li key={z} style={{ fontSize: "14px", color: "#184A27", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle size={13} color="#B5913D" /> {z}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ border: "1px solid #E4DEC6", borderRadius: "8px", padding: "28px", backgroundColor: "#F4F1C6" }}>
                <h3 style={{ fontSize: "17px", color: "#17351F", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
                  <ArrowRight size={18} color="#B5913D" /> Popular Taxi Routes in Saudi Arabia
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["Jeddah to Makkah Taxi", "Makkah to Jeddah Taxi", "Makkah to Madinah Taxi", "Madinah to Makkah Taxi", "Jeddah to Madinah Taxi"].map((route) => (
                    <li key={route} style={{ fontSize: "14px", color: "#184A27", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle size={13} color="#B5913D" /> {route}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ADDED SECTION 5: Travel Tips & Guides (Blog Sneak Peek) */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Umrah Travel Guides & Tips</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Helpful recommendations and guidelines for preparing your journey.</p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              {tips.map(({ title, category, readTime, desc }) => (
                <div key={title} style={{ border: "1px solid #E4DEC6", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "#B5913D", marginBottom: "10px" }}>
                      <span>{category}</span>
                      <span style={{ color: "#5C6B5A" }}>{readTime}</span>
                    </div>
                    <h3 style={{ fontSize: "18px", color: "#17351F", marginBottom: "10px", fontWeight: "600", lineHeight: "1.4" }}>{title}</h3>
                    <p style={{ fontSize: "13.5px", color: "#5C6B5A", lineHeight: "1.65", marginBottom: "20px", flex: 1 }}>{desc}</p>
                    <a href={`https://wa.me/966598947503?text=Salam,%20I%20want%20to%20know%20more%20about:%20${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13.5px", color: "#25D366", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                      <MessageCircle size={14} /> Book & Ask on WhatsApp <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs (Interactive Accordion using HTML Details) */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container faq-container" style={{ maxWidth: "800px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Frequently Asked Questions</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Find answers to quick questions about our Umrah ride services.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {faqs.map(({ q, a }) => (
                <details key={q} style={{ border: "1px solid #E4DEC6", borderRadius: "8px", backgroundColor: "#ffffff" }}>
                  <summary style={{ padding: "20px 24px", fontSize: "16px", fontWeight: "600", color: "#17351F", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", listStyle: "none" }}>
                    <span>{q}</span>
                    <span style={{ fontSize: "20px", color: "#B5913D" }}>+</span>
                  </summary>
                  <p style={{ padding: "0 24px 24px", fontSize: "14.5px", color: "#5C6B5A", lineHeight: "1.6" }}>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Booking Request Form */}
        <div id="book" style={{ backgroundColor: "#ffffff" }}>
          <ContactForm />
        </div>

      </main>
      <Footer />
      <style>{`
        details summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </>
  );
}


