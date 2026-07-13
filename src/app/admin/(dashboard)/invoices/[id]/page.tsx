import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Invoice } from "@/lib/types";
import { formatDate } from "@/lib/format";
import InvoiceDetail from "./InvoiceDetail";
import InvoiceActions from "./InvoiceActions";

export const metadata = { title: "Invoice — Saudia Cabs Admin", robots: { index: false, follow: false } };

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single();

  if (!invoice) notFound();

  const inv = invoice as Invoice;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{inv.number}</h1>
        <p className="text-sm text-muted">Created {formatDate(inv.created_at)}</p>
      </div>

      <InvoiceDetail invoice={inv} />

      <InvoiceActions id={inv.id} status={inv.status} />
    </div>
  );
}
