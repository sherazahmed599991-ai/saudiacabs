import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAdminSession } from '@/lib/admin-auth';

// Sends a free-text email to a client from the admin panel. Unlike the
// invoice/receipt/quote routes, this has no fixed template — the admin
// writes the subject and message directly, wrapped in the same branded
// layout used elsewhere so it still reads as an official message.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

        const body = await request.json();
        const { to, cc, subject, message, bookingId, customerName, attachment } = body;

        if (!to || !subject || !message) {
            return NextResponse.json({ error: 'To, subject, and message are required' }, { status: 400 });
        }

        const ccList: string[] = Array.isArray(cc)
            ? cc.filter((e: string) => e && e.includes('@'))
            : [];

        const greetingName = customerName ? customerName.split(' ')[0] : null;
        const paragraphs = String(message)
            .split(/\n{2,}/)
            .map((p: string) => `<p style="margin: 0 0 14px 0;">${p.replace(/\n/g, '<br/>')}</p>`)
            .join('');

        const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <div style="background-color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; color: #C6FF00; font-size: 20px; letter-spacing: 1px;">Taxi Service KSA</h1>
            </div>
            <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; background-color: #fff;">
                ${greetingName ? `<p style="font-size: 16px; margin-top: 0;">Dear <strong>${greetingName}</strong>,</p>` : ''}
                ${paragraphs}

                <table role="presentation" style="margin-top: 28px; border-top: 1px solid #eee; padding-top: 18px;">
                    <tr>
                        <td style="padding-right: 16px;">
                            <img src="https://taxiserviceksa.com/ismail-signature.png" alt="Ismail" style="height: 36px; display: block;" />
                            <p style="margin: 4px 0 0; font-size: 13px; font-weight: bold; color: #111;">Ismail</p>
                            <p style="margin: 0; font-size: 11px; color: #888;">Director, Taxi Service KSA</p>
                        </td>
                    </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0 14px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Taxi Service KSA &bull; info@taxiserviceksa.com &bull; +966 57 580 6733 &bull; www.taxiserviceksa.com
                </p>
            </div>
        </div>`;

        await sendMail({
            to,
            cc: ccList.length ? ccList : undefined,
            subject,
            html,
            replyTo: 'info@taxiserviceksa.com',
            attachments: attachment?.filename && attachment?.content
                ? [{ filename: attachment.filename, content: attachment.content }]
                : undefined,
        });

        if (bookingId) {
            const logTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            await appendEmailLog(bookingId, `[${logTime}] Email sent to ${to} — Subject: "${subject}"`).catch(() => {});
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Send Client Email Error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
