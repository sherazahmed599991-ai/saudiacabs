import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail-server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('🧪 Triggering Resend Test API...');
        
        const result = await sendMail({
            to: 'taxiserviceksa9988@gmail.com',
            subject: '🚀 Resend Connection Test - Taxi KSA',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #000;">Connection Successful!</h1>
                    <p>Your Resend API is now working correctly with the new key.</p>
                    <hr/>
                    <p style="font-size: 12px; color: #666;">Sent at: ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Test email sent successfully!',
            details: result 
        });
    } catch (error: any) {
        console.error('❌ Test API Failed:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
