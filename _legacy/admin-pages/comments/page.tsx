'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { commentService, BlogComment } from '@/lib/commentService';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, MessageSquare, Calendar, FileText } from 'lucide-react';

export default function AdminCommentsPage() {
    const router = useRouter();
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            loadComments();
        });
    }, [router]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await commentService.getAllComments();
            setComments(data);
        } catch {
            alert('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const reply = replyText[id]?.trim() || undefined;
            await commentService.approveComment(id, reply);
            setReplyText(prev => { const n = { ...prev }; delete n[id]; return n; });
            loadComments();
        } catch {
            alert('Failed to approve comment');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this comment?')) return;
        try {
            await commentService.rejectComment(id);
            loadComments();
        } catch {
            alert('Failed to reject comment');
        }
    };

    const handleAddReply = async (id: string) => {
        const reply = replyText[id]?.trim();
        if (!reply) { alert('Please enter a reply'); return; }
        try {
            await commentService.addReply(id, reply);
            setReplyText(prev => { const n = { ...prev }; delete n[id]; return n; });
            loadComments();
        } catch {
            alert('Failed to add reply');
        }
    };

    const filtered = comments.filter(c => filter === 'all' || c.status === filter);
    const stats = {
        total: comments.length,
        pending: comments.filter(c => c.status === 'pending').length,
        approved: comments.filter(c => c.status === 'approved').length,
        rejected: comments.filter(c => c.status === 'rejected').length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Blog Comments</h1>
                    <p className="text-gray-600 mt-1">Approve, reject, and reply to reader comments</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
                        <div className="text-sm text-gray-500">Pending</div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-green-200">
                        <div className="text-sm text-gray-500">Approved</div>
                        <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-red-200">
                        <div className="text-sm text-gray-500">Rejected</div>
                        <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg p-4 mb-6 border-2 border-gray-200 flex gap-2 flex-wrap">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                        <Button
                            key={f}
                            variant={filter === f ? 'default' : 'outline'}
                            onClick={() => setFilter(f)}
                            className={
                                filter === f
                                    ? f === 'pending' ? 'bg-yellow-600 text-white'
                                        : f === 'approved' ? 'bg-green-600 text-white'
                                            : f === 'rejected' ? 'bg-red-600 text-white'
                                                : 'bg-black text-white hover:bg-gray-800'
                                    : ''
                            }
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? stats.total : stats[f as keyof typeof stats]})
                        </Button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center py-16 text-gray-500">Loading comments...</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-lg p-16 text-center border-2 border-gray-200 text-gray-400">
                        No comments found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(comment => (
                            <div key={comment.id} className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                                    <div>
                                        <span className="font-bold text-gray-900">{comment.name}</span>
                                        <span className="text-gray-400 text-sm ml-3">{comment.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 text-sm text-gray-500">
                                            <FileText className="w-3.5 h-3.5" />
                                            <a href={`/blog/${comment.blog_slug}/`} target="_blank" className="text-primary hover:underline">
                                                /blog/{comment.blog_slug}/
                                            </a>
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            comment.status === 'approved' ? 'bg-green-100 text-green-800'
                                            : comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                            {comment.status}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-800 mb-3 leading-relaxed">{comment.comment}</p>

                                <div className="text-xs text-gray-400 flex items-center gap-1 mb-4">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(comment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {/* Existing reply */}
                                {comment.admin_reply && (
                                    <div className="mb-4 ml-4 pl-4 border-l-2 border-primary/40 bg-primary/5 rounded-r-lg p-3">
                                        <div className="text-xs font-bold text-primary mb-1">Your Reply:</div>
                                        <p className="text-gray-700 text-sm">{comment.admin_reply}</p>
                                    </div>
                                )}

                                {/* Actions for pending */}
                                {comment.status === 'pending' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Reply (optional)</label>
                                            <textarea
                                                value={replyText[comment.id] || ''}
                                                onChange={e => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none resize-none"
                                                placeholder="Add a reply to this comment..."
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleApprove(comment.id)} className="bg-green-600 text-white hover:bg-green-700">
                                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button onClick={() => handleReject(comment.id)} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Reply on approved comment without reply */}
                                {comment.status === 'approved' && !comment.admin_reply && (
                                    <div className="space-y-3">
                                        <textarea
                                            value={replyText[comment.id] || ''}
                                            onChange={e => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none resize-none"
                                            placeholder="Add a reply..."
                                        />
                                        <Button onClick={() => handleAddReply(comment.id)} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                                            <MessageSquare className="w-4 h-4 mr-2" /> Add Reply
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
