"use client";

import { useActionState } from "react";
import { createQuotation } from "./actions";
import type { QuotationFormState } from "./actions";
import { TextField, TextAreaField } from "@/components/admin/FormField";
import SubmitButton from "@/components/admin/SubmitButton";

const initialQuotationState: QuotationFormState = { status: "idle", message: "" };

export default function QuotationForm({
  defaultValues,
}: {
  defaultValues?: {
    customerName?: string;
    customerPhone?: string;
    serviceDescription?: string;
    bookingRequestId?: string;
  };
}) {
  const [state, formAction] = useActionState(createQuotation, initialQuotationState);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {defaultValues?.bookingRequestId && (
        <input type="hidden" name="bookingRequestId" value={defaultValues.bookingRequestId} />
      )}
      <TextField label="Customer Name" name="customerName" defaultValue={defaultValues?.customerName} required />
      <TextField label="Phone / WhatsApp" name="customerPhone" defaultValue={defaultValues?.customerPhone} required />
      <TextField label="Email" name="customerEmail" type="email" required />
      <TextAreaField
        label="Service Description"
        name="serviceDescription"
        defaultValue={defaultValues?.serviceDescription}
      />
      <TextField label="Amount (SAR)" name="amount" type="number" step="0.01" required />
      <TextAreaField label="Notes (optional)" name="notes" rows={2} />

      {state.status === "error" && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.message}
        </p>
      )}

      <SubmitButton
        pendingText="Creating..."
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        Create Quotation
      </SubmitButton>
    </form>
  );
}
