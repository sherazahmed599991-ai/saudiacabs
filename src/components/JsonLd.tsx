const BASE_URL = "https://saudiacabs.com";

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#business`,
    name: "Saudia Cabs",
    description:
      "Trusted Umrah transportation services in Makkah, Madinah and Jeddah. Airport transfers, Ziyarat tours, Makkah–Madinah transfers and group packages. Available 24/7.",
    url: BASE_URL,
    telephone: "+966598947503",
    priceRange: "$$",
    image: `${BASE_URL}/og-image.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Makkah",
      addressRegion: "Makkah Province",
      addressCountry: "SA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 21.3891,
      longitude: 39.8579,
    },
    areaServed: [
      { "@type": "City", name: "Makkah" },
      { "@type": "City", name: "Madinah" },
      { "@type": "City", name: "Jeddah" },
      { "@type": "City", name: "Riyadh" },
      { "@type": "City", name: "AlUla" },
      { "@type": "City", name: "Taif" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: [`https://wa.me/966598947503`],
    hasMap: "https://maps.google.com/?q=Makkah+Saudi+Arabia",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+966598947503",
      contactType: "customer service",
      availableLanguage: ["English", "Arabic", "Urdu"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "Saudia Cabs",
    url: BASE_URL,
    publisher: { "@id": `${BASE_URL}/#business` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${BASE_URL}${url}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Saudia Cabs",
      "@id": `${BASE_URL}/#business`,
    },
    areaServed: [
      { "@type": "City", name: "Makkah" },
      { "@type": "City", name: "Madinah" },
      { "@type": "City", name: "Jeddah" },
      { "@type": "City", name: "Riyadh" },
      { "@type": "City", name: "AlUla" },
      { "@type": "City", name: "Taif" },
    ],
    serviceType: "Transportation",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleSchema({
  title,
  description,
  url,
  datePublished,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${BASE_URL}${url}`,
    datePublished,
    dateModified: datePublished,
    image: `${BASE_URL}/og-image.jpg`,
    author: { "@type": "Organization", name: "Saudia Cabs", "@id": `${BASE_URL}/#business` },
    publisher: { "@type": "Organization", name: "Saudia Cabs", "@id": `${BASE_URL}/#business` },
    mainEntityOfPage: `${BASE_URL}${url}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
