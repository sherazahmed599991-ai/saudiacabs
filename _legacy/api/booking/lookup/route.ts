import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Only fields customers are allowed to see - excludes internal_notes, tags,
// payment_status and other admin-only fields.
const PUBLIC_FIELDS = 'id, created_at, pickup_location, destination, pickup_date, pickup_time, trip_end_date, vehicle_type, passengers, luggage, customer_name, customer_email, customer_phone, status, total_price, currency, special_requests, driver_name, driver_phone, driver_plate, has_return_trip, return_date, return_time, return_pickup_location, return_destination';

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`booking-lookup:${ip}`, 10, 60_000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let ref: string | undefined;
    let email: string | undefined;
    try {
        ({ ref, email } = await request.json());
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!ref && !email) {
        return NextResponse.json({ error: 'Missing ref or email' }, { status: 400 });
    }

    if (ref) {
        const { data } = await supabaseAdmin
            .from('bookings')
            .select(PUBLIC_FIELDS)
            .ilike('id', `${ref}%`)
            .limit(1)
            .single();
        if (data) return NextResponse.json({ booking: data });
    }

    if (email) {
        const { data } = await supabaseAdmin
            .from('bookings')
            .select(PUBLIC_FIELDS)
            .eq('customer_email', email.toLowerCase())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (data) return NextResponse.json({ booking: data });
    }

    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
}
