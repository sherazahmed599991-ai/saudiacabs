'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    MessageCircle, Search, Loader2, Check, Clock,
    CheckCircle2, Phone, Mail, RefreshCw, Filter,
    StickyNote, Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet';

interface Inquiry {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'open' | 'resolved';
    booking_ref?: string;
    admin_notes?: string;
    created_at: string;
}

const SETUP_SQL = `See supabase-missing-schema.sql in the project root — it creates
this table and locks it to the admin_users allowlist from
supabase-rls-hardening.sql. The contact form at /contact already
posts to /api/send-contact, which inserts into this table.`;

export default function SupportPage() {
    const router = useRouter();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading]     = useState(true);
    const [dbReady, setDbReady]     = useState(true);
    const [showSql, setShowSql]     = useState(false);
    const [search, setSearch]       = useState('');
    const [filter, setFilter]       = useState<'all' | 'open' | 'resolved'>('open');
    const [selected, setSelected]   = useState<Inquiry | null>(null);
    const [resolving, setResolving] = useState<string | null>(null);
    const [notesDraft, setNotesDraft]   = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved]   = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchInquiries();
        });
    }, [router]);

    const fetchInquiries = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('support_inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) { setDbReady(false); setLoading(false); return; }
        setInquiries((data as Inquiry[]) || []);
        setLoading(false);
    };

    const openInquiry = (inq: Inquiry) => {
        setSelected(inq);
        setNotesDraft(inq.admin_notes || '');
        setNotesSaved(false);
    };

    const saveNotes = async () => {
        if (!selected) return;
        setSavingNotes(true);
        await supabase.from('support_inquiries').update({ admin_notes: notesDraft }).eq('id', selected.id);
        setInquiries(prev => prev.map(i => i.id === selected.id ? { ...i, admin_notes: notesDraft } : i));
        setSelected(s => s ? { ...s, admin_notes: notesDraft } : s);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2500);
        setSavingNotes(false);
    };

    const toggleResolve = async (inq: Inquiry) => {
        const next = inq.status === 'open' ? 'resolved' : 'open';
        setResolving(inq.id);
        await supabase.from('support_inquiries').update({ status: next }).eq('id', inq.id);
        setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: next } : i));
        if (selected?.id === inq.id) setSelected({ ...selected, status: next });
        setResolving(null);
    };

    const filtered = inquiries.filter(i => {
        const matchFilter = filter === 'all' || i.status === filter;
        const matchSearch = !search ||
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.email.toLowerCase().includes(search.toLowerCase()) ||
            i.subject.toLowerCase().includes(search.toLowerCase()) ||
            (i.booking_ref || '').toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const openCount = inquiries.filter(i => i.status === 'open').length;

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(h / 24);
        if (d > 0) return `${d}d ago`;
        if (h > 0) return `${h}h ago`;
        return 'Just now';
    };

    return (
        <div className="text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Support Inbox
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        Customer inquiries &amp; messages
                        {openCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{openCount} open</span>}
                    </p>
                </div>
                <Button onClick={fetchInquiries} variant="outline" className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {!dbReady && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-6">
                    <p className="font-bold text-amber-400 mb-1">⚠️ Table Missing</p>
                    <p className="text-sm text-amber-300 mb-2">Run this SQL in Supabase to enable the support inbox:</p>
                    <button onClick={() => setShowSql(!showSql)} className="text-xs text-amber-400 underline mb-2">
                        {showSql ? 'Hide SQL' : 'Show SQL'}
                    </button>
                    {showSql && <pre className="bg-neutral-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">{SETUP_SQL}</pre>}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total',    value: inquiries.length,   color: 'text-white' },
                    { label: 'Open',     value: openCount,          color: 'text-red-400' },
                    { label: 'Resolved', value: inquiries.filter(i => i.status === 'resolved').length, color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 text-center">
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest mb-1">{label}</p>
                        <p className={`text-2xl font-black ${color}`}>{value}</p>
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
                        placeholder="Search by name, email or subject..."
                        className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'open', 'resolved'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-xs px-4 py-2 rounded-lg font-bold capitalize transition-colors ${filter === f ? 'bg-primary text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : (
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500">
                            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>No inquiries found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-700/50">
                            {filtered.map(inq => (
                                <div
                                    key={inq.id}
                                    onClick={() => openInquiry(inq)}
                                    className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-700/20 cursor-pointer transition-colors"
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${inq.status === 'open' ? 'bg-red-400' : 'bg-emerald-400'}`} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <span className="font-bold text-white text-sm">{inq.name}</span>
                                            {inq.booking_ref && (
                                                <span className="text-[10px] font-mono text-neutral-500">#{inq.booking_ref.toUpperCase()}</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-300 font-medium truncate">{inq.subject}</p>
                                        <p className="text-xs text-neutral-500 truncate mt-0.5">{inq.message}</p>
                                    </div>

                                    <div className="text-right shrink-0 space-y-1.5">
                                        <p className="text-xs text-neutral-500">{timeAgo(inq.created_at)}</p>
                                        <Badge className={`text-[10px] border-0 ${inq.status === 'open' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                                            {inq.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Detail Sheet */}
            <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
                <SheetContent side="right" className="bg-white w-full max-w-md overflow-y-auto p-0">
                    {selected && (
                        <div>
                            <div className="bg-black p-6">
                                <SheetHeader>
                                    <SheetTitle className="text-white text-left">
                                        <div className="flex items-center justify-between">
                                            <span>{selected.name}</span>
                                            <Badge className={`text-xs border-0 ${selected.status === 'open' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {selected.status}
                                            </Badge>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex items-center gap-3 mt-4">
                                    <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors">
                                        <Mail className="w-3.5 h-3.5" />{selected.email}
                                    </a>
                                    {selected.phone && (
                                        <a href={`https://wa.me/${selected.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#25D366] hover:text-[#20bd5a] transition-colors">
                                            <Phone className="w-3.5 h-3.5" />{selected.phone}
                                        </a>
                                    )}
                                </div>
                                {selected.booking_ref && (
                                    <p className="text-xs text-neutral-500 mt-2">Booking Ref: #{selected.booking_ref.toUpperCase()}</p>
                                )}
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subject</p>
                                    <p className="font-bold text-gray-900">{selected.subject}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message</p>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {selected.message}
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(selected.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>

                                {/* Admin Notes */}
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                                            <StickyNote className="w-3.5 h-3.5" /> Internal Notes
                                        </p>
                                        <button
                                            onClick={saveNotes}
                                            disabled={savingNotes || notesDraft === (selected.admin_notes || '')}
                                            className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                                                notesSaved
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-amber-200 text-amber-800 hover:bg-amber-300 disabled:opacity-40'
                                            }`}
                                        >
                                            {savingNotes
                                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                                : notesSaved
                                                ? <><Check className="w-3 h-3" /> Saved</>
                                                : <><Save className="w-3 h-3" /> Save</>
                                            }
                                        </button>
                                    </div>
                                    <textarea
                                        value={notesDraft}
                                        onChange={e => { setNotesDraft(e.target.value); setNotesSaved(false); }}
                                        placeholder="Private notes (not visible to customer)..."
                                        rows={3}
                                        className="w-full text-sm bg-white border border-amber-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-amber-300 text-gray-700"
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <a
                                        href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                                        className="flex items-center justify-center gap-2 w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-colors"
                                    >
                                        <Mail className="w-4 h-4" /> Reply via Email
                                    </a>
                                    {selected.phone && (
                                        <a
                                            href={`https://wa.me/${selected.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello ${selected.name}, regarding your inquiry: "${selected.subject}"`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 rounded-xl hover:bg-[#20bd5a] transition-colors"
                                        >
                                            <MessageCircle className="w-4 h-4" /> Reply on WhatsApp
                                        </a>
                                    )}
                                    <Button
                                        onClick={() => toggleResolve(selected)}
                                        disabled={resolving === selected.id}
                                        className={`w-full font-bold ${selected.status === 'open' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                    >
                                        {resolving === selected.id
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : selected.status === 'open'
                                            ? <><CheckCircle2 className="w-4 h-4 mr-2" />Mark as Resolved</>
                                            : <><Clock className="w-4 h-4 mr-2" />Reopen Inquiry</>
                                        }
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
