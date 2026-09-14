
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/lib/blogService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';
import { useDropzone } from 'react-dropzone';
import { AUTHORS } from '@/lib/constants';
import { X, UploadCloud } from 'lucide-react';

interface EditBlogPageProps {
    params: {
        id: string;
    };
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
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
        author: 'Taxi Service KSA',
        created_at: '',
        views: 0,
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
        'News',
        'Travel Guides' // Added Travel Guides as it was used in our script
    ];

    useEffect(() => {
        loadBlog();
    }, [params.id]);

    const loadBlog = async () => {
        try {
            setLoading(true);
            const data = await blogService.getBlogById(params.id);
            if (!data) {
                alert('Blog not found');
                router.push('/admin/blogs');
                return;
            }
            // Populate form
            setFormData({
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                category: data.category,
                tags: data.tags || [],
                status: data.status,
                seo_title: data.seo_title || '',
                seo_description: data.seo_description || '',
                seo_keywords: data.seo_keywords || [],
                author: data.author,
                created_at: data.created_at,
                views: data.views,
                featured_image: data.featured_image || '',
                published_at: data.published_at || ''
            });
        } catch (error) {
            console.error('Error loading blog:', error);
            alert('Failed to load blog');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (publish: boolean = false) => {
        if (!formData.title || !formData.content) {
            alert('Please fill in title and content');
            return;
        }

        try {
            setSaving(true);
            await blogService.updateBlog(params.id, {
                ...formData,
                status: publish ? 'published' : 'draft',
                updated_at: new Date().toISOString(),
                featured_image: formData.featured_image,
                published_at: formData.published_at || (publish ? new Date().toISOString() : undefined)
            });

            alert(`Blog ${publish ? 'published' : 'updated'} successfully!`);
            router.push('/admin/blogs');
        } catch (error) {
            console.error('Error updating blog:', error);
            alert('Failed to update blog');
        } finally {
            setSaving(false);
        }
    };

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            // Upload logic
            const url = await blogService.uploadImage(file);
            if (url) {
                setFormData(prev => ({ ...prev, featured_image: url }));
            } else {
                alert('Upload failed. Ensure "blog-images" bucket exists in Supabase.');
            }
        } catch (error) {
            console.error('Upload error', error);
            alert('Upload failed');
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, featured_image: '' }));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading editor...</div>
            </div>
        );
    }

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
                            <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
                            <p className="text-gray-600 mt-1">Editing: {formData.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/blog/preview/${params.id}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </Button>
                        </Link>
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
                            {formData.status === 'published' ? 'Update & Publish' : 'Publish'}
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
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

                    {/* Image & Date & Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                Featured Image
                            </label>

                            {!formData.featured_image ? (
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
                                        ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
                                >
                                    <input {...getInputProps()} />
                                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 text-center">
                                        {isDragActive ? "Drop image here..." : "Drag & drop image, or click to select"}
                                    </p>
                                </div>
                            ) : (
                                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden group">
                                    <img
                                        src={formData.featured_image}
                                        alt="Featured"
                                        className="w-full h-48 object-cover"
                                    />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove Image"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Author Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Author
                                </label>
                                <select
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                >
                                    {AUTHORS.map(author => (
                                        <option key={author.id} value={author.name}>{author.name}</option>
                                    ))}
                                    <option value="Taxi Service KSA">Taxi Service KSA (Legacy)</option>
                                </select>
                            </div>

                            {/* Schedule */}
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
                            </div>
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
