'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    Plus, Copy, Pencil, Trash2, Loader2, Check,
    MessageSquare, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

interface Template {
    id: string;
    title: string;
    category: string;
    body: string;
    created_at?: string;
}

const CATEGORIES = ['Greeting', 'Quote', 'Confirmation', 'Pickup Reminder', 'Driver Info', 'Review Request', 'Cancellation', 'Custom'];

const VARIABLES = ['{name}', '{ref}', '{date}', '{time}', '{from}', '{to}', '{vehicle}', '{price}', '{driver}', '{plate}'];

const CATEGORY_COLORS: Record<string, string> = {
    'Greeting':        'bg-blue-500/15 text-blue-400',
    'Quote':           'bg-amber-500/15 text-amber-400',
    'Confirmation':    'bg-emerald-500/15 text-emerald-400',
    'Pickup Reminder': 'bg-purple-500/15 text-purple-400',
    'Driver Info':     'bg-sky-500/15 text-sky-400',
    'Review Request':  'bg-pink-500/15 text-pink-400',
    'Cancellation':    'bg-red-500/15 text-red-400',
    'Custom':          'bg-neutral-500/15 text-neutral-400',
};

const DEFAULT_TEMPLATES: Omit<Template, 'id' | 'created_at'>[] = [
    {
        title: 'Greeting — New Booking',
        category: 'Greeting',
        body: `Hello {name} 👋\n\nThank you for choosing Taxi Service KSA!\n\nWe've received your booking request (Ref: {ref}).\nRoute: {from} → {to}\nDate: {date} at {time}\nVehicle: {vehicle}\n\nWe'll send your quote shortly. 🚗`,
    },
    {
        title: 'Quote Ready',
        category: 'Quote',
        body: `Hello {name} 👋\n\nYour quote for booking *{ref}* is ready!\n\n📍 *Route:* {from} → {to}\n📅 *Date:* {date} at {time}\n🚗 *Vehicle:* {vehicle}\n💰 *Price:* {price}\n\nReply *CONFIRM* to book or tap the link to accept online.`,
    },
    {
        title: 'Booking Confirmed',
        category: 'Confirmation',
        body: `Hello {name} ✅\n\nYour booking *{ref}* is confirmed!\n\n📍 {from} → {to}\n📅 {date} at {time}\n🚗 {vehicle}\n\nYour chauffeur will be ready at your pickup point. We'll send driver details soon.`,
    },
    {
        title: 'Pickup Reminder',
        category: 'Pickup Reminder',
        body: `Hello {name} ⏰\n\nReminder: Your transfer is *tomorrow at {time}*!\n\nRef: {ref}\nPickup: {from}\n\nPlease be ready 5 minutes early. Contact us if anything changes.`,
    },
    {
        title: 'Driver Details',
        category: 'Driver Info',
        body: `Hello {name} 🚗\n\nYour driver for booking *{ref}* is on the way!\n\n👤 Driver: {driver}\n🚙 Plate: {plate}\n\nYou can contact your driver directly. Have a great journey!`,
    },
    {
        title: 'Review Request',
        category: 'Review Request',
        body: `Hello {name} 🌟\n\nThank you for travelling with Taxi Service KSA!\n\nWe hope your journey (Ref: {ref}) was excellent. Your feedback means the world to us.\n\nPlease take 1 minute to leave a review — it really helps! 🙏`,
    },
];

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  category   text NOT NULL DEFAULT 'Custom',
  body       text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON whatsapp_templates FOR ALL USING (auth.role() = 'authenticated');`;

const emptyForm = { title: '', category: 'Custom', body: '' };

export default function WhatsAppTemplatesPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading]     = useState(true);
    const [dbReady, setDbReady]     = useState(true);
    const [showSql, setShowSql]     = useState(false);
    const [filterCat, setFilterCat] = useState('all');

    const [open, setOpen]           = useState(false);
    const [editing, setEditing]     = useState<Template | null>(null);
    const [form, setForm]           = useState(emptyForm);
    const [saving, setSaving]       = useState(false);
    const [copied, setCopied]       = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchTemplates();
        });
    }, [router]);

    const fetchTemplates = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('whatsapp_templates')
            .select('*')
            .order('category')
            .order('created_at');

        if (error) {
            setDbReady(false);
            // Show defaults even without DB
            setTemplates(DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: String(i) })));
            setLoading(false);
            return;
        }

        // If DB is empty, seed defaults
        if (data.length === 0) {
            const { data: seeded } = await supabase
                .from('whatsapp_templates')
                .insert(DEFAULT_TEMPLATES)
                .select();
            setTemplates((seeded as Template[]) || []);
        } else {
            setTemplates(data as Template[]);
        }
        setLoading(false);
    };

    const copyTemplate = (t: Template) => {
        navigator.clipboard.writeText(t.body);
        setCopied(t.id);
        setTimeout(() => setCopied(null), 2000);
    };

    const insertVar = (v: string) => {
        setForm(p => ({ ...p, body: p.body + v }));
    };

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (t: Template) => {
        setEditing(t);
        setForm({ title: t.title, category: t.category, body: t.body });
        setOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.body.trim()) return;
        setSaving(true);
        const payload = { title: form.title.trim(), category: form.category, body: form.body.trim() };

        if (editing) {
            await supabase.from('whatsapp_templates').update(payload).eq('id', editing.id);
            setTemplates(prev => prev.map(t => t.id === editing.id ? { ...t, ...payload } : t));
        } else {
            const { data } = await supabase.from('whatsapp_templates').insert(payload).select().single();
            if (data) setTemplates(prev => [...prev, data as Template]);
        }
        setSaving(false);
        setOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this template?')) return;
        await supabase.from('whatsapp_templates').delete().eq('id', id);
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    const filtered = filterCat === 'all'
        ? templates
        : templates.filter(t => t.category === filterCat);

    return (
        <div className="text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        WhatsApp Templates
                    </h1>
                    <p className="text-neutral-400 mt-1">Saved message templates — one click to copy</p>
                </div>
                <Button onClick={openAdd} disabled={!dbReady} className="bg-[#25D366] text-white hover:bg-[#20bd5a] font-bold">
                    <Plus className="w-4 h-4 mr-2" /> New Template
                </Button>
            </div>

            {/* DB warning */}
            {!dbReady && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-6">
                    <p className="font-bold text-amber-400 mb-1">⚠️ Table Missing — showing defaults (read-only)</p>
                    <button onClick={() => setShowSql(!showSql)} className="text-xs text-amber-400 underline">
                        {showSql ? 'Hide SQL' : 'Show Setup SQL'}
                    </button>
                    {showSql && (
                        <pre className="bg-neutral-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto mt-2">{SETUP_SQL}</pre>
                    )}
                </div>
            )}

            {/* Variable reference */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-6">
                <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Available Variables
                </p>
                <div className="flex flex-wrap gap-2">
                    {VARIABLES.map(v => (
                        <span key={v} className="text-xs bg-neutral-700 text-primary px-2 py-1 rounded-md font-mono">{v}</span>
                    ))}
                </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap mb-6">
                {['all', ...CATEGORIES].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCat(cat)}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${filterCat === cat ? 'bg-primary text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'}`}
                    >
                        {cat === 'all' ? 'All' : cat}
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(t => (
                        <div key={t.id} className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden group hover:border-[#25D366]/40 transition-colors flex flex-col">
                            <div className="px-5 py-3 border-b border-neutral-700 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                                    <span className="font-bold text-white text-sm truncate">{t.title}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Custom']}`}>
                                    {t.category}
                                </span>
                            </div>

                            <div className="p-5 flex-1">
                                <pre className="text-sm text-neutral-300 whitespace-pre-wrap font-sans leading-relaxed">
                                    {t.body}
                                </pre>
                            </div>

                            <div className="px-5 py-3 border-t border-neutral-700 flex items-center justify-between">
                                <div className="flex gap-1">
                                    {dbReady && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(t)} className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <Button
                                    onClick={() => copyTemplate(t)}
                                    className={`font-bold text-sm h-8 px-4 transition-all ${copied === t.id ? 'bg-green-500 hover:bg-green-500 text-white' : 'bg-[#25D366] hover:bg-[#20bd5a] text-white'}`}
                                >
                                    {copied === t.id
                                        ? <><Check className="w-3.5 h-3.5 mr-1.5" />Copied!</>
                                        : <><Copy className="w-3.5 h-3.5 mr-1.5" />Copy</>
                                    }
                                </Button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-2 text-center py-16 text-neutral-500">
                            No templates in this category.
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-700 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Template' : 'New Template'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs text-neutral-400 uppercase font-bold">Title</label>
                                <Input
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Quote Ready"
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-neutral-400 uppercase font-bold">Category</label>
                                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Quick insert variables */}
                        <div>
                            <p className="text-xs text-neutral-400 uppercase font-bold mb-2">Insert Variable</p>
                            <div className="flex flex-wrap gap-1.5">
                                {VARIABLES.map(v => (
                                    <button
                                        key={v}
                                        onClick={() => insertVar(v)}
                                        className="text-xs bg-neutral-700 hover:bg-neutral-600 text-primary px-2 py-1 rounded font-mono transition-colors"
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 uppercase font-bold">Message Body</label>
                            <textarea
                                value={form.body}
                                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                                rows={8}
                                placeholder="Write your WhatsApp message here..."
                                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm font-sans resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-neutral-600"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white">Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !form.title.trim() || !form.body.trim()}
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                            {editing ? 'Save Changes' : 'Save Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
