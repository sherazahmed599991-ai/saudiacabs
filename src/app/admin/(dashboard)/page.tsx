import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingRequest, Quotation, Invoice } from "@/lib/types";
import { formatSAR, formatDate } from "@/lib/format";

export const metadata = { title: "Admin Dashboard — Saudia Cabs", robots: { index: false, follow: false } };

async function getDashboardData() {
  const supabase = await createSupabaseServerClient();

  const [newBookings, draftQuotations, unpaidInvoices, recentBookings, recentQuotations, recentInvoices] = await Promise.all([
    supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("quotations").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
    supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
    supabase
      .from("booking_requests")
      .select("id, full_name, phone, service_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("quotations").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  return {
    newBookings: newBookings.count ?? 0,
    draftQuotations: draftQuotations.count ?? 0,
    unpaidInvoices: unpaidInvoices.count ?? 0,
    recentBookings: (recentBookings.data ?? []) as Pick<
      BookingRequest,
      "id" | "full_name" | "phone" | "service_type" | "status" | "created_at"
    >[],
    recentQuotations: (recentQuotations.data ?? []) as Quotation[],
    recentInvoices: (recentInvoices.data ?? []) as Invoice[],
  };
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{children}</span>;
}

export default async function AdminDashboardPage() {
  const { newBookings, draftQuotations, unpaidInvoices, recentBookings, recentQuotations, recentInvoices } = await getDashboardData();

  const stats = [
    { label: "New Booking Requests", value: newBookings, href: "/admin/bookings" },
    { label: "Open Quotations", value: draftQuotations, href: "/admin/quotations" },
    { label: "Unpaid Invoices", value: unpaidInvoices, href: "/admin/invoices" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="text-3xl font-bold text-primary">{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mb-6 rounded-lg border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Recent Booking Requests</h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No booking requests yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{b.full_name}</td>
                  <td className="px-5 py-3 text-muted">{b.phone}</td>
                  <td className="px-5 py-3 text-muted">{b.service_type}</td>
                  <td className="px-5 py-3">
                    <Badge>{b.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right text-muted">{formatDate(b.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mb-6 rounded-lg border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Recent Quotations</h2>
          <Link href="/admin/quotations" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        {recentQuotations.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No quotations yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recentQuotations.map((q) => (
                <tr key={q.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/admin/quotations/${q.id}`} className="font-medium text-primary">
                      {q.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-foreground">{q.customer_name}</td>
                  <td className="px-5 py-3 text-muted">{formatSAR(q.amount)}</td>
                  <td className="px-5 py-3">
                    <Badge>{q.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right text-muted">{formatDate(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-lg border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Recent Invoices</h2>
          <Link href="/admin/invoices" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-primary">
                      {inv.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-foreground">{inv.customer_name}</td>
                  <td className="px-5 py-3 text-muted">{formatSAR(inv.total)}</td>
                  <td className="px-5 py-3">
                    <Badge>{inv.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right text-muted">{formatDate(inv.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
