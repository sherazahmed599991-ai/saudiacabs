import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const baseUrl = 'https://taxiserviceksa.com';
    
    // Dynamically read services from the filesystem
    let servicePages: string[] = [];
    try {
        const servicesDirectory = path.join(process.cwd(), 'app', '(main)', 'services');
        const services = fs.readdirSync(servicesDirectory);
        
        servicePages = services
            .filter(file => {
                const filePath = path.join(servicesDirectory, file);
                return fs.statSync(filePath).isDirectory();
            })
            .map(slug => `/services/${slug}`);
    } catch (e) {
        console.error('Failed to read services directory:', e);
    }

    const serviceUrls = servicePages.map((route) => {
        return `  <url>
    <loc>${baseUrl}${route}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${serviceUrls}
</urlset>`;

    return new NextResponse(sitemap, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}

