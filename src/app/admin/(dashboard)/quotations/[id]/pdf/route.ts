import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/validation";
import { renderDocumentPDF } from "@/lib/pdf/render";
import type { Quotation } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getAdmin();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });
  if (!isUuid(id)) return new NextResponse("Not found", { status: 404 });
  const { supabase } = admin;
  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).single();

  if (!quotation) {
    return new NextResponse("Not found", { status: 404 });
  }

  const q = quotation as Quotation;

  const pdf = await renderDocumentPDF({
    kind: "Quotation",
    number: q.number,
    date: new Date(q.created_at).toLocaleDateString(),
    status: q.status,
    customer: { name: q.customer_name, phone: q.customer_phone, email: q.customer_email },
    lineItems: [{ description: q.service_description, quantity: 1, unitPrice: q.amount }],
    total: q.amount,
    notes: q.notes,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${q.number}.pdf"`,
    },
  });
}
