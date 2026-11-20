'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { reviewService, Review } from '@/lib/reviewQuestionService';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, XCircle, MessageSquare, Calendar, MapPin } from 'lucide-react';

export default function AdminReviewsPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [responseText, setResponseText] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            loadReviews();
        });
    }, [router]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const data = await reviewService.getAllReviews();
            setReviews(data);
        } catch (error) {
            console.error('Error loading reviews:', error);
            alert('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const response = responseText[id] || '';
            await reviewService.approveReview(id, response);
            loadReviews();
            setResponseText({ ...responseText, [id]: '' });
            alert('Review approved successfully!');
        } catch (error) {
            console.error('Error approving review:', error);
            alert('Failed to approve review');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this review?')) return;

        try {
            await reviewService.rejectReview(id);
            loadReviews();
            alert('Review rejected');
        } catch (error) {
            console.error('Error rejecting review:', error);
            alert('Failed to reject review');
        }
    };

    const handleAddResponse = async (id: string) => {
        const response = responseText[id];
        if (!response || !response.trim()) {
            alert('Please enter a response');
            return;
        }

        try {
            await reviewService.addResponse(id, response);
            loadReviews();
            setResponseText({ ...responseText, [id]: '' });
            alert('Response added successfully!');
        } catch (error) {
            console.error('Error adding response:', error);
            alert('Failed to add response');
        }
    };

    const filteredReviews = reviews.filter(review => {
        if (filter === 'all') return true;
        return review.status === filter;
    });

    const stats = {
        total: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        rejected: reviews.filter(r => r.status === 'rejected').length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
                    <p className="text-gray-600 mt-2">Approve, reject, and respond to customer reviews</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Total Reviews</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-yellow-200">
                        <div className="text-sm text-gray-600 mb-1">Pending</div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                        <div className="text-sm text-gray-600 mb-1">Approved</div>
                        <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-red-200">
                        <div className="text-sm text-gray-600 mb-1">Rejected</div>
                        <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg p-4 mb-6 border-2 border-gray-200">
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            className={filter === 'all' ? 'bg-black text-white hover:bg-gray-800' : ''}
                        >
                            All ({stats.total})
                        </Button>
                        <Button
                            variant={filter === 'pending' ? 'default' : 'outline'}
                            onClick={() => setFilter('pending')}
                            className={filter === 'pending' ? 'bg-yellow-600 text-white' : ''}
                        >
                            Pending ({stats.pending})
                        </Button>
                        <Button
                            variant={filter === 'approved' ? 'default' : 'outline'}
                            onClick={() => setFilter('approved')}
                            className={filter === 'approved' ? 'bg-green-600 text-white' : ''}
                        >
                            Approved ({stats.approved})
                        </Button>
                        <Button
                            variant={filter === 'rejected' ? 'default' : 'outline'}
                            onClick={() => setFilter('rejected')}
                            className={filter === 'rejected' ? 'bg-red-600 text-white' : ''}
                        >
                            Rejected ({stats.rejected})
                        </Button>
                    </div>
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-600">Loading reviews...</div>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center border-2 border-gray-200">
                        <div className="text-gray-400 mb-4">No reviews found</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-5 h-5 ${star <= review.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${review.status === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : review.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {review.status}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{review.title}</h3>
                                        <p className="text-gray-700 mb-3">{review.review}</p>

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="font-medium text-gray-900">{review.name}</span>
                                            <span>{review.email}</span>
                                            {review.route && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {review.route}
                                                </span>
                                            )}
                                            {review.travel_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(review.travel_date).toLocaleDateString()}
                                                </span>
                                            )}
                                            {review.location && <span className="bg-gray-100 px-2 py-1 rounded">{review.location}</span>}
                                            {review.service && <span className="bg-gray-100 px-2 py-1 rounded">{review.service}</span>}
                                        </div>

                                        {/* Admin Response */}
                                        {review.admin_response && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-bold text-blue-900">Your Response:</span>
                                                </div>
                                                <p className="text-blue-800">{review.admin_response}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                {review.status === 'pending' && (
                                    <div className="mt-4 space-y-3">
                                        {/* Response Field */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                                Add Response (Optional)
                                            </label>
                                            <textarea
                                                value={responseText[review.id] || ''}
                                                onChange={(e) => setResponseText({ ...responseText, [review.id]: e.target.value })}
                                                rows={2}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none resize-none"
                                                placeholder="Thank you for your feedback! We're glad you had a great experience..."
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleApprove(review.id)}
                                                className="bg-green-600 text-white hover:bg-green-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve & Publish
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(review.id)}
                                                variant="outline"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Add Response to Approved */}
                                {review.status === 'approved' && !review.admin_response && (
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                                Add Response
                                            </label>
                                            <textarea
                                                value={responseText[review.id] || ''}
                                                onChange={(e) => setResponseText({ ...responseText, [review.id]: e.target.value })}
                                                rows={2}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none resize-none"
                                                placeholder="Thank you for your feedback..."
                                            />
                                        </div>
                                        <Button
                                            onClick={() => handleAddResponse(review.id)}
                                            size="sm"
                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Add Response
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

