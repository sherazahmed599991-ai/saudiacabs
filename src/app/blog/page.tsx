import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";
import { BreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Umrah Travel Guides & Tips — Saudia Cabs Blog",
  description:
    "Practical guides for Umrah pilgrims: airport transfers, Ziyarat sites, Miqat points, packing lists, budgeting and everything else you need to plan a smooth trip.",
  keywords: ["umrah travel guide", "umrah tips", "umrah blog", "makkah madinah travel guides"],
  alternates: { canonical: "https://saudiacabs.com/blog/" },
  openGraph: {
    title: "Umrah Travel Guides & Tips — Saudia Cabs",
    description: "Practical guides covering every part of your Umrah journey, from airport arrival to Ziyarat and beyond.",
    url: "https://saudiacabs.com/blog/",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));

  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Blog", url: "/blog/" }]} />
      <Header />
      <main>
        <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "14px" }}>Blog</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: "42px", fontWeight: "700", marginBottom: "16px" }}>Umrah Travel Guides</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", maxWidth: "600px", lineHeight: "1.7" }}>
              Practical guides covering airport transfers, Ziyarat sites, Miqat points, packing, budgeting and everything else that makes for a smooth Umrah journey.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container">
            <div className="rg-3" style={{ display: "grid", gap: "28px" }}>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}/`}
                  style={{ display: "flex", flexDirection: "column", backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "28px", textDecoration: "none" }}
                >
                  <span style={{ display: "inline-block", alignSelf: "flex-start", backgroundColor: "#F3E9D2", color: "#8F6F25", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 10px", borderRadius: "20px", marginBottom: "14px" }}>
                    {post.category}
                  </span>
                  <h2 style={{ fontSize: "19px", color: "#17351F", marginBottom: "10px", lineHeight: "1.4" }}>{post.title}</h2>
                  <p style={{ fontSize: "14.5px", color: "#5C6B5A", lineHeight: "1.65", marginBottom: "18px", flexGrow: 1 }}>{post.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12.5px", color: "#8A9488", marginBottom: "14px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Calendar size={13} /> {formatDate(post.publishDate)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Clock size={13} /> {post.readTime}</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#B5913D", fontSize: "14px", fontWeight: 600 }}>
                    Read Guide <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "64px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "16px" }}>Ready to Book Your Trip?</h2>
            <p style={{ fontSize: "17px", color: "#5C6B5A", marginBottom: "32px" }}>Submit your trip details and we&apos;ll confirm on WhatsApp within minutes.</p>
            <Link href="/book-online/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#B5913D", color: "#fff", fontSize: "16px", fontWeight: "600", padding: "14px 36px", borderRadius: "42px", textDecoration: "none" }}>
              Book Online <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
