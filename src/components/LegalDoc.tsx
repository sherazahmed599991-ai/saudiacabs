import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export type LegalSection = { heading: string; paragraphs?: string[]; bullets?: string[] };

/** Shared layout for the terms and privacy pages. */
export default function LegalDoc({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <PageHero title={title} intro={intro} crumbs={[{ label: title }]} />
        <section className="section-padding">
          <div className="container" style={{ maxWidth: "820px" }}>
            <p style={{ fontSize: "14px", marginBottom: "32px" }}>Last updated: {updated}</p>
            {sections.map((s, i) => (
              <div key={s.heading} style={{ marginBottom: "30px" }}>
                <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>
                  {i + 1}. {s.heading}
                </h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} style={{ fontSize: "15.5px", marginBottom: "12px" }}>{p}</p>
                ))}
                {s.bullets && (
                  <ul style={{ paddingLeft: "22px", display: "grid", gap: "8px" }}>
                    {s.bullets.map((b) => (
                      <li key={b} style={{ fontSize: "15.5px", color: "#5C6B5A", lineHeight: 1.7 }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
