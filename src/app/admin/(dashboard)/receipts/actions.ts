"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { renderDocumentPDF } from "@/lib/pdf/render";
import { sendReceiptEmail } from "@/lib/mail";
import type { ReceiptWithInvoice } from "@/lib/types";

export type ReceiptEditState = { status: "idle" | "success" | "error"; message: string };

export async function sendReceipt(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: receipt } = await supabase
    .from("receipts")
    .select("*, invoice:invoices(*)")
    .eq("id", id)
    .single<ReceiptWithInvoice>();

  if (!receipt) throw new Error("Receipt not found");

  const { invoice } = receipt;

  const pdf = await renderDocumentPDF({
    kind: "Receipt",
    number: receipt.number,
    date: new Date(receipt.paid_at).toLocaleDateString(),
    customer: { name: invoice.customer_name, phone: invoice.customer_phone, email: invoice.customer_email },
    lineItems: [
      { description: `Payment for Invoice ${invoice.number}`, quantity: 1, unitPrice: receipt.amount_paid },
    ],
    total: receipt.amount_paid,
    extraFields: [
      { label: "Payment Method", value: receipt.payment_method },
      { label: "Invoice", value: invoice.number },
    ],
  });

  await sendReceiptEmail({
    to: invoice.customer_email,
    customerName: invoice.customer_name,
    number: receipt.number,
    pdf,
  });

  revalidatePath(`/admin/receipts/${id}`);
}

export async function updateReceipt(
  id: string,
  _prevState: ReceiptEditState,
  formData: FormData
): Promise<ReceiptEditState> {
  const amountPaid = Number(formData.get("amountPaid"));
  const paymentMethod = String(formData.get("paymentMethod") ?? "cash");
  const paidAt = String(formData.get("paidAt") ?? "").trim();

  if (!amountPaid || amountPaid <= 0 || !paidAt) {
    return { status: "error", message: "Please provide a valid amount and payment date." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("receipts")
    .update({ amount_paid: amountPaid, payment_method: paymentMethod, paid_at: paidAt })
    .eq("id", id);

  if (error) {
    console.error("Failed to update receipt:", error.message);
    return { status: "error", message: "Something went wrong saving the receipt." };
  }

  revalidatePath(`/admin/receipts/${id}`);
  revalidatePath("/admin/receipts");
  return { status: "success", message: "" };
}

export async function deleteReceipt(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: receipt } = await supabase.from("receipts").select("invoice_id").eq("id", id).single();

  await supabase.from("receipts").delete().eq("id", id);

  // A receipt only exists because its invoice was marked paid — removing the
  // receipt without reverting the invoice would leave it stuck as "paid"
  // with no proof of payment, so put it back in "sent" status.
  if (receipt?.invoice_id) {
    await supabase
      .from("invoices")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", receipt.invoice_id);
    revalidatePath(`/admin/invoices/${receipt.invoice_id}`);
  }

  revalidatePath("/admin/receipts");
  revalidatePath("/admin/invoices");
  redirect("/admin/receipts");
}
