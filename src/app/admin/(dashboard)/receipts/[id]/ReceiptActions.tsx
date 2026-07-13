"use client";

import { sendReceipt, deleteReceipt } from "../actions";
import SubmitButton from "@/components/admin/SubmitButton";

export default function ReceiptActions({ id }: { id: string }) {
  const sendWithId = sendReceipt.bind(null, id);
  const deleteWithId = deleteReceipt.bind(null, id);

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
        href={`/admin/receipts/${id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground"
      >
        Download PDF
      </a>
      <form
        action={deleteWithId}
        onSubmit={(e) => {
          if (!confirm("Delete this receipt? The linked invoice will be reverted to \"sent\" status. This cannot be undone.")) {
            e.preventDefault();
          }
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
