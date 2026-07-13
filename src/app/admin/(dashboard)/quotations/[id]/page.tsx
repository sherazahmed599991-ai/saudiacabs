import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Quotation } from "@/lib/types";
import { formatDate } from "@/lib/format";
import QuotationDetail from "./QuotationDetail";
import QuotationActions from "./QuotationActions";

export const metadata = { title: "Quotation — Saudia Cabs Admin", robots: { index: false, follow: false } };

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: quotation }, { count: invoiceCount }] = await Promise.all([
    supabase.from("quotations").select("*").eq("id", id).single(),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("quotation_id", id),
  ]);

  if (!quotation) notFound();

  const q = quotation as Quotation;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{q.number}</h1>
        <p className="text-sm text-muted">Created {formatDate(q.created_at)}</p>
      </div>

      <QuotationDetail quotation={q} />

      <QuotationActions id={q.id} status={q.status} hasInvoice={(invoiceCount ?? 0) > 0} />
    </div>
  );
}
