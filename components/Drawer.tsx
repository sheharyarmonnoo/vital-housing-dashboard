"use client";
import { useEffect, useState } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Drawer({ open, onClose, title, subtitle, children }: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${visible ? "opacity-20" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full sm:w-[480px] bg-white h-full overflow-y-auto border-l border-[#d4dede] transition-transform duration-200 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#d4dede] px-5 py-4 flex items-center justify-between z-10">
          <div>
            {title && <h2 className="text-[16px] font-semibold text-[#1a2e2e]">{title}</h2>}
            {subtitle && <p className="text-[11px] text-[#8aabab] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#f0f4f4] rounded cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8aabab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
