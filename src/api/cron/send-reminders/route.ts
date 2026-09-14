import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendMail } from '@/lib/mail-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function formatTime12h(timeStr?: string): string {
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
    } catch {
        return timeStr;
    }
}

export async function GET(request: NextRequest) {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA'); // YYYY-MM-DD

    // Fetch confirmed bookings for tomorrow that haven't been reminded yet
    const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('pickup_date', tomorrowStr)
        .eq('status', 'confirmed')
        .is('deleted_at', null)
        .eq('reminder_sent', false);

    if (error) {
        console.error('Reminder cron error:', error);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
        return NextResponse.json({ message: 'No reminders to send', date: tomorrowStr });
    }

    let sent = 0;
    for (const booking of bookings) {
        if (!booking.customer_email) continue;

        const refId = `#${String(booking.id).slice(0, 8).toUpperCase()}`;
        const pickupTimeDisplay = formatTime12h(booking.pickup_time);
        const whatsappMsg = encodeURIComponent(
            `Hello, I have a booking tomorrow.\n\n*Ref:* ${refId}\n*Route:* ${booking.pickup_location} → ${booking.destination}\n*Time:* ${pickupTimeDisplay}\n*Vehicle:* ${booking.vehicle_type}`
        );

        try {
            await sendMail({
                to: booking.customer_email,
                subject: `⏰ Reminder: Your Trip Tomorrow — ${pickupTimeDisplay}`,
                html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; color: #C6FF00; text-transform: uppercase; letter-spacing: 2px;">Trip Reminder</h1>
                        <p style="color: #aaa; margin: 6px 0 0; font-size: 13px;">Your journey is tomorrow</p>
                    </div>
                    <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; background-color: #fff;">
                        <p style="font-size: 16px;">Dear <strong>${booking.customer_name}</strong>,</p>
                        <p>This is a friendly reminder that your transfer with <strong>Taxi Service KSA</strong> is scheduled for <strong>tomorrow</strong>.</p>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #ebedf0;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr><td style="padding: 6px 0; color: #666; width: 40%;">Booking Ref</td><td style="font-weight: bold; color: #000;">${refId}</td></tr>
                                <tr><td style="padding: 6px 0; color: #666;">Pickup Time</td><td style="font-weight: bold; color: #000; font-size: 18px;">${pickupTimeDisplay}</td></tr>
                                <tr><td style="padding: 6px 0; color: #666;">Pickup Location</td><td style="font-weight: bold; color: #000;">${booking.pickup_location}</td></tr>
                                <tr><td style="padding: 6px 0; color: #666;">Destination</td><td style="font-weight: bold; color: #000;">${booking.destination}</td></tr>
                                <tr><td style="padding: 6px 0; color: #666;">Vehicle</td><td style="font-weight: bold; color: #000;">${booking.vehicle_type}</td></tr>
                                <tr><td style="padding: 6px 0; color: #666;">Passengers</td><td style="font-weight: bold; color: #000;">${booking.passengers} Pax</td></tr>
                            </table>
                        </div>

                        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 15px; margin-bottom: 25px;">
                            <p style="margin: 0; font-size: 13px; color: #92400e;">
                                💡 <strong>Please be ready 10 minutes before your pickup time.</strong> Your chauffeur will contact you upon arrival.
                            </p>
                        </div>

                        <div style="text-align: center; margin: 25px 0;">
                            <a href="https://wa.me/966575806733?text=${whatsappMsg}" style="background-color: #25D366; color: white; padding: 13px 28px; text-decoration: none; font-weight: bold; border-radius: 30px; display: inline-block; font-size: 15px;">💬 Contact Driver / Support</a>
                        </div>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">Taxi Service KSA • Premium Chauffeur &amp; Private Transport Service</p>
                    </div>
                </div>`,
            });
            sent++;
            // Mark reminder as sent to prevent duplicate emails
            const { error: markError } = await supabaseAdmin
                .from('bookings')
                .update({ reminder_sent: true })
                .eq('id', booking.id);

            if (markError) {
                console.error('Failed to mark reminder_sent:', markError);
            }
        } catch (err) {
            console.error(`Reminder failed for booking ${booking.id}:`, err);
        }
    }

    return NextResponse.json({ success: true, sent, date: tomorrowStr });
}
