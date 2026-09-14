import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { hasStructuredReturnLeg, getReturnRoute } from '@/lib/booking-validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to format booking ID
function formatBookingId(id: string | number | undefined): string {
    if (!id) return 'N/A';
    return `#${String(id).slice(0, 8).toUpperCase()}`;
}



// Helper function to format date safely
function formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' });
    } catch {
        return String(date);
    }
}

function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request);
        if (!checkRateLimit(`booking-email:${ip}`, 10, 60_000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        if (!body || !body.booking) {
            return NextResponse.json({ error: 'Missing booking data' }, { status: 400 });
        }

        const { booking } = body;
        const emailAdmin = process.env.ADMIN_EMAIL || 'info@taxiserviceksa.com';

        const safeName     = escapeHtml(booking.customer_name);
        const safePickup   = escapeHtml(booking.pickup_location);
        const safeDest     = escapeHtml(booking.destination);
        const safeVehicle  = escapeHtml(booking.vehicle_type);
        const safeRequests = escapeHtml(booking.special_requests) || 'None';
        const safeFlightNumber = escapeHtml(booking.flight_number);

        const formatTime12h = (timeStr?: string): string => {
            if (!timeStr) return '—';
            try {
                const parts = timeStr.split(':');
                if (parts.length < 2) return timeStr;
                let hours = parseInt(parts[0], 10);
                const minutes = parts[1];
                if (isNaN(hours)) return timeStr;
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                return `${hours}:${minutes} ${ampm}`;
            } catch (e) {
                return timeStr;
            }
        };

        const returnLegLine = hasStructuredReturnLeg(booking)
            ? `<p style="margin: 5px 0;"><strong>Return Route:</strong> ${escapeHtml(getReturnRoute(booking).pickupLocation)} → ${escapeHtml(getReturnRoute(booking).destination)}</p><p style="margin: 5px 0;"><strong>Return Date/Time:</strong> ${booking.return_date} at ${formatTime12h(booking.return_time)}${booking.return_date === booking.pickup_date ? ' (same day)' : ''}</p>`
            : (booking.has_return_trip ? `<p style="margin: 5px 0;"><strong>Trip Type:</strong> Round Trip (return details to be confirmed)</p>` : '');

        console.log('Sending emails for booking:', booking.id || 'new booking');

        // 1. Send email to customer
        await sendMail({
            to: booking.customer_email,
            subject: 'Quotation Request Received - Taxi Service KSA',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                <div style="background-color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; color: #C6FF00; text-transform: uppercase; letter-spacing: 2px;">Quotation Request</h1>
                </div>
                <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; background-color: #fff;">
                    <p style="font-size: 16px;">Dear <strong>${safeName}</strong>,</p>
                    <p>Thank you for reaching out to <strong>Taxi Service KSA</strong>. We have received your request for a quotation for your upcoming journey. Our team is currently reviewing your details and will provide you with our best competitive rates shortly.</p>

                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #ebedf0;">
                        <h3 style="margin-top: 0; color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 8px; display: inline-block;">Journey Details</h3>
                        <p style="margin: 10px 0;"><strong>Request ID:</strong> ${formatBookingId(booking.id)}</p>
                        <p style="margin: 5px 0;"><strong>Pickup:</strong> ${safePickup}</p>
                        <p style="margin: 5px 0;"><strong>Destination:</strong> ${safeDest}</p>
                        <p style="margin: 5px 0;"><strong>Date/Time:</strong> ${booking.pickup_date} at ${formatTime12h(booking.pickup_time)}</p>
                        ${returnLegLine}
                        <p style="margin: 5px 0;"><strong>Vehicle Type:</strong> ${safeVehicle}</p>
                        <p style="margin: 5px 0;"><strong>Passengers:</strong> ${booking.passengers} Pax</p>
                    </div>

                    <div style="background-color: #000; color: #fff; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                        <p style="margin: 0; font-weight: bold;">Our team will reply with your official quote via email/WhatsApp within 15-30 minutes.</p>
                    </div>

                    <p style="font-size: 15px;">If you have any urgent changes, please reply to this email or contact us <a href="mailto:taxiserviceksa9988@gmail.com" style="color: #000; font-weight: bold;">taxiserviceksa9988@gmail.com</a></p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://wa.me/966575806733?text=Hello%2C%20I%20want%20to%20discuss%20my%20booking.%0A%0A*Booking%20Details%3A*%0A%E2%96%B6%20ID%3A%20${formatBookingId(booking.id)}%0A%E2%96%B6%20Name%3A%20${encodeURIComponent(booking.customer_name)}%0A%E2%96%B6%20Route%3A%20${encodeURIComponent(booking.pickup_location)}%20to%20${encodeURIComponent(booking.destination)}%0A%E2%96%B6%20Date%3A%20${encodeURIComponent(booking.pickup_date)}%20at%20${encodeURIComponent(booking.pickup_time)}%0A%E2%96%B6%20Vehicle%3A%20${encodeURIComponent(booking.vehicle_type)}" style="background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 30px; display: inline-block; font-size: 16px;">💬 Chat on WhatsApp</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">Taxi Service KSA • Premium Chauffeur &amp; Private Transport Service</p>
                </div>
            </div>
            `,
        });

        // 2. Send email to admin
        await sendMail({
            to: emailAdmin,
            replyTo: booking.customer_email,
            subject: `📋 New Quote Request - ${safeName}`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 10px;">New Quotation Request</h2>
                <p><strong>Customer Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${escapeHtml(booking.customer_email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(booking.customer_phone)}</p>
                <p><strong>Route:</strong> ${safePickup} to ${safeDest}</p>
                <p><strong>Date/Time:</strong> ${booking.pickup_date} at ${formatTime12h(booking.pickup_time)}</p>
                ${returnLegLine}
                <p><strong>Vehicle:</strong> ${safeVehicle}</p>
                <p><strong>Passengers:</strong> ${booking.passengers}</p>
                <p><strong>Luggage:</strong> ${booking.luggage ?? 0} bags</p>
                ${safeFlightNumber ? `<p><strong>Flight Number:</strong> ${safeFlightNumber}</p>` : ''}
                <p><strong>Special Requests:</strong> ${safeRequests}</p>
                <hr>
                <p style="font-size: 12px; color: #666;">View this in the Admin Dashboard to generate a PDF Quotation.</p>
            </div>
            `,
        });

        return NextResponse.json({
            success: true,
            bookingId: booking.id || 'pending'
        });
    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
    }
}
