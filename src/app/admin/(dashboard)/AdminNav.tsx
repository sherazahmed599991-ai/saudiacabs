"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, FileText, Receipt, FileCheck2 } from "lucide-react";

const links = [
  { label: "Dashboard", href: "/admin", Icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", Icon: ClipboardList },
  { label: "Quotations", href: "/admin/quotations", Icon: FileText },
  { label: "Invoices", href: "/admin/invoices", Icon: FileCheck2 },
  { label: "Receipts", href: "/admin/receipts", Icon: Receipt },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ label, href, Icon }) => {
        const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
