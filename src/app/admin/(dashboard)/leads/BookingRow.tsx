"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Pencil, Trash2, X } from "lucide-react";
import { updateBookingStatus, updateBooking, deleteBooking } from "./actions";
import type { BookingEditState } from "./actions";
import SubmitButton from "@/components/admin/SubmitButton";
import type { BookingRequest } from "@/lib/types";

const statuses = ["new", "contacted", "quoted", "booked", "completed", "cancelled"];
const initialEditState: BookingEditState = { status: "idle", message: "" };
const inputClass = "w-full rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-primary";

function StatusSelect({ id, status }: { id: string; status: string }) {
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

export default function BookingRow({ booking }: { booking: BookingRequest }) {
  const [editing, setEditing] = useState(false);
  const updateWithId = updateBooking.bind(null, booking.id);
  const [state, formAction] = useActionState(updateWithId, initialEditState);

  const [lastStatus, setLastStatus] = useState(state.status);
  if (state.status !== lastStatus) {
    setLastStatus(state.status);
    if (state.status === "success") setEditing(false);
  }

  const waHref = `https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}`;
  const telHref = `tel:${booking.phone}`;

  async function handleDelete() {
    if (!confirm(`Delete booking request from ${booking.full_name}? This cannot be undone.`)) return;
    await deleteBooking(booking.id);
  }

  if (!editing) {
    return (
      <tr className="border-b border-border last:border-0">
        <td className="px-5 py-3 font-medium text-foreground">{booking.full_name}</td>
        <td className="px-5 py-3 text-muted">{booking.phone}</td>
        <td className="px-5 py-3 text-muted">{booking.service_type}</td>
        <td className="px-5 py-3 text-muted">{booking.travel_date ?? "—"}</td>
        <td className="px-5 py-3">
          <StatusSelect id={booking.id} status={booking.status} />
        </td>
        <td className="px-5 py-3 text-muted">{new Date(booking.created_at).toLocaleDateString()}</td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-3">
            <a href={waHref} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="text-muted hover:text-primary">
              <MessageCircle size={15} />
            </a>
            <a href={telHref} title="Call" className="text-muted hover:text-primary">
              <Phone size={15} />
            </a>
            <Link href={`/admin/quotations/new?bookingId=${booking.id}`} className="text-xs font-medium text-primary">
              Quote
            </Link>
            <button onClick={() => setEditing(true)} title="Edit" className="text-muted hover:text-foreground">
              <Pencil size={15} />
            </button>
            <button onClick={handleDelete} title="Delete" className="text-muted hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border last:border-0 bg-surface">
      <td colSpan={7} className="px-5 py-4">
        <form action={formAction} className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <input name="fullName" defaultValue={booking.full_name} placeholder="Full name" className={inputClass} required />
          <input name="phone" defaultValue={booking.phone} placeholder="Phone" className={inputClass} required />
          <input name="passengers" defaultValue={booking.passengers ?? ""} placeholder="Passengers" className={inputClass} />
          <input name="serviceType" defaultValue={booking.service_type} placeholder="Service type" className={inputClass} required />
          <input name="travelDate" type="date" defaultValue={booking.travel_date ?? ""} className={inputClass} />
          <input name="message" defaultValue={booking.message ?? ""} placeholder="Message" className={`col-span-2 md:col-span-1 ${inputClass}`} />

          {state.status === "error" && (
            <p className="col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 md:col-span-3">{state.message}</p>
          )}

          <div className="col-span-2 flex items-center gap-2 md:col-span-3">
            <SubmitButton pendingText="Saving..." className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
              Save
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-muted"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
