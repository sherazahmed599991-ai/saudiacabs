"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { clean } from "@/lib/validation";

export type AuthFormState = {
  status: "idle" | "error";
  message: string;
};

export async function signIn(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = clean(formData.get("email"), 254);
  const password = String(formData.get("password") ?? "").slice(0, 200);

  if (!email || !password) {
    return { status: "error", message: "Please enter your email and password." };
  }

  // Throttle credential stuffing per IP (best-effort; see lib/rate-limit.ts).
  if (!checkRateLimit(`login:${await getClientIp()}`, 8, 10 * 60_000)) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: "Invalid email or password." };
  }

  redirect("/admin");
}
