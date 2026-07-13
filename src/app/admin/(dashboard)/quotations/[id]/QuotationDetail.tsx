"use client";

import { useActionState, useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateQuotation } from "../actions";
import type { QuotationFormState } from "../actions";
import { TextField, TextAreaField } from "@/components/admin/FormField";
import SubmitButton from "@/components/admin/SubmitButton";
import { formatSAR } from "@/lib/format";
import type { Quotation } from "@/lib/types";

const initialState: QuotationFormState = { status: "idle", message: "" };

export default function QuotationDetail({ quotation }: { quotation: Quotation }) {
  const [editing, setEditing] = useState(false);
  const updateWithId = updateQuotation.bind(null, quotation.id);
  const [state, formAction] = useActionState(updateWithId, initialState);

  const [lastStatus, setLastStatus] = useState(state.status);
  if (state.status !== lastStatus) {
    setLastStatus(state.status);
    if (state.status === "success") setEditing(false);
  }

  if (editing) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-white p-6">
        <form action={formAction} className="max-w-xl space-y-4">
          <TextField label="Customer Name" name="customerName" defaultValue={quotation.customer_name} required />
          <TextField label="Phone / WhatsApp" name="customerPhone" defaultValue={quotation.customer_phone} required />
          <TextField label="Email" name="customerEmail" defaultValue={quotation.customer_email} type="email" required />
          <TextAreaField label="Service Description" name="serviceDescription" defaultValue={quotation.service_description} />
          <TextField label="Amount (SAR)" name="amount" type="number" step="0.01" defaultValue={String(quotation.amount)} required />
          <TextAreaField label="Notes (optional)" name="notes" defaultValue={quotation.notes ?? ""} rows={2} />

          {state.status === "error" && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.message}
            </p>
          )}

          <div className="flex items-center gap-2">
            <SubmitButton
              pendingText="Saving..."
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Save Changes
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 rounded-md border border-border px-4 py-2.5 text-sm text-muted"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-border bg-white p-6">
      <div className="mb-6 flex items-start justify-between">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-1 text-xs uppercase text-muted">Customer</div>
            <div className="font-medium text-foreground">{quotation.customer_name}</div>
            <div className="text-sm text-muted">{quotation.customer_phone}</div>
            <div className="text-sm text-muted">{quotation.customer_email}</div>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase text-muted">Amount</div>
            <div className="text-xl font-bold text-primary">{formatSAR(quotation.amount)}</div>
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
          <Pencil size={14} /> Edit
        </button>
      </div>

      <div className="mb-6">
        <div className="mb-1 text-xs uppercase text-muted">Service</div>
        <p className="text-sm text-foreground">{quotation.service_description}</p>
      </div>

      {quotation.notes && (
        <div>
          <div className="mb-1 text-xs uppercase text-muted">Notes</div>
          <p className="text-sm text-muted">{quotation.notes}</p>
        </div>
      )}
    </div>
  );
}
