"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties, formatCurrency, Property } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";
import PropertyDetail from "@/components/PropertyDetail";

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
  const sections = [
    {
      title: "Property Information",
      rows: [
        ["Name", property.name],
        ["Address", property.address || property.location],
        ["Location", property.location],
        ["Units", String(property.units)],
        ["Year Built", property.yearBuilt ? String(property.yearBuilt) : "N/A"],
        ["Role", property.role === "co-gp" ? "Co-GP" : property.role === "third-party" ? "3rd Party AM" : property.role.charAt(0).toUpperCase() + property.role.slice(1)],
        ["Status", property.status],
      ],
    },
    {
      title: "Loan Details",
      rows: property.loan
        ? [
            ["Loan Amount", formatCurrency(property.loan.amount)],
            ["Interest Rate", `${property.loan.rate}%`],
            ["Maturity", property.loan.maturity],
            ["Lender", property.loan.lender],
          ]
        : [["Loan", "N/A — no loan data on file"]],
    },
    {
      title: "Investor Information",
      rows: [
        ["Investor Group", property.investorGroup],
        ["Acquisition Date", property.acquisitionDate || "N/A"],
        ["Acquisition Price", property.acquisitionPrice ? formatCurrency(property.acquisitionPrice) : "N/A"],
      ],
    },
    {
      title: "Key Metrics",
      rows: [
        ["Occupancy", `${property.occupancy}%`],
        ["Annual NOI", formatCurrency(property.noi)],
        ["Monthly Revenue", formatCurrency(property.monthlyRevenue)],
        ["Last Review", property.lastReviewDate || "N/A"],
        ["Review Status", property.reviewStatus],
      ],
    },
    {
      title: "Property Management",
      rows: [
        ["PM Company", property.pmCompany || "N/A"],
        ["PM System", property.pmSystem],
      ],
    },
  ];

  return (
    <div className="bg-white border border-[#d4dede] rounded p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[#1a2e2e]">
          {property.name}
        </h3>
        <button
          onClick={onClose}
          className="text-[#8aabab] hover:text-[#1a2e2e] cursor-pointer"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-[11px] font-medium text-[#4a6b6b] uppercase tracking-wide mb-2 border-b border-[#eaf0f0] pb-1">
              {section.title}
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
              {section.rows.map(([label, value]) => (
                <div key={label} className="py-1">
                  <span className="text-[11px] font-medium text-[#8aabab] uppercase tracking-wide block">
                    {label}
                  </span>
                  <span className="text-[13px] text-[#1a2e2e] capitalize">{value}</span>
                </div>
              ))}
            </div>
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
            acquisition: "Pipeline",
          };
          return <span className="capitalize text-[12px]">{labels[p.value] || p.value}</span>;
        },
      },
      { field: "pmSystem", headerName: "PM System", width: 100 },
      { field: "pmCompany", headerName: "PM Company", width: 150 },
      { field: "investorGroup", headerName: "Investor Group", width: 170 },
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
          return <span className={`${colors[p.value] || ""} text-[12px] font-medium capitalize`}>{p.value}</span>;
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
          return <span className={`${colors[p.value] || ""} text-[12px] font-medium capitalize`}>{p.value}</span>;
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
        subtitle={`${properties.length} properties across all roles — ${properties.reduce((s, p) => s + p.units, 0)} total units`}
      />

      <div className="bg-white border border-[#d4dede] rounded p-4">
        <div className="ag-theme-alpine" style={{ height: 520, width: "100%" }}>
          <AgGridReact
            rowData={properties}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, resizable: true, filter: true }}
            animateRows
            suppressCellFocus
            onRowClicked={onRowClicked}
          />
        </div>
        <p className="text-[10px] text-[#8aabab] mt-2">Click any row to view property details.</p>
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={selected ? `${selected.location} · ${selected.units} units` : ""}
      >
        {selected && <PropertyDetail property={selected} />}
      </Drawer>
    </>
  );
}
