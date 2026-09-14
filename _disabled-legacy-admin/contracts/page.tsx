'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Repeat, Plus, Eye, Trash2, PlusCircle } from 'lucide-react';

type ContractStatus = 'active' | 'paused' | 'completed' | 'cancelled';

interface Contract {
    id: string;
    customer_name: string;
    customer_email?: string | null;
    customer_phone: string;
    pickup_location: string;
    destination: string;
    pickup_day_of_week: number;
    pickup_time: string;
    return_day_of_week: number;
    return_time: string;
    vehicle_type: string;
    preferred_driver?: string | null;
    monthly_rate?: number | null;
    currency?: string | null;
    status: ContractStatus;
    notes?: string | null;
    start_date: string;
    weeks_generated: number;
    created_at: string;
}

interface ContractBooking {
    id: string;
    pickup_location: string;
    destination: string;
    pickup_date: string;
    pickup_time: string;
    status: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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

const STATUS_COLOR: Record<ContractStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    paused: 'bg-amber-100 text-amber-700 border border-amber-200',
    completed: 'bg-blue-100 text-blue-700 border border-blue-200',
    cancelled: 'bg-red-100 text-red-600 border border-red-200',
};

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS contracts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name      text NOT NULL,
  customer_email     text,
  customer_phone     text NOT NULL,
  pickup_location    text NOT NULL,
  destination        text NOT NULL,
  pickup_day_of_week smallint NOT NULL,
  pickup_time        time NOT NULL,
  return_day_of_week smallint NOT NULL,
  return_time        time NOT NULL,
  vehicle_type       text NOT NULL,
  preferred_driver   text,
  monthly_rate       numeric(10,2),
  currency           text DEFAULT 'SAR',
  status             text NOT NULL DEFAULT 'active',
  notes              text,
  start_date         date NOT NULL DEFAULT CURRENT_DATE,
  weeks_generated    integer NOT NULL DEFAULT 0,
  created_at         timestamptz DEFAULT now()
);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access" ON contracts;
CREATE POLICY "Admin full access" ON contracts FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS preferred_driver text;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_contract_id ON bookings(contract_id);`;

const EMPTY_FORM = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_location: '',
    destination: '',
    pickup_day_of_week: 3,
    pickup_time: '18:00',
    return_day_of_week: 0,
    return_time: '05:00',
    vehicle_type: VEHICLE_OPTIONS[0],
    preferred_driver: '',
    monthly_rate: '',
    currency: 'SAR',
    notes: '',
    weeks_to_generate: 4,
};

// Next date on/after `from` that falls on `targetDow` (0=Sunday..6=Saturday).
function nextOccurrence(from: Date, targetDow: number): Date {
    const d = new Date(from);
    const diff = (targetDow - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    return d;
}

function toDateStr(d: Date): string {
    return d.toLocaleDateString('en-CA');
}

// Pickup date of the last week that has actually been generated for this
// contract — used to warn the admin before a client's bookings quietly
// run out because nobody clicked "Generate More Weeks" in time.
function getLastGeneratedPickupDate(contract: Contract): Date | null {
    if (!contract.weeks_generated || contract.weeks_generated <= 0) return null;
    const weekBase = new Date(contract.start_date + 'T00:00:00');
    weekBase.setDate(weekBase.getDate() + (contract.weeks_generated - 1) * 7);
    return nextOccurrence(weekBase, contract.pickup_day_of_week);
}

function daysUntilRunOut(contract: Contract): number | null {
    const lastDate = getLastGeneratedPickupDate(contract);
    if (!lastDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((lastDate.getTime() - today.getTime()) / 86400000);
}

function formatTime12h(timeStr?: string): string {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

export default function ContractsPage() {
    const router = useRouter();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbReady, setDbReady] = useState(true);
    const [showSql, setShowSql] = useState(false);

    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [contractBookings, setContractBookings] = useState<ContractBooking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [extendWeeks, setExtendWeeks] = useState(4);
    const [extending, setExtending] = useState(false);
    const driverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchContracts();
        });
    }, [router]);

    const fetchContracts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setDbReady(false);
            setLoading(false);
            return;
        }
        setDbReady(true);
        setContracts((data as Contract[]) || []);
        setLoading(false);
    };

    // Inserts pickup+return bookings for `count` weeks, starting at week index
    // `fromWeek` (0-based, relative to the contract's start_date). Weeks are
    // always spaced exactly 7 days apart so re-running with a later fromWeek
    // (the "extend" action) continues the same weekly cadence.
    const generateWeeks = async (contract: Contract, fromWeek: number, count: number) => {
        const rows = [];
        for (let w = fromWeek; w < fromWeek + count; w++) {
            const weekBase = new Date(contract.start_date + 'T00:00:00');
            weekBase.setDate(weekBase.getDate() + w * 7);
            const pickupDate = nextOccurrence(weekBase, contract.pickup_day_of_week);
            const returnDate = nextOccurrence(pickupDate, contract.return_day_of_week);
            const label = `Recurring contract — ${contract.customer_name} (week ${w + 1})`;

            rows.push({
                customer_name: contract.customer_name,
                customer_email: contract.customer_email || '',
                customer_phone: contract.customer_phone,
                pickup_location: contract.pickup_location,
                destination: contract.destination,
                pickup_date: toDateStr(pickupDate),
                pickup_time: contract.pickup_time,
                vehicle_type: contract.vehicle_type,
                driver_name: contract.preferred_driver || undefined,
                passengers: 1,
                luggage: 0,
                status: 'confirmed',
                special_requests: label,
                tags: 'Recurring Contract',
                currency: contract.currency || 'SAR',
                trip_type: 'point_to_point',
                contract_id: contract.id,
            });
            rows.push({
                customer_name: contract.customer_name,
                customer_email: contract.customer_email || '',
                customer_phone: contract.customer_phone,
                pickup_location: contract.destination,
                destination: contract.pickup_location,
                pickup_date: toDateStr(returnDate),
                pickup_time: contract.return_time,
                vehicle_type: contract.vehicle_type,
                driver_name: contract.preferred_driver || undefined,
                passengers: 1,
                luggage: 0,
                status: 'confirmed',
                special_requests: `${label} (return)`,
                tags: 'Recurring Contract',
                currency: contract.currency || 'SAR',
                trip_type: 'point_to_point',
                contract_id: contract.id,
            });
        }
        const { error } = await supabase.from('bookings').insert(rows);
        if (error) throw error;
    };

    const handleCreate = async () => {
        if (!form.customer_name || !form.customer_phone || !form.pickup_location || !form.destination) {
            alert('Please fill in customer name, phone, pickup and destination.');
            return;
        }
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('contracts')
                .insert([{
                    customer_name: form.customer_name,
                    customer_email: form.customer_email || null,
                    customer_phone: form.customer_phone,
                    pickup_location: form.pickup_location,
                    destination: form.destination,
                    pickup_day_of_week: form.pickup_day_of_week,
                    pickup_time: form.pickup_time,
                    return_day_of_week: form.return_day_of_week,
                    return_time: form.return_time,
                    vehicle_type: form.vehicle_type,
                    preferred_driver: form.preferred_driver || null,
                    monthly_rate: form.monthly_rate ? Number(form.monthly_rate) : null,
                    currency: form.currency,
                    notes: form.notes || null,
                    weeks_generated: 0,
                }])
                .select()
                .single();
            if (error) throw error;

            const contract = data as Contract;
            const weeksToGenerate = Math.max(1, Number(form.weeks_to_generate) || 4);
            await generateWeeks(contract, 0, weeksToGenerate);
            await supabase.from('contracts').update({ weeks_generated: weeksToGenerate }).eq('id', contract.id);

            setForm(EMPTY_FORM);
            setShowAddForm(false);
            fetchContracts();
            alert(`Contract created — ${weeksToGenerate * 2} bookings generated (${weeksToGenerate} pickups + ${weeksToGenerate} returns).`);
        } catch (err) {
            console.error(err);
            alert('Failed to create contract.');
        } finally {
            setSaving(false);
        }
    };

    const openContract = async (contract: Contract) => {
        setSelectedContract(contract);
        setLoadingBookings(true);
        const { data } = await supabase
            .from('bookings')
            .select('id,pickup_location,destination,pickup_date,pickup_time,status')
            .eq('contract_id', contract.id)
            .order('pickup_date', { ascending: true });
        setContractBookings((data as ContractBooking[]) || []);
        setLoadingBookings(false);
    };

    const handleExtend = async (contract: Contract) => {
        setExtending(true);
        try {
            await generateWeeks(contract, contract.weeks_generated, extendWeeks);
            const newTotal = contract.weeks_generated + extendWeeks;
            await supabase.from('contracts').update({ weeks_generated: newTotal }).eq('id', contract.id);
            setContracts(prev => prev.map(c => c.id === contract.id ? { ...c, weeks_generated: newTotal } : c));
            setSelectedContract(prev => prev && prev.id === contract.id ? { ...prev, weeks_generated: newTotal } : prev);
            await openContract({ ...contract, weeks_generated: newTotal });
            alert(`Generated ${extendWeeks} more weeks (${extendWeeks * 2} bookings).`);
        } catch (err) {
            console.error(err);
            alert('Failed to extend contract.');
        } finally {
            setExtending(false);
        }
    };

    const updateStatus = async (contract: Contract, status: ContractStatus) => {
        await supabase.from('contracts').update({ status }).eq('id', contract.id);
        setContracts(prev => prev.map(c => c.id === contract.id ? { ...c, status } : c));
        setSelectedContract(prev => prev && prev.id === contract.id ? { ...prev, status } : prev);
    };

    const updatePreferredDriver = async (contract: Contract, driver: string) => {
        const value = driver.trim() || null;
        if (value === (contract.preferred_driver || null)) return;
        await supabase.from('contracts').update({ preferred_driver: value }).eq('id', contract.id);
        setContracts(prev => prev.map(c => c.id === contract.id ? { ...c, preferred_driver: value } : c));
        setSelectedContract(prev => prev && prev.id === contract.id ? { ...prev, preferred_driver: value } : prev);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this contract? Bookings already generated from it will stay in the Bookings list (just unlinked).')) return;
        await supabase.from('contracts').delete().eq('id', id);
        setContracts(prev => prev.filter(c => c.id !== id));
        if (selectedContract?.id === id) setSelectedContract(null);
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
                    <Repeat className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Recurring Contracts</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Fixed monthly clients (e.g. weekly Khobar ↔ Bahrain runs) — set the weekly schedule once, bookings are generated automatically
                    </p>
                </div>
            </div>

            {!dbReady && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                    <p className="font-bold mb-1">Database Setup Required</p>
                    <p>Run this SQL in Supabase (SQL Editor) to create the contracts table:</p>
                    <button onClick={() => setShowSql(!showSql)} className="text-xs text-amber-700 underline mt-1">
                        {showSql ? 'Hide SQL' : 'Show SQL to create it'}
                    </button>
                    {showSql && <pre className="mt-2 bg-amber-100 rounded p-2 text-xs overflow-x-auto font-mono whitespace-pre-wrap">{SETUP_SQL}</pre>}
                </div>
            )}

            {(() => {
                const runningLow = contracts.filter(c => c.status === 'active' && (daysUntilRunOut(c) ?? 99) <= 7);
                if (runningLow.length === 0) return null;
                return (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
                        <p className="font-bold mb-1">⚠️ {runningLow.length} contract{runningLow.length > 1 ? 's' : ''} running low on generated bookings</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            {runningLow.map(c => {
                                const days = daysUntilRunOut(c)!;
                                return (
                                    <li key={c.id}>
                                        <button onClick={() => openContract(c)} className="underline font-semibold hover:text-red-900">{c.customer_name}</button>
                                        {' — '}{days < 0 ? `ran out ${Math.abs(days)}d ago` : days === 0 ? 'runs out today' : `only ${days}d of bookings left`}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })()}

            <div className="flex flex-wrap gap-3 mb-4">
                <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)} className="bg-white gap-2">
                    <Plus className="w-4 h-4" /> New Contract
                </Button>
            </div>

            {showAddForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input placeholder="Customer name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
                        <Input placeholder="Phone (+966...)" value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} />
                        <Input placeholder="Email (optional)" type="email" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} />
                        <Input placeholder="Pickup location (e.g. Khobar)" value={form.pickup_location} onChange={e => setForm(f => ({ ...f, pickup_location: e.target.value }))} />
                        <Input placeholder="Destination (e.g. Bahrain via Causeway)" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                        <select
                            value={form.vehicle_type}
                            onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}
                            className="h-10 rounded-md border border-gray-200 px-3 text-sm bg-white"
                        >
                            {VEHICLE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <Input placeholder="Preferred driver (optional)" value={form.preferred_driver} onChange={e => setForm(f => ({ ...f, preferred_driver: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Pickup Day</label>
                            <select
                                value={form.pickup_day_of_week}
                                onChange={e => setForm(f => ({ ...f, pickup_day_of_week: Number(e.target.value) }))}
                                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm bg-white"
                            >
                                {DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Pickup Time</label>
                            <Input type="time" value={form.pickup_time} onChange={e => setForm(f => ({ ...f, pickup_time: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Return Day</label>
                            <select
                                value={form.return_day_of_week}
                                onChange={e => setForm(f => ({ ...f, return_day_of_week: Number(e.target.value) }))}
                                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm bg-white"
                            >
                                {DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Return Time</label>
                            <Input type="time" value={form.return_time} onChange={e => setForm(f => ({ ...f, return_time: e.target.value }))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Monthly Rate</label>
                            <Input type="number" placeholder="e.g. 4000" value={form.monthly_rate} onChange={e => setForm(f => ({ ...f, monthly_rate: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Currency</label>
                            <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-gray-500">Generate how many weeks now?</label>
                            <Input type="number" min={1} value={form.weeks_to_generate} onChange={e => setForm(f => ({ ...f, weeks_to_generate: Number(e.target.value) || 1 }))} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Notes (alt pickup locations, driver preference, etc.)</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full min-h-[70px] p-2 text-sm border border-gray-200 rounded-md bg-white text-gray-900"
                            placeholder="e.g. Occasional pickup from Jubail or Ras Al Khair, SUV only"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={handleCreate} disabled={saving} className="bg-primary text-black hover:bg-black hover:text-white font-bold">
                            {saving ? 'Creating...' : 'Create Contract & Generate Bookings'}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}>Cancel</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Monthly Rate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Weeks Generated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contracts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-400 py-10">No recurring contracts yet.</TableCell>
                            </TableRow>
                        ) : contracts.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>
                                    <div className="font-semibold text-gray-900">{c.customer_name}</div>
                                    <div className="text-xs text-gray-500">{c.customer_phone}</div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-700">{c.pickup_location} ↔ {c.destination}</TableCell>
                                <TableCell className="text-xs text-gray-600">
                                    {DAY_NAMES[c.pickup_day_of_week]} {formatTime12h(c.pickup_time)} → {DAY_NAMES[c.return_day_of_week]} {formatTime12h(c.return_time)}
                                </TableCell>
                                <TableCell className="text-sm text-gray-700">
                                    {c.vehicle_type}
                                    {c.preferred_driver && <div className="text-xs text-gray-400">🧑‍✈️ {c.preferred_driver}</div>}
                                </TableCell>
                                <TableCell className="text-sm font-bold text-gray-900">{c.monthly_rate ? `${c.currency || 'SAR'} ${c.monthly_rate}` : '—'}</TableCell>
                                <TableCell>
                                    <select
                                        value={c.status}
                                        onChange={e => updateStatus(c, e.target.value as ContractStatus)}
                                        className={`h-7 rounded-full px-2 text-[11px] font-bold uppercase tracking-wide border-none outline-none ${STATUS_COLOR[c.status]}`}
                                    >
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </TableCell>
                                <TableCell className="text-sm text-gray-700">
                                    {c.weeks_generated}
                                    {c.status === 'active' && (daysUntilRunOut(c) ?? 99) <= 7 && (
                                        <Badge className="ml-1.5 bg-red-100 text-red-700 border-red-300 text-[10px]">⚠️ Renew</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => openContract(c)} title="View bookings">
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} title="Delete contract">
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={!!selectedContract} onOpenChange={(open) => { if (!open) setSelectedContract(null); }}>
                <SheetContent className="overflow-y-auto bg-white border-l border-gray-200 text-gray-900 w-full sm:max-w-xl">
                    {selectedContract && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{selectedContract.customer_name}</SheetTitle>
                                <SheetDescription>
                                    {selectedContract.pickup_location} ↔ {selectedContract.destination} · {selectedContract.vehicle_type}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-4 space-y-4">
                                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 border border-gray-100">
                                    <div className="flex justify-between"><span className="text-gray-500">Schedule</span><span className="font-semibold">{DAY_NAMES[selectedContract.pickup_day_of_week]} {formatTime12h(selectedContract.pickup_time)} → {DAY_NAMES[selectedContract.return_day_of_week]} {formatTime12h(selectedContract.return_time)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Monthly Rate</span><span className="font-semibold">{selectedContract.monthly_rate ? `${selectedContract.currency || 'SAR'} ${selectedContract.monthly_rate}` : '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-semibold">{selectedContract.customer_phone}</span></div>
                                    {selectedContract.customer_email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-semibold">{selectedContract.customer_email}</span></div>}
                                    {selectedContract.notes && <div className="pt-1 border-t border-gray-200 mt-1 text-gray-600">{selectedContract.notes}</div>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500">Preferred Driver (applies to future generated bookings only)</label>
                                    <Input
                                        key={selectedContract.id}
                                        ref={driverInputRef}
                                        defaultValue={selectedContract.preferred_driver || ''}
                                        onBlur={e => updatePreferredDriver(selectedContract, e.target.value)}
                                        placeholder="e.g. Ahmed"
                                        className="h-9 bg-white"
                                    />
                                </div>

                                {(() => {
                                    const days = daysUntilRunOut(selectedContract);
                                    if (days === null || days > 7) return null;
                                    return (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800 font-semibold">
                                            ⚠️ {days < 0 ? `Ran out ${Math.abs(days)} day(s) ago` : days === 0 ? 'Runs out today' : `Only ${days} day(s) of bookings left`} — generate more weeks below.
                                        </div>
                                    );
                                })()}

                                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={extendWeeks}
                                        onChange={e => setExtendWeeks(Number(e.target.value) || 1)}
                                        className="w-20 h-9 bg-white"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => handleExtend(selectedContract)}
                                        disabled={extending}
                                        className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <PlusCircle className="w-4 h-4" /> {extending ? 'Generating...' : 'Generate More Weeks'}
                                    </Button>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold text-gray-900">Generated Bookings ({contractBookings.length})</h3>
                                        <span className="text-[10px] text-gray-400">Click a trip to edit it (e.g. change pickup to Jubail for one week)</span>
                                    </div>
                                    {loadingBookings ? (
                                        <div className="text-sm text-gray-400">Loading...</div>
                                    ) : contractBookings.length === 0 ? (
                                        <div className="text-sm text-gray-400">No bookings generated yet.</div>
                                    ) : (
                                        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                                            {contractBookings.map(b => (
                                                <button
                                                    key={b.id}
                                                    type="button"
                                                    onClick={() => router.push(`/admin/bookings?openId=${b.id}`)}
                                                    className="w-full flex items-center justify-between text-xs bg-white border border-gray-100 rounded-lg px-3 py-2 hover:border-primary hover:bg-primary/5 transition-colors text-left"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{b.pickup_date} · {formatTime12h(b.pickup_time)}</div>
                                                        <div className="text-gray-500">{b.pickup_location} → {b.destination}</div>
                                                    </div>
                                                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px]">{b.status}</Badge>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
