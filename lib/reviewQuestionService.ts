import { supabase } from './supabase';

export interface Review {
    id: string;
    name: string;
    email: string;
    rating: number;
    title: string;
    review: string;
    route?: string;
    travel_date?: string;
    location?: string;
    service?: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_response?: string;
    created_at: string;
    approved_at?: string;
    responded_at?: string;
}

export interface Question {
    id: string;
    name: string;
    email: string;
    category: string;
    question: string;
    location?: string;
    service?: string;
    status: 'pending' | 'answered' | 'rejected';
    answer?: string;
    answered_by?: string;
    created_at: string;
    answered_at?: string;
}

export const reviewService = {
    // Get all approved reviews (public)
    async getApprovedReviews() {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('status', 'approved')
            .order('approved_at', { ascending: false });

        if (error) throw error;
        return data as Review[];
    },

    // Get all reviews (admin)
    async getAllReviews() {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Review[];
    },

    // Submit review (public)
    async submitReview(review: Omit<Review, 'id' | 'created_at' | 'status' | 'approved_at' | 'responded_at'>) {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{ ...review, status: 'pending' }])
            .select()
            .single();

        if (error) throw error;
        return data as Review;
    },

    // Approve review (admin)
    async approveReview(id: string, adminResponse?: string) {
        const { data, error } = await supabase
            .from('reviews')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                admin_response: adminResponse,
                responded_at: adminResponse ? new Date().toISOString() : null
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Review;
    },

    // Reject review (admin)
    async rejectReview(id: string) {
        const { data, error } = await supabase
            .from('reviews')
            .update({ status: 'rejected' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Review;
    },

    // Add admin response (admin)
    async addResponse(id: string, response: string) {
        const { data, error } = await supabase
            .from('reviews')
            .update({
                admin_response: response,
                responded_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Review;
    },
};

export const questionService = {
    // Get all answered questions (public)
    async getAnsweredQuestions() {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('status', 'answered')
            .order('answered_at', { ascending: false });

        if (error) throw error;
        return data as Question[];
    },

    // Get all questions (admin)
    async getAllQuestions() {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Question[];
    },

    // Submit question (public)
    async submitQuestion(question: Omit<Question, 'id' | 'created_at' | 'status' | 'answer' | 'answered_by' | 'answered_at'>) {
        const { data, error } = await supabase
            .from('questions')
            .insert([{ ...question, status: 'pending' }])
            .select()
            .single();

        if (error) throw error;
        return data as Question;
    },

    // Answer question (admin)
    async answerQuestion(id: string, answer: string, answeredBy: string = 'Taxi Service KSA') {
        const { data, error } = await supabase
            .from('questions')
            .update({
                status: 'answered',
                answer,
                answered_by: answeredBy,
                answered_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Question;
    },

    // Reject question (admin)
    async rejectQuestion(id: string) {
        const { data, error } = await supabase
            .from('questions')
            .update({ status: 'rejected' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Question;
    },
};
