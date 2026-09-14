import { NextResponse } from 'next/server';
import { internationalGuides } from '@/data/international_guides';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const baseUrl = 'https://taxiserviceksa.com';

    // Static guides
    const guidePages = [
        '/guides/avoid-taxi-scams',
        '/guides/currency',
        '/guides/haram-gates-access',
        '/guides/jeddah-airport-guide',
        '/guides/madinah-food',
        '/guides/madinah-prayer-times',
        '/guides/madinah-weather',
        '/guides/makkah-shopping',
        '/guides/makkah-umrah-guide',
        '/guides/meeqat-locations',
        '/guides/quba-walking-path',
        '/guides/riyadh-business-guide',
        '/guides/seven-mosques',
        '/guides/uhud-history',
        '/guides/umrah-tawaf-guide',
    ];

    // 1. Static Guide URLs
    const staticUrls = guidePages.map((route) => {
        return `  <url>
    <loc>${baseUrl}${route}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>`;
    });

    // 2. International Guide URLs
    const internationalUrls = internationalGuides.map((guide) => {
        return `  <url>
    <loc>${baseUrl}/guides/international/${guide.slug}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>`;
    });

    const allUrls = [...staticUrls, ...internationalUrls].join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
</urlset>`;

    return new NextResponse(sitemap, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}

