import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingRequest } from "@/lib/types";
import InvoiceForm from "../InvoiceForm";

export const metadata = { title: "New Invoice — Saudia Cabs Admin", robots: { index: false, follow: false } };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  let booking: BookingRequest | null = null;
  if (bookingId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("booking_requests").select("*").eq("id", bookingId).single();
    booking = data as BookingRequest | null;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">New Invoice</h1>
      <InvoiceForm
        defaultValues={
          booking
            ? {
                customerName: booking.full_name,
                customerPhone: booking.phone,
                bookingRequestId: booking.id,
              }
            : undefined
        }
      />
    </div>
  );
}
