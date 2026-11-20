// Edge-safe (no next/headers import) so the proxy can use it too.
//
// Fails CLOSED: if ADMIN_EMAILS is unset or empty, nobody is an admin.
// Previously an unset variable meant "every signed-in Supabase user is an
// admin", which is the opposite of a safe default.
export function getAdminAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminAllowlist().includes(email.toLowerCase());
}
