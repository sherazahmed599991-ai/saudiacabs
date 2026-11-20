"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { renderDocumentPDF } from "@/lib/pdf/render";
import { sendInvoiceEmail } from "@/lib/mail";
import { parseCustomer, parseLineItems, parseOptionalUuid, sumLineItems } from "@/lib/document-input";
import { INVOICE_STATUSES, PAYMENT_METHODS, clean, isUuid, oneOf } from "@/lib/validation";
import type { Invoice } from "@/lib/types";

export type InvoiceFormState = { status: "idle" | "success" | "error"; message: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDueDate(formData: FormData): { value: string | null; error?: string } {
  const raw = clean(formData.get("dueDate"), 10);
  if (!raw) return { value: null };
  if (!DATE_RE.test(raw) || Number.isNaN(Date.parse(raw))) return { value: null, error: "Please enter a valid due date." };
  return { value: raw };
}

export async function createInvoice(_prevState: InvoiceFormState, formData: FormData): Promise<InvoiceFormState> {
  const { supabase } = await requireAdmin();

  const customer = parseCustomer(formData);
  const dueDate = parseDueDate(formData);
  const quotationId = parseOptionalUuid(formData, "quotationId");
  const bookingRequestId = parseOptionalUuid(formData, "bookingRequestId");
  const lineItems = parseLineItems(formData.get("lineItems"));

  if (customer.error) return { status: "error", message: customer.error };
  if (dueDate.error) return { status: "error", message: dueDate.error };
  if (quotationId === undefined || bookingRequestId === undefined) {
    return { status: "error", message: "Invalid linked record." };
  }
  if (lineItems.length === 0) {
    return { status: "error", message: "Please add at least one valid line item." };
  }

  // Total is always computed server-side from the validated line items.
  const total = sumLineItems(lineItems);

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      customer_name: customer.value.name,
      customer_phone: customer.value.phone,
      customer_email: customer.value.email,
      line_items: lineItems,
      total,
      due_date: dueDate.value,
      quotation_id: quotationId,
      booking_request_id: bookingRequestId,
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
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) throw new Error("Invalid invoice");

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

  // Don't downgrade a paid/cancelled invoice back to "sent" just because it was re-emailed.
  if (invoice.status === "draft") {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) console.error("Invoice emailed but status update failed:", error.message);
  }

  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
}

export async function markInvoicePaid(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const paymentMethod = oneOf(String(formData.get("paymentMethod") ?? "cash"), PAYMENT_METHODS);
  if (!isUuid(id) || !paymentMethod) throw new Error("Invalid request");

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!invoice) throw new Error("Invoice not found");

  // Guard against double-submits creating duplicate receipts.
  if (invoice.status === "paid" || invoice.status === "cancelled") {
    revalidatePath(`/admin/invoices/${id}`);
    return;
  }

  // Receipt first: if it fails the invoice stays unpaid, instead of ending up
  // "paid" with no receipt.
  const { error: receiptError } = await supabase.from("receipts").insert({
    invoice_id: id,
    amount_paid: invoice.total,
    payment_method: paymentMethod,
  });
  if (receiptError) {
    console.error("Failed to create receipt:", receiptError.message);
    throw new Error("Failed to create receipt");
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("Receipt created but invoice status update failed:", error.message);

  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/receipts");
}

export async function updateInvoiceStatus(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = oneOf(String(formData.get("status") ?? ""), INVOICE_STATUSES);
  if (!isUuid(id) || !status) return;

  const { error } = await supabase
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("Failed to update invoice status:", error.message);

  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
}

export async function updateInvoice(id: string, _prevState: InvoiceFormState, formData: FormData): Promise<InvoiceFormState> {
  const { supabase } = await requireAdmin();

  const customer = parseCustomer(formData);
  const dueDate = parseDueDate(formData);
  const lineItems = parseLineItems(formData.get("lineItems"));

  if (!isUuid(id)) return { status: "error", message: "Invalid invoice." };
  if (customer.error) return { status: "error", message: customer.error };
  if (dueDate.error) return { status: "error", message: dueDate.error };
  if (lineItems.length === 0) {
    return { status: "error", message: "Please add at least one valid line item." };
  }

  const total = sumLineItems(lineItems);

  const { error } = await supabase
    .from("invoices")
    .update({
      customer_name: customer.value.name,
      customer_phone: customer.value.phone,
      customer_email: customer.value.email,
      line_items: lineItems,
      total,
      due_date: dueDate.value,
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
  const { supabase } = await requireAdmin();
  if (isUuid(id)) {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) console.error("Failed to delete invoice:", error.message);
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/receipts");
  redirect("/admin/invoices");
}

export async function duplicateInvoice(id: string) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) throw new Error("Invalid invoice");

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
