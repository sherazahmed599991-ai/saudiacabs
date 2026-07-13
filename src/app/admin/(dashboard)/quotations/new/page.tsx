import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingRequest } from "@/lib/types";
import QuotationForm from "../QuotationForm";

export const metadata = { title: "New Quotation — Saudia Cabs Admin", robots: { index: false, follow: false } };

export default async function NewQuotationPage({
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
      <h1 className="mb-6 text-2xl font-bold text-foreground">New Quotation</h1>
      <QuotationForm
        defaultValues={
          booking
            ? {
                customerName: booking.full_name,
                customerPhone: booking.phone,
                serviceDescription: booking.service_type,
                bookingRequestId: booking.id,
              }
            : undefined
        }
      />
    </div>
  );
}
