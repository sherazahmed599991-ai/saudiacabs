"use client";

import { useActionState, useState } from "react";
import { createInvoice } from "./actions";
import type { InvoiceFormState } from "./actions";
import { TextField } from "@/components/admin/FormField";
import SubmitButton from "@/components/admin/SubmitButton";
import LineItemsEditor, { type LineItemRow } from "@/components/admin/LineItemsEditor";

const initialInvoiceState: InvoiceFormState = { status: "idle", message: "" };

export default function InvoiceForm({
  defaultValues,
}: {
  defaultValues?: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    quotationId?: string;
    bookingRequestId?: string;
    lineItems?: LineItemRow[];
  };
}) {
  const [state, formAction] = useActionState(createInvoice, initialInvoiceState);
  const [rows, setRows] = useState<LineItemRow[]>(
    defaultValues?.lineItems && defaultValues.lineItems.length > 0
      ? defaultValues.lineItems
      : [{ description: "", quantity: "1", unitPrice: "" }]
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {defaultValues?.quotationId && <input type="hidden" name="quotationId" value={defaultValues.quotationId} />}
      {defaultValues?.bookingRequestId && (
        <input type="hidden" name="bookingRequestId" value={defaultValues.bookingRequestId} />
      )}
      <input type="hidden" name="lineItems" value={JSON.stringify(rows)} />

      <TextField label="Customer Name" name="customerName" defaultValue={defaultValues?.customerName} required />
      <TextField label="Phone / WhatsApp" name="customerPhone" defaultValue={defaultValues?.customerPhone} required />
      <TextField
        label="Email"
        name="customerEmail"
        defaultValue={defaultValues?.customerEmail}
        type="email"
        required
      />
      <TextField label="Due Date (optional)" name="dueDate" type="date" />

      <LineItemsEditor rows={rows} onChange={setRows} />

      {state.status === "error" && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.message}
        </p>
      )}

      <SubmitButton
        pendingText="Creating..."
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        Create Invoice
      </SubmitButton>
    </form>
  );
}
