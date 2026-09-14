import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cities with real, regular search demand — used to tell hub-to-hub routes
// (high priority) apart from routes into small/obscure towns (lower priority).
const HIGH_VALUE_CITIES = [
    'jeddah', 'makkah', 'madinah', 'riyadh', 'dammam', 'khobar', 'taif',
    'yanbu', 'abha', 'hail', 'alula', 'jubail', 'dhahran', 'tabuk',
    'dubai', 'doha', 'kuwait', 'bahrain', 'sharjah', 'muscat', 'amman', 'abu-dhabi',
].sort((a, b) => b.length - a.length);

// Slugs that target a specific hotel/airport/train-station rather than a plain
// city pair — real purchase intent, but not a core hub-to-hub route.
function isLandmarkSlug(slug: string): boolean {
    return /-to-|airport|train-station/.test(slug);
}

function priorityFor(slug: string): number {
    if (isLandmarkSlug(slug)) return 0.7;

    const origin = HIGH_VALUE_CITIES.find((c) => slug === c || slug.startsWith(`${c}-`));
    if (!origin) return 0.6;

    const rest = slug === origin ? '' : slug.slice(origin.length + 1);
    if (HIGH_VALUE_CITIES.includes(rest)) return 0.9; // hub-to-hub
    return 0.5; // hub to a smaller/long-tail town
}

export async function GET() {
    const baseUrl = 'https://taxiserviceksa.com';

    // Dynamically read routes from the filesystem
    let routePages: string[] = [];
    try {
        const routesDirectory = path.join(process.cwd(), 'app', '(main)', 'routes');
        const routes = fs.readdirSync(routesDirectory);

        routePages = routes
            .filter(file => {
                const filePath = path.join(routesDirectory, file);
                return fs.statSync(filePath).isDirectory();
            })
            .map(slug => `/routes/${slug}`);
    } catch (e) {
        console.error('Failed to read routes directory:', e);
    }

    const routeUrls = routePages.map((route) => {
        const slug = route.replace(/^\/routes\//, '');
        return `  <url>
    <loc>${baseUrl}${route}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priorityFor(slug).toFixed(1)}</priority>
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routeUrls}
</urlset>`;

    return new NextResponse(sitemap, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}

