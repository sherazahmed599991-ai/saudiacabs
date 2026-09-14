import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const formSchema = z.object({
    email: z.string().email(),
});

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        if (!checkRateLimit(`newsletter:${ip}`, 5, 60_000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await req.json();
        const { email } = formSchema.parse(body);

        // Best-effort — a DB hiccup shouldn't block the signup from being noticed via email.
        const { error: dbError } = await supabaseAdmin
            .from('newsletter_subscribers')
            .upsert([{ email, source: 'homepage' }], { onConflict: 'email', ignoreDuplicates: true });
        if (dbError) console.error('Failed to save newsletter subscriber:', dbError);

        const adminEmail = process.env.ADMIN_EMAIL || 'info@taxiserviceksa.com';
        await sendMail({
            to: adminEmail,
            subject: '📧 New Newsletter Signup',
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><p>New homepage newsletter signup:</p><p><strong>${email}</strong></p></div>`,
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Newsletter signup error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
