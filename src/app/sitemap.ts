import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";
import { locations } from "@/lib/locations";
import { routes } from "@/lib/routes";
import { fleet } from "@/lib/fleet";

const BASE_URL = "https://saudiacabs.com";

// Date the static pages were last meaningfully edited. Update this when page
// content changes. (It used to be `new Date()`, which claimed every page changed
// on every deploy and taught Google to ignore lastmod.)
const SITE_LAST_UPDATED = new Date("2026-11-21");

export default function sitemap(): MetadataRoute.Sitemap {



  const extraEntries: MetadataRoute.Sitemap = [
    ...fleet.map((v) => ({
      url: `${BASE_URL}/fleet/${v.slug}/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE_URL}/faq/`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/partners/`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/partners/driver-registration/`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms-conditions/`, lastModified: SITE_LAST_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy/`, lastModified: SITE_LAST_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];

  const placeEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/locations/`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    ...locations.map((l) => ({
      url: `${BASE_URL}/locations/${l.slug}/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    { url: `${BASE_URL}/routes/`, lastModified: SITE_LAST_UPDATED, changeFrequency: "monthly", priority: 0.85 },
    ...routes.map((r) => ({
      url: `${BASE_URL}/routes/${r.slug}/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];

  const blogEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}/`,
      lastModified: new Date(post.publishDate),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [
    ...blogEntries,
    ...placeEntries,
    ...extraEntries,
    {
      url: `${BASE_URL}/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/services/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services/airport-transfer/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services/airport-transfer/jeddah/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/services/airport-transfer/madinah/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/services/airport-transfer/riyadh/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/services/airport-transfer/alula/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/services/airport-transfer/taif/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/services/ziyarat-tours/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/services/makkah-madinah-transfer/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/services/miqat-transfer/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services/group-packages/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/fleet/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/about/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/book-online/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact/`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
