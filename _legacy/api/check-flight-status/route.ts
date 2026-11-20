import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// On-demand flight status lookup via AviationStack (free tier: 100
// requests/month, get a key at https://aviationstack.com/). Checked
// from the admin panel right before a driver leaves for an airport
// pickup — not a background cron, so it can't run into Vercel's
// cron-job limits and doesn't burn API quota on flights nobody's
// about to go meet.
export async function GET(request: NextRequest) {
    const session = await getAdminSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flightNumber = request.nextUrl.searchParams.get('flight')?.trim();
    if (!flightNumber) {
        return NextResponse.json({ error: 'Missing flight number' }, { status: 400 });
    }

    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (!apiKey) {
        return NextResponse.json({
            error: 'not_configured',
            message: 'Flight tracking isn\'t set up yet. Get a free API key at aviationstack.com and add it as AVIATIONSTACK_API_KEY.',
        }, { status: 200 });
    }

    try {
        const res = await fetch(
            `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${encodeURIComponent(flightNumber)}`,
            { cache: 'no-store' }
        );
        const json = await res.json();

        if (json.error) {
            return NextResponse.json({ error: 'api_error', message: json.error.message || 'Flight lookup failed.' }, { status: 200 });
        }

        const flight = json.data?.[0];
        if (!flight) {
            return NextResponse.json({ error: 'not_found', message: `No live data found for flight ${flightNumber}.` }, { status: 200 });
        }

        return NextResponse.json({
            status: flight.flight_status,
            departureAirport: flight.departure?.airport,
            departureScheduled: flight.departure?.scheduled,
            departureEstimated: flight.departure?.estimated,
            departureDelay: flight.departure?.delay,
            arrivalAirport: flight.arrival?.airport,
            arrivalScheduled: flight.arrival?.scheduled,
            arrivalEstimated: flight.arrival?.estimated,
            arrivalDelay: flight.arrival?.delay,
        });
    } catch (err) {
        console.error('Flight status lookup failed:', err);
        return NextResponse.json({ error: 'lookup_failed', message: 'Could not reach the flight tracking service.' }, { status: 200 });
    }
}
