'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { adminFetch } from '@/lib/admin-fetch';
import {
    Mail, Search, RefreshCw, Send, Loader2,
    CheckCircle, FileText, Bell, Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotifEntry {
    bookingId: string;
    bookingRef: string;
    customerName: string;
    customerEmail: string;
    type: string;
    label: string;
    time: string;
    rawLine: string;
    status: string;
}

interface Booking {
    id: string;
    customer_name: string;
    customer_email: string;
    status: string;
    internal_notes?: string;
}

const TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
    'Quote':     { color: 'bg-amber-500/15 text-amber-400',   icon: '💰' },
    'Confirmed': { color: 'bg-emerald-500/15 text-emerald-400', icon: '✅' },
    'Cancelled': { color: 'bg-red-500/15 text-red-400',        icon: '❌' },
    'Completed': { color: 'bg-sky-500/15 text-sky-400',        icon: '🌟' },
    'In_progress':{ color: 'bg-purple-500/15 text-purple-400', icon: '🚗' },
    'Other':     { color: 'bg-neutral-500/15 text-neutral-400', icon: '📧' },
};

function parseNotes(booking: Booking): NotifEntry[] {
    if (!booking.internal_notes) return [];
    const lines = booking.internal_notes.split('\n').filter(l => l.startsWith('📧'));
    return lines.map(line => {
        // Format: 📧 [DD Mon HH:MM] Status email — Confirmed
        //      or 📧 [DD Mon HH:MM] Quote sent — SAR 500.00
        const timeMatch = line.match(/\[([^\]]+)\]/);
        const time = timeMatch?.[1] || '';

        let type = 'Other';
        let label = line.replace('📧', '').replace(/\[[^\]]+\]/, '').trim();

        const lower = label.toLowerCase();
        if (lower.includes('quote'))        type = 'Quote';
        else if (lower.includes('confirmed')) type = 'Confirmed';
        else if (lower.includes('cancelled')) type = 'Cancelled';
        else if (lower.includes('completed')) type = 'Completed';
        else if (lower.includes('progress'))  type = 'In_progress';

        return {
            bookingId:    booking.id,
            bookingRef:   booking.id.slice(0, 8).toUpperCase(),
            customerName: booking.customer_name,
            customerEmail:booking.customer_email,
            type,
            label,
            time,
            rawLine: line,
            status: booking.status,
        };
    });
}

export default function NotificationsPage() {
    const router = useRouter();
    const [bookings, setBookings]   = useState<Booking[]>([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [resending, setResending] = useState<string | null>(null);
    const [resent, setResent]       = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchData();
        });
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('bookings')
            .select('id,customer_name,customer_email,status,internal_notes')
            .is('deleted_at', null)
            .not('internal_notes', 'is', null)
            .order('created_at', { ascending: false });
        setBookings((data as Booking[]) || []);
        setLoading(false);
    };

    // Parse all notifications from internal_notes
    const allNotifs = useMemo<NotifEntry[]>(() => {
        return bookings.flatMap(b => parseNotes(b)).reverse();
    }, [bookings]);

    const filtered = useMemo(() => {
        return allNotifs.filter(n => {
            const matchType   = typeFilter === 'all' || n.type === typeFilter;
            const matchSearch = !search ||
                n.customerName.toLowerCase().includes(search.toLowerCase()) ||
                n.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
                n.bookingRef.toLowerCase().includes(search.toLowerCase());
            return matchType && matchSearch;
        });
    }, [allNotifs, typeFilter, search]);

    const resendEmail = async (n: NotifEntry) => {
        const key = `${n.bookingId}-${n.type}`;
        setResending(key);
        try {
            const statusMap: Record<string, string> = {
                'Quote':      'quote_sent',
                'Confirmed':  'confirmed',
                'Cancelled':  'cancelled',
                'Completed':  'completed',
                'In_progress':'in_progress',
            };
            const status = statusMap[n.type] || 'confirmed';
            await adminFetch('/api/send-status-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId:     n.bookingId,
                    status,
                    customerEmail: n.customerEmail,
                    customerName:  n.customerName,
                }),
            });
            setResent(key);
            setTimeout(() => setResent(null), 3000);
        } catch {
            alert('Failed to resend email.');
        } finally {
            setResending(null);
        }
    };

    const typeCounts = useMemo(() => {
        const c: Record<string, number> = {};
        allNotifs.forEach(n => { c[n.type] = (c[n.type] || 0) + 1; });
        return c;
    }, [allNotifs]);

    return (
        <div className="text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Notifications Center
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        All sent emails across every booking
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
                <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
                    <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-4 h-4 text-primary" />
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest">Total Sent</p>
                    </div>
                    <p className="text-2xl font-black">{allNotifs.length}</p>
                </div>
                {['Quote', 'Confirmed', 'Completed'].map(t => (
                    <div key={t} className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4 text-neutral-500" />
                            <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest">{t}</p>
                        </div>
                        <p className="text-2xl font-black">{typeCounts[t] || 0}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by customer name, email or booking ref..."
                        className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'Quote', 'Confirmed', 'Completed', 'Cancelled', 'In_progress'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`text-xs px-3 py-2 rounded-lg font-bold transition-colors ${typeFilter === t ? 'bg-primary text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'}`}
                        >
                            {t === 'all' ? 'All' : t === 'In_progress' ? 'En Route' : t}
                            {t !== 'all' && typeCounts[t] ? ` (${typeCounts[t]})` : ''}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : (
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500">
                            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>No notifications found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-700/50">
                            {filtered.map((n, i) => {
                                const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG['Other'];
                                const key  = `${n.bookingId}-${n.type}`;
                                const isResending = resending === key;
                                const isResent    = resent === key;
                                return (
                                    <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-700/20 transition-colors">
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${cfg.color}`}>
                                            {cfg.icon}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-white text-sm">{n.customerName}</span>
                                                <span className="text-xs font-mono text-neutral-500">#{n.bookingRef}</span>
                                                <Badge className={`text-[10px] border-0 ${cfg.color}`}>
                                                    {n.type === 'In_progress' ? 'En Route' : n.type}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-neutral-400 mt-0.5 truncate">{n.customerEmail}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{n.label}</p>
                                        </div>

                                        {/* Time */}
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-neutral-400 font-mono">{n.time}</p>
                                        </div>

                                        {/* Resend */}
                                        {['Quote', 'Confirmed', 'Cancelled', 'Completed', 'In_progress'].includes(n.type) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isResending}
                                                onClick={() => resendEmail(n)}
                                                className={`h-8 text-xs shrink-0 ${isResent ? 'text-green-400' : 'text-neutral-400 hover:text-white'}`}
                                            >
                                                {isResending
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : isResent
                                                    ? <><CheckCircle className="w-3.5 h-3.5 mr-1" />Sent</>
                                                    : <><Send className="w-3.5 h-3.5 mr-1" />Resend</>
                                                }
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
