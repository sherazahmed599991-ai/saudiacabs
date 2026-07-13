import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReceiptWithInvoice } from "@/lib/types";
import { formatDate } from "@/lib/format";
import ReceiptDetail from "./ReceiptDetail";
import ReceiptActions from "./ReceiptActions";

export const metadata = { title: "Receipt — Saudia Cabs Admin", robots: { index: false, follow: false } };

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: receipt } = await supabase.from("receipts").select("*, invoice:invoices(*)").eq("id", id).single();

  if (!receipt) notFound();

  const r = receipt as ReceiptWithInvoice;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{r.number}</h1>
        <p className="text-sm text-muted">Paid {formatDate(r.paid_at)}</p>
      </div>

      <ReceiptDetail receipt={r} />

      <ReceiptActions id={r.id} />
    </div>
  );
}
