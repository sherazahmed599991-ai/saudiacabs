import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const baseUrl = 'https://taxiserviceksa.com';

    const fleetDirectory = path.join(process.cwd(), 'app', '(main)', 'fleet');
    let fleetSlugs: string[] = [];
    try {
        fleetSlugs = fs.readdirSync(fleetDirectory, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);
    } catch (e) {
        console.error('Failed to read fleet directory:', e);
    }

    const fleetUrls = fleetSlugs.map((slug) => {
        return `  <url>
    <loc>${baseUrl}/fleet/${slug}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fleetUrls}
</urlset>`;

    return new NextResponse(sitemap, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}
