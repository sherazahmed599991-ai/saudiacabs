import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';
import { getAdminSession } from '@/lib/admin-auth';

// Sends one outreach email to one B2B lead (Umrah/Hajj travel companies etc).
// Called once per recipient from the client-side campaign sender in
// app/(main)/admin/b2b-leads/page.tsx — deliberately not a server-side loop,
// so a large campaign never risks hitting the serverless function timeout.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { to, cc, companyName, subject, message, attachment } = body;

        if (!to || !subject || !message) {
            return NextResponse.json({ error: 'To, subject, and message are required' }, { status: 400 });
        }

        const ccList: string[] = Array.isArray(cc)
            ? cc.filter((e: string) => e && e.includes('@'))
            : [];

        const paragraphs = String(message)
            .split(/\n{2,}/)
            .map((p: string) => `<p style="margin: 0 0 14px 0;">${p.replace(/\n/g, '<br/>')}</p>`)
            .join('');

        const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <div style="background-color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; color: #C6FF00; font-size: 20px; letter-spacing: 1px;">Taxi Service KSA</h1>
                <p style="color: #aaa; margin: 6px 0 0; font-size: 12px;">Ground Transport Partner in Saudi Arabia</p>
            </div>
            <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px; background-color: #fff;">
                ${companyName ? `<p style="font-size: 16px; margin-top: 0;">Dear <strong>${companyName}</strong> team,</p>` : ''}
                ${paragraphs}

                <table role="presentation" style="margin-top: 28px; border-top: 1px solid #eee; padding-top: 18px;">
                    <tr>
                        <td style="padding-right: 24px;">
                            <img src="https://taxiserviceksa.com/ismail-signature.png" alt="Ismail" style="height: 34px; display: block;" />
                            <p style="margin: 4px 0 0; font-size: 13px; font-weight: bold; color: #111;">Ismail</p>
                            <p style="margin: 0; font-size: 11px; color: #888;">Director</p>
                        </td>
                        <td>
                            <img src="https://taxiserviceksa.com/zumer-signature.png" alt="Zumer" style="height: 34px; display: block;" />
                            <p style="margin: 4px 0 0; font-size: 13px; font-weight: bold; color: #111;">Zumer</p>
                            <p style="margin: 0; font-size: 11px; color: #888;">Partner</p>
                        </td>
                    </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0 14px;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Taxi Service KSA &bull; info@taxiserviceksa.com &bull; +966 57 580 6733 &bull; www.taxiserviceksa.com
                </p>
                <p style="font-size: 11px; color: #bbb; text-align: center;">
                    If you'd rather not receive future updates from us, just reply and let us know.
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Send B2B Email Error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
