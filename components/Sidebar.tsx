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
  GitBranch,
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
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-4 pt-5 pb-6 flex items-center gap-2.5 min-h-[56px]">
        <div className="w-7 h-7 rounded bg-[#f4f4f5] flex items-center justify-center flex-shrink-0">
          <Building2 size={15} className="text-[#18181b]" />
        </div>
        {!collapsed && (
          <span className="text-[14px] font-semibold text-[#fafafa] tracking-tight whitespace-nowrap">
            Vital Housing
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#27272a] text-[#fafafa]"
                  : "text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a]/50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 pb-4 pt-2">
          <p className="text-[11px] text-[#52525b]">Updated Mar 15, 2026</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <div className="mobile-nav fixed top-0 left-0 right-0 z-50 h-12 bg-[#18181b] flex items-center px-3 gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#a1a1aa] hover:text-[#fafafa]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="text-[14px] font-semibold text-[#fafafa] tracking-tight">
          Vital Housing
        </span>
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
        <aside className="mobile-nav fixed top-12 left-0 bottom-0 z-50 w-56 bg-[#18181b] flex flex-col overflow-y-auto">
          {navContent}
        </aside>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`sidebar-desktop fixed top-0 left-0 bottom-0 z-40 bg-[#18181b] flex flex-col transition-all duration-200 ${
          collapsed ? "w-[52px]" : "w-[220px]"
        }`}
      >
        {navContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#a1a1aa] hover:text-[#fafafa]"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
