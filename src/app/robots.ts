import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://saudiacabs.com/sitemap.xml",
    host: "https://saudiacabs.com",
  };
}
