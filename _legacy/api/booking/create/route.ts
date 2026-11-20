import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { bookingSchema, adminBookingSchema, toFieldErrors } from '@/lib/booking-validation';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Single source of truth for creating a booking. Every booking form (public
// multi-step form, both homepage hero widgets, and the admin "create
// booking" panel) submits here instead of writing to Supabase directly, so
// validation (see lib/booking-validation.ts) can never drift between callers.
export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`booking-create:${ip}`, 10, 60_000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Route-only flag, not part of the persisted booking shape.
    const sendCustomerEmail = body.sendCustomerEmail !== false;
    const { sendCustomerEmail: _omit, ...bookingInput } = body;

    // Admin-originated requests (Bearer token from the admin panel's
    // adminFetch) use the relaxed admin schema — the admin "quick create"
    // form has always allowed saving a booking before contact details are
    // known (walk-in/phone bookings). Unauthenticated public requests always
    // go through the strict customer-facing schema.
    const adminSession = await getAdminSession(request);
    const schema = adminSession ? adminBookingSchema : bookingSchema;

    const parsed = schema.safeParse(bookingInput);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', fieldErrors: toFieldErrors(parsed.error) },
            { status: 400 }
        );
    }

    // Round-trip fields should never be persisted as stray values on a
    // one-way booking, even if a client accidentally sends them.
    const data = parsed.data;
    const insertPayload = {
        ...data,
        return_date: data.has_return_trip ? data.return_date ?? null : null,
        return_time: data.has_return_trip ? data.return_time ?? null : null,
        return_pickup_location: data.has_return_trip ? data.return_pickup_location ?? null : null,
        return_destination: data.has_return_trip ? data.return_destination ?? null : null,
        status: data.status || 'pending',
    };

    const { data: inserted, error } = await supabaseAdmin
        .from('bookings')
        .insert([insertPayload])
        .select()
        .single();

    if (error || !inserted) {
        console.error('Booking create error:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    if (sendCustomerEmail) {
        // Fire-and-forget — don't block booking success on email delivery.
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taxiserviceksa.com';
        const internalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (process.env.INTERNAL_API_SECRET) {
            internalHeaders['x-internal-secret'] = process.env.INTERNAL_API_SECRET;
        }
        fetch(`${baseUrl}/api/send-booking-emails`, {
            method: 'POST',
            headers: internalHeaders,
            body: JSON.stringify({ booking: inserted }),
        }).catch((err) => console.error('send-booking-emails fetch failed:', err));
    }

    return NextResponse.json({ booking: inserted }, { status: 201 });
}
