import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "../actions";
import AdminNav from "./AdminNav";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <div className="mb-6">
            <div className="text-lg font-bold text-foreground">
              Saudia <span className="text-primary">Cabs</span>
            </div>
            <div className="text-xs text-muted">Admin Panel</div>
          </div>
          <AdminNav />
          <div className="mt-8 border-t border-border pt-4">
            <div className="mb-2 truncate text-xs text-muted" title={user.email}>
              {user.email}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-white hover:text-foreground"
              >
                <LogOut size={17} /> Sign Out
              </button>
            </form>
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
