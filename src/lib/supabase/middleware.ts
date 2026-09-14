import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
  // ADMIN_EMAILS mirrors the allowlist lib/admin-auth.ts already enforces
  // for the /api/admin/* routes — without this, any authenticated Supabase
  // account (anyone the project allows to sign up) would pass as admin.
  const allowlist = process.env.ADMIN_EMAILS;
  const isAdmin =
    !!user &&
    (!allowlist ||
      allowlist
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
        .includes((user.email || "").toLowerCase()));

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
