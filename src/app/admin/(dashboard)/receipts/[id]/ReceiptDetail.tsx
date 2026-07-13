"use client";

import { useActionState, useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateReceipt } from "../actions";
import type { ReceiptEditState } from "../actions";
import { TextField } from "@/components/admin/FormField";
import SubmitButton from "@/components/admin/SubmitButton";
import { formatSAR, formatDate } from "@/lib/format";
import type { ReceiptWithInvoice, PaymentMethod } from "@/lib/types";

const initialState: ReceiptEditState = { status: "idle", message: "" };
const paymentMethods: PaymentMethod[] = ["cash", "card", "bank_transfer", "other"];

export default function ReceiptDetail({ receipt }: { receipt: ReceiptWithInvoice }) {
  const [editing, setEditing] = useState(false);
  const updateWithId = updateReceipt.bind(null, receipt.id);
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
          <TextField label="Amount Paid (SAR)" name="amountPaid" type="number" step="0.01" defaultValue={String(receipt.amount_paid)} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Payment Method</label>
            <select
              name="paymentMethod"
              defaultValue={receipt.payment_method}
              className="w-full rounded-md border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <TextField label="Paid At" name="paidAt" type="date" defaultValue={receipt.paid_at.slice(0, 10)} required />

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
            <div className="font-medium text-foreground">{receipt.invoice.customer_name}</div>
            <div className="text-sm text-muted">{receipt.invoice.customer_phone}</div>
            <div className="text-sm text-muted">{receipt.invoice.customer_email}</div>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase text-muted">Amount Paid</div>
            <div className="text-xl font-bold text-primary">{formatSAR(receipt.amount_paid)}</div>
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
          <Pencil size={14} /> Edit
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <div className="mb-1 text-xs uppercase text-muted">Invoice</div>
          <div className="text-sm text-foreground">{receipt.invoice.number}</div>
        </div>
        <div>
          <div className="mb-1 text-xs uppercase text-muted">Payment Method</div>
          <div className="text-sm text-foreground">{receipt.payment_method}</div>
        </div>
        <div>
          <div className="mb-1 text-xs uppercase text-muted">Paid At</div>
          <div className="text-sm text-foreground">{formatDate(receipt.paid_at)}</div>
        </div>
      </div>
    </div>
  );
}
