
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { blogService } from '@/lib/blogService';
import { Button } from '@/components/ui/button';
import { Check, Loader2, FileText, Sparkles } from 'lucide-react';

import { BLOG_TEMPLATES } from '@/data/blogTemplates';

export default function BlogGeneratorPage() {
    const router = useRouter();
    const [generating, setGenerating] = useState<string | null>(null);
    const [generated, setGenerated] = useState<string[]>([]);
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) router.push('/admin/login');
        });
    }, [router]);

    const generateBlog = async (template: typeof BLOG_TEMPLATES[0]) => {
        try {
            setGenerating(template.slug);
            setStatus(`Generating ${template.title}...`);

            // Check if exists
            const existing = await blogService.getBlogBySlugAnyStatus(template.slug).catch(() => null);
            if (existing) {
                setStatus('Blog already exists! Skipping.');
                setGenerating(null);
                return;
            }

            await blogService.createBlog({
                title: template.title,
                slug: template.slug,
                excerpt: template.excerpt,
                content: template.content,
                category: template.category,
                tags: template.seo_keywords,
                status: 'draft',
                author: 'Muhammad Ismail',
                seo_title: template.seo_title,
                seo_description: template.seo_description,
                seo_keywords: template.seo_keywords,
                featured_image: '' // Left empty for user to fill
            });

            setGenerated(prev => [...prev, template.slug]);
            setStatus(`Successfully created draft: ${template.title}`);
        } catch (error) {
            console.error(error);
            // @ts-ignore
            setStatus(`Error creating ${template.title}: ${error.message || 'Unknown error'}`);
        } finally {
            setGenerating(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Blog Generator</h1>

                {status && (
                    <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                        {status}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">Available Templates</h2>
                        <div className="flex gap-3 items-center">
                            <span className="text-sm text-gray-500">{BLOG_TEMPLATES.length} templates ready</span>
                            <Button
                                onClick={async () => {
                                    if (confirm(`Are you sure you want to GENERATE all ${BLOG_TEMPLATES.length} drafts? This may take a minute.`)) {
                                        let count = 0;
                                        for (const template of BLOG_TEMPLATES) {
                                            // Skip if already generated in this session
                                            if (generated.includes(template.slug)) continue;

                                            // Call the generation function directly
                                            await generateBlog(template);
                                            count++;
                                        }
                                        alert(`Finished! Generated ${count} templates.`);
                                    }
                                }}
                                disabled={generating !== null}
                                className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                            >
                                <Sparkles className="w-3 h-3 mr-1" />
                                Generate All
                            </Button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {BLOG_TEMPLATES.map((template) => (
                            <div key={template.slug} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{template.title}</h3>
                                    <p className="text-sm text-gray-500">{template.excerpt}</p>
                                    <span className="inline-block mt-2 text-xs font-semibold bg-primary/10 text-primary-dark px-2 py-0.5 rounded">
                                        {template.category}
                                    </span>
                                </div>

                                <Button
                                    onClick={() => generateBlog(template)}
                                    disabled={generating !== null || generated.includes(template.slug)}
                                    className={`min-w-[140px] ${generated.includes(template.slug) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                >
                                    {generated.includes(template.slug) ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" /> Created
                                        </>
                                    ) : generating === template.slug ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Writing...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4 mr-2" /> Generate Draft
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

