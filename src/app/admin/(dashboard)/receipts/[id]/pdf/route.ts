import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { renderDocumentPDF } from "@/lib/pdf/render";
import type { ReceiptWithInvoice } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: receipt } = await supabase.from("receipts").select("*, invoice:invoices(*)").eq("id", id).single();

  if (!receipt) {
    return new NextResponse("Not found", { status: 404 });
  }

  const r = receipt as ReceiptWithInvoice;

  const pdf = await renderDocumentPDF({
    kind: "Receipt",
    number: r.number,
    date: new Date(r.paid_at).toLocaleDateString(),
    status: "paid",
    customer: { name: r.invoice.customer_name, phone: r.invoice.customer_phone, email: r.invoice.customer_email },
    lineItems: [{ description: `Payment for Invoice ${r.invoice.number}`, quantity: 1, unitPrice: r.amount_paid }],
    total: r.amount_paid,
    extraFields: [
      { label: "Payment Method", value: r.payment_method },
      { label: "Invoice", value: r.invoice.number },
    ],
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${r.number}.pdf"`,
    },
  });
}
