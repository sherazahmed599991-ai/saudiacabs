import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeSearchTerm } from "@/lib/validation";
import { parsePage, pageRange } from "@/lib/pagination";
import Pagination from "@/components/admin/Pagination";
import type { BookingRequest } from "@/lib/types";
import { Download } from "lucide-react";
import BookingRow from "./BookingRow";

export const metadata = { title: "Leads — Admin", robots: { index: false, follow: false } };

const statuses = ["new", "contacted", "quoted", "booked", "completed", "cancelled"];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q: rawQ, status, page: rawPage } = await searchParams;
  const q = safeSearchTerm(rawQ);
  const page = parsePage(rawPage);
  const [from, to] = pageRange(page);

  const supabase = await createSupabaseServerClient();
  let query = supabase.from("booking_requests").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  if (status) query = query.eq("status", status);

  const { data, count } = await query.range(from, to);
  const total = count ?? 0;
  const bookings = (data ?? []) as BookingRequest[];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">
          Booking Requests <span className="text-base font-normal text-muted">({total})</span>
        </h1>
        <a
          href={`/admin/leads/export?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}) }).toString()}`}
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
        >
          <Download size={15} /> Export CSV
        </a>
      </div>

      <form className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name or phone..."
          className="w-64 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        {bookings.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No booking requests match.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Travel Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Received</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} total={total} basePath="/admin/leads/" params={{ q, status }} />
    </div>
  );
}
