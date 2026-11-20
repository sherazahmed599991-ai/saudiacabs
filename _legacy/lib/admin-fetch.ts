import { supabase } from './supabase';

// This admin panel's session lives in localStorage (lib/supabase.ts uses the
// plain browser client, not @supabase/ssr's cookie-syncing client), so the
// server can't read it via cookies. Use this instead of plain fetch() for
// any admin-only API route — it attaches the current access token as a
// Bearer header so the server can verify it with supabase.auth.getUser().
export async function adminFetch(url: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers(options.headers);
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    return fetch(url, { ...options, headers });
}
