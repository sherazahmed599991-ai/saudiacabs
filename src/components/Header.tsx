"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { locations } from "@/lib/locations";
import { routes, routeTitle } from "@/lib/routes";
import { PHONE_DISPLAY, waUrl } from "@/lib/contact";

type NavItem = { label: string; href: string };
type NavMenu = { label: string; items: NavItem[]; viewAll: NavItem };

const serviceItems: NavItem[] = [
  { label: "Airport Transfer", href: "/services/airport-transfer/" },
  { label: "Ziyarat Tours", href: "/services/ziyarat-tours/" },
  { label: "Makkah–Madinah Transfer", href: "/services/makkah-madinah-transfer/" },
  { label: "Miqat Transfer", href: "/services/miqat-transfer/" },
  { label: "Group Packages", href: "/services/group-packages/" },
  { label: "Our Fleet", href: "/fleet/" },
];

const menus: NavMenu[] = [
  { label: "Services", items: serviceItems, viewAll: { label: "All services", href: "/services/" } },
  {
    label: "Locations",
    items: locations.map((l) => ({ label: l.name, href: `/locations/${l.slug}/` })),
    viewAll: { label: "All locations", href: "/locations/" },
  },
  {
    label: "Routes",
    items: routes.slice(0, 7).map((r) => ({ label: routeTitle(r), href: `/routes/${r.slug}/` })),
    viewAll: { label: "All routes", href: "/routes/" },
  },
  {
    label: "Company",
    items: [
      { label: "About Us", href: "/about/" },
      { label: "Blog", href: "/blog/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Partners", href: "/partners/" },
      { label: "Contact", href: "/contact/" },
    ],
    viewAll: { label: "Book Online", href: "/book-online/" },
  },
];

const linkStyle = {
  fontSize: "15px",
  fontWeight: 500,
  padding: "8px 14px",
  borderRadius: "4px",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Close menus whenever the page changes (reset during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  }

  // Close the open dropdown on outside click or Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const isActive = (href: string) => pathname === href || pathname === href.replace(/\/$/, "");
  const sectionActive = (m: NavMenu) =>
    [...m.items, m.viewAll].some((i) => pathname.startsWith(i.href) && i.href !== "/");

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>
      {/* Top bar */}
      <div className="hidden-mobile" style={{ backgroundColor: "#0F2A18", color: "#EDEAD3", fontSize: "13px" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "32px" }}>
          <span>Private transfers across Saudi Arabia · Available 24/7</span>
          <a href="tel:+966598947503" style={{ color: "#EDEAD3" }}>{PHONE_DISPLAY}</a>
        </div>
      </div>

      <div style={{ backgroundColor: "#184A27", borderBottom: "1px solid #0F2A18" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.25)" }}>
              <Image src="/logo.jpeg" alt="Saudia Cabs logo" fill style={{ objectFit: "cover" }} sizes="40px" priority />
            </div>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#FCFBEA" }}>
              Saudia <span style={{ color: "#D1B969" }}>Cabs</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav ref={navRef} aria-label="Main" className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <Link
              href="/"
              aria-current={isActive("/") ? "page" : undefined}
              style={{ ...linkStyle, color: isActive("/") ? "#D1B969" : "#EDEAD3" }}
            >
              Home
            </Link>

            {menus.map((m) => {
              const open = openMenu === m.label;
              const active = sectionActive(m);
              return (
                <div
                  key={m.label}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setOpenMenu(m.label)}
                  onMouseLeave={() => setOpenMenu((cur) => (cur === m.label ? null : cur))}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(open ? null : m.label)}
                    style={{ ...linkStyle, color: active || open ? "#D1B969" : "#EDEAD3", backgroundColor: open ? "rgba(255,255,255,0.08)" : "transparent" }}
                  >
                    {m.label}
                    <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                  </button>
                  {open && (
                    <div
                      role="menu"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        minWidth: "230px",
                        backgroundColor: "#fff",
                        border: "1px solid #E4DEC6",
                        borderRadius: "8px",
                        boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
                        padding: "8px",
                        zIndex: 120,
                      }}
                    >
                      {m.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          style={{ display: "block", padding: "9px 12px", fontSize: "14.5px", color: "#17351F", borderRadius: "4px", textDecoration: "none" }}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <Link
                        href={m.viewAll.href}
                        role="menuitem"
                        style={{ display: "block", padding: "10px 12px", marginTop: "4px", borderTop: "1px solid #E4DEC6", fontSize: "14.5px", fontWeight: 600, color: "#8F6F25", textDecoration: "none" }}
                      >
                        {m.viewAll.label} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/book-online/"
              style={{ ...linkStyle, backgroundColor: "#8F6F25", color: "#fff", padding: "9px 16px", borderRadius: "42px", marginLeft: "8px" }}
            >
              Get a Quote
            </Link>
            <a
              href={waUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...linkStyle, backgroundColor: "#0E7A3E", color: "#fff", padding: "9px 16px", borderRadius: "42px", marginLeft: "4px", fontSize: "14px" }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="show-mobile"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: "#FCFBEA", display: "none" }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div id="mobile-menu" style={{ backgroundColor: "#184A27", borderTop: "1px solid #0F2A18", padding: "8px 24px 20px", maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
            <Link
              href="/"
              aria-current={isActive("/") ? "page" : undefined}
              style={{ display: "block", fontSize: "16px", fontWeight: 500, color: isActive("/") ? "#D1B969" : "#FCFBEA", padding: "12px 0", borderBottom: "1px solid #2D663A", textDecoration: "none" }}
            >
              Home
            </Link>
            {menus.map((m) => {
              const open = mobileSection === m.label;
              return (
                <div key={m.label} style={{ borderBottom: "1px solid #2D663A" }}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setMobileSection(open ? null : m.label)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", color: "#FCFBEA", fontSize: "16px", fontWeight: 500, padding: "12px 0", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {m.label}
                    <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "none" }} />
                  </button>
                  {open && (
                    <div style={{ paddingBottom: "10px" }}>
                      {m.items.map((item) => (
                        <Link key={item.href} href={item.href} style={{ display: "block", padding: "8px 0 8px 14px", fontSize: "15px", color: "#EDEAD3", textDecoration: "none" }}>
                          {item.label}
                        </Link>
                      ))}
                      <Link href={m.viewAll.href} style={{ display: "block", padding: "8px 0 8px 14px", fontSize: "15px", fontWeight: 600, color: "#D1B969", textDecoration: "none" }}>
                        {m.viewAll.label} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <a href={waUrl()} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", backgroundColor: "#0E7A3E", color: "#fff", fontSize: "14px", fontWeight: 500, padding: "11px", borderRadius: "42px", textDecoration: "none" }}>
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href="tel:+966598947503" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", backgroundColor: "#8F6F25", color: "#fff", fontSize: "14px", fontWeight: 500, padding: "11px", borderRadius: "42px", textDecoration: "none" }}>
                <Phone size={16} /> Call Us
              </a>
            </div>
            <Link href="/book-online/" style={{ display: "block", textAlign: "center", marginTop: "12px", backgroundColor: "#fff", color: "#8F6F25", fontSize: "15px", fontWeight: 600, padding: "12px", borderRadius: "42px", textDecoration: "none" }}>
              Get a Quote
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </header>
  );
}
