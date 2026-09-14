import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getAdminSession, isInternalRequest } from '@/lib/admin-auth';

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
        // Called both from the admin browser UI (session cookie) and
        // server-to-server by /api/booking/accept-quote (internal secret).
        if (!isInternalRequest(request)) {
            const session = await getAdminSession(request);
            if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ip = getClientIp(request);
        if (!checkRateLimit(`status-email:${ip}`, 10, 60_000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { bookingId, status, customerEmail, customerName, totalPrice, currency } = body;

        if (!bookingId || !status || !customerEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const safeName = escapeHtml(customerName);
        let subject = '';
        let htmlContent = '';

        const wrapperStart = `
        <div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="color: #000; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Status Update</h2>
                <div style="width: 50px; height: 3px; background-color: #C6FF00; margin: 10px auto;"></div>
            </div>
            <p>Dear <strong>${safeName}</strong>,</p>
        `;
        const wrapperEnd = `
            <p style="margin-top: 30px;">Best regards,<br><strong>Customer Success Team</strong><br>Taxi Service KSA</p>
        </div>
        `;

        switch (status) {
            case 'quote_sent': {
                const curr = currency || 'SAR';
                const price = totalPrice ? `${curr} ${Number(totalPrice).toFixed(2)}` : null;
                subject = `💰 Your Quote is Ready - Taxi Service KSA`;
                htmlContent = `${wrapperStart}
                    <p>Thank you for choosing <strong>Taxi Service KSA</strong>. Your official quote for booking <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">#${bookingId.slice(0, 8).toUpperCase()}</span> is ready.</p>
                    ${price ? `<div style="background-color: #000; color: #fff; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                        <p style="margin: 0 0 4px; font-size: 12px; color: #aaa; text-transform: uppercase; letter-spacing: 2px;">Total Quote Price</p>
                        <p style="margin: 0; font-size: 32px; font-weight: 900; color: #C6FF00;">${price}</p>
                        <p style="margin: 8px 0 0; font-size: 11px; color: #777;">Includes fuel, toll &amp; all fees</p>
                    </div>` : ''}
                    <p style="font-size: 14px; color: #555;">This quote is valid for <strong>48 hours</strong>. Click below to accept and confirm your booking instantly.</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="https://taxiserviceksa.com/booking/quote?ref=${bookingId.slice(0, 8)}" style="background-color: #C6FF00; color: #000; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 900; display: inline-block; font-size: 16px;">✅ Accept Quote Online</a>
                    </div>
                    <p style="font-size: 13px; color: #777; text-align: center;">Or reply to this email / WhatsApp us to confirm.</p>
                ${wrapperEnd}`;
                break;
            }
            case 'in_progress':
                subject = '🚗 Your Driver is On the Way - Taxi Service KSA';
                htmlContent = `${wrapperStart}
                    <p>Great news! Your driver for booking <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">#${bookingId.slice(0, 8).toUpperCase()}</span> is on the way to your pickup location.</p>
                    <div style="background-color: #F6FFF0; border-left: 4px solid #C6FF00; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #000;">Driver is En Route</p>
                        <p style="margin: 5px 0 0; font-size: 14px; color: #555;">Please be ready at your pickup point. If you need to contact your driver, reply to this email or contact our support.</p>
                    </div>
                ${wrapperEnd}`;
                break;
            case 'confirmed':
                subject = '✅ Booking Confirmed - Taxi Service KSA';
                htmlContent = `${wrapperStart}
                    <p>We are pleased to inform you that your booking <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">#${bookingId.slice(0, 8).toUpperCase()}</span> has been <strong>successfully confirmed</strong>.</p>
                    <p>Our chauffeur will be ready at your specified pickup location and time. You will receive a notification when they are on the way.</p>
                    <div style="background-color: #F6FFF0; border-left: 4px solid #C6FF00; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold; color: #000;">Prepared for Departure</p>
                        <p style="margin: 5px 0; font-size: 14px;">Your luxury vehicle has been reserved and our team is finalizing your route.</p>
                    </div>
                ${wrapperEnd}`;
                break;
            case 'cancelled':
                subject = 'Booking Cancellation - Taxi Service KSA';
                htmlContent = `${wrapperStart}
                    <p>Your booking <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">#${bookingId.slice(0, 8).toUpperCase()}</span> has been <strong>cancelled</strong> as per your request or system update.</p>
                    <p>If you believe this is an error or would like to reschedule, please reply to this email immediately.</p>
                ${wrapperEnd}`;
                break;
            case 'completed':
                subject = '🌟 Your Trip with Taxi Service KSA';
                htmlContent = `${wrapperStart}
                    <p>Thank you for choosing <strong>Taxi Service KSA</strong> for your recent journey.</p>
                    <p>We hope you enjoyed the premium experience. Your feedback helps us maintain our leading standards in Saudi Arabia.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.trustpilot.com/review/taxiserviceksa.com" style="background-color: #00B67A; color: #fff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">⭐ Leave a Review on Trustpilot</a>
                    </div>
                ${wrapperEnd}`;
                break;
            default:
                return NextResponse.json({ message: 'No email sent for this status' });
        }

        await sendMail({
            to: customerEmail,
            subject,
            html: htmlContent
        });

        // Log email activity to booking
        const logTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        await appendEmailLog(bookingId, `📧 [${logTime}] Status email — ${statusLabel}`).catch(() => {});

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error sending status email:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
