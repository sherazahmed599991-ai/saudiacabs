'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { adminFetch } from '@/lib/admin-fetch';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Percent, DollarSign, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PromoCode {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
}

const EMPTY_FORM = {
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_uses: '',
    expires_at: '',
    is_active: true,
};

export default function PromoCodesPage() {
    const router = useRouter();
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin/login');
            } else {
                fetchCodes();
            }
        };
        checkSession();
    }, [router]);

    const fetchCodes = async () => {
        setLoading(true);
        const res = await adminFetch('/api/admin/promo-codes');
        if (res.ok) {
            const data = await res.json();
            setCodes(data);
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!form.code || !form.discount_value) {
            setError('Code and discount value are required.');
            return;
        }
        setSaving(true);
        setError('');
        const res = await adminFetch('/api/admin/promo-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: form.code,
                discount_type: form.discount_type,
                discount_value: Number(form.discount_value),
                max_uses: form.max_uses ? Number(form.max_uses) : null,
                expires_at: form.expires_at || null,
                is_active: form.is_active,
            }),
        });
        if (res.ok) {
            setForm(EMPTY_FORM);
            setShowForm(false);
            fetchCodes();
        } else {
            const d = await res.json();
            setError(d.error || 'Failed to create promo code');
        }
        setSaving(false);
    };

    const toggleActive = async (pc: PromoCode) => {
        await adminFetch('/api/admin/promo-codes', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: pc.id, is_active: !pc.is_active }),
        });
        setCodes(prev => prev.map(c => c.id === pc.id ? { ...c, is_active: !c.is_active } : c));
    };

    const deleteCode = async (id: string) => {
        if (!confirm('Delete this promo code?')) return;
        await adminFetch('/api/admin/promo-codes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        setCodes(prev => prev.filter(c => c.id !== id));
    };

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isExpired = (expires_at: string | null) =>
        expires_at ? new Date(expires_at) < new Date() : false;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Promo Codes</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage discount codes for customers</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-black hover:bg-black hover:text-white font-bold gap-2">
                    <Plus className="w-4 h-4" />
                    New Code
                </Button>
            </div>

            {/* DB Setup Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                <p className="font-bold mb-1">Database Setup Required</p>
                <p>Run this SQL in Supabase to create the promo_codes table:</p>
                <pre className="mt-2 bg-amber-100 rounded p-2 text-xs overflow-x-auto font-mono">{`CREATE TABLE promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  discount_type text CHECK (discount_type IN ('percentage','fixed')) NOT NULL,
  discount_value numeric NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);`}</pre>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h2 className="font-black text-gray-900 mb-4">Create Promo Code</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Code *</label>
                            <Input
                                value={form.code}
                                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                placeholder="e.g. SUMMER20"
                                className="font-mono font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Type *</label>
                            <select
                                value={form.discount_type}
                                onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as any }))}
                                className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm font-medium bg-white"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (SAR)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Value *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {form.discount_type === 'percentage' ? '%' : 'SAR'}
                                </span>
                                <Input
                                    type="number"
                                    value={form.discount_value}
                                    onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                                    placeholder="0"
                                    className="pl-12"
                                    min={0}
                                    max={form.discount_type === 'percentage' ? 100 : undefined}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Uses (leave blank for unlimited)</label>
                            <Input
                                type="number"
                                value={form.max_uses}
                                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                                placeholder="Unlimited"
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expires At (optional)</label>
                            <Input
                                type="datetime-local"
                                value={form.expires_at}
                                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-bold text-gray-700">Active</label>
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                    <div className="flex gap-3 mt-4">
                        <Button onClick={handleCreate} disabled={saving} className="bg-primary text-black hover:bg-black hover:text-white font-bold">
                            {saving ? 'Creating...' : 'Create Code'}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
                    </div>
                </div>
            )}

            {/* Codes Table */}
            {codes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No promo codes yet</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first code to offer discounts to customers</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Code</th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Discount</th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Uses</th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Expires</th>
                                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-black text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {codes.map(pc => (
                                    <tr key={pc.id} className={`hover:bg-gray-50 transition-colors ${!pc.is_active || isExpired(pc.expires_at) ? 'opacity-50' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">{pc.code}</span>
                                                <button onClick={() => copyCode(pc.code, pc.id)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                                    {copiedId === pc.id ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 font-bold text-gray-900">
                                                {pc.discount_type === 'percentage' ? (
                                                    <><Percent className="w-3.5 h-3.5 text-blue-500" />{pc.discount_value}% off</>
                                                ) : (
                                                    <><DollarSign className="w-3.5 h-3.5 text-green-500" />SAR {pc.discount_value} off</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {pc.used_count}{pc.max_uses !== null ? ` / ${pc.max_uses}` : ' / ∞'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {pc.expires_at ? (
                                                <span className={`text-xs font-medium ${isExpired(pc.expires_at) ? 'text-red-500' : 'text-gray-600'}`}>
                                                    {isExpired(pc.expires_at) ? 'Expired' : new Date(pc.expires_at).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Never</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={pc.is_active && !isExpired(pc.expires_at) ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500 border border-gray-200'}>
                                                {pc.is_active && !isExpired(pc.expires_at) ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleActive(pc)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                                    title={pc.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {pc.is_active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => deleteCode(pc.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
                                                >
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
        </div>
    );
}
