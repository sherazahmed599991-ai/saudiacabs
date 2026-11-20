'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { blogService, Blog } from '@/lib/blogService';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AdminBlogsPage() {
    const router = useRouter();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            loadBlogs();
        });
    }, [router]);

    const loadBlogs = async () => {
        try {
            setLoading(true);
            const data = await blogService.getAllBlogs();
            setBlogs(data);
        } catch (error) {
            console.error('Error loading blogs:', error);
            alert('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;

        try {
            await blogService.deleteBlog(id);
            setBlogs(blogs.filter(b => b.id !== id));
            alert('Blog deleted successfully');
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog');
        }
    };

    const handleToggleStatus = async (blog: Blog) => {
        try {
            if (blog.status === 'published') {
                await blogService.unpublishBlog(blog.id);
            } else {
                await blogService.publishBlog(blog.id);
            }
            loadBlogs();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status');
        }
    };

    const filteredBlogs = blogs.filter(blog => {
        if (filter === 'all') return true;
        return blog.status === filter;
    });

    const stats = {
        total: blogs.length,
        published: blogs.filter(b => b.status === 'published').length,
        draft: blogs.filter(b => b.status === 'draft').length,
        totalViews: blogs.reduce((sum, b) => sum + b.views, 0)
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                        <p className="text-gray-600 mt-2">Manage your blog posts and articles</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/generator">
                            <Button className="bg-purple-600 text-white hover:bg-purple-700">
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Blog Generator
                            </Button>
                        </Link>
                        <Link href="/admin/blogs/new">
                            <Button className="bg-primary text-white hover:text-black hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                New Blog Post
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Total Posts</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                        <div className="text-sm text-gray-600 mb-1">Published</div>
                        <div className="text-3xl font-bold text-green-600">{stats.published}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-yellow-200">
                        <div className="text-sm text-gray-600 mb-1">Drafts</div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.draft}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                        <div className="text-sm text-gray-600 mb-1">Total Views</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.totalViews}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg p-4 mb-6 border-2 border-gray-200">
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            className={filter === 'all' ? 'bg-primary text-white hover:text-black' : ''}
                        >
                            All ({stats.total})
                        </Button>
                        <Button
                            variant={filter === 'published' ? 'default' : 'outline'}
                            onClick={() => setFilter('published')}
                            className={filter === 'published' ? 'bg-green-600 text-white' : ''}
                        >
                            Published ({stats.published})
                        </Button>
                        <Button
                            variant={filter === 'draft' ? 'default' : 'outline'}
                            onClick={() => setFilter('draft')}
                            className={filter === 'draft' ? 'bg-yellow-600 text-white' : ''}
                        >
                            Drafts ({stats.draft})
                        </Button>
                    </div>

                    {/* Publish All Button */}
                    {stats.draft > 0 && (
                        <Button
                            onClick={async () => {
                                if (confirm(`Are you sure you want to PUBLISH all ${stats.draft} drafts? This will make them live on the website.`)) {
                                    setLoading(true);
                                    let count = 0;
                                    const draftBlogs = blogs.filter(b => b.status === 'draft');

                                    for (const blog of draftBlogs) {
                                        try {
                                            await blogService.publishBlog(blog.id);
                                            count++;
                                        } catch (e) {
                                            console.error(`Failed to publish ${blog.title}`, e);
                                        }
                                    }

                                    alert(`Successfully published ${count} blogs!`);
                                    loadBlogs();
                                }
                            }}
                            className="bg-green-600 text-white hover:bg-green-700 font-bold"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Publish All {stats.draft} Drafts
                        </Button>
                    )}
                </div>

                {/* Blog List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-600">Loading blogs...</div>
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center border-2 border-gray-200">
                        <div className="text-gray-400 mb-4">No blogs found</div>
                        <Link href="/admin/blogs/new">
                            <Button className="bg-primary text-white hover:text-black hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Blog Post
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBlogs.map((blog) => (
                            <div key={blog.id} className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-primary transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{blog.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${blog.status === 'published'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {blog.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{blog.excerpt}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(blog.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {blog.views} views
                                            </span>
                                            <span className="bg-gray-100 px-2 py-1 rounded">
                                                {blog.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleStatus(blog)}
                                            title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                                        >
                                            {blog.status === 'published' ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Link href={`/admin/blogs/edit/${blog.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(blog.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

