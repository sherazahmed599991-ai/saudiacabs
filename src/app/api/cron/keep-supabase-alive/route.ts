import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Supabase free-tier projects auto-pause after 7 days with no API activity.
// Vercel Cron hits this daily (see vercel.json). The query itself counts as
// activity, so it runs on the anon key.
//
// Fails closed: without CRON_SECRET the endpoint refuses every call instead
// of being open to the public internet. Vercel sends it automatically as
// "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    // head:true counts without returning rows. The anon role can't SELECT
    // booking_requests (RLS), so this succeeds with 0 rows — still activity.
    const { error } = await supabase.from("booking_requests").select("id", { head: true, count: "exact" });

    if (error) {
        console.error("keep-alive failed:", error.message);
        return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
}
