'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Building2, Upload, Plus, Search, Send, X, Trash2,
    CheckCircle2, Mail, Loader2, Pencil, StickyNote, Download, Paperclip
} from 'lucide-react';
import EmailTemplatePicker from '@/components/admin/EmailTemplatePicker';

type LeadStatus = 'not_contacted' | 'contacted' | 'responded' | 'not_interested';

interface Lead {
    id: string;
    company_name: string;
    email: string;
    country: string | null;
    group_name: string;
    status: LeadStatus;
    last_contacted_at: string | null;
    notes: string | null;
    created_at: string;
}

const STATUS_LABEL: Record<LeadStatus, string> = {
    not_contacted: 'Not Contacted',
    contacted: 'Contacted',
    responded: 'Responded',
    not_interested: 'Not Interested',
};

const STATUS_COLOR: Record<LeadStatus, string> = {
    not_contacted: 'bg-gray-100 text-gray-600 border border-gray-200',
    contacted: 'bg-blue-100 text-blue-700 border border-blue-200',
    responded: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    not_interested: 'bg-red-100 text-red-600 border border-red-200',
};

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS b2b_leads (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name       text NOT NULL,
  email              text NOT NULL,
  country            text,
  group_name         text NOT NULL DEFAULT 'General',
  status             text NOT NULL DEFAULT 'not_contacted',
  last_contacted_at  timestamptz,
  notes              text,
  created_at         timestamptz DEFAULT now()
);
ALTER TABLE b2b_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON b2b_leads FOR ALL USING (auth.role() = 'authenticated');`;

const EMPTY_FORM = { company_name: '', email: '', country: '', group_name: 'General' };
const EMPTY_EDIT_FORM = { company_name: '', email: '', country: '', group_name: '', notes: '' };

// Minimal CSV parser — handles quoted fields (so a company name with a
// comma in it doesn't split into two columns).
function parseCsv(text: string): Record<string, string>[] {
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (line[i + 1] === '"') { cur += '"'; i++; }
                    else inQuotes = false;
                } else cur += ch;
            } else if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                result.push(cur); cur = '';
            } else {
                cur += ch;
            }
        }
        result.push(cur);
        return result;
    };
    const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
        const values = parseLine(line);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
        return row;
    });
}

export default function B2BLeadsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbReady, setDbReady] = useState(true);
    const [showSql, setShowSql] = useState(false);

    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
    const [savingEdit, setSavingEdit] = useState(false);

    const [importing, setImporting] = useState(false);
    const [importMsg, setImportMsg] = useState('');

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showCompose, setShowCompose] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [cc, setCc] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentError, setAttachmentError] = useState('');
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const [sending, setSending] = useState(false);
    const [sendProgress, setSendProgress] = useState({ done: 0, total: 0, failed: 0 });
    const [bulkDeleting, setBulkDeleting] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchLeads();
        });
    }, [router]);

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('b2b_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setDbReady(false);
            setLoading(false);
            return;
        }
        setDbReady(true);
        setLeads((data as Lead[]) || []);
        setLoading(false);
    };

    const groups = useMemo(() => {
        const set = new Set(leads.map(l => l.group_name).filter(Boolean));
        return Array.from(set).sort();
    }, [leads]);

    const filtered = useMemo(() => {
        return leads.filter(l => {
            if (groupFilter !== 'all' && l.group_name !== groupFilter) return false;
            if (statusFilter !== 'all' && l.status !== statusFilter) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                if (!l.company_name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !(l.country || '').toLowerCase().includes(q)) {
                    return false;
                }
            }
            return true;
        });
    }, [leads, groupFilter, statusFilter, search]);

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAllFiltered = () => {
        const allSelected = filtered.every(l => selected.has(l.id));
        setSelected(prev => {
            const next = new Set(prev);
            if (allSelected) {
                filtered.forEach(l => next.delete(l.id));
            } else {
                filtered.forEach(l => next.add(l.id));
            }
            return next;
        });
    };

    const handleAddLead = async () => {
        if (!form.company_name.trim() || !form.email.includes('@')) return;
        setSaving(true);
        const payload = {
            company_name: form.company_name.trim(),
            email: form.email.trim().toLowerCase(),
            country: form.country.trim() || null,
            group_name: form.group_name.trim() || 'General',
        };
        const { data } = await supabase.from('b2b_leads').insert(payload).select().single();
        if (data) setLeads(prev => [data as Lead, ...prev]);
        setForm(EMPTY_FORM);
        setShowAddForm(false);
        setSaving(false);
    };

    const openComposeForSingle = (lead: Lead) => {
        setSelected(new Set([lead.id]));
        setShowCompose(true);
    };

    const openEdit = (lead: Lead) => {
        setEditingLead(lead);
        setEditForm({
            company_name: lead.company_name,
            email: lead.email,
            country: lead.country || '',
            group_name: lead.group_name,
            notes: lead.notes || '',
        });
    };

    const closeEdit = () => {
        setEditingLead(null);
        setEditForm(EMPTY_EDIT_FORM);
    };

    const handleSaveEdit = async () => {
        if (!editingLead || !editForm.company_name.trim() || !editForm.email.includes('@')) return;
        setSavingEdit(true);
        const payload = {
            company_name: editForm.company_name.trim(),
            email: editForm.email.trim().toLowerCase(),
            country: editForm.country.trim() || null,
            group_name: editForm.group_name.trim() || 'General',
            notes: editForm.notes.trim() || null,
        };
        const { error } = await supabase.from('b2b_leads').update(payload).eq('id', editingLead.id);
        if (!error) {
            setLeads(prev => prev.map(l => l.id === editingLead.id ? { ...l, ...payload } : l));
            closeEdit();
        }
        setSavingEdit(false);
    };

    const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
        await supabase.from('b2b_leads').update({ status: newStatus }).eq('id', lead.id);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this lead?')) return;
        await supabase.from('b2b_leads').delete().eq('id', id);
        setLeads(prev => prev.filter(l => l.id !== id));
        setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selected);
        if (ids.length === 0) return;
        if (!confirm(`Remove ${ids.length} selected compan${ids.length > 1 ? 'ies' : 'y'}?`)) return;
        setBulkDeleting(true);
        await supabase.from('b2b_leads').delete().in('id', ids);
        setLeads(prev => prev.filter(l => !selected.has(l.id)));
        setSelected(new Set());
        setBulkDeleting(false);
    };

    const handleBulkStatusChange = async (newStatus: LeadStatus) => {
        const ids = Array.from(selected);
        if (ids.length === 0) return;
        setLeads(prev => prev.map(l => selected.has(l.id) ? { ...l, status: newStatus } : l));
        await supabase.from('b2b_leads').update({ status: newStatus }).in('id', ids);
    };

    const exportCsv = () => {
        const header = ['company_name', 'email', 'country', 'group', 'status', 'last_contacted_at', 'notes'];
        const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
        const rows = filtered.map(l => [
            l.company_name, l.email, l.country || '', l.group_name,
            STATUS_LABEL[l.status], l.last_contacted_at || '', l.notes || '',
        ].map(v => escapeCsv(String(v))).join(','));
        const csv = [header.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `b2b-leads-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024; // 3MB — stays safely under serverless request-body limits once base64-encoded.

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

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

    const handleImportFile = async (file: File) => {
        setImporting(true);
        setImportMsg('');
        try {
            const text = await file.text();
            const rows = parseCsv(text);
            const toInsert = rows
                .map(r => ({
                    company_name: r['company_name'] || r['company'] || r['name'] || '',
                    email: (r['email'] || '').toLowerCase(),
                    country: r['country'] || null,
                    group_name: r['group'] || r['group_name'] || r['tag'] || r['category'] || 'General',
                }))
                .filter(l => l.company_name && l.email.includes('@'));

            if (toInsert.length === 0) {
                setImportMsg('No valid rows found. Expected columns: company_name, email, country, group.');
                setImporting(false);
                return;
            }

            const { data, error } = await supabase.from('b2b_leads').insert(toInsert).select();
            if (error) throw error;
            setLeads(prev => [...((data as Lead[]) || []), ...prev]);
            setImportMsg(`Imported ${toInsert.length} companies successfully.`);
        } catch (err: any) {
            setImportMsg(`Import failed: ${err.message || 'unknown error'}`);
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const selectedLeads = leads.filter(l => selected.has(l.id));

    const handleSendCampaign = async () => {
        if (!subject.trim() || !message.trim() || selectedLeads.length === 0) return;
        setSending(true);
        setSendProgress({ done: 0, total: selectedLeads.length, failed: 0 });

        const ccList = cc.split(',').map(e => e.trim()).filter(Boolean);
        const attachmentPayload = attachment
            ? { filename: attachment.name, content: await fileToBase64(attachment) }
            : null;

        let done = 0;
        let failed = 0;
        for (const lead of selectedLeads) {
            const personalizedMessage = message.replace(/\{\{\s*company\s*\}\}/gi, lead.company_name);
            const personalizedSubject = subject.replace(/\{\{\s*company\s*\}\}/gi, lead.company_name);
            try {
                const res = await adminFetch('/api/send-b2b-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: lead.email,
                        cc: ccList,
                        companyName: lead.company_name,
                        subject: personalizedSubject,
                        message: personalizedMessage,
                        attachment: attachmentPayload,
                    }),
                });
                if (!res.ok) throw new Error('send failed');

                await supabase
                    .from('b2b_leads')
                    .update({ status: 'contacted', last_contacted_at: new Date().toISOString() })
                    .eq('id', lead.id);

                setLeads(prev => prev.map(l => l.id === lead.id
                    ? { ...l, status: 'contacted', last_contacted_at: new Date().toISOString() }
                    : l));
                done++;
            } catch {
                failed++;
            }
            setSendProgress({ done: done + failed, total: selectedLeads.length, failed });
            // Small delay between sends — kind to the mail provider's rate limits.
            await new Promise(r => setTimeout(r, 400));
        }

        setSending(false);
    };

    const closeCompose = () => {
        setShowCompose(false);
        setSubject('');
        setMessage('');
        setCc('');
        setAttachment(null);
        setAttachmentError('');
        if (attachmentInputRef.current) attachmentInputRef.current.value = '';
        setSendProgress({ done: 0, total: 0, failed: 0 });
    };

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
                    <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">B2B Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Umrah/Hajj travel companies and other partners — import, group, and email in bulk
                    </p>
                </div>
            </div>

            {!dbReady && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                    <p className="font-bold mb-1">Database Setup Required</p>
                    <p>Run this SQL in Supabase to create the b2b_leads table:</p>
                    <button onClick={() => setShowSql(!showSql)} className="text-xs text-amber-700 underline mt-1">
                        {showSql ? 'Hide SQL' : 'Show SQL to create it'}
                    </button>
                    {showSql && <pre className="mt-2 bg-amber-100 rounded p-2 text-xs overflow-x-auto font-mono">{SETUP_SQL}</pre>}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company, email, country..." className="pl-9" />
                </div>
                <select
                    value={groupFilter}
                    onChange={e => setGroupFilter(e.target.value)}
                    className="h-10 rounded-md border border-gray-200 px-3 text-sm font-medium bg-white"
                >
                    <option value="all">All Groups</option>
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="h-10 rounded-md border border-gray-200 px-3 text-sm font-medium bg-white"
                >
                    <option value="all">All Statuses</option>
                    {(Object.keys(STATUS_LABEL) as LeadStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleImportFile(e.target.files[0])}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing} className="bg-white gap-2">
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Import CSV
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)} className="bg-white gap-2">
                    <Plus className="w-4 h-4" /> Add Company
                </Button>
                <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0} className="bg-white gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </Button>
            </div>

            {importMsg && (
                <div className="mb-4 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-2">{importMsg}</div>
            )}

            <p className="text-xs text-gray-400 mb-4">
                CSV columns expected: <code className="bg-gray-100 px-1 rounded">company_name, email, country, group</code>
            </p>

            {/* Add form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input placeholder="Company name" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
                        <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        <Input placeholder="Country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                        <Input placeholder="Group (e.g. Pakistan Umrah)" value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} />
                    </div>
                    <div className="flex gap-3 mt-3">
                        <Button onClick={handleAddLead} disabled={saving} className="bg-primary text-black hover:bg-black hover:text-white font-bold">
                            {saving ? 'Adding...' : 'Add Company'}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}>Cancel</Button>
                    </div>
                </div>
            )}

            {/* Selection bar */}
            {selected.size > 0 && (
                <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-2 bg-gray-900 text-white rounded-xl px-4 py-3 mb-4 shadow-lg">
                    <span className="text-sm font-bold">{selected.size} compan{selected.size > 1 ? 'ies' : 'y'} selected</span>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            defaultValue=""
                            onChange={e => { if (e.target.value) { handleBulkStatusChange(e.target.value as LeadStatus); e.target.value = ''; } }}
                            className="h-8 rounded-lg bg-white/10 border border-white/20 text-white text-xs px-2 outline-none"
                        >
                            <option value="" disabled>Change status to...</option>
                            {(Object.keys(STATUS_LABEL) as LeadStatus[]).map(s => (
                                <option key={s} value={s} className="text-gray-900">{STATUS_LABEL[s]}</option>
                            ))}
                        </select>
                        <Button size="sm" variant="ghost" onClick={handleBulkDelete} disabled={bulkDeleting} className="text-red-300 hover:bg-red-500/10 hover:text-red-200 gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="text-white hover:bg-white/10">
                            Clear
                        </Button>
                        <Button size="sm" onClick={() => setShowCompose(true)} className="bg-primary text-black hover:bg-white font-bold gap-1.5">
                            <Send className="w-3.5 h-3.5" /> Compose Campaign
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No companies yet</p>
                    <p className="text-gray-400 text-sm mt-1">Import a CSV or add companies to start building your outreach list</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 w-8">
                                        <input type="checkbox" checked={filtered.length > 0 && filtered.every(l => selected.has(l.id))} onChange={toggleSelectAllFiltered} />
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Company</th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Country</th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Group</th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Last Contacted</th>
                                    <th className="text-right px-4 py-3 text-xs font-black text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(l => (
                                    <tr key={l.id} className={`hover:bg-gray-50 transition-colors ${selected.has(l.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleSelect(l.id)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <p className="font-bold text-gray-900">{l.company_name}</p>
                                                {l.notes && (
                                                    <span title={l.notes}>
                                                        <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{l.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{l.country || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{l.group_name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={l.status}
                                                onChange={e => handleStatusChange(l, e.target.value as LeadStatus)}
                                                className={`text-xs font-bold rounded-full px-2 py-1 border outline-none cursor-pointer ${STATUS_COLOR[l.status]}`}
                                            >
                                                {(Object.keys(STATUS_LABEL) as LeadStatus[]).map(s => (
                                                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {l.last_contacted_at ? new Date(l.last_contacted_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openComposeForSingle(l)}
                                                    title="Email this company"
                                                    className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-gray-400 hover:text-primary"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEdit(l)}
                                                    title="Edit company"
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(l.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Compose Campaign Panel */}
            {showCompose && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeCompose}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="font-black text-gray-900">Compose Campaign</h2>
                            <button onClick={closeCompose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                Sending to <strong>{selectedLeads.length}</strong> compan{selectedLeads.length > 1 ? 'ies' : 'y'}
                                {groupFilter !== 'all' ? ` in "${groupFilter}"` : ''}. Use <code className="bg-gray-200 px-1 rounded">{'{{company}}'}</code> anywhere to insert each company's name automatically.
                            </p>
                            <div>
                                <EmailTemplatePicker
                                    subject={subject}
                                    message={message}
                                    onLoad={(s, b) => { setSubject(s); setMessage(b); }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
                                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Partnership Opportunity — Ground Transport in Saudi Arabia" disabled={sending} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CC (optional, comma separated)</label>
                                <Input value={cc} onChange={e => setCc(e.target.value)} placeholder="teammate@taxiserviceksa.com" disabled={sending} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message *</label>
                                <Textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder={`Dear {{company}} team,\n\nWe'd like to introduce Taxi Service KSA as your trusted ground transport partner for pilgrims traveling to Makkah and Madinah...`}
                                    rows={10}
                                    disabled={sending}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attachment (optional, max 3MB)</label>
                                <input
                                    ref={attachmentInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={e => handleAttachmentPick(e.target.files?.[0] || null)}
                                    disabled={sending}
                                />
                                {attachment ? (
                                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                        <span className="flex items-center gap-1.5 text-gray-700 truncate"><Paperclip className="w-3.5 h-3.5 shrink-0" /> {attachment.name}</span>
                                        <button type="button" onClick={() => handleAttachmentPick(null)} disabled={sending} className="text-gray-400 hover:text-red-500 shrink-0">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" size="sm" onClick={() => attachmentInputRef.current?.click()} disabled={sending} className="bg-white gap-1.5">
                                        <Paperclip className="w-3.5 h-3.5" /> Attach File
                                    </Button>
                                )}
                                {attachmentError && <p className="text-xs text-red-500 mt-1">{attachmentError}</p>}
                                <p className="text-[11px] text-gray-400 mt-1">Same file is attached to every email in this campaign.</p>
                            </div>

                            {sendProgress.total > 0 && (
                                <div>
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Sending... {sendProgress.done} / {sendProgress.total}</span>
                                        {sendProgress.failed > 0 && <span className="text-red-500">{sendProgress.failed} failed</span>}
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all" style={{ width: `${(sendProgress.done / sendProgress.total) * 100}%` }} />
                                    </div>
                                </div>
                            )}

                            {!sending && sendProgress.total > 0 && sendProgress.done === sendProgress.total && (
                                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4" /> Campaign sent — {sendProgress.done - sendProgress.failed} delivered{sendProgress.failed > 0 ? `, ${sendProgress.failed} failed` : ''}.
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={closeCompose} disabled={sending}>
                                    {sendProgress.done > 0 && sendProgress.done === sendProgress.total ? 'Close' : 'Cancel'}
                                </Button>
                                <Button
                                    onClick={handleSendCampaign}
                                    disabled={sending || !subject.trim() || !message.trim() || selectedLeads.length === 0 || (sendProgress.done > 0 && sendProgress.done === sendProgress.total)}
                                    className="bg-primary text-black hover:bg-black hover:text-white font-bold gap-2"
                                >
                                    {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Campaign</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Company Panel */}
            {editingLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeEdit}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="font-black text-gray-900">Edit Company</h2>
                            <button onClick={closeEdit} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name *</label>
                                <Input value={editForm.company_name} onChange={e => setEditForm(f => ({ ...f, company_name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
                                <Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country</label>
                                    <Input value={editForm.country} onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Group</label>
                                    <Input value={editForm.group_name} onChange={e => setEditForm(f => ({ ...f, group_name: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                                <Textarea
                                    value={editForm.notes}
                                    onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="e.g. Spoke on phone 20 Jul, interested in group Umrah packages..."
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={closeEdit} disabled={savingEdit}>Cancel</Button>
                                <Button
                                    onClick={handleSaveEdit}
                                    disabled={savingEdit || !editForm.company_name.trim() || !editForm.email.includes('@')}
                                    className="bg-primary text-black hover:bg-black hover:text-white font-bold"
                                >
                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
