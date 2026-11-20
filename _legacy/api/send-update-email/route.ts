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

function escapeHtml(str: unknown): string {
    if (str === null || str === undefined || str === '') return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatValue(field: string, value: unknown, currency: string): string {
    if (value === null || value === undefined || value === '') return '—';
    if (field === 'Price') return `${currency} ${Number(value).toFixed(2)}`;
    if (field === 'Round Trip') return value ? 'Yes' : 'No';
    return String(value);
}

interface Change {
    field: string;
    oldValue: unknown;
    newValue: unknown;
}

export async function POST(request: NextRequest) {
    try {
        if (!isInternalRequest(request)) {
            const session = await getAdminSession(request);
            if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ip = getClientIp(request);
        if (!checkRateLimit(`update-email:${ip}`, 10, 60_000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { bookingId, customerEmail, customerName, currency, changes } = body as {
            bookingId: string; customerEmail: string; customerName: string; currency?: string; changes: Change[];
        };

        if (!bookingId || !customerEmail || !Array.isArray(changes) || changes.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const safeName = escapeHtml(customerName);
        const curr = currency || 'SAR';
        const refId = bookingId.slice(0, 8).toUpperCase();

        const rows = changes.map(c => `
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">${escapeHtml(c.field)}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eee; color: #999; text-decoration: line-through;">${escapeHtml(formatValue(c.field, c.oldValue, curr))}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #eee; color: #000; font-weight: bold;">${escapeHtml(formatValue(c.field, c.newValue, curr))}</td>
            </tr>
        `).join('');

        const subject = `✏️ Your Booking Has Been Updated - #${refId}`;
        const html = `
        <div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="color: #000; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Booking Updated</h2>
                <div style="width: 50px; height: 3px; background-color: #C6FF00; margin: 10px auto;"></div>
            </div>
            <p>Dear <strong>${safeName}</strong>,</p>
            <p>We've updated the following detail${changes.length > 1 ? 's' : ''} on your booking <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">#${refId}</span>:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                <thead>
                    <tr style="background: #f9f9f9;">
                        <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Field</th>
                        <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Previous</th>
                        <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Updated</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <p style="font-size: 13px; color: #777;">If you have any questions about this change, just reply to this email or contact us on WhatsApp.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>Customer Success Team</strong><br>Taxi Service KSA</p>
        </div>
        `;

        await sendMail({ to: customerEmail, subject, html });

        const logTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        const fieldsList = changes.map(c => c.field).join(', ');
        await appendEmailLog(bookingId, `📧 [${logTime}] Update email — ${fieldsList} changed`).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending update email:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
