import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { isAdminEmail } from "@/lib/admin-allowlist";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() re-validates the token against Supabase's auth server instead
  // of just trusting the cookie — required for a safe authorization check.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Being a signed-in Supabase user is not the same as being an admin.
  // Fails closed: with no ADMIN_EMAILS configured, nobody gets in. Every
  // admin page/action/route also re-checks via lib/auth.ts — this proxy is
  // only the first layer.
  const isAdmin = !!user && isAdminEmail(user.email);

  const { pathname } = request.nextUrl;
  const isLoginPath = pathname.startsWith("/admin/login");

  if (pathname.startsWith("/admin") && !isLoginPath && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (isLoginPath && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}
