import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeSearchTerm } from "@/lib/validation";
import { parsePage, pageRange } from "@/lib/pagination";
import Pagination from "@/components/admin/Pagination";
import type { ReceiptWithInvoice, PaymentMethod } from "@/lib/types";
import { formatSAR, formatDate } from "@/lib/format";

export const metadata = { title: "Receipts — Admin", robots: { index: false, follow: false } };

const paymentMethods: PaymentMethod[] = ["cash", "card", "bank_transfer", "other"];

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; method?: string; page?: string }>;
}) {
  const { q: rawQ, method, page: rawPage } = await searchParams;
  const q = safeSearchTerm(rawQ);
  const page = parsePage(rawPage);
  const [from, to] = pageRange(page);

  const supabase = await createSupabaseServerClient();

  let matchingInvoiceIds: string[] = [];
  if (q) {
    const { data: matchedInvoices } = await supabase.from("invoices").select("id").ilike("customer_name", `%${q}%`);
    matchingInvoiceIds = (matchedInvoices ?? []).map((i) => i.id);
  }

  let query = supabase
    .from("receipts")
    .select("*, invoice:invoices(number, customer_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    const orParts = [`number.ilike.%${q}%`];
    if (matchingInvoiceIds.length > 0) orParts.push(`invoice_id.in.(${matchingInvoiceIds.join(",")})`);
    query = query.or(orParts.join(","));
  }
  if (method) query = query.eq("payment_method", method);

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  const receipts = (data ?? []) as ReceiptWithInvoice[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Receipts</h1>

      <form className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search customer or receipt/invoice number..."
          className="w-72 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select name="method" defaultValue={method ?? ""} className="rounded-md border border-border px-3 py-2 text-sm text-foreground">
          <option value="">All payment methods</option>
          {paymentMethods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        {receipts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No receipts match — receipts are created automatically when an invoice is marked as paid.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase text-muted">
                <th className="px-5 py-3 font-medium">Number</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3">
                    <Link href={`/admin/receipts/${r.id}`} className="font-medium text-primary">
                      {r.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-foreground">{r.invoice?.customer_name}</td>
                  <td className="px-5 py-3 text-muted">{r.invoice?.number}</td>
                  <td className="px-5 py-3 text-muted">{formatSAR(r.amount_paid)}</td>
                  <td className="px-5 py-3 text-muted">{r.payment_method}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(r.paid_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} total={total} basePath="/admin/receipts/" params={{ q, method }} />
    </div>
  );
}
