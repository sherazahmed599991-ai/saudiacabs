import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeSearchTerm } from "@/lib/validation";
import { parsePage, pageRange } from "@/lib/pagination";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Invoice } from "@/lib/types";
import { formatSAR, formatDate, isOverdue } from "@/lib/format";

export const metadata = { title: "Invoices — Admin", robots: { index: false, follow: false } };

const statuses = ["draft", "sent", "paid", "cancelled"];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q: rawQ, status, page: rawPage } = await searchParams;
  const q = safeSearchTerm(rawQ);
  const page = parsePage(rawPage);
  const [from, to] = pageRange(page);

  const supabase = await createSupabaseServerClient();
  let query = supabase.from("invoices").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (q) query = query.or(`customer_name.ilike.%${q}%,number.ilike.%${q}%`);
  if (status) query = query.eq("status", status);

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  const invoices = (data ?? []) as Invoice[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
        <Link href="/admin/invoices/new" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          + New Invoice
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search customer or number..."
          className="w-64 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-md border border-border px-3 py-2 text-sm text-foreground">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        {invoices.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No invoices match.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase text-muted">
                <th className="px-5 py-3 font-medium">Number</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3">
                    <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-primary">
                      {inv.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-foreground">{inv.customer_name}</td>
                  <td className="px-5 py-3 text-muted">{formatSAR(inv.total)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={isOverdue(inv) ? "overdue" : inv.status} />
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(inv.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} total={total} basePath="/admin/invoices/" params={{ q, status }} />
    </div>
  );
}
