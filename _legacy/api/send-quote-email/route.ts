import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getAdminSession } from '@/lib/admin-auth';
import { hasStructuredReturnLeg, getReturnRoute } from '@/lib/booking-validation';

async function appendEmailLog(bookingId: string, entry: string) {
    const { data } = await supabaseAdmin.from('bookings').select('internal_notes').eq('id', bookingId).single();
    const existing = data?.internal_notes || '';
    const updated = existing ? `${existing}\n${entry}` : entry;
    await supabaseAdmin.from('bookings').update({ internal_notes: updated }).eq('id', bookingId);
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
        const session = await getAdminSession(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const ip = getClientIp(request);
        if (!checkRateLimit(`quote-email:${ip}`, 10, 60_000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { booking, currency, additionalEmails } = body;

        if (!booking || !booking.customer_email || !booking.total_price) {
            return NextResponse.json({ error: 'Missing booking data or price' }, { status: 400 });
        }

        const cc: string[] = Array.isArray(additionalEmails)
            ? additionalEmails.filter((e: string) => e && e.includes('@'))
            : [];

        const emailAdmin = process.env.ADMIN_EMAIL || 'info@taxiserviceksa.com';
        const refId      = `#${String(booking.id).slice(0, 8).toUpperCase()}`;
        const curr       = currency || booking.currency || 'SAR';
        const price      = Number(booking.total_price).toFixed(2);

        const safeName    = escapeHtml(booking.customer_name);
        const safePickup  = escapeHtml(booking.pickup_location);
        const safeDest    = escapeHtml(booking.destination);
        const safeVehicle = escapeHtml(booking.vehicle_type);

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

        const returnLegRow = hasStructuredReturnLeg(booking)
            ? `<tr><td style="padding: 5px 0; color: #666;">Return Route</td><td style="font-weight: bold; color: #000;">${getReturnRoute(booking).pickupLocation} → ${getReturnRoute(booking).destination}</td></tr><tr><td style="padding: 5px 0; color: #666;">Return Date/Time</td><td style="font-weight: bold; color: #000;">${booking.return_date} at ${formatTime12h(booking.return_time)}${booking.return_date === booking.pickup_date ? ' (same day)' : ''}</td></tr>`
            : (booking.has_return_trip ? `<tr><td style="padding: 5px 0; color: #666;">Trip Type</td><td style="font-weight: bold; color: #000;">Round Trip</td></tr>` : '');

        const itineraryLegs: { date: string; time: string; pickup: string; dropoff: string }[] = Array.isArray(booking.itinerary_legs) ? booking.itinerary_legs : [];
        const itineraryHtml = itineraryLegs.length > 0 ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 15px 0; border: 1px solid #ebedf0;">
                <h3 style="margin-top: 0; color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 8px; display: inline-block;">Full Itinerary</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 5px 8px 5px 0; color: #666; white-space: nowrap;">${booking.pickup_date} ${formatTime12h(booking.pickup_time)}</td><td style="padding: 5px 0; font-weight: bold; color: #000;">${safePickup} → ${safeDest}</td></tr>
                    ${itineraryLegs.map((leg) => `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 5px 8px 5px 0; color: #666; white-space: nowrap;">${escapeHtml(leg.date)}${leg.time ? ' ' + formatTime12h(leg.time) : ''}</td><td style="padding: 5px 0; font-weight: bold; color: #000;">${escapeHtml(leg.pickup)} → ${escapeHtml(leg.dropoff)}</td></tr>`).join('')}
                </table>
            </div>` : '';

        const additionalStops: { time?: string | null; location: string }[] = Array.isArray(booking.additional_stops) ? booking.additional_stops : [];
        const additionalStopsHtml = additionalStops.length > 0 ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 15px 0; border: 1px solid #ebedf0;">
                <h3 style="margin-top: 0; color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 8px; display: inline-block;">Sites to Visit</h3>
                <ul style="margin: 10px 0 0; padding-left: 20px; font-size: 13px; color: #333;">
                    ${additionalStops.map((stop) => `<li style="margin-bottom: 4px;">${stop.time ? `<strong>${formatTime12h(stop.time)}</strong> — ` : ''}${escapeHtml(stop.location)}</li>`).join('')}
                </ul>
            </div>` : '';

        const whatsappMsg = encodeURIComponent(
            `Hello, I'd like to confirm my booking.\n\n*Quote Ref:* ${refId}\n*Route:* ${booking.pickup_location} → ${booking.destination}\n*Date:* ${booking.pickup_date} at ${formatTime12h(booking.pickup_time)}${hasStructuredReturnLeg(booking) ? `\n*Return Route:* ${getReturnRoute(booking).pickupLocation} → ${getReturnRoute(booking).destination}\n*Return:* ${booking.return_date} at ${formatTime12h(booking.return_time)}` : ''}\n*Vehicle:* ${booking.vehicle_type}\n*Quote:* ${curr} ${price}`
        );

        const quoteHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; color: #C6FF00; text-transform: uppercase; letter-spacing: 2px;">Your Quote</h1>
                    <p style="color: #aaa; margin: 8px 0 0; font-size: 13px;">Taxi Service KSA</p>
                </div>
                <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; background-color: #fff;">
                    <p style="font-size: 16px;">Dear <strong>${safeName}</strong>,</p>
                    <p>Thank you for choosing <strong>Taxi Service KSA</strong>. Here is your official quote for the requested journey. <strong>Please find the full quotation PDF attached to this email.</strong></p>

                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #ebedf0;">
                        <h3 style="margin-top: 0; color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 8px; display: inline-block;">Journey Details</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr><td style="padding: 5px 0; color: #666; width: 40%;">Ref Number</td><td style="font-weight: bold; color: #000;">${refId}</td></tr>
                            <tr><td style="padding: 5px 0; color: #666;">Pickup</td><td style="font-weight: bold; color: #000;">${safePickup}</td></tr>
                            <tr><td style="padding: 5px 0; color: #666;">Destination</td><td style="font-weight: bold; color: #000;">${safeDest}</td></tr>
                            <tr><td style="padding: 5px 0; color: #666;">Date &amp; Time</td><td style="font-weight: bold; color: #000;">${booking.pickup_date} at ${formatTime12h(booking.pickup_time)}</td></tr>
                            ${returnLegRow}
                            <tr><td style="padding: 5px 0; color: #666;">Vehicle</td><td style="font-weight: bold; color: #000;">${safeVehicle}</td></tr>
                            <tr><td style="padding: 5px 0; color: #666;">Passengers</td><td style="font-weight: bold; color: #000;">${booking.passengers} Pax</td></tr>
                        </table>
                    </div>
                    ${itineraryHtml}
                    ${additionalStopsHtml}

                    <div style="background-color: #000; color: #fff; padding: 20px 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                        <p style="margin: 0 0 5px; font-size: 13px; color: #aaa; text-transform: uppercase; letter-spacing: 2px;">Total Quote Price</p>
                        <p style="margin: 0; font-size: 36px; font-weight: 900; color: #C6FF00; letter-spacing: 1px;">${curr} ${price}</p>
                        <p style="margin: 8px 0 0; font-size: 11px; color: #777;">Includes fuel, toll, and parking fees</p>
                        ${booking.deposit_amount ? `
                        <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #333; display: flex; justify-content: space-between; gap: 20px;">
                            <span style="font-size: 12px; color: #8fd3ff;">Deposit / Advance: <strong style="color:#fff;">${curr} ${Number(booking.deposit_amount).toFixed(2)}</strong></span>
                            <span style="font-size: 12px; color: #aaa;">Balance Due: <strong style="color:#fff;">${curr} ${(Number(booking.total_price) - Number(booking.deposit_amount)).toFixed(2)}</strong></span>
                        </div>` : ''}
                    </div>

                    <p style="font-size: 14px; color: #555;">This quote is valid for <strong>48 hours</strong>. To confirm your booking or ask any questions, simply reply to this email or tap the button below.</p>

                    <div style="text-align: center; margin: 30px 0; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <a href="https://taxiserviceksa.com/booking/quote?ref=${booking.id.slice(0, 8)}" style="background-color: #C6FF00; color: #000; padding: 14px 28px; text-decoration: none; font-weight: 900; border-radius: 30px; display: inline-block; font-size: 15px;">✅ Accept Quote Online</a>
                        <a href="https://wa.me/966575806733?text=${whatsappMsg}" style="background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 30px; display: inline-block; font-size: 15px;">💬 Confirm on WhatsApp</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">Taxi Service KSA • Premium Chauffeur &amp; Private Transport Service<br>taxiserviceksa9988@gmail.com • www.taxiserviceksa.com</p>
                </div>
            </div>`;

        // Build attachments array if PDF base64 was provided from the browser
        const attachments = body.pdfBase64 ? [{
            filename: body.pdfFilename || `Quotation-${refId}.pdf`,
            content: body.pdfBase64,
            encoding: 'base64',
        }] : undefined;

        // 1. Send quote to customer (+ CC additional emails)
        await sendMail({
            to: booking.customer_email,
            cc: cc.length ? cc : undefined,
            subject: `Your Quote ${refId} - Taxi Service KSA`,
            html: quoteHtml,
            attachments,
        });

        // 2. Notify admin that a quote was sent
        await sendMail({
            to: emailAdmin,
            replyTo: booking.customer_email,
            subject: `💰 Quote Sent — ${safeName} | ${curr} ${price}`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 10px;">Quote Sent to Customer</h2>
                <p><strong>Customer:</strong> ${safeName} (${escapeHtml(booking.customer_email)})</p>
                <p><strong>Phone:</strong> ${escapeHtml(booking.customer_phone)}</p>
                <p><strong>Route:</strong> ${safePickup} → ${safeDest}</p>
                <p><strong>Date/Time:</strong> ${booking.pickup_date} at ${formatTime12h(booking.pickup_time)}</p>
                ${hasStructuredReturnLeg(booking) ? `<p><strong>Return Route:</strong> ${escapeHtml(getReturnRoute(booking).pickupLocation)} → ${escapeHtml(getReturnRoute(booking).destination)}</p><p><strong>Return:</strong> ${booking.return_date} at ${formatTime12h(booking.return_time)}${booking.return_date === booking.pickup_date ? ' (same day)' : ''}</p>` : ''}
                <p><strong>Vehicle:</strong> ${safeVehicle}</p>
                <p><strong>Quoted Price:</strong> <span style="font-size:18px; font-weight:900; color:#000;">${curr} ${price}</span></p>
                <p style="font-size: 12px; color: #666;">Quote ref: ${refId} — valid 48 hours</p>
            </div>`,
        });

        // Log email activity to booking
        const logTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        await appendEmailLog(booking.id, `📧 [${logTime}] Quote sent — ${curr} ${price}`).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Send Quote Email Error:', error);
        return NextResponse.json({ error: 'Failed to send quote email' }, { status: 500 });
    }
}
