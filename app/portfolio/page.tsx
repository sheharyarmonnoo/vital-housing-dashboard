"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties, formatCurrency, Property } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import { X } from "lucide-react";

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

function DetailPanel({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const rows = [
    ["Location", property.location],
    ["Units", String(property.units)],
    ["Role", property.role],
    ["PM System", property.pmSystem],
    ["Investor Group", property.investorGroup],
    ["Occupancy", `${property.occupancy}%`],
    ["Annual NOI", formatCurrency(property.noi)],
    ["Monthly Revenue", formatCurrency(property.monthlyRevenue)],
    ["Status", property.status],
    ["Last Review", property.lastReviewDate || "N/A"],
    ["Review Status", property.reviewStatus],
  ];

  return (
    <div className="bg-white border border-[#d4dede] rounded p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[#1a2e2e]">
          {property.name}
        </h3>
        <button
          onClick={onClose}
          className="text-[#8aabab] hover:text-[#1a2e2e]"
        >
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="py-1.5">
            <span className="text-[11px] font-medium text-[#8aabab] uppercase tracking-wide block">
              {label}
            </span>
            <span className="text-[13px] text-[#1a2e2e] capitalize">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<Property | null>(null);

  const columnDefs: ColDef[] = useMemo(() => {
    if (isMobile) {
      return [
        { field: "name", headerName: "Property", flex: 1, minWidth: 140 },
        { field: "units", headerName: "Units", width: 70, type: "numericColumn" },
        {
          field: "occupancy",
          headerName: "Occ %",
          width: 75,
          valueFormatter: (p: any) => `${p.value}%`,
        },
      ];
    }
    return [
      { field: "name", headerName: "Property", flex: 1, minWidth: 160 },
      { field: "location", headerName: "Location", width: 130 },
      { field: "units", headerName: "Units", width: 80, type: "numericColumn" },
      {
        field: "role",
        headerName: "Role",
        width: 110,
        cellRenderer: (p: any) => {
          const labels: Record<string, string> = {
            core: "Core",
            "co-gp": "Co-GP",
            "third-party": "3rd Party AM",
            acquisition: "Acquisition",
          };
          return `<span class="capitalize text-[12px]">${labels[p.value] || p.value}</span>`;
        },
      },
      { field: "pmSystem", headerName: "PM System", width: 100 },
      { field: "investorGroup", headerName: "Investor Group", width: 160 },
      {
        field: "occupancy",
        headerName: "Occupancy",
        width: 100,
        valueFormatter: (p: any) => `${p.value}%`,
      },
      {
        field: "noi",
        headerName: "Annual NOI",
        width: 120,
        valueFormatter: (p: any) => formatCurrency(p.value),
        type: "numericColumn",
      },
      {
        field: "monthlyRevenue",
        headerName: "Monthly Rev",
        width: 120,
        valueFormatter: (p: any) => formatCurrency(p.value),
        type: "numericColumn",
      },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            active: "text-[#16a34a]",
            "pre-conversion": "text-[#d97706]",
            pipeline: "text-[#5a7272]",
          };
          return `<span class="${colors[p.value] || ""} text-[12px] font-medium capitalize">${p.value}</span>`;
        },
      },
      {
        field: "reviewStatus",
        headerName: "Review",
        width: 100,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            current: "text-[#16a34a]",
            pending: "text-[#d97706]",
            overdue: "text-[#dc2626]",
          };
          return `<span class="${colors[p.value] || ""} text-[12px] font-medium capitalize">${p.value}</span>`;
        },
      },
    ];
  }, [isMobile]);

  const onRowClicked = useCallback((event: any) => {
    setSelected(event.data);
  }, []);

  return (
    <>
      <PageHeader
        title="Portfolio"
        subtitle={`${properties.length} properties across all roles`}
      />

      {selected && (
        <DetailPanel property={selected} onClose={() => setSelected(null)} />
      )}

      <div className="bg-white border border-[#d4dede] rounded p-4">
        <div
          className="ag-theme-alpine"
          style={{ height: 520, width: "100%" }}
        >
          <AgGridReact
            rowData={properties}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true,
            }}
            animateRows
            suppressCellFocus
            onRowClicked={onRowClicked}
          />
        </div>
      </div>
    </>
  );
}
