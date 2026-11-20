'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, DollarSign, Car, MapPin, Loader2, Calendar, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Booking {
    id: string;
    pickup_location: string;
    destination: string;
    pickup_date: string;
    vehicle_type: string;
    status: string;
    total_price?: number;
    currency?: string;
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    completed:   '#38bdf8',
    confirmed:   '#34d399',
    in_progress: '#a78bfa',
    quote_sent:  '#60a5fa',
    pending:     '#fbbf24',
    cancelled:   '#f87171',
};

const CHART_COLORS = ['#C6FF00', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#f87171'];

const PRESETS = [
    { label: 'This Month',  getValue: () => { const d = new Date(); return { from: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`, to: new Date().toLocaleDateString('en-CA') }; } },
    { label: 'Last Month',  getValue: () => { const d = new Date(); d.setMonth(d.getMonth()-1); const y = d.getFullYear(), m = d.getMonth()+1; const last = new Date(y, m, 0).getDate(); return { from: `${y}-${String(m).padStart(2,'0')}-01`, to: `${y}-${String(m).padStart(2,'0')}-${last}` }; } },
    { label: 'Last 3 Months', getValue: () => { const to = new Date().toLocaleDateString('en-CA'); const f = new Date(); f.setMonth(f.getMonth()-3); return { from: f.toLocaleDateString('en-CA'), to }; } },
    { label: 'This Year',   getValue: () => { const y = new Date().getFullYear(); return { from: `${y}-01-01`, to: new Date().toLocaleDateString('en-CA') }; } },
    { label: 'All Time',    getValue: () => ({ from: '', to: '' }) },
];

export default function ReportsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading]   = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo]     = useState('');
    const [activePreset, setActivePreset] = useState('All Time');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            supabase
                .from('bookings')
                .select('id,pickup_location,destination,pickup_date,vehicle_type,status,total_price,currency,created_at')
                .is('deleted_at', null)
                .then(({ data }) => {
                    setBookings((data as Booking[]) || []);
                    setLoading(false);
                });
        });
    }, [router]);

    const applyPreset = (preset: typeof PRESETS[0]) => {
        const { from, to } = preset.getValue();
        setDateFrom(from);
        setDateTo(to);
        setActivePreset(preset.label);
    };

    const clearDates = () => {
        setDateFrom('');
        setDateTo('');
        setActivePreset('All Time');
    };

    // Filtered bookings by date range
    const filtered = useMemo(() => {
        return bookings.filter(b => {
            if (dateFrom && b.pickup_date < dateFrom) return false;
            if (dateTo   && b.pickup_date > dateTo)   return false;
            return true;
        });
    }, [bookings, dateFrom, dateTo]);

    if (loading) return (
        <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
    );

    // --- Monthly Revenue ---
    const monthlyMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        monthlyMap.set(d.toLocaleString('en-US', { month: 'short', year: '2-digit' }), 0);
    }
    for (const b of filtered) {
        if (!['completed', 'confirmed'].includes(b.status)) continue;
        // Chart shows one number per month — mixing currencies into that bar
        // would misreport revenue, so this chart tracks SAR bookings only.
        if ((b.currency || 'SAR') !== 'SAR') continue;
        const key = new Date(b.pickup_date).toLocaleString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(b.total_price || 0));
    }
    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({ month, revenue }));

    // --- Status Breakdown ---
    const statusCount: Record<string, number> = {};
    for (const b of filtered) statusCount[b.status] = (statusCount[b.status] || 0) + 1;
    const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // --- Top Routes ---
    const routeMap = new Map<string, number>();
    for (const b of filtered) {
        const key = `${b.pickup_location} → ${b.destination}`;
        routeMap.set(key, (routeMap.get(key) || 0) + 1);
    }
    const topRoutes = Array.from(routeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([route, count]) => ({ route, count }));

    // --- Vehicle Demand ---
    const vehicleMap = new Map<string, number>();
    for (const b of filtered) vehicleMap.set(b.vehicle_type, (vehicleMap.get(b.vehicle_type) || 0) + 1);
    const vehicleData = Array.from(vehicleMap.entries()).sort((a, b) => b[1] - a[1]).map(([vehicle, count]) => ({ vehicle: vehicle.split(' ')[0], count }));

    // --- Summary Stats ---
    // Group by currency instead of summing everything under one "SAR" label —
    // a KWD or AED booking's total_price isn't directly comparable to a SAR one.
    const revenueByCurrency = filtered
        .filter(b => ['completed', 'confirmed'].includes(b.status))
        .reduce((acc, b) => {
            const curr = b.currency || 'SAR';
            acc[curr] = (acc[curr] || 0) + Number(b.total_price || 0);
            return acc;
        }, {} as Record<string, number>);
    const totalRevenueLabel = Object.keys(revenueByCurrency).length === 0
        ? 'SAR 0'
        : Object.entries(revenueByCurrency).map(([curr, amount]) => `${curr} ${amount.toLocaleString()}`).join(' + ');

    const completedTrips = filtered.filter(b => b.status === 'completed').length;
    const cancelRate     = filtered.length ? Math.round(filtered.filter(b => b.status === 'cancelled').length / filtered.length * 100) : 0;

    const completedByCurrency = filtered
        .filter(b => b.status === 'completed')
        .reduce((acc, b) => {
            const curr = b.currency || 'SAR';
            if (!acc[curr]) acc[curr] = { sum: 0, count: 0 };
            acc[curr].sum += Number(b.total_price || 0);
            acc[curr].count += 1;
            return acc;
        }, {} as Record<string, { sum: number; count: number }>);
    const avgValueLabel = Object.keys(completedByCurrency).length === 0
        ? 'SAR 0'
        : Object.entries(completedByCurrency).map(([curr, { sum, count }]) => `${curr} ${Math.round(sum / count)}`).join(' + ');

    const hasDateFilter = !!dateFrom || !!dateTo;

    return (
        <div className="text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Reports &amp; Analytics
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        {hasDateFilter
                            ? `Showing ${filtered.length} bookings ${dateFrom ? `from ${dateFrom}` : ''} ${dateTo ? `to ${dateTo}` : ''}`
                            : 'All-time overview of your business performance'
                        }
                    </p>
                </div>
                <Button
                    variant="outline" size="sm"
                    onClick={() => { setBookings([]); setLoading(true); supabase.from('bookings').select('id,pickup_location,destination,pickup_date,vehicle_type,status,total_price,currency,created_at').is('deleted_at', null).then(({ data }) => { setBookings((data as Booking[]) || []); setLoading(false); }); }}
                    className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 gap-2 shrink-0"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {/* Date Range Filter */}
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0 mt-2 sm:mt-0" />
                    <div className="flex flex-wrap gap-2 flex-1">
                        {PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => applyPreset(p)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${activePreset === p.label ? 'bg-primary text-black' : 'bg-neutral-700 text-neutral-300 hover:text-white'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={e => { setDateFrom(e.target.value); setActivePreset('Custom'); }}
                            className="bg-neutral-700 border-neutral-600 text-white text-xs h-8 w-36"
                        />
                        <span className="text-neutral-500 text-xs">to</span>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={e => { setDateTo(e.target.value); setActivePreset('Custom'); }}
                            className="bg-neutral-700 border-neutral-600 text-white text-xs h-8 w-36"
                        />
                        {hasDateFilter && (
                            <button onClick={clearDates} className="text-neutral-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Revenue',    value: totalRevenueLabel,                      icon: DollarSign, color: 'text-primary' },
                    { label: 'Completed Trips',  value: completedTrips,                         icon: TrendingUp,  color: 'text-emerald-400' },
                    { label: 'Avg Trip Value',   value: avgValueLabel,                          icon: Calendar,    color: 'text-sky-400' },
                    { label: 'Cancel Rate',      value: `${cancelRate}%`,                       icon: Car,         color: cancelRate > 20 ? 'text-red-400' : 'text-neutral-300' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-4 h-4 ${color}`} />
                            <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">{label}</p>
                        </div>
                        <p className={`text-2xl font-black ${color}`}>{value}</p>
                        {hasDateFilter && <p className="text-[10px] text-neutral-500 mt-1">In selected period</p>}
                    </div>
                ))}
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6 mb-5">
                <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-widest mb-1">
                    Monthly Revenue (Last 6 Months)
                </h2>
                <p className="text-[11px] text-neutral-500 mb-4">SAR bookings only — other currencies excluded to avoid mixing totals</p>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyRevenue} barSize={36}>
                        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
                            formatter={(v: number) => [`SAR ${v.toLocaleString()}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#C6FF00" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Status Breakdown */}
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
                    <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-widest mb-5">
                        Bookings by Status
                    </h2>
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                                >
                                    {statusData.map((entry, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8, color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-neutral-500 text-sm">No data in this range</div>
                    )}
                </div>

                {/* Vehicle Demand */}
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
                    <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-widest mb-5">
                        Vehicle Demand
                    </h2>
                    {vehicleData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={vehicleData} layout="vertical" barSize={18}>
                                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="vehicle" tick={{ fill: '#d1d5db', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                                <Tooltip contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8, color: '#fff' }} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {vehicleData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-neutral-500 text-sm">No data in this range</div>
                    )}
                </div>
            </div>

            {/* Top Routes */}
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
                <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Top Routes
                </h2>
                <div className="space-y-3">
                    {topRoutes.map(({ route, count }, i) => {
                        const width = Math.round((count / (topRoutes[0]?.count || 1)) * 100);
                        return (
                            <div key={route}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-neutral-300 truncate pr-4">{route}</span>
                                    <span className="font-black text-white shrink-0">{count} trips</span>
                                </div>
                                <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${width}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                </div>
                            </div>
                        );
                    })}
                    {topRoutes.length === 0 && (
                        <p className="text-neutral-500 text-sm text-center py-8">No data in this range.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
