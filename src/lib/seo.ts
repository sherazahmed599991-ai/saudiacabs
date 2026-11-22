import type { Metadata } from "next";

export const SITE_URL = "https://saudiacabs.com";
const BRAND = "Saudia Cabs";

export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Saudia Cabs — Umrah transportation in Saudi Arabia",
};

type PageMeta = {
  /** Page title WITHOUT the brand — the root layout template appends " | Saudia Cabs". */
  title: string;
  /** Keep to ~155 characters so Google doesn't cut it off. */
  description: string;
  /** Path with leading and trailing slash, e.g. "/services/fleet/". */
  path: string;
  keywords?: string[];
  /** Use for a title that must not get the brand suffix (home page, long blog titles). */
  absoluteTitle?: string;
  type?: "website" | "article";
};

/**
 * One place that builds a page's metadata so every page gets a canonical URL,
 * the share image, and matching Open Graph / Twitter tags. Next.js replaces
 * (not merges) a parent's openGraph when a page defines its own, so pages that
 * wrote openGraph by hand were silently losing og:image.
 */
export function buildMetadata({ title, description, path, keywords, absoluteTitle, type = "website" }: PageMeta): Metadata {
  const url = `${SITE_URL}${path}`;
  const socialTitle = absoluteTitle ?? `${title} | ${BRAND}`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: BRAND,
      locale: "en_US",
      title: socialTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
