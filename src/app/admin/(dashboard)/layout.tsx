import { requireAdmin } from "@/lib/auth";
import { signOut } from "../actions";
import AdminNav from "./AdminNav";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:gap-8 md:px-6 md:py-8">
        <aside className="w-full shrink-0 md:w-56">
          <div className="mb-3 md:mb-6">
            <div className="text-lg font-bold text-foreground">
              Saudia <span className="text-primary">Cabs</span>
            </div>
            <div className="text-xs text-muted">Admin Panel</div>
          </div>
          <AdminNav />
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 md:mt-8 md:block md:pt-4">
            <div className="truncate text-xs text-muted md:mb-2" title={user.email}>
              {user.email}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-white hover:text-foreground md:w-full"
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
