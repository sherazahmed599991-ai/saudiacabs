import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { BOOKING_STATUSES, oneOf, safeSearchTerm } from "@/lib/validation";

export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;

// Spreadsheet apps run cells starting with = + - @ as formulas. Booking
// fields come from a public form, so neutralise them before export.
function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

// Admin-only CSV of booking requests, honouring the same search/status
// filters as the Leads page.
export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });

  const sp = request.nextUrl.searchParams;
  const q = safeSearchTerm(sp.get("q") ?? undefined);
  const status = oneOf(sp.get("status") ?? "", BOOKING_STATUSES);

  let query = admin.supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("Leads export failed:", error.message);
    return new NextResponse("Export failed", { status: 500 });
  }

  const header = ["Received", "Name", "Phone", "Email", "Service", "Passengers", "Travel date", "Status", "Message"];
  const rows = (data ?? []).map((b) =>
    [b.created_at, b.full_name, b.phone, b.email, b.service_type, b.passengers, b.travel_date, b.status, b.message]
      .map(csvCell)
      .join(",")
  );

  // BOM so Excel reads Arabic/UTF-8 names correctly.
  const csv = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="booking-requests-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
