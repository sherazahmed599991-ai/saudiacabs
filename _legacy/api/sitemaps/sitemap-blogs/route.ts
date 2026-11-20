import { NextResponse } from 'next/server';
import { blogService } from '@/lib/blogService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const baseUrl = 'https://taxiserviceksa.com';
    
    try {
        const blogs = await blogService.getPublishedBlogs();
        
        const blogUrls = blogs.map((blog) => {
            const lastmod = blog.updated_at || blog.created_at;
            return `  <url>
    <loc>${baseUrl}/blog/${blog.slug}/</loc>
    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }).join('\n');

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogUrls}
</urlset>`;

        return new NextResponse(sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating blog sitemap:', error);
        return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    }
}

