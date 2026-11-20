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

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { booking, pdfBase64, filename, currency, paymentStatus, paymentMethod, additionalEmails } = body;

        if (!booking || !pdfBase64) {
            return NextResponse.json({ error: 'Missing booking or PDF data' }, { status: 400 });
        }

        const cc: string[] = Array.isArray(additionalEmails)
            ? additionalEmails.filter((e: string) => e && e.includes('@'))
            : [];

        const refId = `#${String(booking.id).slice(0, 8).toUpperCase()}`;
        const emailAdmin = process.env.ADMIN_EMAIL || 'info@taxiserviceksa.com';
        const curr = currency || 'SAR';
        const amount = booking.total_price?.toFixed(2) || '0.00';

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
            ? `<p style="margin: 5px 0;"><strong>Return Route:</strong> ${getReturnRoute(booking).pickupLocation} → ${getReturnRoute(booking).destination}</p><p style="margin: 5px 0;"><strong>Return Date/Time:</strong> ${booking.return_date} at ${formatTime12h(booking.return_time)}${booking.return_date === booking.pickup_date ? ' (same day)' : ''}</p>`
            : '';

        // 1. Send invoice to customer (+ CC additional emails)
        await sendMail({
            to: booking.customer_email,
            cc: cc.length ? cc : undefined,
            subject: `Your Invoice ${refId} - Taxi Service KSA`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                <div style="background-color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; color: #C6FF00; text-transform: uppercase; letter-spacing: 2px;">Your Invoice</h1>
                </div>
                <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; background-color: #fff;">
                    <p style="font-size: 16px;">Dear <strong>${booking.customer_name}</strong>,</p>
                    <p>Please find your invoice attached for your upcoming journey with <strong>Taxi Service KSA</strong>.</p>

                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #ebedf0;">
                        <h3 style="margin-top: 0; color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 8px; display: inline-block;">Booking Summary</h3>
                        <p style="margin: 10px 0;"><strong>Invoice Ref:</strong> ${refId}</p>
                        <p style="margin: 5px 0;"><strong>Pickup:</strong> ${booking.pickup_location}</p>
                        <p style="margin: 5px 0;"><strong>Destination:</strong> ${booking.destination}</p>
                        <p style="margin: 5px 0;"><strong>Date/Time:</strong> ${booking.pickup_date} at ${formatTime12h(booking.pickup_time)}</p>
                        ${returnLegLine}
                        <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${booking.vehicle_type}</p>
                        <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency || 'SAR'} ${booking.total_price?.toFixed(2) || '0.00'}</p>
                        ${booking.deposit_amount ? `<p style="margin: 5px 0;"><strong>Deposit Paid:</strong> ${currency || 'SAR'} ${Number(booking.deposit_amount).toFixed(2)}</p><p style="margin: 5px 0;"><strong>Balance Due:</strong> ${currency || 'SAR'} ${(Number(booking.total_price) - Number(booking.deposit_amount)).toFixed(2)}</p>` : ''}
                        <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${paymentStatus || 'Unpaid'}</p>
                        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod || 'Cash to Driver'}</p>
                    </div>

                    <p style="font-size: 14px; color: #666;">The PDF invoice is attached to this email. Please save it for your records.</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://wa.me/966575806733" style="background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 30px; display: inline-block; font-size: 16px;">💬 Contact Us on WhatsApp</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">Taxi Service KSA • Premium Chauffeur &amp; Private Transport Service</p>
                </div>
            </div>
            `,
            attachments: [
                {
                    filename: filename || `Invoice-${refId}.pdf`,
                    content: pdfBase64,
                },
            ],
        });

        // 2. Notify admin that invoice was sent
        await sendMail({
            to: emailAdmin,
            replyTo: booking.customer_email,
            subject: `🧾 Invoice Sent — ${booking.customer_name} | ${curr} ${amount}`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 10px;">Invoice Sent to Customer</h2>
                <p><strong>Customer:</strong> ${booking.customer_name}</p>
                <p><strong>Email:</strong> ${booking.customer_email}</p>
                <p><strong>Phone:</strong> ${booking.customer_phone || 'N/A'}</p>
                <p><strong>Route:</strong> ${booking.pickup_location} → ${booking.destination}</p>
                <p><strong>Date/Time:</strong> ${booking.pickup_date} at ${formatTime12h(booking.pickup_time)}</p>
                ${returnLegLine}
                <p><strong>Vehicle:</strong> ${booking.vehicle_type}</p>
                <p><strong>Amount:</strong> <span style="font-size:18px; font-weight:900; color:#000;">${curr} ${amount}</span></p>
                <p><strong>Payment Status:</strong> ${paymentStatus || 'Unpaid'}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod || 'Cash to Driver'}</p>
                <p style="font-size:12px; color:#666;">Ref: ${refId} — PDF invoice was attached to customer email.</p>
            </div>`,
        });

        // Log email activity to booking
        const logTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        await appendEmailLog(booking.id, `📧 [${logTime}] Invoice sent — ${curr} ${amount} | ${paymentStatus || 'Unpaid'}`).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Send Invoice Email Error:', error);
        return NextResponse.json({ error: 'Failed to send invoice email' }, { status: 500 });
    }
}
