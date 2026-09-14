import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Resend Config (Recommended for Vercel)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// SMTP Config (Fallback)
const emailUser = process.env.EMAIL_USER || 'info@taxiserviceksa.com';
// Google displays app passwords grouped as "xxxx xxxx xxxx xxxx" for
// readability, but the real credential has no spaces — a copy-paste of
// the displayed form (as happened once already) fails Gmail auth with a
// generic "Username and Password not accepted" error that gives no hint
// the spaces are the problem. Stripping them here makes that mistake
// harmless regardless of how the env var gets set.
const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, '');
let smtpHost = process.env.SMTP_HOST;
if (!smtpHost) {
    smtpHost = emailUser.endsWith('@gmail.com') ? 'smtp.gmail.com' : 'smtp.gmail.com';
}
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

console.log(' Mail Config Status:', {
    provider: resend ? 'Resend' : 'Nodemailer (SMTP)',
    user: emailUser,
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasSmtpPass: !!emailPass
});

// Create the Nodemailer transporter (Fallback)
export const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: emailUser,
        pass: emailPass,
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Send an email using Resend (Primary) or Nodemailer (Fallback)
 */
interface Attachment {
    filename: string;
    content: string; // base64 encoded
}

export async function sendMail({ to, cc, subject, html, fromName = 'Taxi Service KSA', replyTo, attachments }: {
    to: string;
    cc?: string[];
    subject: string;
    html: string;
    fromName?: string;
    replyTo?: string;
    attachments?: Attachment[];
}) {
    // 1. Try Resend First (Best for Vercel)
    if (resend) {
        try {
            console.log(`📧 Sending via Resend to: ${to}${cc?.length ? ` + CC: ${cc.join(', ')}` : ''}`);
            const { data, error } = await resend.emails.send({
                from: `${fromName} <info@taxiserviceksa.com>`,
                to,
                cc: cc?.length ? cc : undefined,
                subject,
                html,
                replyTo: replyTo || 'info@taxiserviceksa.com',
                attachments: attachments?.map(a => ({
                    filename: a.filename,
                    content: a.content,
                })),
            });

            if (error) {
                console.warn('⚠️ Resend failed, falling back to SMTP:', error);
                // Continue to SMTP fallback
            } else {
                console.log(`✅ Email sent via Resend: ${data?.id}`);
                return data;
            }
        } catch (e) {
            console.error('❌ Resend Exception, falling back to SMTP:', e);
        }
    }

    // 2. Fallback to Nodemailer/SMTP
    if (!emailPass) {
        console.warn('⚠️ SMTP Fallback skipped (no password configured)');
        return { message: 'Email skipped (no secrets)' };
    }

    try {
        console.log(`📧 SMTP Fallback to: ${to}${cc?.length ? ` + CC: ${cc.join(', ')}` : ''}`);
        const info = await transporter.sendMail({
            from: `"${fromName}" <${emailUser}>`,
            to,
            cc: cc?.length ? cc.join(', ') : undefined,
            subject,
            html,
            replyTo: replyTo || emailUser,
            attachments: attachments?.map(a => ({
                filename: a.filename,
                content: Buffer.from(a.content, 'base64'),
                contentType: 'application/pdf',
            })),
        });

        console.log(`✅ Email sent via SMTP: ${info.messageId}`);
        return info;
    } catch (error: any) {
        console.error('❌ All email providers failed!');
        throw error;
    }
}
