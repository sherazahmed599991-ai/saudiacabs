import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login — Saudia Cabs",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-bold text-foreground">Saudia Cabs Admin</h1>
      <p className="mb-6 text-sm text-muted">Sign in to manage bookings, quotations & invoices.</p>
      <LoginForm />
    </div>
  );
}
