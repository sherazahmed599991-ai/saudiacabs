import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAdminSession } from '@/lib/admin-auth';
import { adminBookingSchema, toFieldErrors } from '@/lib/booking-validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Update a booking (admin edit form). Uses the same bookingSchema as
// POST /api/booking/create so admin edits can never drift from the rules
// customer-facing forms enforce.
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    try {
        const session = await getAdminSession(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const parsed = adminBookingSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', fieldErrors: toFieldErrors(parsed.error) },
                { status: 400 }
            );
        }

        const data = parsed.data;
        const updatePayload = {
            ...data,
            return_date: data.has_return_trip ? data.return_date ?? null : null,
            return_time: data.has_return_trip ? data.return_time ?? null : null,
            return_pickup_location: data.has_return_trip ? data.return_pickup_location ?? null : null,
            return_destination: data.has_return_trip ? data.return_destination ?? null : null,
        };

        const { data: updated, error } = await supabaseAdmin
            .from('bookings')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error || !updated) {
            console.error('Supabase Update Error:', error);
            return NextResponse.json({ error: error?.message || 'Failed to update booking' }, { status: 500 });
        }

        return NextResponse.json({ booking: updated });
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Soft delete — sets deleted_at timestamp instead of removing the row
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    try {
        const session = await getAdminSession(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { error } = await supabaseAdmin
            .from('bookings')
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: session.user.email,
            })
            .eq('id', id);

        if (error) {
            console.error('Supabase Soft Delete Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Booking moved to trash' });
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Restore — clears deleted_at so the booking reappears in the main list
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    try {
        const session = await getAdminSession(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { error } = await supabaseAdmin
            .from('bookings')
            .update({ deleted_at: null, deleted_by: null })
            .eq('id', id);

        if (error) {
            console.error('Supabase Restore Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Booking restored' });
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
