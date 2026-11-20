'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    ClipboardList, Search, Loader2, RefreshCw,
    Pencil, Trash2, CheckCircle, ArrowRightLeft, FileText, Download
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
    id: string;
    booking_id: string;
    admin_email: string;
    action: string;
    field_name?: string;
    old_value?: string;
    new_value?: string;
    created_at: string;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    status_change:  { icon: <ArrowRightLeft className="w-3.5 h-3.5" />, color: 'bg-blue-500/15 text-blue-400',    label: 'Status Change' },
    edit:           { icon: <Pencil className="w-3.5 h-3.5" />,         color: 'bg-amber-500/15 text-amber-400',  label: 'Edit' },
    delete:         { icon: <Trash2 className="w-3.5 h-3.5" />,         color: 'bg-red-500/15 text-red-400',      label: 'Delete' },
    restore:        { icon: <CheckCircle className="w-3.5 h-3.5" />,    color: 'bg-emerald-500/15 text-emerald-400', label: 'Restore' },
    create:         { icon: <FileText className="w-3.5 h-3.5" />,       color: 'bg-primary/15 text-primary',      label: 'Create' },
};

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS booking_audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL,
  admin_email text NOT NULL,
  action      text NOT NULL,
  field_name  text,
  old_value   text,
  new_value   text,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE booking_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON booking_audit_logs FOR ALL USING (auth.role() = 'authenticated');`;

export default function AuditLogPage() {
    const router = useRouter();
    const [logs, setLogs]         = useState<AuditLog[]>([]);
    const [loading, setLoading]   = useState(true);
    const [dbReady, setDbReady]   = useState(true);
    const [showSql, setShowSql]   = useState(false);
    const [search, setSearch]     = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [page, setPage]         = useState(1);
    const PER_PAGE = 50;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { router.push('/admin/login'); return; }
            fetchLogs();
        });
    }, [router]);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('booking_audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) { setDbReady(false); setLoading(false); return; }
        setLogs((data as AuditLog[]) || []);
        setLoading(false);
    };

    const filtered = logs.filter(l => {
        const matchAction = actionFilter === 'all' || l.action === actionFilter;
        const matchSearch = !search ||
            l.booking_id.toLowerCase().includes(search.toLowerCase()) ||
            l.admin_email.toLowerCase().includes(search.toLowerCase()) ||
            (l.field_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.new_value || '').toLowerCase().includes(search.toLowerCase());
        return matchAction && matchSearch;
    });

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);

    const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

    const timeStr = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

    const exportCSV = () => {
        const headers = ['Time', 'Action', 'Booking ID', 'Admin', 'Field', 'Old Value', 'New Value'];
        const rows = filtered.map(l => [
            timeStr(l.created_at),
            l.action,
            l.booking_id.slice(0, 8).toUpperCase(),
            l.admin_email,
            l.field_name || '',
            l.old_value  || '',
            l.new_value  || '',
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `audit-log-${new Date().toLocaleDateString('en-CA')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Audit Log
                    </h1>
                    <p className="text-neutral-400 mt-1">Full history of admin actions on bookings</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline" className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button onClick={fetchLogs} variant="outline" className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                </div>
            </div>

            {!dbReady && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-6">
                    <p className="font-bold text-amber-400 mb-1">⚠️ Table Missing</p>
                    <p className="text-sm text-amber-300 mb-2">Run this SQL in Supabase:</p>
                    <button onClick={() => setShowSql(!showSql)} className="text-xs text-amber-400 underline mb-2">
                        {showSql ? 'Hide SQL' : 'Show SQL'}
                    </button>
                    {showSql && <pre className="bg-neutral-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">{SETUP_SQL}</pre>}
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Actions', value: logs.length },
                    { label: 'Status Changes', value: logs.filter(l => l.action === 'status_change').length },
                    { label: 'Edits', value: logs.filter(l => l.action === 'edit').length },
                    { label: 'Deletions', value: logs.filter(l => l.action === 'delete').length },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest mb-1">{label}</p>
                        <p className="text-2xl font-black text-white">{value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search booking ID, admin email, field..."
                        className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', ...uniqueActions].map(a => (
                        <button
                            key={a}
                            onClick={() => { setActionFilter(a); setPage(1); }}
                            className={`text-xs px-3 py-2 rounded-lg font-bold capitalize transition-colors ${actionFilter === a ? 'bg-primary text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'}`}
                        >
                            {a === 'all' ? 'All' : a.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Log Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : (
                <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-neutral-900/50">
                                <tr className="border-b border-neutral-700">
                                    <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Action</th>
                                    <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Booking</th>
                                    <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Admin</th>
                                    <th className="text-left px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Change</th>
                                    <th className="text-right px-5 py-3 text-xs text-neutral-400 uppercase tracking-widest font-bold">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(log => {
                                    const cfg = ACTION_CONFIG[log.action] || {
                                        icon: <ClipboardList className="w-3.5 h-3.5" />,
                                        color: 'bg-neutral-500/15 text-neutral-400',
                                        label: log.action
                                    };
                                    return (
                                        <tr key={log.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/20 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <Badge className={`text-[10px] border-0 flex items-center gap-1.5 w-fit ${cfg.color}`}>
                                                    {cfg.icon}
                                                    {cfg.label}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-mono text-neutral-300">
                                                    #{log.booking_id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs text-neutral-400">{log.admin_email}</span>
                                            </td>
                                            <td className="px-5 py-3.5 max-w-[220px]">
                                                {log.field_name && (
                                                    <div className="flex items-center gap-1.5 text-xs flex-wrap">
                                                        {log.field_name && (
                                                            <span className="text-neutral-500 font-mono">{log.field_name}:</span>
                                                        )}
                                                        {log.old_value && (
                                                            <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[10px] line-through">{log.old_value}</span>
                                                        )}
                                                        {log.new_value && (
                                                            <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{log.new_value}</span>
                                                        )}
                                                    </div>
                                                )}
                                                {!log.field_name && log.new_value && (
                                                    <span className="text-xs text-neutral-400">{log.new_value}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className="text-xs text-neutral-500 font-mono">{timeStr(log.created_at)}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-neutral-500">
                            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>No audit logs found.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-neutral-700 flex items-center justify-between">
                            <p className="text-xs text-neutral-500">
                                Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)} className="border-neutral-600 text-neutral-300 h-7 text-xs">
                                    Prev
                                </Button>
                                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="border-neutral-600 text-neutral-300 h-7 text-xs">
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
