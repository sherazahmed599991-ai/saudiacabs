"use client";

import { sendInvoice, markInvoicePaid, updateInvoiceStatus, deleteInvoice, duplicateInvoice } from "../actions";
import SubmitButton from "@/components/admin/SubmitButton";
import type { InvoiceStatus, PaymentMethod } from "@/lib/types";

const editableStatuses: InvoiceStatus[] = ["draft", "sent", "cancelled"];
const paymentMethods: PaymentMethod[] = ["cash", "card", "bank_transfer", "other"];

export default function InvoiceActions({ id, status }: { id: string; status: InvoiceStatus }) {
  const sendWithId = sendInvoice.bind(null, id);
  const markPaidWithId = markInvoicePaid.bind(null, id);
  const updateStatusWithId = updateInvoiceStatus.bind(null, id);
  const duplicateWithId = duplicateInvoice.bind(null, id);
  const deleteWithId = deleteInvoice.bind(null, id);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={sendWithId}>
        <SubmitButton
          pendingText="Sending..."
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Send Email
        </SubmitButton>
      </form>

      <a
        href={`/admin/invoices/${id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground"
      >
        Download PDF
      </a>

      {status === "paid" ? (
        <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">✓ Paid</span>
      ) : (
        <>
          <form action={markPaidWithId} className="flex items-center gap-2">
            <select
              name="paymentMethod"
              defaultValue="cash"
              className="rounded-md border border-border px-2 py-2 text-sm text-foreground"
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <SubmitButton
              pendingText="Saving..."
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Mark as Paid
            </SubmitButton>
          </form>

          <form action={updateStatusWithId}>
            <select
              name="status"
              defaultValue={status}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="rounded-md border border-border px-2 py-2 text-sm text-foreground"
            >
              {editableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </form>
        </>
      )}

      <form action={duplicateWithId}>
        <SubmitButton
          pendingText="Duplicating..."
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60"
        >
          Duplicate
        </SubmitButton>
      </form>

      <form
        action={deleteWithId}
        onSubmit={(e) => {
          const msg =
            status === "paid"
              ? "This invoice is paid and has a receipt — deleting it will also delete that receipt. Continue?"
              : "Delete this invoice? This cannot be undone.";
          if (!confirm(msg)) e.preventDefault();
        }}
      >
        <SubmitButton
          pendingText="Deleting..."
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60"
        >
          Delete
        </SubmitButton>
      </form>
    </div>
  );
}
