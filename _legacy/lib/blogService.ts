import { supabase } from './supabase';

export interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image?: string;
    category: string;
    tags: string[];
    author: string;
    status: 'draft' | 'published' | 'scheduled';
    published_at?: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string[];
    views: number;
    created_at: string;
    updated_at: string;
}

export const blogService = {
    // Get all published blogs
    async getPublishedBlogs() {
        // Fetch from Supabase
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) {
            console.error("Error fetching published blogs:", error);
            return [];
        }

        return data as Blog[] || [];
    },

    // Get all blogs (for admin)
    async getAllBlogs() {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching all blogs:", error);
            return [];
        }

        return data as Blog[] || [];
    },

    // Get blog by slug (any status - for admin checks)
    async getBlogBySlugAnyStatus(slug: string) {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`Error fetching blog by slug ${slug}:`, error);
            return null;
        }

        return data as Blog;
    },

    // Get blog by slug
    async getBlogBySlug(slug: string) {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) {
            // It's common to not find a blog, closer to a 404 than a system error
            return null;
        }

        const post = data as Blog;

        // Try to increment views (fire and forget, don't block)
        if (post) {
            try {
                // Determine if we can call an RPC function or need a direct update
                // For safety with RLS, we prefer RPC, but if not exists, we skip for now 
                // to avoid 403 errors on the client side.
                /* 
                supabase.rpc('increment_blog_view', { blog_id: post.id }).then(({ error }) => {
                    if (error) console.error("Error incrementing view:", error);
                });
                */
            } catch (e) {
                console.error("Failed to increment views", e);
            }
        }

        return post || null;
    },

    // Get blog by ID (for admin)
    async getBlogById(id: string) {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching blog by id ${id}:`, error);
            return null;
        }
        return data as Blog;
    },

    // Get blogs by category
    async getBlogsByCategory(category: string) {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('category', category)
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) {
            console.error(`Error fetching blogs by category ${category}:`, error);
            return [];
        }
        return data as Blog[] || [];
    },

    // Get blogs by author
    async getBlogsByAuthor(authorName: string) {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('author', authorName)
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) {
            console.error(`Error fetching blogs by author ${authorName}:`, error);
            return [];
        }
        return data as Blog[] || [];
    },

    // Create blog
    async createBlog(blog: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'views'>) {
        const newBlog = {
            ...blog,
            views: 0
            // created_at/updated_at handled by DB defaults
        };

        const { data, error } = await supabase
            .from('blogs')
            .insert([newBlog])
            .select()
            .single();

        if (error) {
            console.error("Error creating blog:", error);
            throw error;
        }
        return data as Blog;
    },

    // Update blog
    async updateBlog(id: string, updates: Partial<Blog>) {
        const { data, error } = await supabase
            .from('blogs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating blog ${id}:`, error);
            throw error;
        }
        return data as Blog;
    },

    // Delete blog
    async deleteBlog(id: string) {
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting blog ${id}:`, error);
            throw error;
        }
    },

    // Publish blog
    async publishBlog(id: string) {
        const { data, error } = await supabase
            .from('blogs')
            .update({
                status: 'published',
                published_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error publishing blog ${id}:`, error);
            throw error;
        }
        return data as Blog;
    },

    // Unpublish blog
    async unpublishBlog(id: string) {
        const { data, error } = await supabase
            .from('blogs')
            .update({ status: 'draft' })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error unpublishing blog ${id}:`, error);
            throw error;
        }
        return data as Blog;
    },

    async uploadImage(file: File): Promise<string | null> {
        try {
            // Upload to Supabase Storage 'blog-images' bucket
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Error uploading image:", uploadError);
                return null;
            }

            const { data } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error("Exception uploading image:", error);
            return null;
        }
    },

    // Generate slug from title
    generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
};
