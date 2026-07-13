import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Quotation } from "@/lib/types";
import { formatSAR, formatDate } from "@/lib/format";

export const metadata = { title: "Quotations — Saudia Cabs Admin", robots: { index: false, follow: false } };

const statuses = ["draft", "sent", "accepted", "declined", "expired"];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-50 text-blue-600",
  accepted: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-600",
  expired: "bg-yellow-50 text-yellow-700",
};

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const supabase = await createSupabaseServerClient();
  let query = supabase.from("quotations").select("*").order("created_at", { ascending: false });

  if (q) query = query.or(`customer_name.ilike.%${q}%,number.ilike.%${q}%`);
  if (status) query = query.eq("status", status);

  const { data } = await query;
  const quotations = (data ?? []) as Quotation[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Quotations</h1>
        <Link href="/admin/quotations/new" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          + New Quotation
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

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {quotations.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No quotations match.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase text-muted">
                <th className="px-5 py-3 font-medium">Number</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3">
                    <Link href={`/admin/quotations/${q.id}`} className="font-medium text-primary">
                      {q.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-foreground">{q.customer_name}</td>
                  <td className="px-5 py-3 text-muted">{formatSAR(q.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[q.status] ?? ""}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
