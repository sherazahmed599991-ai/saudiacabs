import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog-data";
import RichText from "@/components/blog/RichText";
import { ArticleSchema, BreadcrumbSchema } from "@/components/JsonLd";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Saudia Cabs`,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `https://saudiacabs.com/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://saudiacabs.com/blog/${post.slug}/`,
      type: "article",
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);

  return (
    <>
      <ArticleSchema title={post.title} description={post.metaDescription} url={`/blog/${post.slug}/`} datePublished={post.publishDate} />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Blog", url: "/blog/" }, { name: post.title, url: `/blog/${post.slug}/` }]} />
      <Header />
      <main>
        <section style={{ backgroundColor: "#184A27", padding: "56px 0 48px" }}>
          <div className="container" style={{ maxWidth: "760px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>/</span>
              <Link href="/blog/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", textDecoration: "none" }}>Blog</Link>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>/</span>
              <span style={{ color: "#fff", fontSize: "13px" }}>{post.category}</span>
            </div>
            <span style={{ display: "inline-block", backgroundColor: "rgba(255,255,255,0.15)", color: "#D1B969", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 10px", borderRadius: "20px", marginBottom: "16px" }}>
              {post.category}
            </span>
            <h1 style={{ color: "#fff", fontSize: "36px", fontWeight: "700", marginBottom: "18px", lineHeight: "1.3" }}>{post.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13.5px", color: "rgba(255,255,255,0.75)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={14} /> {formatDate(post.publishDate)}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> {post.readTime}</span>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container" style={{ maxWidth: "760px" }}>
            <RichText blocks={post.content} />

            {post.relatedServices.length > 0 && (
              <div style={{ backgroundColor: "#F4F1C6", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "24px 28px", marginTop: "20px", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "15px", color: "#17351F", marginBottom: "12px" }}>Related Services</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {post.relatedServices.map((s) => (
                    <Link key={s.href} href={s.href} style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#fff", border: "1px solid #E4DEC6", color: "#B5913D", fontSize: "13.5px", fontWeight: 600, padding: "8px 16px", borderRadius: "20px", textDecoration: "none" }}>
                      {s.label} <ArrowRight size={13} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section style={{ backgroundColor: "#F4F1C6", borderTop: "1px solid #E4DEC6", padding: "56px 0" }}>
            <div className="container">
              <h2 style={{ marginBottom: "28px", fontSize: "22px" }}>Related Reading</h2>
              <div className="rg-3" style={{ display: "grid", gap: "24px" }}>
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}/`}
                    style={{ display: "flex", flexDirection: "column", backgroundColor: "#fff", border: "1px solid #E4DEC6", borderRadius: "8px", padding: "22px", textDecoration: "none" }}
                  >
                    <span style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#8F6F25", marginBottom: "8px" }}>{r.category}</span>
                    <h3 style={{ fontSize: "16px", color: "#17351F", marginBottom: "8px", lineHeight: "1.4" }}>{r.title}</h3>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#B5913D", fontSize: "13px", fontWeight: 600, marginTop: "auto" }}>
                      Read Guide <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section style={{ padding: "56px 0", textAlign: "center" }}>
          <div className="container">
            <h2 style={{ marginBottom: "16px" }}>Ready to Book Your Ride?</h2>
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
