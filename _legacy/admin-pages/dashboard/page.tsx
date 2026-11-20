'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    Calendar, Clock, CheckCircle2, DollarSign, TrendingUp,
    BarChart2, ArrowUpRight, ExternalLink, Bell, MessageCircle,
    Zap, AlertTriangle, RefreshCw, Car
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Booking {
    id: string;
    created_at: string;
    pickup_location: string;
    destination: string;
    pickup_date: string;
    pickup_time: string;
    vehicle_type: string;
    customer_name: string;
    status: string;
    total_price?: number;
    currency?: string;
    deleted_at?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
    pending:     '#fbbf24',
    quote_sent:  '#60a5fa',
    confirmed:   '#34d399',
    in_progress: '#a78bfa',
    completed:   '#38bdf8',
    cancelled:   '#f87171',
};

const STATUS_BADGE: Record<string, string> = {
    pending:     'bg-amber-500/15 text-amber-400',
    quote_sent:  'bg-blue-500/15 text-blue-400',
    confirmed:   'bg-emerald-500/15 text-emerald-400',
    in_progress: 'bg-purple-500/15 text-purple-400',
    completed:   'bg-sky-500/15 text-sky-400',
    cancelled:   'bg-red-500/15 text-red-400',
};

export default function AdminDashboard() {
    const router = useRouter();
    const [bookings, setBookings]       = useState<Booking[]>([]);
    const [openSupport, setOpenSupport] = useState(0);
    const [loading, setLoading]         = useState(true);

    const fetchData = useCallback(async () => {
        const [{ data: bData }, { count: sCount }] = await Promise.all([
            supabase
                .from('bookings')
                .select('id,created_at,status,pickup_location,destination,pickup_date,pickup_time,vehicle_type,customer_name,total_price,currency')
                .is('deleted_at', null)
                .order('created_at', { ascending: false }),
            supabase
                .from('support_inquiries')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'open'),
        ]);
        setBookings((bData as Booking[]) || []);
        setOpenSupport(sCount || 0);
        setLoading(false);
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchData();
        });
    }, [router, fetchData]);

    // Realtime: new bookings appear instantly
    useEffect(() => {
        const channel = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
                setBookings(prev => [payload.new as Booking, ...prev]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
                setBookings(prev => prev.map(b => b.id === (payload.new as Booking).id ? payload.new as Booking : b));
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    // Tab title shows pending action count
    useEffect(() => {
        const count = bookings.filter(b => b.status === 'pending' || b.status === 'quote_sent').length;
        document.title = count > 0 ? `(${count}) Admin Panel` : 'Admin Panel';
        return () => { document.title = 'Admin Panel'; };
    }, [bookings]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
        </div>
    );

    const today      = new Date().toLocaleDateString('en-CA');
    const tomorrow   = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

    const needsAction    = bookings.filter(b => b.status === 'pending' || b.status === 'quote_sent');
    const todaysTrips    = bookings.filter(b => b.pickup_date === today && b.status !== 'cancelled');
    const confirmedToday = bookings.filter(b => b.pickup_date === today && b.status === 'confirmed');
    const inProgress     = bookings.filter(b => b.status === 'in_progress');
    // Group by currency — mixing SAR, KWD, AED etc. into one sum under a
    // single hardcoded "SAR" label would misreport revenue.
    const revenueByCurrency = bookings
        .filter(b => b.status === 'completed')
        .reduce((acc, b) => {
            const curr = b.currency || 'SAR';
            acc[curr] = (acc[curr] || 0) + (b.total_price || 0);
            return acc;
        }, {} as Record<string, number>);

    const upcomingSchedule = bookings
        .filter(b => (b.pickup_date === today || b.pickup_date === tomorrowStr) && !['cancelled','completed'].includes(b.status))
        .sort((a, b) => (a.pickup_date + a.pickup_time).localeCompare(b.pickup_date + b.pickup_time))
        .slice(0, 8);

    // Monthly bookings (last 6 months)
    const monthlyMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        monthlyMap[d.toLocaleString('en-US', { month: 'short', year: '2-digit' })] = 0;
    }
    bookings.forEach(b => {
        const key = new Date(b.created_at).toLocaleString('en-US', { month: 'short', year: '2-digit' });
        if (key in monthlyMap) monthlyMap[key]++;
    });
    const monthlyData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

    // Status pie
    const statusMap: Record<string, number> = {};
    bookings.forEach(b => { statusMap[b.status] = (statusMap[b.status] || 0) + 1; });
    const statusData = Object.entries(statusMap)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || '#6b7280' }));

    return (
        <div className="text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Dashboard
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {/* Needs-Attention Banner */}
            {needsAction.length > 0 && (
                <div
                    onClick={() => router.push('/admin/bookings')}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                            <p className="font-bold text-amber-400">
                                {needsAction.length} booking{needsAction.length > 1 ? 's' : ''} need your attention
                            </p>
                            <p className="text-xs text-amber-300/70">
                                {bookings.filter(b => b.status === 'pending').length} new requests &middot;{' '}
                                {bookings.filter(b => b.status === 'quote_sent').length} awaiting customer confirmation
                            </p>
                        </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-amber-400 shrink-0" />
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest">Total Bookings</p>
                        <Calendar className="w-4 h-4 text-neutral-500" />
                    </div>
                    <p className="text-3xl font-black">{bookings.length}</p>
                </div>

                <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest">Today&apos;s Trips</p>
                        <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-3xl font-black text-amber-400">{todaysTrips.length}</p>
                    {inProgress.length > 0 && (
                        <p className="text-[10px] text-purple-400 font-bold mt-1">{inProgress.length} en route now</p>
                    )}
                </div>

                <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest">Confirmed Today</p>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-black text-emerald-400">{confirmedToday.length}</p>
                </div>

                <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest">Total Revenue</p>
                        <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    {Object.keys(revenueByCurrency).length === 0 ? (
                        <p className="text-2xl font-black text-primary">SAR 0</p>
                    ) : (
                        Object.entries(revenueByCurrency).map(([curr, amount]) => (
                            <p key={curr} className="text-2xl font-black text-primary">{curr} {amount.toLocaleString()}</p>
                        ))
                    )}
                    <p className="text-[10px] text-neutral-500 mt-1">Completed trips only</p>
                </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <button
                    onClick={() => router.push('/admin/bookings')}
                    className="bg-primary text-black font-bold rounded-xl p-4 flex items-center gap-3 hover:bg-primary/90 transition-colors text-left"
                >
                    <Zap className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold">Dispatch Board</p>
                        <p className="text-[10px] opacity-70">Manage bookings</p>
                    </div>
                </button>
                <button
                    onClick={() => router.push('/admin/support')}
                    className={`rounded-xl p-4 flex items-center gap-3 transition-colors text-left border ${
                        openSupport > 0
                            ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                            : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                    }`}
                >
                    <MessageCircle className={`w-5 h-5 shrink-0 ${openSupport > 0 ? 'text-red-400' : 'text-neutral-400'}`} />
                    <div>
                        <p className={`text-xs font-bold ${openSupport > 0 ? 'text-red-400' : 'text-white'}`}>Support Inbox</p>
                        <p className={`text-[10px] ${openSupport > 0 ? 'text-red-300' : 'text-neutral-500'}`}>
                            {openSupport > 0 ? `${openSupport} open` : 'All clear'}
                        </p>
                    </div>
                </button>
                <button
                    onClick={() => router.push('/admin/customers')}
                    className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex items-center gap-3 hover:bg-neutral-700 transition-colors text-left"
                >
                    <TrendingUp className="w-5 h-5 shrink-0 text-neutral-400" />
                    <div>
                        <p className="text-xs font-bold text-white">Customers</p>
                        <p className="text-[10px] text-neutral-500">CRM &amp; history</p>
                    </div>
                </button>
                <button
                    onClick={() => router.push('/admin/reports')}
                    className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex items-center gap-3 hover:bg-neutral-700 transition-colors text-left"
                >
                    <BarChart2 className="w-5 h-5 shrink-0 text-neutral-400" />
                    <div>
                        <p className="text-xs font-bold text-white">Reports</p>
                        <p className="text-[10px] text-neutral-500">Analytics</p>
                    </div>
                </button>
            </div>

            {/* Today / Tomorrow Schedule */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Today &amp; Tomorrow Schedule</h2>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => router.push('/admin/bookings')}
                        className="border-neutral-700 text-neutral-400 hover:text-white text-xs gap-1"
                    >
                        View All <ExternalLink className="w-3 h-3" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Schedule list */}
                    <div className="lg:col-span-2 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                        {upcomingSchedule.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No trips scheduled for today or tomorrow</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-700/50">
                                {upcomingSchedule.map(b => (
                                    <div
                                        key={b.id}
                                        onClick={() => router.push(`/admin/bookings?openId=${b.id}`)}
                                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-700/30 transition-colors cursor-pointer"
                                    >
                                        <div className="text-center shrink-0 w-14">
                                            <p className="text-xs font-black text-white">{b.pickup_time}</p>
                                            <p className="text-[10px] text-neutral-500 uppercase">
                                                {b.pickup_date === today ? 'Today' : 'Tomorrow'}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{b.customer_name}</p>
                                            <p className="text-xs text-neutral-500 truncate">
                                                {b.pickup_location} → {b.destination}
                                            </p>
                                        </div>
                                        <Badge className={`text-[10px] border-0 shrink-0 ${STATUS_BADGE[b.status] || 'bg-neutral-700 text-neutral-400'}`}>
                                            {b.status.replace('_', ' ')}
                                        </Badge>
                                        <Button
                                            size="sm" variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); router.push(`/admin/bookings?openId=${b.id}`); }}
                                            className="text-neutral-400 hover:text-white h-7 w-7 p-0 shrink-0"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary card */}
                    <div className="bg-black rounded-xl p-5 border border-neutral-700 flex flex-col justify-between">
                        <div>
                            <h3 className="text-primary font-bold text-xs mb-4 tracking-widest uppercase flex items-center gap-2">
                                <Bell className="w-4 h-4" /> Quick Summary
                            </h3>
                            <div className="space-y-0">
                                {[
                                    { label: "Today's Pickups",    value: todaysTrips.length,    color: 'text-white' },
                                    { label: 'En Route Now',        value: inProgress.length,     color: 'text-purple-400' },
                                    { label: 'Needs Attention',     value: needsAction.length,    color: needsAction.length > 0 ? 'text-amber-400' : 'text-white' },
                                    { label: "Tomorrow's Pickups",  value: bookings.filter(b => b.pickup_date === tomorrowStr && b.status !== 'cancelled').length, color: 'text-white' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex items-center justify-between border-t border-neutral-800 py-3 first:border-0">
                                        <span className="text-xs text-neutral-400">{label}</span>
                                        <span className={`text-xl font-black ${color}`}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button
                            onClick={() => router.push('/admin/bookings')}
                            className="w-full mt-5 bg-primary text-black font-bold hover:bg-white hover:text-black transition-all"
                        >
                            Go to Dispatch Board
                        </Button>
                    </div>
                </div>
            </div>

            {/* Analytics */}
            <div>
                <div className="flex items-center gap-2 mb-5">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold">Analytics</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Monthly Bookings */}
                    <div className="lg:col-span-2 bg-neutral-800 rounded-xl border border-neutral-700 p-5">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
                            Monthly Bookings (Last 6 Months)
                        </p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthlyData} barSize={32}>
                                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                                <Tooltip
                                    contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 12 }}
                                    formatter={(v: number) => [v, 'Bookings']}
                                />
                                <Bar dataKey="count" fill="#C6FF00" radius={[4, 4, 0, 0]} name="Bookings" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status Pie */}
                    <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-5">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
                            Booking Status
                        </p>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%" cy="45%"
                                        innerRadius={50} outerRadius={75}
                                        paddingAngle={3} dataKey="value"
                                    >
                                        {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 12 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-neutral-500 text-sm">
                                No data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                    {(() => {
                        // Average trip value per currency, since a mixed SAR/KWD/AED
                        // average under one currency label would be meaningless.
                        const priced = bookings.filter(b => b.total_price);
                        const sumByCurrency = priced.reduce((acc, b) => {
                            const curr = b.currency || 'SAR';
                            if (!acc[curr]) acc[curr] = { sum: 0, count: 0 };
                            acc[curr].sum += b.total_price || 0;
                            acc[curr].count += 1;
                            return acc;
                        }, {} as Record<string, { sum: number; count: number }>);
                        const avgTripValue = Object.keys(sumByCurrency).length === 0
                            ? 'SAR 0'
                            : Object.entries(sumByCurrency)
                                .map(([curr, { sum, count }]) => `${curr} ${Math.round(sum / count)}`)
                                .join(' + ');

                        return [
                            { label: 'Completion Rate', value: bookings.length ? `${Math.round(bookings.filter(b => b.status === 'completed').length / bookings.length * 100)}%` : '0%', icon: CheckCircle2, color: 'text-emerald-400' },
                            { label: 'Cancel Rate',      value: bookings.length ? `${Math.round(bookings.filter(b => b.status === 'cancelled').length / bookings.length * 100)}%` : '0%', icon: Car, color: 'text-red-400' },
                            { label: 'Avg Trip Value',   value: avgTripValue, icon: DollarSign, color: 'text-sky-400' },
                            { label: 'This Month',       value: (() => { const m = new Date().toLocaleString('en-US', { month: 'short', year: '2-digit' }); return bookings.filter(b => new Date(b.created_at).toLocaleString('en-US', { month: 'short', year: '2-digit' }) === m).length; })(), icon: Calendar, color: 'text-primary' },
                        ];
                    })().map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`w-4 h-4 ${color}`} />
                                <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest">{label}</p>
                            </div>
                            <p className={`text-2xl font-black ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
