'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/lib/blogService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';

export default function NewBlogPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Travel Tips',
        tags: [] as string[],
        status: 'draft' as 'draft' | 'published' | 'scheduled',
        seo_title: '',
        seo_description: '',
        seo_keywords: [] as string[],
        featured_image: '',
        published_at: ''
    });

    const categories = [
        'Travel Tips',
        'Umrah Guide',
        'Airport Guide',
        'Business Travel',
        'Saudi Arabia',
        'Routes',
        'Fleet',
        'News'
    ];

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: blogService.generateSlug(title),
            seo_title: title
        });
    };

    const handleSave = async (publish: boolean = false) => {
        if (!formData.title || !formData.content) {
            alert('Please fill in title and content');
            return;
        }

        try {
            setSaving(true);
            await blogService.createBlog({
                ...formData,
                status: publish ? 'published' : 'draft',
                published_at: formData.published_at || (publish ? new Date().toISOString() : undefined),
                author: 'Taxi Service KSA',
                featured_image: formData.featured_image
            });

            alert(`Blog ${publish ? 'published' : 'saved as draft'} successfully!`);
            router.push('/admin/blogs');
        } catch (error) {
            console.error('Error saving blog:', error);
            alert('Failed to save blog');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/blogs">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">New Blog Post</h1>
                            <p className="text-gray-600 mt-1">Create a new blog article</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleSave(false)}
                            disabled={saving}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleSave(true)}
                            disabled={saving}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Publish
                        </Button>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg p-8 border-2 border-gray-200 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-lg font-semibold"
                            placeholder="Enter blog title..."
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            URL Slug
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">/blog/</span>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                placeholder="url-slug"
                            />
                        </div>
                    </div>

                    {/* Category & Tags */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                value={formData.tags.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                                })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                placeholder="tag1, tag2, tag3"
                            />
                        </div>
                    </div>

                    {/* Image & Date */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Featured Image URL
                            </label>
                            <input
                                type="text"
                                value={formData.featured_image}
                                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                placeholder="/images/example.jpg"
                            />
                            {formData.featured_image && (
                                <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden border">
                                    <img src={formData.featured_image} alt="Preview" className="object-cover w-full h-full" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Schedule / Publish Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                                onChange={(e) => setFormData({ ...formData, published_at: new Date(e.target.value).toISOString() })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty to publish immediately upon clicking Publish.</p>
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Excerpt
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none"
                            placeholder="Brief summary of the blog post..."
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Content *
                        </label>
                        <RichTextEditor
                            content={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                            placeholder="Start writing your blog post..."
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Use the toolbar to format your content. Rich text editor with WordPress Gutenberg-style experience.
                        </p>
                    </div>

                    {/* SEO Section */}
                    <div className="border-t-2 border-gray-200 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">SEO Settings</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    SEO Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.seo_title}
                                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                    placeholder="SEO optimized title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    SEO Description
                                </label>
                                <textarea
                                    value={formData.seo_description}
                                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none"
                                    placeholder="Meta description for search engines..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    SEO Keywords (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.seo_keywords.join(', ')}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        seo_keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                                    })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

