'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { questionService, Question } from '@/lib/reviewQuestionService';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Calendar, MapPin, Tag } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function AdminQuestionsPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'answered' | 'rejected'>('all');
    const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            loadQuestions();
        });
    }, [router]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const data = await questionService.getAllQuestions();
            setQuestions(data);
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (id: string) => {
        const answer = answerText[id];
        if (!answer || !answer.trim()) {
            alert('Please enter an answer');
            return;
        }

        try {
            await questionService.answerQuestion(id, answer);
            loadQuestions();
            setAnswerText({ ...answerText, [id]: '' });
            alert('Question answered successfully!');
        } catch (error) {
            console.error('Error answering question:', error);
            alert('Failed to answer question');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this question?')) return;

        try {
            await questionService.rejectQuestion(id);
            loadQuestions();
            alert('Question rejected');
        } catch (error) {
            console.error('Error rejecting question:', error);
            alert('Failed to reject question');
        }
    };

    const filteredQuestions = questions.filter(question => {
        if (filter === 'all') return true;
        return question.status === filter;
    });

    const stats = {
        total: questions.length,
        pending: questions.filter(q => q.status === 'pending').length,
        answered: questions.filter(q => q.status === 'answered').length,
        rejected: questions.filter(q => q.status === 'rejected').length,
    };

    const getCategoryLabel = (category: string) => {
        const labels: { [key: string]: string } = {
            general: 'General Question',
            pricing: 'Pricing & Payment',
            booking: 'Booking Process',
            routes: 'Routes & Timing',
            vehicles: 'Vehicles & Capacity',
            airport: 'Airport Transfers',
            umrah: 'Umrah Transport',
            corporate: 'Corporate Services',
        };
        return labels[category] || category;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Questions Management</h1>
                    <p className="text-gray-600 mt-2">Answer customer questions with driver expertise</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Total Questions</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-yellow-200">
                        <div className="text-sm text-gray-600 mb-1">Pending</div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                        <div className="text-sm text-gray-600 mb-1">Answered</div>
                        <div className="text-3xl font-bold text-green-600">{stats.answered}</div>
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
                            variant={filter === 'answered' ? 'default' : 'outline'}
                            onClick={() => setFilter('answered')}
                            className={filter === 'answered' ? 'bg-green-600 text-white' : ''}
                        >
                            Answered ({stats.answered})
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

                {/* Questions List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-600">Loading questions...</div>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center border-2 border-gray-200">
                        <div className="text-gray-400 mb-4">No questions found</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredQuestions.map((question) => (
                            <div key={question.id} className="bg-white rounded-lg p-6 border-2 border-gray-200">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${question.status === 'answered'
                                                ? 'bg-green-100 text-green-800'
                                                : question.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {question.status}
                                            </span>
                                            <span className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-full">
                                                <Tag className="w-3 h-3" />
                                                {getCategoryLabel(question.category)}
                                            </span>
                                        </div>

                                        {/* Question */}
                                        <div className="mb-4">
                                            <div className="flex items-start gap-2 mb-2">
                                                <WhatsAppIcon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                                <p className="text-lg font-medium text-gray-900">{question.question}</p>
                                            </div>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                            <span className="font-medium text-gray-900">{question.name}</span>
                                            <span>{question.email}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(question.created_at).toLocaleDateString()}
                                            </span>
                                            {question.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {question.location}
                                                </span>
                                            )}
                                            {question.service && <span className="bg-gray-100 px-2 py-1 rounded">{question.service}</span>}
                                        </div>

                                        {/* Answer */}
                                        {question.answer && (
                                            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-bold text-green-900">
                                                        Answer by {question.answered_by || 'Taxi Service KSA'}:
                                                    </span>
                                                </div>
                                                <p className="text-green-800">{question.answer}</p>
                                                {question.answered_at && (
                                                    <p className="text-xs text-green-600 mt-2">
                                                        Answered on {new Date(question.answered_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                {question.status === 'pending' && (
                                    <div className="mt-4 space-y-3">
                                        {/* Answer Field */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                                Your Answer *
                                            </label>
                                            <textarea
                                                value={answerText[question.id] || ''}
                                                onChange={(e) => setAnswerText({ ...answerText, [question.id]: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none resize-none"
                                                placeholder="Provide a detailed answer based on your driver experience..."
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Tip: Be specific, mention exact times/routes, share insider knowledge
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleAnswer(question.id)}
                                                className="bg-green-600 text-white hover:bg-green-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Submit Answer & Publish
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(question.id)}
                                                variant="outline"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
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

