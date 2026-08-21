import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Car, MapPin, Plane, Users, ArrowRight, Sparkles, Star, Wind, MessageCircle, Clock, ShieldCheck, DollarSign, Landmark, Mountain } from "lucide-react";
import { LocalBusinessSchema, WebsiteSchema, FAQSchema } from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Saudia Cabs — Private Umrah Taxi & Transportation in Saudi Arabia",
  description:
    "Private Umrah taxi and airport transfers across Saudi Arabia — Makkah, Madinah, Jeddah, Riyadh, AlUla & Taif. Fixed quotes on WhatsApp, available 24/7.",
  keywords: [
    "umrah taxi saudi arabia",
    "private taxi makkah madinah jeddah",
    "airport transfer jeddah to makkah",
    "madinah airport to hotel transfer",
    "riyadh airport taxi",
    "alula airport taxi",
    "taif airport taxi",
    "miqat transfer taxi",
    "ziyarat tour makkah",
    "ziyarat tour madinah",
    "makkah madinah private transfer",
    "umrah car rental makkah",
    "group umrah transport",
    "saudia cabs",
    "umrah ride booking",
    "toyota coaster umrah",
    "toyota hiace makkah",
  ],
  alternates: { canonical: "https://saudiacabs.com/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Saudia Cabs",
    title: "Saudia Cabs — Private Umrah Taxi & Transportation in Saudi Arabia",
    description:
      "Private taxi and chauffeur transfers across Makkah, Madinah, Jeddah, Riyadh, AlUla and Taif — airport transfers, Ziyarat, Miqat and intercity journeys. Book on WhatsApp, 24/7.",
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
    title: "Saudia Cabs — Private Umrah Taxi & Transportation in Saudi Arabia",
    description:
      "Airport transfers, Ziyarat, Miqat and intercity transfers across Saudi Arabia. Book on WhatsApp +966 59 894 7503.",
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

const trustPoints = [
  { Icon: Clock, title: "24/7 Support", desc: "Booking support and driver availability around the clock, whenever your flight lands." },
  { Icon: Car, title: "Private Door-to-Door Transfers", desc: "No shared shuttle stops — your private vehicle takes your group directly to its destination." },
  { Icon: ShieldCheck, title: "Experienced Drivers", desc: "Drivers familiar with Saudi routes and pilgrim travel, speaking English, Urdu and Arabic." },
  { Icon: Wind, title: "Clean, Comfortable Vehicles", desc: "All vehicles are regularly cleaned and serviced for a comfortable, safe ride." },
  { Icon: DollarSign, title: "Fixed Quotes", desc: "You know the agreed fare before confirming — no meters, no hidden charges." },
  { Icon: MessageCircle, title: "WhatsApp Booking", desc: "Send your trip details and get a fixed quote back in minutes, no app download needed." },
];

const popularRoutes = [
  { route: "Jeddah Airport → Makkah", desc: "Private transfer from KAIA directly to your Makkah hotel.", href: "/services/airport-transfer/jeddah/" },
  { route: "Jeddah Airport → Madinah", desc: "Private transfer from KAIA directly to your Madinah hotel.", href: "/services/airport-transfer/jeddah/" },
  { route: "Makkah → Madinah", desc: "Direct intercity transfer, around 4–5 hours by road.", href: "/services/makkah-madinah-transfer/" },
  { route: "Madinah → Makkah", desc: "Direct intercity transfer, around 4–5 hours by road.", href: "/services/makkah-madinah-transfer/" },
  { route: "Makkah → Jeddah Airport", desc: "Departure transfer timed to get you there on time.", href: "/services/airport-transfer/jeddah/" },
  { route: "Madinah → Jeddah Airport", desc: "Departure transfer timed to get you there on time.", href: "/services/airport-transfer/jeddah/" },
];

const airports = [
  { Icon: Plane, name: "Jeddah Airport (KAIA)", href: "/services/airport-transfer/jeddah/" },
  { Icon: Plane, name: "Madinah Airport (AMAA)", href: "/services/airport-transfer/madinah/" },
  { Icon: Landmark, name: "Riyadh Airport", href: "/services/airport-transfer/riyadh/" },
  { Icon: Mountain, name: "AlUla Airport", href: "/services/airport-transfer/alula/" },
  { Icon: MapPin, name: "Taif Airport", href: "/services/airport-transfer/taif/" },
];

const umrahServices = [
  { title: "Jeddah Airport to Makkah", desc: "Arrival transfer straight to your Makkah hotel.", href: "/services/airport-transfer/jeddah/" },
  { title: "Makkah to Madinah", desc: "Direct intercity transfer between the two holy cities.", href: "/services/makkah-madinah-transfer/" },
  { title: "Madinah to Makkah", desc: "Direct intercity transfer, either direction.", href: "/services/makkah-madinah-transfer/" },
  { title: "Makkah Ziyarat", desc: "Guided visits to Jabal Noor, Jabal Thawr and more.", href: "/services/ziyarat-tours/" },
  { title: "Madinah Ziyarat", desc: "Guided visits to Jabal Uhud, Quba Mosque and more.", href: "/services/ziyarat-tours/" },
  { title: "Miqat Transfers", desc: "A stop at your Miqat to enter Ihram, then on to Makkah.", href: "/services/miqat-transfer/" },
];

const fleet = [
  { src: "/camry.webp", name: "Toyota Camry", seats: 4, bestFor: "Couples / small families" },
  { src: "/staria.webp", name: "Hyundai Staria", seats: 7, bestFor: "Families" },
  { src: "/Gmc.webp", name: "GMC Yukon", seats: 7, bestFor: "Premium / luxury" },
  { src: "/hiace 11 seator.webp", name: "Toyota Hiace", seats: 11, bestFor: "Groups" },
  { src: "/coaster 17 seator.webp", name: "Toyota Coaster", seats: 17, bestFor: "Larger groups" },
];

const whyUs = [
  { title: "Private Vehicle", desc: "Your group travels together without shared shuttle stops." },
  { title: "Door-to-Door Service", desc: "Pickup from airport, hotel or another agreed location." },
  { title: "Professional Drivers", desc: "Experienced drivers familiar with Saudi routes and pilgrim travel." },
  { title: "Clear Pricing", desc: "Know your agreed fare before confirming." },
  { title: "WhatsApp Support", desc: "Easy communication before and during your journey." },
  { title: "24/7 Availability", desc: "Booking support whenever you need it." },
];

const bookingSteps = [
  { step: "01", title: "Send Your Trip Details", desc: "Pickup, destination, date, time, passengers and vehicle preference." },
  { step: "02", title: "Get Your Quote", desc: "We'll confirm the vehicle and agreed fare on WhatsApp." },
  { step: "03", title: "Meet Your Driver", desc: "Your driver arrives at the agreed pickup point and takes you directly to your destination." },
];

const testimonials = [
  { name: "Siddique Ahmed", country: "United Kingdom", text: "Exceptional service! The GMC Yukon was spotless, and the driver was extremely polite. Booking on WhatsApp was finished in less than 2 minutes.", stars: 5 },
  { name: "Zainab Bint Omar", country: "Indonesia", text: "We booked the Toyota Hiace for our family of 9. AC was excellent, and the driver knew all the Ziyarat locations perfectly. Highly recommended!", stars: 5 },
  { name: "Mustafa Kamal", country: "Turkey", text: "Fixed price, clean vehicle, and on-time arrival. Saudia Cabs made our journey between Makkah and Madinah stress-free.", stars: 5 },
];

const cityServices = [
  { name: "Makkah", desc: "Private taxis, airport transfers, Ziyarat and Miqat transfers." },
  { name: "Madinah", desc: "Airport transfers, hotel transfers and Ziyarat tours." },
  { name: "Jeddah", desc: "Airport transfers and private intercity taxis." },
];

const tips = [
  { title: "Jeddah Airport to Makkah: What Pilgrims Should Know", category: "Pilgrim Guide", readTime: "3 min read", desc: "Where to wear Ihram, perform Niyyah, and handle immigration efficiently at KAIA terminal." },
  { title: "Makkah to Madinah Taxi Guide", category: "Route Guide", readTime: "3 min read", desc: "What to expect on the intercity journey, travel time, and how to book a direct transfer." },
  { title: "Choosing the Right Taxi for Your Umrah Group", category: "Fleet Tips", readTime: "2 min read", desc: "A comparison guide between our vehicles depending on group size and baggage." },
];

const faqs: { q: string; a: string; related?: { label: string; href: string } }[] = [
  { q: "How much is a private taxi from Jeddah Airport to Makkah?", a: "The fare depends on your vehicle choice and group size. We offer fixed, all-inclusive rates with no hidden charges — WhatsApp us for an instant quote.", related: { label: "View our Jeddah Airport transfer service", href: "/services/airport-transfer/jeddah/" } },
  { q: "Do you offer private Makkah to Madinah transfers?", a: "Yes. Direct, private intercity transfers between Makkah and Madinah, around 4–5 hours by road. Fares for a private sedan start from around SAR 450 — WhatsApp us for an exact quote.", related: { label: "See our Makkah–Madinah transfer service", href: "/services/makkah-madinah-transfer/" } },
  { q: "Can I book a taxi from Madinah Airport?", a: "Yes. We provide transfers from Prince Mohammad Bin Abdulaziz Airport (AMAA) directly to your Madinah hotel, and onward to Makkah if needed.", related: { label: "Explore our Madinah Airport transfer", href: "/services/airport-transfer/madinah/" } },
  { q: "How do I book a taxi on WhatsApp?", a: "Click any 'Get Quote' or 'Book Now' button on our site to open a direct WhatsApp chat. Share your pickup location, destination, travel date and preferred vehicle — we confirm within minutes. No credit card required.", related: { label: "Visit our booking page", href: "/contact/" } },
  { q: "Can I choose my vehicle?", a: "Yes. Tell us your group size and preference and we'll confirm availability — from a 4-seater Camry to a 17-seater Coaster.", related: { label: "See our full fleet", href: "/fleet/" } },
  { q: "Do you provide Ziyarat taxi services?", a: "Yes. Private guided Ziyarat tours to the major holy sites in both Makkah and Madinah, with drivers who know every location.", related: { label: "Explore our Ziyarat tours", href: "/services/ziyarat-tours/" } },
  { q: "Do you provide Miqat transfers?", a: "Yes. We stop at the correct Miqat boundary point for your route so you can enter Ihram, then continue directly to Makkah — no extra charge for the wait.", related: { label: "Learn more about Miqat transfers", href: "/services/miqat-transfer/" } },
  { q: "How do I meet my driver at the airport?", a: "Your driver tracks your flight arrival time and waits at the arrivals area with a nameplate, coordinating with you by WhatsApp as soon as you land." },
  { q: "Are your prices fixed?", a: "Yes. All our rates are agreed and fixed during booking — no hidden charges, surge pricing, or extra fees for waiting time." },
  { q: "Which cities and airports do you serve?", a: "We operate across Makkah, Madinah, Jeddah, Riyadh, AlUla and Taif, including transfers from Jeddah (KAIA), Madinah (AMAA), Riyadh, AlUla and Taif airports.", related: { label: "See all airport transfer options", href: "/services/airport-transfer/" } },
];

export default function Home() {
  return (
    <>
      <LocalBusinessSchema />
      <WebsiteSchema />
      <FAQSchema faqs={faqs} />
      <Header />
      <main style={{ flex: 1 }}>

        {/* 1. Hero */}
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
              Private Umrah Taxi &amp; Transportation <br />
              <span style={{ color: "#ffffff" }}>in Saudi Arabia</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", maxWidth: "660px", margin: "0 auto 32px", lineHeight: "1.75" }}>
              Reliable private taxi and chauffeur transfers across Makkah, Madinah, Jeddah, Riyadh, AlUla and Taif —
              including airport transfers, intercity journeys, Ziyarat and Miqat stops. Book your private car 24/7 through WhatsApp.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
              <a
                href="https://wa.me/966598947503?text=Salam,%20I%20want%20to%20get%20a%20fixed%20quote%20for%20a%20private%20taxi"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ backgroundColor: "#ffffff", color: "#B5913D", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <MessageCircle size={18} /> Get a Fixed Quote on WhatsApp
              </a>
              <Link href="/services/" className="btn-outline" style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.7)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} /> View Taxi Services
              </Link>
            </div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", letterSpacing: "0.02em" }}>
              24/7 Booking &nbsp;·&nbsp; Private Cars &nbsp;·&nbsp; Fixed Quotes &nbsp;·&nbsp; Professional Drivers
            </p>
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

        {/* 2. Trust / Service Benefits */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Why Travelers Choose Saudia Cabs</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A", maxWidth: "550px", margin: "0 auto" }}>
                We combine years of local experience with a modern fleet to provide the ultimate Umrah travel convenience.
              </p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
              {trustPoints.map(({ Icon, title, desc }) => (
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

        {/* 3. Popular Routes */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Popular Saudi Taxi Routes</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A", maxWidth: "520px", margin: "0 auto" }}>
                Our most requested private transfers — each route page has full details and a fixed-quote WhatsApp link.
              </p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "20px" }}>
              {popularRoutes.map(({ route, desc, href }, i) => (
                <Link key={i} href={href} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "24px", textDecoration: "none", display: "block" }}>
                  <h3 style={{ fontSize: "16px", color: "#17351F", marginBottom: "8px" }}>{route}</h3>
                  <p style={{ fontSize: "13.5px", color: "#5C6B5A", marginBottom: "14px" }}>{desc}</p>
                  <span style={{ fontSize: "14px", color: "#B5913D", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                    Get Quote <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Airport Transfers */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Private Airport Transfers in Saudi Arabia</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A", maxWidth: "640px", margin: "0 auto" }}>
                Arriving in Saudi Arabia? Book a private airport transfer with a dedicated vehicle and driver.
                We provide door-to-door transfers from Jeddah, Madinah and other major airports to hotels and
                destinations across the Kingdom.
              </p>
            </div>
            <div className="rg-4" style={{ display: "grid", gap: "20px" }}>
              {airports.map(({ Icon, name, href }) => (
                <Link key={name} href={href} style={{ backgroundColor: "#F4F1C6", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "24px 20px", textDecoration: "none", display: "block", textAlign: "center" }}>
                  <div style={{ width: "44px", height: "44px", backgroundColor: "#F3E9D2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Icon size={22} color="#B5913D" />
                  </div>
                  <h3 style={{ fontSize: "15px", color: "#17351F", marginBottom: "10px" }}>{name}</h3>
                  <span style={{ fontSize: "13px", color: "#B5913D", fontWeight: "500" }}>View details →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Umrah & Ziyarat Services */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Umrah Taxi Services</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Everything your Umrah journey needs, in one place.</p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "20px" }}>
              {umrahServices.map(({ title, desc, href }) => (
                <Link key={title} href={href} style={{ backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "24px", textDecoration: "none", display: "block" }}>
                  <h3 style={{ fontSize: "16px", color: "#17351F", marginBottom: "8px" }}>{title}</h3>
                  <p style={{ fontSize: "13.5px", color: "#5C6B5A", marginBottom: "14px" }}>{desc}</p>
                  <span style={{ fontSize: "14px", color: "#B5913D", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                    Learn more <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Fleet */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Choose the Right Vehicle for Your Journey</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Select the perfect clean, fully air-conditioned ride matching your group size.</p>
            </div>
            <div className="table-scroll" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #E4DEC6", borderRadius: "8px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F4F1C6" }}>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#5C6B5A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vehicle</th>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#5C6B5A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Passengers</th>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: "13px", color: "#5C6B5A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Best For</th>
                    <th style={{ padding: "14px 16px" }} />
                  </tr>
                </thead>
                <tbody>
                  {fleet.map((car, i) => (
                    <tr key={car.name} style={{ borderTop: "1px solid #E4DEC6", backgroundColor: i % 2 === 0 ? "#fff" : "#fafaf9" }}>
                      <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ position: "relative", width: "56px", height: "40px", borderRadius: "4px", overflow: "hidden", flexShrink: 0 }}>
                          <Image src={car.src} alt={`${car.name} — Umrah taxi in Saudi Arabia`} fill style={{ objectFit: "cover" }} />
                        </div>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#17351F" }}>{car.name}</span>
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#5C6B5A" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><Users size={14} color="#B5913D" /> {car.seats}</span>
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#5C6B5A" }}>{car.bestFor}</td>
                      <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                        <Link href="/fleet/" style={{ fontSize: "13.5px", color: "#B5913D", fontWeight: "600", textDecoration: "none", marginRight: "16px" }}>View Vehicle →</Link>
                        <a href={`https://wa.me/966598947503?text=Salam,%20I%20want%20to%20get%20a%20quote%20for%20${encodeURIComponent(car.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13.5px", color: "#25D366", fontWeight: "600", textDecoration: "none" }}>Get Quote →</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 7. Why Saudia Cabs */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Why Book With Saudia Cabs?</h2>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
              {whyUs.map(({ title, desc }) => (
                <div key={title} style={{ padding: "24px", border: "1px solid #E4DEC6", borderRadius: "8px", backgroundColor: "#fff" }}>
                  <h3 style={{ fontSize: "16px", color: "#17351F", marginBottom: "8px", fontWeight: "600" }}>{title}</h3>
                  <p style={{ fontSize: "13.5px", color: "#5C6B5A", lineHeight: "1.6" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. How Booking Works */}
        <section style={{ backgroundColor: "#ffffff", padding: "80px 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <h2 style={{ marginBottom: "14px" }}>Book Your Private Taxi in 3 Steps</h2>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "30px", marginBottom: "40px" }}>
              {bookingSteps.map(({ step, title, desc }) => (
                <div key={step} style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px", border: "1px solid #E4DEC6", position: "relative" }}>
                  <span style={{ position: "absolute", top: "24px", right: "24px", fontSize: "36px", fontWeight: "800", color: "rgba(181, 145, 61, 0.15)" }}>{step}</span>
                  <h3 style={{ fontSize: "18px", color: "#17351F", marginBottom: "12px" }}>{title}</h3>
                  <p style={{ fontSize: "14.5px", color: "#5C6B5A", lineHeight: "1.6" }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <a
                href="https://wa.me/966598947503?text=Salam,%20I%20want%20to%20book%20a%20private%20taxi"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <MessageCircle size={18} /> Get a Quote on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* 9. Customer Reviews */}
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

        {/* 10. Makkah / Madinah / Jeddah services */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Taxi Services Across Saudi Arabia</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Serving pilgrims, tourists, and locals across major Saudi cities — available 24/7.</p>
            </div>
            <div className="rg-3" style={{ display: "grid", gap: "24px", marginBottom: "36px" }}>
              {cityServices.map(({ name, desc }) => (
                <div key={name} style={{ border: "1px solid #E4DEC6", borderRadius: "8px", padding: "24px", backgroundColor: "#F4F1C6" }}>
                  <h3 style={{ fontSize: "16px", color: "#17351F", marginBottom: "8px", fontWeight: "700" }}>{name}</h3>
                  <p style={{ fontSize: "13.5px", color: "#5C6B5A", lineHeight: "1.6" }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/services/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#B5913D", fontSize: "15px", fontWeight: "600", textDecoration: "none" }}>
                View All Saudi Taxi Services <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 11. Umrah Travel Guides */}
        <section className="section-padding" style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", borderBottom: "1px solid #E4DEC6" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Umrah Travel Guides</h2>
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
                      <MessageCircle size={14} /> Ask on WhatsApp <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. FAQ */}
        <section className="section-padding" style={{ backgroundColor: "#ffffff" }}>
          <div className="container faq-container" style={{ maxWidth: "800px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ marginBottom: "14px" }}>Frequently Asked Questions</h2>
              <p style={{ fontSize: "17px", color: "#5C6B5A" }}>Find answers to quick questions about our Umrah ride services.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {faqs.map(({ q, a, related }) => (
                <details key={q} style={{ border: "1px solid #E4DEC6", borderRadius: "8px", backgroundColor: "#F4F1C6" }}>
                  <summary style={{ padding: "20px 24px", fontSize: "16px", fontWeight: "600", color: "#17351F", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", listStyle: "none" }}>
                    <span>{q}</span>
                    <span style={{ fontSize: "20px", color: "#B5913D" }}>+</span>
                  </summary>
                  <p style={{ padding: "0 24px 24px", fontSize: "14.5px", color: "#5C6B5A", lineHeight: "1.6" }}>
                    {a}
                    {related && (
                      <>
                        {" "}
                        <Link href={related.href} style={{ color: "#B5913D", fontWeight: "600" }}>
                          {related.label} <ArrowRight size={12} style={{ display: "inline" }} />
                        </Link>
                      </>
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 13. Final CTA */}
        <section style={{ backgroundColor: "#184A27", padding: "64px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>Ready to Book Your Private Saudi Taxi?</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "17px", maxWidth: "560px", margin: "0 auto 32px", lineHeight: "1.7" }}>
              Tell us your pickup location, destination, travel date and number of passengers.
              We&apos;ll help you choose the right vehicle and provide a clear quote.
            </p>
            <a
              href="https://wa.me/966598947503?text=Salam,%20I%20want%20to%20book%20a%20private%20taxi"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", color: "#B5913D", fontSize: "16px", fontWeight: "700", padding: "14px 40px", borderRadius: "42px", textDecoration: "none" }}
            >
              <MessageCircle size={18} /> Get Your Taxi Quote on WhatsApp
            </a>
            <p style={{ marginTop: "20px" }}>
              <a href="#book" style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", textDecoration: "underline" }}>
                or fill in a quick booking form below
              </a>
            </p>
          </div>
        </section>

        {/* Booking Request Form */}
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
