import { supabase } from './supabase';

export interface BlogComment {
    id: string;
    blog_slug: string;
    name: string;
    email: string;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_reply?: string;
    created_at: string;
    approved_at?: string;
}

export const commentService = {
    // Submit comment (public)
    async submitComment(data: Pick<BlogComment, 'blog_slug' | 'name' | 'email' | 'comment'>) {
        const { data: result, error } = await supabase
            .from('blog_comments')
            .insert([{ ...data, status: 'pending' }])
            .select()
            .single();

        if (error) throw error;
        return result as BlogComment;
    },

    // Get approved comments for a blog post (public)
    async getApprovedComments(blog_slug: string) {
        const { data, error } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('blog_slug', blog_slug)
            .eq('status', 'approved')
            .order('approved_at', { ascending: true });

        if (error) throw error;
        return data as BlogComment[];
    },

    // Get all comments (admin)
    async getAllComments() {
        const { data, error } = await supabase
            .from('blog_comments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BlogComment[];
    },

    // Approve comment with optional reply (admin)
    async approveComment(id: string, adminReply?: string) {
        const { data, error } = await supabase
            .from('blog_comments')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                ...(adminReply ? { admin_reply: adminReply } : {}),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as BlogComment;
    },

    // Reject comment (admin)
    async rejectComment(id: string) {
        const { data, error } = await supabase
            .from('blog_comments')
            .update({ status: 'rejected' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as BlogComment;
    },

    // Add/update admin reply on already-approved comment
    async addReply(id: string, adminReply: string) {
        const { data, error } = await supabase
            .from('blog_comments')
            .update({ admin_reply: adminReply })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as BlogComment;
    },
};
