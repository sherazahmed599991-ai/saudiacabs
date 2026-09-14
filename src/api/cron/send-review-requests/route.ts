import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendMail } from '@/lib/mail-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA'); // YYYY-MM-DD

    // A trip "concluded yesterday" if its trip_end_date was yesterday
    // (multi-day package), or — when there's no trip_end_date — its
    // pickup_date was yesterday (single-day trip).
    const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .or(`trip_end_date.eq.${yesterdayStr},and(trip_end_date.is.null,pickup_date.eq.${yesterdayStr})`)
        .in('status', ['confirmed', 'completed', 'in_progress'])
        .is('deleted_at', null)
        .eq('review_requested', false);

    if (error) {
        console.error('Review-request cron error:', error);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
        return NextResponse.json({ message: 'No review requests to send', date: yesterdayStr });
    }

    let sent = 0;
    for (const booking of bookings) {
        if (!booking.customer_email) continue;

        try {
            await sendMail({
                to: booking.customer_email,
                subject: `⭐ How was your trip with Taxi Service KSA?`,
                html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; color: #C6FF00; text-transform: uppercase; letter-spacing: 2px;">We'd Love Your Feedback</h1>
                        <p style="color: #aaa; margin: 6px 0 0; font-size: 13px;">Your trip from ${booking.pickup_location} to ${booking.destination}</p>
                    </div>
                    <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; background-color: #fff;">
                        <p style="font-size: 16px;">Dear <strong>${booking.customer_name}</strong>,</p>
                        <p>Thank you for traveling with <strong>Taxi Service KSA</strong>. We hope your chauffeur made your journey comfortable and stress-free.</p>
                        <p>Would you mind sharing your experience? It takes less than a minute and genuinely helps other travelers choose us with confidence.</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://taxiserviceksa.com/submit-review" style="background-color: #C6FF00; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 30px; display: inline-block; font-size: 15px; margin: 0 6px 10px;">⭐ Leave a Review</a>
                            <br/>
                            <a href="https://www.trustpilot.com/review/taxiserviceksa.com?utm_medium=trustbox&utm_source=ReviewCollector" style="background-color: #00b67a; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 30px; display: inline-block; font-size: 13px; margin: 0 6px;">Review on Trustpilot</a>
                        </div>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">Taxi Service KSA • Premium Chauffeur &amp; Private Transport Service</p>
                    </div>
                </div>`,
            });
            sent++;
            // Mark as requested to prevent duplicate emails
            const { error: markError } = await supabaseAdmin
                .from('bookings')
                .update({ review_requested: true })
                .eq('id', booking.id);

            if (markError) {
                console.error('Failed to mark review_requested:', markError);
            }
        } catch (err) {
            console.error(`Review request failed for booking ${booking.id}:`, err);
        }
    }

    return NextResponse.json({ success: true, sent, date: yesterdayStr });
}
