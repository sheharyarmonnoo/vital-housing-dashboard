"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Packages", href: "/packages" },
  { label: "Financial Review", href: "/financial-review" },
  { label: "Investor Reports", href: "/investor-reports" },
  { label: "Deal Memory", href: "/deal-memory" },
  { label: "Acquisitions", href: "/acquisitions" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-4 pt-4 pb-5 border-b border-white/[0.08]">
        {collapsed ? (
          <div className="flex justify-center">
            <span className="text-[16px] font-bold text-[#6b9b9b]">VH</span>
          </div>
        ) : (
          <>
            <p className="text-[16px] font-bold text-white tracking-tight">Vital Housing</p>
            <p className="text-[9px] text-[#6b9b9b] font-medium tracking-[0.12em] uppercase mt-1">Portfolio Manager</p>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] transition-colors ${
                active
                  ? "bg-[#4a6b6b] text-white font-medium"
                  : "text-[#8aabab] hover:text-white hover:bg-[#3a5555]/50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {!collapsed && <span>{item.label}</span>}
              {collapsed && <span className="text-[11px]">{item.label.charAt(0)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 pb-3 pt-2 border-t border-white/[0.08]">
          <p className="text-[10px] text-[#5a7272]">Updated Mar 15, 2026</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <div className="mobile-nav fixed top-0 left-0 right-0 z-50 h-12 bg-[#2a4040] flex items-center px-3 gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#8aabab] hover:text-white"
        >
          {mobileOpen ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          )}
        </button>
        <span className="text-[14px] font-bold text-white">Vital Housing</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-nav fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <aside className="mobile-nav fixed top-12 left-0 bottom-0 z-50 w-56 bg-[#2a4040] flex flex-col overflow-y-auto">
          {navContent}
        </aside>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`sidebar-desktop fixed top-0 left-0 bottom-0 z-40 bg-[#2a4040] flex flex-col transition-all duration-200 ${
          collapsed ? "w-[52px]" : "w-[220px]"
        }`}
      >
        {navContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-[#2a4040] border border-[#4a6b6b] flex items-center justify-center text-[#8aabab] hover:text-white cursor-pointer"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </aside>
    </>
  );
}
