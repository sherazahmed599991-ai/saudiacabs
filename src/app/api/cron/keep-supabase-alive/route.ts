import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Supabase free-tier projects auto-pause after 7 days with no API activity.
// Vercel Cron hits this daily (see vercel.json) with a plain read against a
// small public table - the query itself is what counts as activity, so it
// runs on the anon key and doesn't need service-role access.
export async function GET(request: NextRequest) {
    if (process.env.CRON_SECRET) {
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { error } = await supabase.from("booking_requests").select("id").limit(1);

    if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
}
