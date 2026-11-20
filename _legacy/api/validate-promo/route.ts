import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const { code, basePrice } = await request.json();

        if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

        const { data, error } = await supabaseAdmin
            .from('promo_codes')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return NextResponse.json({ valid: false, error: 'Invalid or expired promo code' });
        }

        // Check expiry
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return NextResponse.json({ valid: false, error: 'This promo code has expired' });
        }

        // Check max uses
        if (data.max_uses !== null && data.used_count >= data.max_uses) {
            return NextResponse.json({ valid: false, error: 'This promo code has reached its usage limit' });
        }

        let discountAmount = 0;
        if (basePrice && basePrice > 0) {
            if (data.discount_type === 'percentage') {
                discountAmount = Math.round((basePrice * data.discount_value) / 100 * 100) / 100;
            } else {
                discountAmount = Math.min(data.discount_value, basePrice);
            }
        }

        return NextResponse.json({
            valid: true,
            code: data.code,
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            discount_amount: discountAmount,
            final_price: basePrice ? Math.max(0, basePrice - discountAmount) : null,
        });
    } catch (err) {
        console.error('validate-promo error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
