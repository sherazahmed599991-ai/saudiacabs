import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Fetch published blogs from Supabase
        const { data: blogs, error } = await supabase
            .from('blogs')
            .select('slug')
            .eq('status', 'published');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const siteUrl = "https://taxiserviceksa.com";
        
        // 2. Build URL list starting with main pages and then dynamic blogs
        const urls = [
            `${siteUrl}/`,
            `${siteUrl}/booking/`,
            `${siteUrl}/fleet/`,
            `${siteUrl}/contact/`,
            `${siteUrl}/calculator/`,
            `${siteUrl}/faq/`,
            `${siteUrl}/about/`
        ];

        if (blogs && blogs.length > 0) {
            blogs.forEach((blog: { slug: string }) => {
                urls.push(`${siteUrl}/blog/${blog.slug}`);
            });
        }

        // 3. Make IndexNow post request to Bing
        const payload = {
            host: "taxiserviceksa.com",
            key: "88b0d5a1c86d4e6da275c07ab1aeb952",
            keyLocation: "https://taxiserviceksa.com/88b0d5a1c86d4e6da275c07ab1aeb952.txt",
            urlList: urls
        };

        const response = await fetch("https://www.bing.com/indexnow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const text = await response.text();

        return NextResponse.json({
            success: status === 200 || status === 202,
            statusCode: status,
            bingResponse: text,
            submittedUrlsCount: urls.length,
            urls: urls
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
