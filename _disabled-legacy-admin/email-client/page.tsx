'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Search, User, CheckCircle2, X, Paperclip } from 'lucide-react';
import EmailTemplatePicker from '@/components/admin/EmailTemplatePicker';

const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024; // 3MB — stays safely under serverless request-body limits once base64-encoded.

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

interface RecentClient {
    bookingId: string;
    name: string;
    email: string;
    phone: string;
    lastBookingDate: string;
}

export default function EmailClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<RecentClient[]>([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<RecentClient | null>(null);

    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentError, setAttachmentError] = useState('');
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

    const handleAttachmentPick = (file: File | null) => {
        setAttachmentError('');
        if (file && file.size > MAX_ATTACHMENT_BYTES) {
            setAttachmentError('File is too large — please keep attachments under 3MB.');
            setAttachment(null);
            if (attachmentInputRef.current) attachmentInputRef.current.value = '';
            return;
        }
        setAttachment(file);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchRecentClients();
        });
    }, [router]);

    const fetchRecentClients = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('bookings')
            .select('id,customer_name,customer_email,customer_phone,created_at')
            .is('deleted_at', null)
            .not('customer_email', 'is', null)
            .order('created_at', { ascending: false })
            .limit(300);

        const seen = new Set<string>();
        const unique: RecentClient[] = [];
        for (const b of data || []) {
            const email = (b.customer_email || '').trim().toLowerCase();
            if (!email || seen.has(email)) continue;
            seen.add(email);
            unique.push({
                bookingId: b.id,
                name: b.customer_name || 'Unknown',
                email,
                phone: b.customer_phone || '',
                lastBookingDate: b.created_at,
            });
        }
        setClients(unique);
        setLoading(false);
    };

    const pickClient = (c: RecentClient) => {
        setSelected(c);
        setTo(c.email);
    };

    const clearSelection = () => {
        setSelected(null);
        setTo('');
    };

    const handleSend = async () => {
        setResult(null);
        if (!to.includes('@') || !subject.trim() || !message.trim()) {
            setResult({ ok: false, text: 'Please fill in To, Subject, and Message.' });
            return;
        }
        setSending(true);
        try {
            const ccList = cc.split(',').map(e => e.trim()).filter(Boolean);
            const attachmentPayload = attachment
                ? { filename: attachment.name, content: await fileToBase64(attachment) }
                : null;
            const res = await adminFetch('/api/send-client-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to,
                    cc: ccList,
                    subject,
                    message,
                    bookingId: selected?.bookingId,
                    customerName: selected?.name,
                    attachment: attachmentPayload,
                }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || 'Failed to send');
            }
            setResult({ ok: true, text: `Email sent to ${to}` });
            setSubject('');
            setMessage('');
            setAttachment(null);
            if (attachmentInputRef.current) attachmentInputRef.current.value = '';
        } catch (err: any) {
            setResult({ ok: false, text: err.message || 'Something went wrong.' });
        } finally {
            setSending(false);
        }
    };

    const filteredClients = clients.filter(c =>
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/15 p-2.5 rounded-xl">
                    <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Email Client</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Send a direct email to any client — sent from <span className="font-semibold text-gray-700">info@taxiserviceksa.com</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent clients picker */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                        <h2 className="font-black text-gray-900 text-sm mb-3">Recent Clients</h2>
                        <div className="relative mb-3">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search name, email, phone..."
                                className="pl-9"
                            />
                        </div>
                        <div className="max-h-[480px] overflow-y-auto space-y-1.5">
                            {filteredClients.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-6">No clients found</p>
                            ) : (
                                filteredClients.slice(0, 100).map(c => (
                                    <button
                                        key={c.email}
                                        onClick={() => pickClient(c)}
                                        className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                                            selected?.email === c.email
                                                ? 'bg-primary/10 border-primary'
                                                : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{c.email}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Compose form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        {selected && (
                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="font-bold text-gray-900">{selected.name}</span>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-gray-600">{selected.phone}</span>
                                </div>
                                <button onClick={clearSelection} className="text-gray-400 hover:text-gray-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To *</label>
                                <Input
                                    type="email"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                    placeholder="client@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CC (optional, comma separated)</label>
                                <Input
                                    value={cc}
                                    onChange={e => setCc(e.target.value)}
                                    placeholder="teammate@taxiserviceksa.com"
                                />
                            </div>
                            <div>
                                <EmailTemplatePicker
                                    subject={subject}
                                    message={message}
                                    onLoad={(s, b) => { setSubject(s); setMessage(b); }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
                                <Input
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="e.g. Update on your booking"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message *</label>
                                <Textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Type your message to the client here..."
                                    rows={10}
                                />
                                <p className="text-xs text-gray-400 mt-1">Sent inside the standard Taxi Service KSA branded email template.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attachment (optional, max 3MB)</label>
                                <input
                                    ref={attachmentInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={e => handleAttachmentPick(e.target.files?.[0] || null)}
                                />
                                {attachment ? (
                                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                        <span className="flex items-center gap-1.5 text-gray-700 truncate"><Paperclip className="w-3.5 h-3.5 shrink-0" /> {attachment.name}</span>
                                        <button type="button" onClick={() => handleAttachmentPick(null)} className="text-gray-400 hover:text-red-500 shrink-0">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" size="sm" onClick={() => attachmentInputRef.current?.click()} className="bg-white gap-1.5">
                                        <Paperclip className="w-3.5 h-3.5" /> Attach File
                                    </Button>
                                )}
                                {attachmentError && <p className="text-xs text-red-500 mt-1">{attachmentError}</p>}
                            </div>
                        </div>

                        {result && (
                            <div className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                                result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {result.ok && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                {result.text}
                            </div>
                        )}

                        <div className="mt-5 flex justify-end">
                            <Button
                                onClick={handleSend}
                                disabled={sending}
                                className="bg-primary text-black hover:bg-black hover:text-white font-bold gap-2 px-6"
                            >
                                {sending ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" /> Send Email
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
