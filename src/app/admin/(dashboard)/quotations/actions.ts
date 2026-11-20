"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { renderDocumentPDF } from "@/lib/pdf/render";
import { sendQuotationEmail } from "@/lib/mail";
import { parseCustomer, parseOptionalUuid } from "@/lib/document-input";
import { QUOTATION_STATUSES, clean, isUuid, oneOf, parseAmount } from "@/lib/validation";
import type { Quotation } from "@/lib/types";

export type QuotationFormState = { status: "idle" | "success" | "error"; message: string };

function parseQuotationFields(formData: FormData) {
  const customer = parseCustomer(formData);
  const serviceDescription = clean(formData.get("serviceDescription"), 500);
  const amount = parseAmount(formData.get("amount"));
  const notes = clean(formData.get("notes"), 2000, false);

  let error = customer.error;
  if (!error && (!serviceDescription || !amount)) {
    error = "Please fill in all required fields with a valid amount.";
  }
  return { customer: customer.value, serviceDescription, amount, notes, error };
}

export async function createQuotation(
  _prevState: QuotationFormState,
  formData: FormData
): Promise<QuotationFormState> {
  const { supabase } = await requireAdmin();
  const f = parseQuotationFields(formData);
  const bookingRequestId = parseOptionalUuid(formData, "bookingRequestId");

  if (f.error || !f.amount) return { status: "error", message: f.error ?? "Invalid amount." };
  if (bookingRequestId === undefined) return { status: "error", message: "Invalid linked booking." };

  const { data, error } = await supabase
    .from("quotations")
    .insert({
      customer_name: f.customer.name,
      customer_phone: f.customer.phone,
      customer_email: f.customer.email,
      service_description: f.serviceDescription,
      amount: f.amount,
      notes: f.notes || null,
      booking_request_id: bookingRequestId,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create quotation:", error?.message);
    return { status: "error", message: "Something went wrong creating the quotation." };
  }

  revalidatePath("/admin/quotations");
  redirect(`/admin/quotations/${data.id}`);
}

export async function updateQuotationStatus(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = oneOf(String(formData.get("status") ?? ""), QUOTATION_STATUSES);
  if (!isUuid(id) || !status) return;

  const { error } = await supabase
    .from("quotations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("Failed to update quotation status:", error.message);

  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin/quotations");
}

export async function sendQuotation(id: string) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) throw new Error("Invalid quotation");

  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).single<Quotation>();
  if (!quotation) throw new Error("Quotation not found");

  const pdf = await renderDocumentPDF({
    kind: "Quotation",
    number: quotation.number,
    date: new Date(quotation.created_at).toLocaleDateString(),
    status: "sent",
    customer: { name: quotation.customer_name, phone: quotation.customer_phone, email: quotation.customer_email },
    lineItems: [{ description: quotation.service_description, quantity: 1, unitPrice: quotation.amount }],
    total: quotation.amount,
    notes: quotation.notes,
  });

  await sendQuotationEmail({
    to: quotation.customer_email,
    customerName: quotation.customer_name,
    number: quotation.number,
    pdf,
  });

  const { error } = await supabase
    .from("quotations")
    .update({ status: "sent", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("Quotation emailed but status update failed:", error.message);

  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin/quotations");
}

export async function updateQuotation(
  id: string,
  _prevState: QuotationFormState,
  formData: FormData
): Promise<QuotationFormState> {
  const { supabase } = await requireAdmin();
  const f = parseQuotationFields(formData);

  if (!isUuid(id)) return { status: "error", message: "Invalid quotation." };
  if (f.error || !f.amount) return { status: "error", message: f.error ?? "Invalid amount." };

  const { error } = await supabase
    .from("quotations")
    .update({
      customer_name: f.customer.name,
      customer_phone: f.customer.phone,
      customer_email: f.customer.email,
      service_description: f.serviceDescription,
      amount: f.amount,
      notes: f.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update quotation:", error.message);
    return { status: "error", message: "Something went wrong saving the quotation." };
  }

  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin/quotations");
  return { status: "success", message: "" };
}

export async function deleteQuotation(id: string) {
  const { supabase } = await requireAdmin();
  if (isUuid(id)) {
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) console.error("Failed to delete quotation:", error.message);
  }

  revalidatePath("/admin/quotations");
  redirect("/admin/quotations");
}

export async function duplicateQuotation(id: string) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) throw new Error("Invalid quotation");

  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).single<Quotation>();
  if (!quotation) throw new Error("Quotation not found");

  const { data, error } = await supabase
    .from("quotations")
    .insert({
      booking_request_id: quotation.booking_request_id,
      customer_name: quotation.customer_name,
      customer_phone: quotation.customer_phone,
      customer_email: quotation.customer_email,
      service_description: quotation.service_description,
      amount: quotation.amount,
      notes: quotation.notes,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to duplicate quotation:", error?.message);
    throw new Error("Failed to duplicate quotation");
  }

  redirect(`/admin/quotations/${data.id}`);
}

export async function convertQuotationToInvoice(id: string) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) throw new Error("Invalid quotation");

  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).single<Quotation>();
  if (!quotation) throw new Error("Quotation not found");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      quotation_id: quotation.id,
      booking_request_id: quotation.booking_request_id,
      customer_name: quotation.customer_name,
      customer_phone: quotation.customer_phone,
      customer_email: quotation.customer_email,
      line_items: [{ description: quotation.service_description, quantity: 1, unit_price: quotation.amount }],
      total: quotation.amount,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    console.error("Failed to convert quotation:", error?.message);
    throw new Error("Failed to create invoice from quotation");
  }

  redirect(`/admin/invoices/${invoice.id}`);
}
