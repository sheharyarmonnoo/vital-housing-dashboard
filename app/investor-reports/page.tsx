"use client";

import { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import {
  properties,
  investorReports,
  formatCurrency,
} from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import { FileText } from "lucide-react";

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

export default function InvestorReportsPage() {
  const isMobile = useIsMobile();

  const propertyMap = useMemo(() => {
    const m: Record<string, string> = {};
    properties.forEach((p) => (m[p.id] = p.name));
    return m;
  }, []);

  const rowData = useMemo(() => {
    return investorReports.map((r) => ({
      ...r,
      propertyName: propertyMap[r.propertyId] || r.propertyId,
    }));
  }, [propertyMap]);

  const columnDefs: ColDef[] = useMemo(() => {
    if (isMobile) {
      return [
        { field: "propertyName", headerName: "Property", flex: 1, minWidth: 120 },
        { field: "quarter", headerName: "Quarter", width: 90 },
        {
          field: "status",
          headerName: "Status",
          width: 90,
          cellRenderer: (p: any) => {
            const colors: Record<string, string> = {
              published: "text-[#16a34a]",
              draft: "text-[#d97706]",
              pending: "text-[#71717a]",
            };
            return `<span class="${colors[p.value] || ""} text-[12px] font-medium capitalize">${p.value}</span>`;
          },
        },
      ];
    }
    return [
      { field: "propertyName", headerName: "Property", flex: 1, minWidth: 160 },
      { field: "quarter", headerName: "Quarter", width: 110 },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            published: "text-[#16a34a]",
            draft: "text-[#d97706]",
            pending: "text-[#71717a]",
          };
          const bg: Record<string, string> = {
            published: "bg-[#f0fdf4]",
            draft: "bg-[#fffbeb]",
            pending: "bg-[#f4f4f5]",
          };
          return `<span class="${colors[p.value] || ""} ${bg[p.value] || ""} text-[11px] font-medium capitalize px-2 py-0.5 rounded">${p.value}</span>`;
        },
      },
      {
        field: "distributionAmount",
        headerName: "Distribution",
        width: 120,
        valueFormatter: (p: any) =>
          p.value > 0 ? formatCurrency(p.value) : "--",
        type: "numericColumn",
      },
      {
        field: "publishedDate",
        headerName: "Published",
        width: 120,
        valueFormatter: (p: any) => p.value || "--",
      },
    ];
  }, [isMobile]);

  return (
    <>
      <PageHeader
        title="Investor Reports"
        subtitle="Quarterly report schedule and distribution tracking"
      >
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] text-white text-[12px] font-medium rounded hover:bg-[#27272a] transition-colors">
          <FileText size={13} />
          Generate Report
        </button>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#e4e4e7] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#71717a] uppercase tracking-wide">
            Published
          </p>
          <p className="text-[20px] font-semibold text-[#16a34a]">
            {investorReports.filter((r) => r.status === "published").length}
          </p>
        </div>
        <div className="bg-white border border-[#e4e4e7] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#71717a] uppercase tracking-wide">
            Drafts
          </p>
          <p className="text-[20px] font-semibold text-[#d97706]">
            {investorReports.filter((r) => r.status === "draft").length}
          </p>
        </div>
        <div className="bg-white border border-[#e4e4e7] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#71717a] uppercase tracking-wide">
            Pending
          </p>
          <p className="text-[20px] font-semibold text-[#71717a]">
            {investorReports.filter((r) => r.status === "pending").length}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#e4e4e7] rounded p-4">
        <div
          className="ag-theme-alpine"
          style={{ height: 360, width: "100%" }}
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
