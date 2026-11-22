import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingRequest, Quotation, Invoice } from "@/lib/types";
import { formatSAR, formatDate, todayInRiyadh } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

export const metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };

const MAX_ROWS = 1000; // Supabase's default row cap; plenty for a month's totals.

async function getDashboardData() {
  const supabase = await createSupabaseServerClient();

  const today = todayInRiyadh();
  const monthStart = `${today.slice(0, 7)}-01`;
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    newLeads,
    staleLeads,
    openQuotations,
    unpaidInvoices,
    sentInvoices,
    monthReceipts,
    recentBookings,
    recentQuotations,
    recentInvoices,
  ] = await Promise.all([
    supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "new").lt("created_at", dayAgo),
    supabase.from("quotations").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
    supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
    supabase.from("invoices").select("total, due_date").eq("status", "sent").limit(MAX_ROWS),
    supabase.from("receipts").select("amount_paid").gte("paid_at", monthStart).limit(MAX_ROWS),
    supabase
      .from("booking_requests")
      .select("id, full_name, phone, service_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("quotations").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const sent = (sentInvoices.data ?? []) as { total: number; due_date: string | null }[];
  const awaitingAmount = sent.reduce((sum, i) => sum + Number(i.total), 0);
  const overdue = sent.filter((i) => i.due_date && i.due_date < today);
  const overdueAmount = overdue.reduce((sum, i) => sum + Number(i.total), 0);
  const collectedThisMonth = ((monthReceipts.data ?? []) as { amount_paid: number }[]).reduce(
    (sum, r) => sum + Number(r.amount_paid),
    0
  );

  return {
    newLeads: newLeads.count ?? 0,
    staleLeads: staleLeads.count ?? 0,
    openQuotations: openQuotations.count ?? 0,
    unpaidInvoices: unpaidInvoices.count ?? 0,
    awaitingAmount,
    overdueCount: overdue.length,
    overdueAmount,
    collectedThisMonth,
    monthLabel: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "Asia/Riyadh" }),
    recentBookings: (recentBookings.data ?? []) as Pick<
      BookingRequest,
      "id" | "full_name" | "phone" | "service_type" | "status" | "created_at"
    >[],
    recentQuotations: (recentQuotations.data ?? []) as Quotation[],
    recentInvoices: (recentInvoices.data ?? []) as Invoice[],
  };
}

function Panel({ title, href, empty, children }: { title: string; href: string; empty: string | null; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <Link href={href} className="text-sm font-medium text-primary">
          View all
        </Link>
      </div>
      {empty ? (
        <p className="px-5 py-8 text-center text-sm text-muted">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const d = await getDashboardData();

  const stats = [
    { label: "New Booking Requests", value: String(d.newLeads), href: "/admin/leads?status=new", tone: "text-primary" },
    { label: "Open Quotations", value: String(d.openQuotations), href: "/admin/quotations", tone: "text-primary" },
    { label: "Unpaid Invoices", value: String(d.unpaidInvoices), sub: `${formatSAR(d.awaitingAmount)} awaiting payment`, href: "/admin/invoices", tone: "text-primary" },
    {
      label: "Overdue Invoices",
      value: String(d.overdueCount),
      sub: d.overdueCount > 0 ? `${formatSAR(d.overdueAmount)} overdue` : "Nothing overdue",
      href: "/admin/invoices?status=sent",
      tone: d.overdueCount > 0 ? "text-red-600" : "text-primary",
    },
    { label: `Collected in ${d.monthLabel}`, value: formatSAR(d.collectedThisMonth), href: "/admin/receipts", tone: "text-green-700" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Dashboard</h1>

      {d.staleLeads > 0 && (
        <Link
          href="/admin/leads?status=new"
          className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800"
        >
          <AlertTriangle size={18} className="shrink-0" />
          <span>
            <strong>{d.staleLeads}</strong> booking request{d.staleLeads === 1 ? " has" : "s have"} been waiting more than
            24 hours without a response.
          </span>
        </Link>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className={`text-3xl font-bold ${s.tone}`}>{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
            {s.sub && <div className="mt-1 text-xs text-muted">{s.sub}</div>}
          </Link>
        ))}
      </div>

      <Panel title="Recent Booking Requests" href="/admin/leads" empty={d.recentBookings.length === 0 ? "No booking requests yet." : null}>
        {d.recentBookings.map((b) => (
          <tr key={b.id} className="border-b border-border last:border-0">
            <td className="px-5 py-3 font-medium text-foreground">{b.full_name}</td>
            <td className="px-5 py-3 text-muted">{b.phone}</td>
            <td className="px-5 py-3 text-muted">{b.service_type}</td>
            <td className="px-5 py-3">
              <StatusBadge status={b.status} />
            </td>
            <td className="px-5 py-3 text-right text-muted">{formatDate(b.created_at)}</td>
          </tr>
        ))}
      </Panel>

      <Panel title="Recent Quotations" href="/admin/quotations" empty={d.recentQuotations.length === 0 ? "No quotations yet." : null}>
        {d.recentQuotations.map((q) => (
          <tr key={q.id} className="border-b border-border last:border-0">
            <td className="px-5 py-3">
              <Link href={`/admin/quotations/${q.id}`} className="font-medium text-primary">
                {q.number}
              </Link>
            </td>
            <td className="px-5 py-3 text-foreground">{q.customer_name}</td>
            <td className="px-5 py-3 text-muted">{formatSAR(q.amount)}</td>
            <td className="px-5 py-3">
              <StatusBadge status={q.status} />
            </td>
            <td className="px-5 py-3 text-right text-muted">{formatDate(q.created_at)}</td>
          </tr>
        ))}
      </Panel>

      <Panel title="Recent Invoices" href="/admin/invoices" empty={d.recentInvoices.length === 0 ? "No invoices yet." : null}>
        {d.recentInvoices.map((inv) => {
          const overdue = inv.status === "sent" && !!inv.due_date && inv.due_date < todayInRiyadh();
          return (
            <tr key={inv.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3">
                <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-primary">
                  {inv.number}
                </Link>
              </td>
              <td className="px-5 py-3 text-foreground">{inv.customer_name}</td>
              <td className="px-5 py-3 text-muted">{formatSAR(inv.total)}</td>
              <td className="px-5 py-3">
                <StatusBadge status={overdue ? "overdue" : inv.status} />
              </td>
              <td className="px-5 py-3 text-right text-muted">{formatDate(inv.created_at)}</td>
            </tr>
          );
        })}
      </Panel>
    </div>
  );
}
