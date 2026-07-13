"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { renderDocumentPDF } from "@/lib/pdf/render";
import { sendQuotationEmail } from "@/lib/resend";
import type { Quotation, QuotationStatus } from "@/lib/types";

export type QuotationFormState = { status: "idle" | "success" | "error"; message: string };

export async function createQuotation(
  _prevState: QuotationFormState,
  formData: FormData
): Promise<QuotationFormState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const serviceDescription = String(formData.get("serviceDescription") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const notes = String(formData.get("notes") ?? "").trim();
  const bookingRequestId = String(formData.get("bookingRequestId") ?? "").trim();

  if (!customerName || !customerPhone || !customerEmail || !serviceDescription || !amount || amount <= 0) {
    return { status: "error", message: "Please fill in all required fields with a valid amount." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quotations")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      service_description: serviceDescription,
      amount,
      notes: notes || null,
      booking_request_id: bookingRequestId || null,
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
  const status = String(formData.get("status") ?? "") as QuotationStatus;
  if (!status) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("quotations").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin/quotations");
}

export async function sendQuotation(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).single<Quotation>();
  if (!quotation) throw new Error("Quotation not found");

  const pdf = await renderDocumentPDF({
    kind: "Quotation",
    number: quotation.number,
    date: new Date(quotation.created_at).toLocaleDateString(),
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

  await supabase
    .from("quotations")
    .update({ status: "sent", updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin/quotations");
}

export async function updateQuotation(
  id: string,
  _prevState: QuotationFormState,
  formData: FormData
): Promise<QuotationFormState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const serviceDescription = String(formData.get("serviceDescription") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!customerName || !customerPhone || !customerEmail || !serviceDescription || !amount || amount <= 0) {
    return { status: "error", message: "Please fill in all required fields with a valid amount." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("quotations")
    .update({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      service_description: serviceDescription,
      amount,
      notes: notes || null,
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
  const supabase = await createSupabaseServerClient();
  await supabase.from("quotations").delete().eq("id", id);

  revalidatePath("/admin/quotations");
  redirect("/admin/quotations");
}

export async function duplicateQuotation(id: string) {
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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
