"use client";

import { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import {
  properties,
  monthlyReviews,
  formatCurrency,
} from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import { Upload } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export default function FinancialReviewPage() {
  const isMobile = useIsMobile();
  const [propertyFilter, setPropertyFilter] = useState<string>("all");

  const propertyMap = useMemo(() => {
    const m: Record<string, string> = {};
    properties.forEach((p) => (m[p.id] = p.name));
    return m;
  }, []);

  const rowData = useMemo(() => {
    const base = monthlyReviews.map((r) => ({
      ...r,
      propertyName: propertyMap[r.propertyId] || r.propertyId,
    }));
    if (propertyFilter === "all") return base;
    return base.filter((r) => r.propertyId === propertyFilter);
  }, [propertyFilter, propertyMap]);

  const columnDefs: ColDef[] = useMemo(() => {
    if (isMobile) {
      return [
        { field: "propertyName", headerName: "Property", flex: 1, minWidth: 120 },
        { field: "month", headerName: "Month", width: 90 },
        {
          field: "flagCount",
          headerName: "Flags",
          width: 70,
          cellRenderer: (p: any) => {
            if (p.value === 0) return `<span class="text-[#a1a1aa]">0</span>`;
            return `<span class="text-[#dc2626] font-medium">${p.value}</span>`;
          },
        },
      ];
    }
    return [
      { field: "propertyName", headerName: "Property", flex: 1, minWidth: 160 },
      { field: "month", headerName: "Month", width: 100 },
      {
        field: "revenue",
        headerName: "Revenue",
        width: 110,
        valueFormatter: (p: any) => formatCurrency(p.value),
        type: "numericColumn",
      },
      {
        field: "expenses",
        headerName: "Expenses",
        width: 110,
        valueFormatter: (p: any) => formatCurrency(p.value),
        type: "numericColumn",
      },
      {
        field: "noi",
        headerName: "NOI",
        width: 100,
        valueFormatter: (p: any) => formatCurrency(p.value),
        type: "numericColumn",
      },
      {
        field: "budgetVariance",
        headerName: "Budget Var",
        width: 105,
        cellRenderer: (p: any) => {
          const v = p.value;
          const color = v < -3 ? "text-[#dc2626]" : v < 0 ? "text-[#d97706]" : "text-[#16a34a]";
          return `<span class="${color} font-medium">${v > 0 ? "+" : ""}${v}%</span>`;
        },
      },
      {
        field: "occupancy",
        headerName: "Occupancy",
        width: 100,
        valueFormatter: (p: any) => `${p.value}%`,
      },
      {
        field: "collections",
        headerName: "Collections",
        width: 105,
        valueFormatter: (p: any) => `${p.value}%`,
      },
      {
        field: "dscr",
        headerName: "DSCR",
        width: 80,
        cellRenderer: (p: any) => {
          const color = p.value < 1.15 ? "text-[#dc2626]" : p.value < 1.25 ? "text-[#d97706]" : "text-[#18181b]";
          return `<span class="${color} font-medium">${p.value.toFixed(2)}</span>`;
        },
      },
      {
        field: "flagCount",
        headerName: "Flags",
        width: 75,
        cellRenderer: (p: any) => {
          if (p.value === 0) return `<span class="text-[#a1a1aa]">0</span>`;
          return `<span class="text-[#dc2626] font-medium">${p.value}</span>`;
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 95,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            reviewed: "text-[#16a34a]",
            draft: "text-[#d97706]",
            pending: "text-[#71717a]",
          };
          return `<span class="${colors[p.value] || ""} text-[12px] font-medium capitalize">${p.value}</span>`;
        },
      },
    ];
  }, [isMobile]);

  // Unique properties that have reviews
  const reviewedProperties = useMemo(() => {
    const ids = [...new Set(monthlyReviews.map((r) => r.propertyId))];
    return ids.map((id) => ({ id, name: propertyMap[id] || id }));
  }, [propertyMap]);

  return (
    <>
      <PageHeader
        title="Financial Review"
        subtitle="Monthly financial package review across all properties"
      >
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] text-white text-[12px] font-medium rounded hover:bg-[#27272a] transition-colors">
          <Upload size={13} />
          Upload Package
        </button>
      </PageHeader>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-[12px] font-medium text-[#71717a]">
          Property:
        </label>
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="text-[13px] border border-[#e4e4e7] rounded px-2.5 py-1.5 bg-white text-[#18181b] outline-none focus:border-[#a1a1aa]"
        >
          <option value="all">All Properties</option>
          {reviewedProperties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-[#e4e4e7] rounded p-4">
        <div
          className="ag-theme-alpine"
          style={{ height: 520, width: "100%" }}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
            animateRows
            suppressCellFocus
          />
        </div>
      </div>
    </>
  );
}
