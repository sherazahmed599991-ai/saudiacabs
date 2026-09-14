'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Car, Plus, Pencil, Trash2, Loader2, Check, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

interface Vehicle {
    id: string;
    name: string;
    type: string;
    passengers: number;
    luggage: number;
    status: 'Active' | 'Maintenance' | 'Inactive';
    price_label: string;
    created_at?: string;
}

const VEHICLE_TYPES = ['Sedan', 'Luxury Sedan', 'SUV', 'Luxury SUV', 'Van', 'Minibus', 'Bus', 'Limousine'];
const STATUS_OPTS   = ['Active', 'Maintenance', 'Inactive'] as const;

const STATUS_STYLES: Record<string, string> = {
    Active:      'bg-green-500/15 text-green-400 border-green-500/30',
    Maintenance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Inactive:    'bg-red-500/15 text-red-400 border-red-500/30',
};

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS fleet (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  type         text NOT NULL DEFAULT 'Sedan',
  passengers   int  NOT NULL DEFAULT 4,
  luggage      int  NOT NULL DEFAULT 3,
  status       text NOT NULL DEFAULT 'Active',
  price_label  text NOT NULL DEFAULT '',
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE fleet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON fleet FOR ALL USING (auth.role() = 'authenticated');`;

const emptyForm = { name: '', type: 'Sedan', passengers: 4, luggage: 3, status: 'Active' as Vehicle['status'], price_label: '' };

export default function FleetPage() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading]   = useState(true);
    const [dbReady, setDbReady]   = useState(true);
    const [showSql, setShowSql]   = useState(false);

    const [open, setOpen]         = useState(false);
    const [editing, setEditing]   = useState<Vehicle | null>(null);
    const [form, setForm]         = useState(emptyForm);
    const [saving, setSaving]     = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchFleet();
        });
    }, [router]);

    const fetchFleet = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('fleet').select('*').order('name');
        if (error) { setDbReady(false); setLoading(false); return; }
        setVehicles((data as Vehicle[]) || []);
        setLoading(false);
    };

    const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const openEdit = (v: Vehicle) => {
        setEditing(v);
        setForm({ name: v.name, type: v.type, passengers: v.passengers, luggage: v.luggage, status: v.status, price_label: v.price_label });
        setOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        const payload = { ...form, name: form.name.trim() };
        if (editing) {
            await supabase.from('fleet').update(payload).eq('id', editing.id);
            setVehicles(prev => prev.map(v => v.id === editing.id ? { ...v, ...payload } : v));
        } else {
            const { data } = await supabase.from('fleet').insert(payload).select().single();
            if (data) setVehicles(prev => [...prev, data as Vehicle]);
        }
        setSaving(false);
        setOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this vehicle?')) return;
        await supabase.from('fleet').delete().eq('id', id);
        setVehicles(prev => prev.filter(v => v.id !== id));
    };

    const setF = (key: keyof typeof emptyForm, val: string | number) =>
        setForm(p => ({ ...p, [key]: val }));

    return (
        <div className="text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Fleet Management
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        {vehicles.filter(v => v.status === 'Active').length} active vehicles
                    </p>
                </div>
                <Button
                    onClick={openAdd}
                    disabled={!dbReady}
                    className="bg-primary text-black hover:bg-primary/90 font-bold"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                </Button>
            </div>

            {!dbReady && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-6">
                    <p className="font-bold text-amber-400 mb-2">⚠️ Table Missing</p>
                    <p className="text-sm text-amber-300 mb-2">Run this SQL in Supabase to enable fleet management:</p>
                    <button onClick={() => setShowSql(!showSql)} className="text-xs text-amber-400 underline mb-2">
                        {showSql ? 'Hide SQL' : 'Show SQL'}
                    </button>
                    {showSql && (
                        <pre className="bg-neutral-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">{SETUP_SQL}</pre>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {vehicles.map(v => (
                        <div key={v.id} className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden group hover:border-primary/40 transition-colors">
                            {/* Icon banner */}
                            <div className="h-28 bg-neutral-900 flex items-center justify-center">
                                <Car className="w-14 h-14 text-neutral-700 group-hover:text-neutral-600 transition-colors" />
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-black text-white text-lg group-hover:text-primary transition-colors">{v.name}</h3>
                                        <p className="text-sm text-neutral-400">{v.type}</p>
                                    </div>
                                    <Badge className={`text-[10px] border ${STATUS_STYLES[v.status]}`}>
                                        {v.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                                        <Users className="w-4 h-4 text-primary" />
                                        {v.passengers} seats
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                                        <Briefcase className="w-4 h-4 text-primary" />
                                        {v.luggage} bags
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-neutral-700">
                                    <span className="text-primary font-bold text-sm">{v.price_label || '—'}</span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(v)} className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {vehicles.length === 0 && (
                        <div className="col-span-3 text-center py-20 text-neutral-500">
                            No vehicles yet. Click &quot;Add Vehicle&quot; to start.
                        </div>
                    )}
                </div>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-700 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 uppercase font-bold">Vehicle Name</label>
                            <Input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Toyota Camry" className="bg-neutral-800 border-neutral-700 text-white" autoFocus />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs text-neutral-400 uppercase font-bold">Type</label>
                                <Select value={form.type} onValueChange={v => setF('type', v)}>
                                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                        {VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-neutral-400 uppercase font-bold">Status</label>
                                <Select value={form.status} onValueChange={v => setF('status', v)}>
                                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                        {STATUS_OPTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs text-neutral-400 uppercase font-bold">Seats</label>
                                <Input type="number" min={1} value={form.passengers} onChange={e => setF('passengers', +e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-neutral-400 uppercase font-bold">Luggage</label>
                                <Input type="number" min={0} value={form.luggage} onChange={e => setF('luggage', +e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 uppercase font-bold">Price Label</label>
                            <Input value={form.price_label} onChange={e => setF('price_label', e.target.value)} placeholder="e.g. Start from 250 SAR" className="bg-neutral-800 border-neutral-700 text-white" />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="bg-primary text-black font-bold hover:bg-primary/90">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                            {editing ? 'Save Changes' : 'Add Vehicle'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
