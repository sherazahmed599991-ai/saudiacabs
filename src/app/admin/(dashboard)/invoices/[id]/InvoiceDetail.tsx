"use client";

import { useActionState, useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateInvoice } from "../actions";
import type { InvoiceFormState } from "../actions";
import { TextField } from "@/components/admin/FormField";
import SubmitButton from "@/components/admin/SubmitButton";
import LineItemsEditor, { type LineItemRow } from "@/components/admin/LineItemsEditor";
import { formatSAR, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";

const initialState: InvoiceFormState = { status: "idle", message: "" };

export default function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const [editing, setEditing] = useState(false);
  const updateWithId = updateInvoice.bind(null, invoice.id);
  const [state, formAction] = useActionState(updateWithId, initialState);
  const [rows, setRows] = useState<LineItemRow[]>(
    invoice.line_items.map((i) => ({ description: i.description, quantity: String(i.quantity), unitPrice: String(i.unit_price) }))
  );

  const [lastStatus, setLastStatus] = useState(state.status);
  if (state.status !== lastStatus) {
    setLastStatus(state.status);
    if (state.status === "success") setEditing(false);
  }

  if (editing) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-white p-6">
        <form action={formAction} className="max-w-2xl space-y-4">
          <input type="hidden" name="lineItems" value={JSON.stringify(rows)} />
          <TextField label="Customer Name" name="customerName" defaultValue={invoice.customer_name} required />
          <TextField label="Phone / WhatsApp" name="customerPhone" defaultValue={invoice.customer_phone} required />
          <TextField label="Email" name="customerEmail" defaultValue={invoice.customer_email} type="email" required />
          <TextField label="Due Date (optional)" name="dueDate" type="date" defaultValue={invoice.due_date ?? ""} />

          <LineItemsEditor rows={rows} onChange={setRows} />

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
            <div className="font-medium text-foreground">{invoice.customer_name}</div>
            <div className="text-sm text-muted">{invoice.customer_phone}</div>
            <div className="text-sm text-muted">{invoice.customer_email}</div>
          </div>
          {invoice.due_date && (
            <div>
              <div className="mb-1 text-xs uppercase text-muted">Due Date</div>
              <div className="text-sm text-foreground">{formatDate(invoice.due_date)}</div>
            </div>
          )}
        </div>
        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
          <Pencil size={14} /> Edit
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted">
            <th className="py-2 font-medium">Description</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Unit Price</th>
            <th className="py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.line_items.map((item, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-2 text-foreground">{item.description}</td>
              <td className="py-2 text-right text-muted">{item.quantity}</td>
              <td className="py-2 text-right text-muted">{formatSAR(item.unit_price)}</td>
              <td className="py-2 text-right text-foreground">{formatSAR(item.quantity * item.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end text-lg font-bold text-foreground">Total: {formatSAR(invoice.total)}</div>
    </div>
  );
}
