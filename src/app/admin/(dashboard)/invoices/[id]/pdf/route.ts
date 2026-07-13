import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { renderDocumentPDF } from "@/lib/pdf/render";
import type { Invoice } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single();

  if (!invoice) {
    return new NextResponse("Not found", { status: 404 });
  }

  const inv = invoice as Invoice;

  const pdf = await renderDocumentPDF({
    kind: "Invoice",
    number: inv.number,
    date: new Date(inv.created_at).toLocaleDateString(),
    customer: { name: inv.customer_name, phone: inv.customer_phone, email: inv.customer_email },
    lineItems: inv.line_items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unit_price })),
    total: inv.total,
    extraFields: inv.due_date ? [{ label: "Due Date", value: inv.due_date }] : undefined,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${inv.number}.pdf"`,
    },
  });
}
