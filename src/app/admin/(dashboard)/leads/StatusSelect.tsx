"use client";

import { updateBookingStatus } from "./actions";

const statuses = ["new", "contacted", "quoted", "booked", "completed", "cancelled"];

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  const updateWithId = updateBookingStatus.bind(null, id);

  return (
    <form action={updateWithId}>
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  );
}
