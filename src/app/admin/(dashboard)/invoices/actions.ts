"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { renderDocumentPDF } from "@/lib/pdf/render";
import { sendInvoiceEmail } from "@/lib/resend";
import type { Invoice, LineItem } from "@/lib/types";

export type InvoiceFormState = { status: "idle" | "success" | "error"; message: string };

export async function createInvoice(_prevState: InvoiceFormState, formData: FormData): Promise<InvoiceFormState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const quotationId = String(formData.get("quotationId") ?? "").trim();
  const bookingRequestId = String(formData.get("bookingRequestId") ?? "").trim();
  const lineItemsRaw = String(formData.get("lineItems") ?? "[]");

  let lineItems: LineItem[] = [];
  try {
    const parsed = JSON.parse(lineItemsRaw) as { description: string; quantity: string; unitPrice: string }[];
    lineItems = parsed
      .filter((r) => r.description.trim() && Number(r.quantity) > 0 && Number(r.unitPrice) >= 0)
      .map((r) => ({ description: r.description.trim(), quantity: Number(r.quantity), unit_price: Number(r.unitPrice) }));
  } catch {
    lineItems = [];
  }

  if (!customerName || !customerPhone || !customerEmail || lineItems.length === 0) {
    return { status: "error", message: "Please fill in customer details and at least one valid line item." };
  }

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      line_items: lineItems,
      total,
      due_date: dueDate || null,
      quotation_id: quotationId || null,
      booking_request_id: bookingRequestId || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create invoice:", error?.message);
    return { status: "error", message: "Something went wrong creating the invoice." };
  }

  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${data.id}`);
}

export async function sendInvoice(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!invoice) throw new Error("Invoice not found");

  const pdf = await renderDocumentPDF({
    kind: "Invoice",
    number: invoice.number,
    date: new Date(invoice.created_at).toLocaleDateString(),
    status: "sent",
    customer: { name: invoice.customer_name, phone: invoice.customer_phone, email: invoice.customer_email },
    lineItems: invoice.line_items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unit_price,
    })),
    total: invoice.total,
    extraFields: invoice.due_date ? [{ label: "Due Date", value: invoice.due_date }] : undefined,
  });

  await sendInvoiceEmail({
    to: invoice.customer_email,
    customerName: invoice.customer_name,
    number: invoice.number,
    pdf,
  });

  await supabase.from("invoices").update({ status: "sent", updated_at: new Date().toISOString() }).eq("id", id);

  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
}

export async function markInvoicePaid(id: string, formData: FormData) {
  const paymentMethod = String(formData.get("paymentMethod") ?? "cash");

  const supabase = await createSupabaseServerClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!invoice) throw new Error("Invoice not found");

  await supabase.from("invoices").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", id);

  await supabase.from("receipts").insert({
    invoice_id: id,
    amount_paid: invoice.total,
    payment_method: paymentMethod,
  });

  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/receipts");
}

export async function updateInvoiceStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "");
  if (!status) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("invoices").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
}

export async function updateInvoice(id: string, _prevState: InvoiceFormState, formData: FormData): Promise<InvoiceFormState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const lineItemsRaw = String(formData.get("lineItems") ?? "[]");

  let lineItems: LineItem[] = [];
  try {
    const parsed = JSON.parse(lineItemsRaw) as { description: string; quantity: string; unitPrice: string }[];
    lineItems = parsed
      .filter((r) => r.description.trim() && Number(r.quantity) > 0 && Number(r.unitPrice) >= 0)
      .map((r) => ({ description: r.description.trim(), quantity: Number(r.quantity), unit_price: Number(r.unitPrice) }));
  } catch {
    lineItems = [];
  }

  if (!customerName || !customerPhone || !customerEmail || lineItems.length === 0) {
    return { status: "error", message: "Please fill in customer details and at least one valid line item." };
  }

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("invoices")
    .update({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      line_items: lineItems,
      total,
      due_date: dueDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update invoice:", error.message);
    return { status: "error", message: "Something went wrong saving the invoice." };
  }

  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
  return { status: "success", message: "" };
}

export async function deleteInvoice(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("invoices").delete().eq("id", id);

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/receipts");
  redirect("/admin/invoices");
}

export async function duplicateInvoice(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!invoice) throw new Error("Invoice not found");

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      quotation_id: invoice.quotation_id,
      booking_request_id: invoice.booking_request_id,
      customer_name: invoice.customer_name,
      customer_phone: invoice.customer_phone,
      customer_email: invoice.customer_email,
      line_items: invoice.line_items,
      total: invoice.total,
      due_date: invoice.due_date,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to duplicate invoice:", error?.message);
    throw new Error("Failed to duplicate invoice");
  }

  redirect(`/admin/invoices/${data.id}`);
}
