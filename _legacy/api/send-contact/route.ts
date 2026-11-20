import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const formSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    subject: z.string().min(5),
    message: z.string().min(10),
});

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        if (!checkRateLimit(`contact:${ip}`, 5, 60_000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await req.json();
        const { name, email, phone, subject, message } = formSchema.parse(body);

        const safeName = escapeHtml(name);
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message);
        const adminEmail = process.env.ADMIN_EMAIL || 'info@taxiserviceksa.com';

        // Save to support_inquiries so it shows up in the admin Support inbox,
        // not just as an email. Best-effort — a DB hiccup shouldn't block the
        // customer's message from emailing through.
        await supabaseAdmin.from('support_inquiries').insert([{
            name, email, phone, subject, message, status: 'open',
        }]).then(({ error }) => {
            if (error) console.error('Failed to save support inquiry:', error);
        });

        // 1. Send Alert to Admin
        await sendMail({
            to: adminEmail,
            replyTo: email,
            subject: `📧 Contact Form: ${subject}`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #efefef; border-radius: 12px; max-width: 600px;">
              <h2 style="color: #000; border-bottom: 2px solid #C6FF00; padding-bottom: 10px; margin-top: 0;">New Contact Inquiry</h2>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>From:</strong> ${safeName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${escapeHtml(phone)}</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${safeSubject}</p>
              </div>
              <p style="color: #666; font-size: 14px; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Message Content:</p>
              <div style="padding: 15px; border: 1px dashed #ddd; border-radius: 8px; background-color: #fff; white-space: pre-wrap; color: #333; line-height: 1.6;">${safeMessage}</div>
              <p style="font-size: 12px; color: #999; margin-top: 20px;">Sent via Contact Form at taxiserviceksa.com</p>
            </div>
            `,
        });

        // 2. Send Auto-Reply to Customer
        try {
            await sendMail({
                to: email,
                subject: `Re: ${subject} - Taxi Service KSA`,
                html: `
                <div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h2 style="color: #000; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Message Received</h2>
                        <div style="width: 50px; height: 3px; background-color: #C6FF00; margin: 10px auto;"></div>
                    </div>

                    <p>Dear <strong>${safeName}</strong>,</p>
                    <p>Thank you for contacting <strong>Taxi Service KSA</strong>. We have received your message regarding "<strong>${safeSubject}</strong>".</p>
                    <p>Our customer support team is currently reviewing your inquiry and will get back to you within the next hour.</p>

                    <div style="background-color: #f8f9fa; border-left: 4px solid #000; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-style: italic; color: #555;">"${message.length > 100 ? safeMessage.substring(0, 100) + '...' : safeMessage}"</p>
                    </div>

                    <p>For urgent inquiries, please do not hesitate to reply to this email.</p>

                    <p style="margin-top: 30px;">Best regards,<br><strong>Customer Success Team</strong><br>Taxi Service KSA</p>
                </div>
                `,
            });
        } catch (e) {
            console.warn('Auto-reply failed to send to customer:', e);
        }

        return NextResponse.json({ success: true, message: 'Email sent successfully' }, { status: 200 });

    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
