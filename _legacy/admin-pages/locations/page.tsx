'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MapPin, Plus, Pencil, Trash2, Loader2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

interface Location {
    id: string;
    name: string;
    type: string;
    status: 'Active' | 'Inactive';
    created_at?: string;
}

const LOCATION_TYPES = ['City', 'Holy City', 'Airport', 'Hotel Zone', 'Border', 'Other'];

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS locations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  type       text NOT NULL DEFAULT 'City',
  status     text NOT NULL DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON locations FOR ALL USING (auth.role() = 'authenticated');`;

export default function LocationsPage() {
    const router = useRouter();
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading]     = useState(true);
    const [dbReady, setDbReady]     = useState(true);
    const [showSql, setShowSql]     = useState(false);

    const [open, setOpen]           = useState(false);
    const [editing, setEditing]     = useState<Location | null>(null);
    const [form, setForm]           = useState({ name: '', type: 'City', status: 'Active' as 'Active' | 'Inactive' });
    const [saving, setSaving]       = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchLocations();
        });
    }, [router]);

    const fetchLocations = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('locations').select('*').order('name');
        if (error) { setDbReady(false); setLoading(false); return; }
        setLocations((data as Location[]) || []);
        setLoading(false);
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', type: 'City', status: 'Active' });
        setOpen(true);
    };

    const openEdit = (loc: Location) => {
        setEditing(loc);
        setForm({ name: loc.name, type: loc.type, status: loc.status });
        setOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        if (editing) {
            const { error } = await supabase.from('locations').update({ name: form.name.trim(), type: form.type, status: form.status }).eq('id', editing.id);
            if (!error) setLocations(prev => prev.map(l => l.id === editing.id ? { ...l, ...form, name: form.name.trim() } : l));
        } else {
            const { data, error } = await supabase.from('locations').insert({ name: form.name.trim(), type: form.type, status: form.status }).select().single();
            if (!error && data) setLocations(prev => [...prev, data as Location].sort((a, b) => a.name.localeCompare(b.name)));
        }
        setSaving(false);
        setOpen(false);
    };

    const toggleStatus = async (loc: Location) => {
        const next = loc.status === 'Active' ? 'Inactive' : 'Active';
        await supabase.from('locations').update({ status: next }).eq('id', loc.id);
        setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, status: next } : l));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this location?')) return;
        await supabase.from('locations').delete().eq('id', id);
        setLocations(prev => prev.filter(l => l.id !== id));
    };

    const activeCount = locations.filter(l => l.status === 'Active').length;

    return (
        <div className="text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Locations
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        Manage service areas · <span className="text-primary font-bold">{activeCount} active</span>
                    </p>
                </div>
                <Button
                    onClick={openAdd}
                    disabled={!dbReady}
                    className="bg-primary text-black hover:bg-primary/90 font-bold"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Location
                </Button>
            </div>

            {!dbReady && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-6">
                    <p className="font-bold text-amber-400 mb-2">⚠️ Table Missing</p>
                    <p className="text-sm text-amber-300 mb-2">Run this SQL in Supabase to enable locations:</p>
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
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-900/50">
                                <tr className="border-b border-neutral-700">
                                    <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Location</th>
                                    <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Type</th>
                                    <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Status</th>
                                    <th className="text-right px-5 py-3 w-28" />
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map(loc => (
                                    <tr key={loc.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-neutral-900 p-2 rounded-lg shrink-0">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-bold text-white">{loc.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-300 text-sm">{loc.type}</td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => toggleStatus(loc)}
                                                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${loc.status === 'Active' ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'}`}
                                            >
                                                {loc.status === 'Active'
                                                    ? <><ToggleRight className="w-3.5 h-3.5" />Active</>
                                                    : <><ToggleLeft className="w-3.5 h-3.5" />Inactive</>
                                                }
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(loc)} className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-600">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {locations.length === 0 && (
                        <div className="text-center py-16 text-neutral-500">
                            No locations yet. Click &quot;Add Location&quot; to start.
                        </div>
                    )}
                </div>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-700 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Location' : 'Add Location'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 uppercase font-bold">Name</label>
                            <Input
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Jeddah Airport"
                                className="bg-neutral-800 border-neutral-700 text-white"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 uppercase font-bold">Type</label>
                            <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                    {LOCATION_TYPES.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 uppercase font-bold">Status</label>
                            <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as 'Active' | 'Inactive' }))}>
                                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="bg-primary text-black font-bold hover:bg-primary/90">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                            {editing ? 'Save Changes' : 'Add Location'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
