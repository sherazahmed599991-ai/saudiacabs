import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`accept-quote:${ip}`, 5, 60_000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let bookingId: string;
    try {
        ({ bookingId } = await request.json());
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!bookingId) {
        return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const { data: booking, error: fetchError } = await supabaseAdmin
        .from('bookings')
        .select('id, status, customer_name, customer_email')
        .eq('id', bookingId)
        .single();

    if (fetchError || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!['quote_sent', 'pending'].includes(booking.status)) {
        return NextResponse.json(
            { error: 'Booking cannot be accepted in this state', currentStatus: booking.status },
            { status: 409 }
        );
    }

    const { error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

    if (updateError) {
        return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 });
    }

    // Fire-and-forget confirmation email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxiserviceksa.com';
    const internalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.INTERNAL_API_SECRET) {
        internalHeaders['x-internal-secret'] = process.env.INTERNAL_API_SECRET;
    }
    fetch(`${baseUrl}/api/send-status-email`, {
        method: 'POST',
        headers: internalHeaders,
        body: JSON.stringify({
            bookingId: booking.id,
            status: 'confirmed',
            customerEmail: booking.customer_email,
            customerName: booking.customer_name
        })
    }).catch(() => {});

    return NextResponse.json({ success: true });
}
