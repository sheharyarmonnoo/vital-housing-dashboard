"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileBarChart,
  Users,
  Target,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Portfolio", href: "/portfolio", icon: Building2 },
  { label: "Financial Review", href: "/financial-review", icon: FileBarChart },
  { label: "Investor Reports", href: "/investor-reports", icon: Users },
  { label: "Acquisitions", href: "/acquisitions", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-4 pt-4 pb-5 border-b border-white/[0.08]">
        {collapsed ? (
          <div className="flex justify-center">
            <span className="text-[16px] font-bold text-[#6b9b9b]">V</span>
          </div>
        ) : (
          <>
            <img src="/vital-logo.webp" alt="Vital Housing" className="h-10 w-auto" />
            <p className="text-[9px] text-[#5a7272] font-medium tracking-[0.12em] uppercase mt-2">Deal Manager AI</p>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
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
              <Icon size={16} strokeWidth={1.5} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
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
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#8aabab] hover:text-white">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <img src="/vital-logo.webp" alt="Vital Housing" className="h-6 w-auto" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-nav fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
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
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
