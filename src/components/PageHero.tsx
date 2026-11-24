import Link from "next/link";

/** Green hero band with breadcrumbs, used by the simple content pages. */
export default function PageHero({
  title,
  intro,
  crumbs,
}: {
  title: string;
  intro?: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <section style={{ backgroundColor: "#184A27", padding: "64px 0 56px" }}>
      <div className="container">
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", fontSize: "14px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.75)" }}>Home</Link>
          {crumbs.map((c) => (
            <span key={c.label} style={{ display: "contents" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
              {c.href ? (
                <Link href={c.href} style={{ color: "rgba(255,255,255,0.75)" }}>{c.label}</Link>
              ) : (
                <span style={{ color: "#fff" }}>{c.label}</span>
              )}
            </span>
          ))}
        </div>
        <h1 style={{ color: "#fff", marginBottom: intro ? "14px" : 0 }}>{title}</h1>
        {intro && (
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "18px", maxWidth: "720px", lineHeight: 1.75 }}>{intro}</p>
        )}
      </div>
    </section>
  );
}
