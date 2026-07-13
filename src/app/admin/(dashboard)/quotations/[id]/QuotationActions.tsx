"use client";

import { sendQuotation, convertQuotationToInvoice, updateQuotationStatus, deleteQuotation, duplicateQuotation } from "../actions";
import SubmitButton from "@/components/admin/SubmitButton";
import type { QuotationStatus } from "@/lib/types";

const statuses: QuotationStatus[] = ["draft", "sent", "accepted", "declined", "expired"];

export default function QuotationActions({
  id,
  status,
  hasInvoice,
}: {
  id: string;
  status: QuotationStatus;
  hasInvoice: boolean;
}) {
  const sendWithId = sendQuotation.bind(null, id);
  const convertWithId = convertQuotationToInvoice.bind(null, id);
  const updateStatusWithId = updateQuotationStatus.bind(null, id);
  const duplicateWithId = duplicateQuotation.bind(null, id);
  const deleteWithId = deleteQuotation.bind(null, id);

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
        href={`/admin/quotations/${id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground"
      >
        Download PDF
      </a>

      {!hasInvoice && (
        <form action={convertWithId}>
          <SubmitButton
            pendingText="Converting..."
            className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
          >
            Convert to Invoice
          </SubmitButton>
        </form>
      )}

      <form action={duplicateWithId}>
        <SubmitButton
          pendingText="Duplicating..."
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60"
        >
          Duplicate
        </SubmitButton>
      </form>

      <form action={updateStatusWithId}>
        <select
          name="status"
          defaultValue={status}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="rounded-md border border-border px-2 py-2 text-sm text-foreground"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </form>

      <form
        action={deleteWithId}
        onSubmit={(e) => {
          if (!confirm("Delete this quotation? This cannot be undone.")) e.preventDefault();
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
