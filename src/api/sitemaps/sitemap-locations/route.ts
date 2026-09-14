import { NextResponse } from 'next/server';
import { cities } from '@/data/cities';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const baseUrl = 'https://taxiserviceksa.com';
    
    const locationUrls = Object.keys(cities).map((citySlug) => {
        return `  <url>
    <loc>${baseUrl}/locations/${citySlug}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }).join('\n');

    const staticLocations = [
        '/locations/jeddah/airport',
        '/locations/jeddah/kaec-transfer',
        '/locations/jeddah/obhur',
        '/locations/jubail/industrial-city',
        '/locations/madinah/central-area',
        '/locations/madinah/madinah-airport',
        '/locations/madinah/qiblatain',
        '/locations/madinah/quba',
        '/locations/madinah/sultana',
        '/locations/madinah/train-station',
        '/locations/madinah/uhud',
        '/locations/makkah/aziziyah',
        '/locations/makkah/jabal-omar',
        '/locations/makkah/jarwal',
        '/locations/makkah/kudai',
        '/locations/makkah/misfalah',
        '/locations/makkah/train-station',
        '/locations/riyadh/boulevard-world',
        '/locations/riyadh/bujairi-terrace',
        '/locations/riyadh/diplomatic-quarter',
        '/locations/riyadh/diriyah',
        '/locations/riyadh/front',
        '/locations/riyadh/kafd',
        '/locations/riyadh/olaya',
        '/locations/taif/al-hada',
        '/locations/taif/al-shafa',
        '/locations/taif/miqat-qarn-al-manazil',
        '/locations/yanbu/industrial-city',
    ];

    const staticUrls = staticLocations.map((route) => {
        return `  <url>
    <loc>${baseUrl}${route}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locationUrls}
${staticUrls}
</urlset>`;

    return new NextResponse(sitemap, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}

