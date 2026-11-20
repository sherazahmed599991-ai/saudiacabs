import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

// This admin panel's browser session lives in localStorage (lib/supabase.ts
// uses the plain browser client, not @supabase/ssr), so it is never sent to
// the server as a cookie. Callers must attach it as a Bearer token instead
// (see lib/admin-fetch.ts on the client side) — we verify that token here.
// If ADMIN_EMAILS is set (comma-separated), the signed-in user's email must
// be in that list — otherwise any authenticated Supabase user counts as admin.
export async function getAdminSession(request: NextRequest | Request) {
    const authHeader = (request as Request).headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return null;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    const allowlist = process.env.ADMIN_EMAILS;
    if (allowlist) {
        const allowed = allowlist.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
        const email = user.email?.toLowerCase();
        if (!email || !allowed.includes(email)) return null;
    }

    return { user };
}

// For server-to-server calls (e.g. one API route invoking another) that
// can't carry a browser session token. Caller must send this header with a
// value matching INTERNAL_API_SECRET.
export function isInternalRequest(request: NextRequest | Request): boolean {
    const secret = process.env.INTERNAL_API_SECRET;
    if (!secret) return false;
    const header = (request as Request).headers.get('x-internal-secret');
    return header === secret;
}
