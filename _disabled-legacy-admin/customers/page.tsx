'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    Search, Crown, Phone, Mail, Eye, Loader2,
    TrendingUp, Users, Star, Wallet, StickyNote, Save, Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet';

interface RawBooking {
    id: string;
    customer_phone: string;
    customer_name: string;
    customer_email: string;
    pickup_location: string;
    destination: string;
    pickup_date: string;
    status: string;
    total_price?: number;
    currency?: string;
    vehicle_type: string;
    created_at: string;
}

interface Customer {
    phone: string;
    name: string;
    email: string;
    totalBookings: number;
    totalSpent: number;
    // Spend grouped by currency — a customer who paid SAR on one trip and
    // KWD on another shouldn't have those added together under one label.
    totalSpentByCurrency: Record<string, number>;
    lastBookingDate: string;
    isVIP: boolean;
    isRepeat: boolean;
    bookings: RawBooking[];
    notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending:     'bg-amber-100 text-amber-700',
    quote_sent:  'bg-blue-100 text-blue-700',
    confirmed:   'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed:   'bg-sky-100 text-sky-700',
    cancelled:   'bg-red-100 text-red-700',
};

function formatSpend(byCurrency: Record<string, number>): string {
    const entries = Object.entries(byCurrency).filter(([, amount]) => amount > 0);
    if (entries.length === 0) return '—';
    return entries.map(([curr, amount]) => `${curr} ${amount.toLocaleString()}`).join(' + ');
}

const NOTES_SQL = `CREATE TABLE IF NOT EXISTS customer_notes (
  phone      text PRIMARY KEY,
  notes      text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON customer_notes FOR ALL USING (auth.role() = 'authenticated');`;

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [selected, setSelected]   = useState<Customer | null>(null);
    const [notesDraft, setNotesDraft] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved]   = useState(false);
    const [notesDbReady, setNotesDbReady] = useState(true);
    const [showNotesSql, setShowNotesSql] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchCustomers();
        });
    }, [router]);

    const fetchCustomers = async () => {
        setLoading(true);
        const [{ data: bData }, { data: nData }] = await Promise.all([
            supabase
                .from('bookings')
                .select('id,customer_phone,customer_name,customer_email,pickup_location,destination,pickup_date,status,total_price,currency,vehicle_type,created_at')
                .is('deleted_at', null)
                .order('created_at', { ascending: false }),
            supabase.from('customer_notes').select('phone,notes'),
        ]);

        if (!bData) { setLoading(false); return; }

        // Check if customer_notes table exists
        const notesMap: Record<string, string> = {};
        if (nData) {
            for (const n of nData as { phone: string; notes: string }[]) {
                notesMap[n.phone] = n.notes;
            }
        } else {
            setNotesDbReady(false);
        }

        const map = new Map<string, Customer>();
        for (const b of bData as RawBooking[]) {
            const key = b.customer_phone || b.customer_email || 'unknown';
            if (!map.has(key)) {
                map.set(key, {
                    phone: b.customer_phone,
                    name:  b.customer_name,
                    email: b.customer_email,
                    totalBookings: 0,
                    totalSpent: 0,
                    totalSpentByCurrency: {},
                    lastBookingDate: b.pickup_date,
                    isVIP: false,
                    isRepeat: false,
                    bookings: [],
                    notes: notesMap[b.customer_phone] || '',
                });
            }
            const c = map.get(key)!;
            c.totalBookings++;
            c.totalSpent += Number(b.total_price || 0);
            const bookingCurrency = b.currency || 'SAR';
            c.totalSpentByCurrency[bookingCurrency] = (c.totalSpentByCurrency[bookingCurrency] || 0) + Number(b.total_price || 0);
            if (b.pickup_date > c.lastBookingDate) {
                c.lastBookingDate = b.pickup_date;
                c.name  = b.customer_name;
                c.email = b.customer_email;
            }
            c.bookings.push(b);
        }

        const result = Array.from(map.values())
            .map(c => ({ ...c, isRepeat: c.totalBookings > 1, isVIP: c.totalBookings >= 3 || c.totalSpent >= 2000 }))
            .sort((a, b) => b.totalBookings - a.totalBookings);

        setCustomers(result);
        setLoading(false);
    };

    const openSheet = (c: Customer) => {
        setSelected(c);
        setNotesDraft(c.notes || '');
        setNotesSaved(false);
    };

    const saveNotes = async () => {
        if (!selected) return;
        setSavingNotes(true);
        const { error } = await supabase
            .from('customer_notes')
            .upsert({ phone: selected.phone, notes: notesDraft, updated_at: new Date().toISOString() }, { onConflict: 'phone' });

        if (error) {
            setNotesDbReady(false);
        } else {
            // Update in-memory
            setCustomers(prev => prev.map(c => c.phone === selected.phone ? { ...c, notes: notesDraft } : c));
            setSelected(s => s ? { ...s, notes: notesDraft } : s);
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 2500);
        }
        setSavingNotes(false);
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const vipCount     = customers.filter(c => c.isVIP).length;
    const repeatCount  = customers.filter(c => c.isRepeat).length;

    const revenueByCurrency = customers.reduce((acc, c) => {
        for (const [curr, amount] of Object.entries(c.totalSpentByCurrency)) {
            acc[curr] = (acc[curr] || 0) + amount;
        }
        return acc;
    }, {} as Record<string, number>);
    const totalRevenueLabel = Object.keys(revenueByCurrency).length === 0
        ? 'SAR 0'
        : Object.entries(revenueByCurrency).map(([curr, amount]) => `${curr} ${amount.toLocaleString()}`).join(' + ');

    return (
        <div className="text-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    Customers
                </h1>
                <p className="text-neutral-400 mt-1">Full customer history and lifetime value</p>
            </div>

            {!notesDbReady && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                    <p className="font-bold text-amber-400 mb-1">⚠️ Notes table missing</p>
                    <button onClick={() => setShowNotesSql(!showNotesSql)} className="text-xs text-amber-400 underline">
                        {showNotesSql ? 'Hide SQL' : 'Show SQL to create it'}
                    </button>
                    {showNotesSql && <pre className="bg-neutral-900 text-green-400 text-xs p-4 rounded-lg mt-2 overflow-x-auto">{NOTES_SQL}</pre>}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Customers', value: customers.length,                            icon: Users,  color: 'text-white' },
                    { label: 'Customers',   value: vipCount,                                    icon: Crown,  color: 'text-amber-400' },
                    { label: 'Repeat Clients',  value: repeatCount,                                 icon: Star,   color: 'text-emerald-400' },
                    { label: 'Total Revenue',   value: totalRevenueLabel,                           icon: Wallet, color: 'text-primary' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-4 h-4 ${color}`} />
                            <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">{label}</p>
                        </div>
                        <p className={`text-2xl font-black ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone or email..."
                    className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : (
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-x-auto">
                    <table className="w-full min-w-[680px]">
                        <thead className="bg-neutral-900/50">
                            <tr className="border-b border-neutral-700">
                                <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Customer</th>
                                <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Contact</th>
                                <th className="text-center px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Trips</th>
                                <th className="text-right px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Lifetime Value</th>
                                <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Last Trip</th>
                                <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Notes</th>
                                <th className="w-12" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr
                                    key={c.phone}
                                    className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors cursor-pointer"
                                    onClick={() => openSheet(c)}
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center font-black text-white shrink-0">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-white text-sm">{c.name}</span>
                                                    {c.isVIP && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                                                </div>
                                                <span className="text-[10px] font-bold">
                                                    {c.isVIP
                                                        ? <span className="text-amber-400">Customer</span>
                                                        : c.isRepeat
                                                        ? <span className="text-emerald-400">Repeat Customer</span>
                                                        : null
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-neutral-300 flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-neutral-500 shrink-0" />{c.phone}
                                        </p>
                                        <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5 truncate max-w-[180px]">
                                            <Mail className="w-3 h-3 shrink-0" />{c.email}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="text-2xl font-black text-white">{c.totalBookings}</span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="font-black text-primary">
                                            {formatSpend(c.totalSpentByCurrency)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-sm text-neutral-300">{c.lastBookingDate}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {c.notes
                                            ? <span className="text-xs text-neutral-400 italic truncate max-w-[140px] block">{c.notes}</span>
                                            : <span className="text-xs text-neutral-600">—</span>
                                        }
                                    </td>
                                    <td className="px-3 py-4">
                                        <Button
                                            variant="ghost" size="icon"
                                            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-600"
                                            onClick={e => { e.stopPropagation(); openSheet(c); }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-neutral-500">No customers found.</div>
                    )}
                </div>
            )}

            {/* Customer Detail Sheet */}
            <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
                <SheetContent side="right" className="bg-white w-full max-w-lg overflow-y-auto p-0">
                    {selected && (
                        <div className="flex flex-col h-full">
                            {/* Top */}
                            <div className="bg-black p-6 pb-5">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-4 text-white">
                                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-2xl font-black text-black shrink-0">
                                            {selected.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-xl">
                                                {selected.name}
                                                {selected.isVIP && <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />}
                                            </div>
                                            <p className="text-sm font-normal text-gray-400">{selected.phone}</p>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="grid grid-cols-3 gap-3 mt-5">
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Trips</p>
                                        <p className="text-2xl font-black text-white">{selected.totalBookings}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Spent</p>
                                        <p className="text-lg font-black text-primary">
                                            {formatSpend(selected.totalSpentByCurrency)}
                                        </p>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Status</p>
                                        <p className="text-sm font-black text-white mt-1">
                                            {selected.isVIP ? '⭐ VIP' : selected.isRepeat ? '🔄 Repeat' : '🆕 New'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto">
                                {/* Contact */}
                                <div className="space-y-2 mb-6">
                                    <a
                                        href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-[#25D366]/10 rounded-xl text-sm font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                                    >
                                        <Phone className="w-4 h-4" /> {selected.phone}
                                    </a>
                                    <a
                                        href={`mailto:${selected.email}`}
                                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                                    >
                                        <Mail className="w-4 h-4" /> {selected.email}
                                    </a>
                                </div>

                                {/* Admin Notes */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <StickyNote className="w-3.5 h-3.5" /> Admin Notes
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={saveNotes}
                                            disabled={savingNotes || notesDraft === (selected.notes || '')}
                                            className={`h-7 text-xs gap-1 ${notesSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-black hover:bg-gray-800'} text-white`}
                                        >
                                            {savingNotes
                                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                                : notesSaved
                                                ? <><Check className="w-3 h-3" /> Saved</>
                                                : <><Save className="w-3 h-3" /> Save</>
                                            }
                                        </Button>
                                    </div>
                                    <textarea
                                        value={notesDraft}
                                        onChange={e => { setNotesDraft(e.target.value); setNotesSaved(false); }}
                                        placeholder="Add private notes about this customer (e.g. 'Prefers Hiace', 'VIP — give priority')..."
                                        rows={4}
                                        className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-black/20 placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Booking History */}
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Booking History ({selected.bookings.length})
                                </p>
                                <div className="space-y-3">
                                    {selected.bookings
                                        .sort((a, b) => b.created_at.localeCompare(a.created_at))
                                        .map(b => (
                                            <div key={b.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-gray-400 font-mono">
                                                        #{b.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                    <Badge className={`text-[10px] border-0 ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {b.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {b.pickup_location} → {b.destination}
                                                </p>
                                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                                    <span>{b.pickup_date} · {b.vehicle_type}</span>
                                                    {b.total_price
                                                        ? <span className="font-bold text-gray-900">{b.currency || 'SAR'} {b.total_price}</span>
                                                        : null
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
