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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "184",
      bestRating: "5",
      worstRating: "1"
    },
    review: [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Mohammad Ali" },
        "datePublished": "2026-05-15",
        "reviewBody": "Excellent service. The driver was waiting at Jeddah Airport on time. Clean Camry and very smooth ride to Makkah.",
        "reviewRating": { "@type": "Rating", "ratingValue": "5" }
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Fatima Ahmed" },
        "datePublished": "2026-06-02",
        "reviewBody": "Booked a Hyundai Staria for our family Ziyarat in Madinah. Very professional driver and guide. Highly recommended!",
        "reviewRating": { "@type": "Rating", "ratingValue": "5" }
      }
    ]
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
