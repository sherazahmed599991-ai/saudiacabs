'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Building2, Plus, Trash2 } from 'lucide-react';

interface RateCard {
    id: string;
    company_name: string;
    pickup_location: string;
    destination: string;
    vehicle_type: string;
    rate: number;
    currency: string;
    notes?: string | null;
    created_at: string;
}

const VEHICLE_OPTIONS = [
    'Toyota Camry',
    'GMC Yukon XL / Denali',
    'Hyundai Staria VIP',
    'Hyundai Starex',
    'Toyota Hiace',
    'Toyota Coaster',
    'Mercedes S-Class',
    'BMW 7 Series',
    'Mercedes Sprinter',
    'Luxurious Bus',
];

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS b2b_rate_cards (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name     text NOT NULL,
  pickup_location  text NOT NULL,
  destination      text NOT NULL,
  vehicle_type     text NOT NULL,
  rate             numeric(10,2) NOT NULL,
  currency         text DEFAULT 'SAR',
  notes            text,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE b2b_rate_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON b2b_rate_cards;
CREATE POLICY "Admin full access" ON b2b_rate_cards FOR ALL USING (auth.role() = 'authenticated');`;

const EMPTY_FORM = {
    company_name: '',
    pickup_location: '',
    destination: '',
    vehicle_type: VEHICLE_OPTIONS[0],
    rate: '',
    currency: 'SAR',
    notes: '',
};

export default function B2BRateCardsPage() {
    const router = useRouter();
    const [rateCards, setRateCards] = useState<RateCard[]>([]);
    const [companyNames, setCompanyNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbReady, setDbReady] = useState(true);
    const [showSql, setShowSql] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [companyFilter, setCompanyFilter] = useState('all');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchRateCards();
            fetchCompanyNames();
        });
    }, [router]);

    const fetchRateCards = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('b2b_rate_cards')
            .select('*')
            .order('company_name');

        if (error) {
            setDbReady(false);
            setLoading(false);
            return;
        }
        setDbReady(true);
        setRateCards((data as RateCard[]) || []);
        setLoading(false);
    };

    const fetchCompanyNames = async () => {
        const { data } = await supabase.from('b2b_leads').select('company_name');
        if (data) setCompanyNames(Array.from(new Set(data.map(d => d.company_name))).sort());
    };

    const handleCreate = async () => {
        if (!form.company_name || !form.pickup_location || !form.destination || !form.rate) {
            alert('Please fill in company, route, and rate.');
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase.from('b2b_rate_cards').insert([{
                company_name: form.company_name,
                pickup_location: form.pickup_location,
                destination: form.destination,
                vehicle_type: form.vehicle_type,
                rate: Number(form.rate),
                currency: form.currency,
                notes: form.notes || null,
            }]);
            if (error) throw error;
            setForm(EMPTY_FORM);
            setShowAddForm(false);
            fetchRateCards();
        } catch (err) {
            console.error(err);
            alert('Failed to add rate.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this rate?')) return;
        await supabase.from('b2b_rate_cards').delete().eq('id', id);
        setRateCards(prev => prev.filter(r => r.id !== id));
    };

    const companies = Array.from(new Set(rateCards.map(r => r.company_name))).sort();
    const filtered = companyFilter === 'all' ? rateCards : rateCards.filter(r => r.company_name === companyFilter);

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
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">B2B Rate Cards</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Negotiated flat rates per corporate client — New Booking will suggest these automatically for a matching company + route + vehicle
                    </p>
                </div>
            </div>

            {!dbReady && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                    <p className="font-bold mb-1">Database Setup Required</p>
                    <p>Run this SQL in Supabase (SQL Editor) to create the b2b_rate_cards table:</p>
                    <button onClick={() => setShowSql(!showSql)} className="text-xs text-amber-700 underline mt-1">
                        {showSql ? 'Hide SQL' : 'Show SQL to create it'}
                    </button>
                    {showSql && <pre className="mt-2 bg-amber-100 rounded p-2 text-xs overflow-x-auto font-mono whitespace-pre-wrap">{SETUP_SQL}</pre>}
                </div>
            )}

            <div className="flex flex-wrap gap-3 mb-4 items-center">
                <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)} className="bg-white gap-2">
                    <Plus className="w-4 h-4" /> New Rate
                </Button>
                {companies.length > 0 && (
                    <select
                        value={companyFilter}
                        onChange={e => setCompanyFilter(e.target.value)}
                        className="h-10 rounded-md border border-gray-200 px-3 text-sm bg-white"
                    >
                        <option value="all">All Companies</option>
                        {companies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                )}
            </div>

            {showAddForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 space-y-4">
                    <datalist id="b2b-company-names">
                        {companyNames.map(c => <option key={c} value={c} />)}
                    </datalist>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input list="b2b-company-names" placeholder="Company name" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
                        <Input placeholder="Pickup location" value={form.pickup_location} onChange={e => setForm(f => ({ ...f, pickup_location: e.target.value }))} />
                        <Input placeholder="Destination" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                        <select
                            value={form.vehicle_type}
                            onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}
                            className="h-10 rounded-md border border-gray-200 px-3 text-sm bg-white"
                        >
                            {VEHICLE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <Input type="number" placeholder="Rate" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} />
                        <Input placeholder="Currency" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
                    </div>
                    <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                    <div className="flex gap-3">
                        <Button onClick={handleCreate} disabled={saving} className="bg-primary text-black hover:bg-black hover:text-white font-bold">
                            {saving ? 'Adding...' : 'Add Rate'}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}>Cancel</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-400 py-10">No rate cards yet.</TableCell>
                            </TableRow>
                        ) : filtered.map(r => (
                            <TableRow key={r.id}>
                                <TableCell className="font-semibold text-gray-900">{r.company_name}</TableCell>
                                <TableCell className="text-sm text-gray-700">{r.pickup_location} → {r.destination}</TableCell>
                                <TableCell className="text-sm text-gray-700">{r.vehicle_type}</TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{r.currency} {r.rate}</TableCell>
                                <TableCell className="text-xs text-gray-500">{r.notes || '—'}</TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)} title="Delete rate">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
