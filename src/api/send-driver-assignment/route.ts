import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAdminSession } from '@/lib/admin-auth';

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

async function appendEmailLog(bookingId: string, entry: string) {
    const { data } = await supabaseAdmin.from('bookings').select('internal_notes').eq('id', bookingId).single();
    const existing = data?.internal_notes || '';
    const updated = existing ? `${existing}\n${entry}` : entry;
    await supabaseAdmin.from('bookings').update({ internal_notes: updated }).eq('id', bookingId);
}

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { booking } = await request.json();

        if (!booking?.customer_email || !booking?.driver_name || !booking?.driver_phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const safeName = escapeHtml(booking.customer_name);
        const safeDriver = escapeHtml(booking.driver_name);
        const safePhone = escapeHtml(booking.driver_phone);
        const safePlate = escapeHtml(booking.driver_plate);
        const safeVehicle = escapeHtml(booking.actual_vehicle || booking.vehicle_type);
        const safeFrom = escapeHtml(booking.pickup_location);
        const safeTo = escapeHtml(booking.destination);
        const refId = `#${String(booking.id).slice(0, 8).toUpperCase()}`;
        const cleanPhone = (booking.driver_phone as string).replace(/\s/g, '');

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

        const whatsappMsg = encodeURIComponent(
            `Hello, I am your driver for booking ${refId}.\n\nDriver: ${booking.driver_name}\nPhone: ${booking.driver_phone}${booking.driver_plate ? `\nPlate: ${booking.driver_plate}` : ''}`
        );

        await sendMail({
            to: booking.customer_email,
            subject: `🚗 Your Driver is Assigned — ${booking.pickup_date} at ${formatTime12h(booking.pickup_time)}`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; color: #C6FF00; text-transform: uppercase; letter-spacing: 2px;">Driver Assigned</h1>
                    <p style="color: #aaa; margin: 6px 0 0; font-size: 13px;">Your chauffeur details are ready</p>
                </div>
                <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; background-color: #fff;">
                    <p style="font-size: 16px;">Dear <strong>${safeName}</strong>,</p>
                    <p>A driver has been assigned to your upcoming trip. Here are your chauffeur's details:</p>

                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 25px 0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; width: 40%;">Driver Name</td>
                                <td style="font-weight: bold; color: #000; font-size: 18px;">${safeDriver}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Driver Phone</td>
                                <td style="font-weight: bold; color: #000; font-size: 16px;"><a href="tel:${escapeHtml(cleanPhone)}" style="color: #16a34a;">${safePhone}</a></td>
                            </tr>
                            ${safePlate ? `<tr><td style="padding: 8px 0; color: #666;">Vehicle Plate</td><td style="font-weight: bold; color: #000;">${safePlate}</td></tr>` : ''}
                            ${safeVehicle ? `<tr><td style="padding: 8px 0; color: #666;">Vehicle</td><td style="font-weight: bold; color: #000;">${safeVehicle}</td></tr>` : ''}
                        </table>
                    </div>

                    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #ebedf0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr><td style="padding: 5px 0; color: #666; width: 40%;">Booking Ref</td><td style="font-weight: bold; color: #000;">${refId}</td></tr>
                            <tr><td style="padding: 5px 0; color: #666;">Pickup Time</td><td style="font-weight: bold; color: #000; font-size: 16px;">${formatTime12h(booking.pickup_time)}</td></tr>
                            <tr><td style="padding: 5px 0; color: #666;">Pickup Location</td><td style="font-weight: bold; color: #000;">${safeFrom}</td></tr>
                            <tr><td style="padding: 5px 0; color: #666;">Destination</td><td style="font-weight: bold; color: #000;">${safeTo}</td></tr>
                        </table>
                    </div>

                    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 15px; margin-bottom: 25px;">
                        <p style="margin: 0; font-size: 13px; color: #92400e;">
                            💡 <strong>Please be ready 10 minutes before your pickup time.</strong> Your driver will contact you upon arrival.
                        </p>
                    </div>

                    <div style="text-align: center; margin: 25px 0;">
                        <a href="https://wa.me/${escapeHtml(cleanPhone)}?text=${whatsappMsg}" style="background-color: #25D366; color: white; padding: 13px 28px; text-decoration: none; font-weight: bold; border-radius: 30px; display: inline-block; font-size: 15px;">💬 WhatsApp Your Driver</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">Taxi Service KSA • Premium Chauffeur &amp; Private Transport Service</p>
                </div>
            </div>`,
        });

        const now = new Date();
        const logEntry = `📧 [${now.toLocaleDateString('en-CA')} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}] Driver assigned — ${booking.driver_name} / ${booking.driver_phone}`;
        await appendEmailLog(booking.id, logEntry);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('send-driver-assignment error:', err);
        return NextResponse.json({ error: 'Failed to send driver assignment email' }, { status: 500 });
    }
}
