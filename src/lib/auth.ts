import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-allowlist";

// Server actions are public POST endpoints: hiding the UI is not access
// control. Every admin action, page and route handler must verify the caller
// itself. getUser() re-validates the JWT with Supabase (getSession() would
// only trust the cookie).

/** For route handlers: returns null instead of redirecting. */
export async function getAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return { supabase, user };
}

/** For server actions and pages: redirects to the login page if not an admin. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
