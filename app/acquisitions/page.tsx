"use client";

import { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { alderwoodDeal, alderwoodRentComps, formatCurrency } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";

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

const pipelineStages = [
  { stage: "Prescreen", status: "complete" as const },
  { stage: "Model", status: "complete" as const },
  { stage: "IC Review", status: "complete" as const },
  { stage: "LOI", status: "complete" as const },
  { stage: "Due Diligence", status: "active" as const },
  { stage: "Close", status: "upcoming" as const },
];

export default function AcquisitionsPage() {
  const isMobile = useIsMobile();
  const deal = alderwoodDeal;

  // Unit Mix AG Grid
  const unitMixColDefs: ColDef[] = useMemo(() => [
    { field: "type", headerName: "Unit Type", flex: 1, minWidth: 120 },
    { field: "count", headerName: "Count", width: 80, type: "numericColumn" },
    { field: "avgSF", headerName: "Avg SF", width: 80, type: "numericColumn" },
    { field: "avgRent", headerName: "Avg Rent", width: 100, type: "numericColumn", valueFormatter: (p: any) => formatCurrency(p.value) },
  ], []);

  // Rent Comps AG Grid
  const compColDefs: ColDef[] = useMemo(() => {
    if (isMobile) {
      return [
        { field: "name", headerName: "Property", flex: 1, minWidth: 120 },
        { field: "avgRent", headerName: "Avg Rent", width: 90, valueFormatter: (p: any) => formatCurrency(p.value) },
        { field: "occupancy", headerName: "Occ %", width: 75, valueFormatter: (p: any) => `${p.value}%` },
      ];
    }
    return [
      { field: "name", headerName: "Property", flex: 1, minWidth: 160 },
      { field: "location", headerName: "Location", width: 120 },
      { field: "units", headerName: "Units", width: 70, type: "numericColumn" },
      { field: "yearBuilt", headerName: "Year", width: 70, type: "numericColumn" },
      { field: "avgRent", headerName: "Avg Rent", width: 100, type: "numericColumn", valueFormatter: (p: any) => formatCurrency(p.value) },
      { field: "rentPerSF", headerName: "$/SF", width: 70, type: "numericColumn", valueFormatter: (p: any) => `$${p.value.toFixed(2)}` },
      { field: "occupancy", headerName: "Occupancy", width: 95, valueFormatter: (p: any) => `${p.value}%` },
      { field: "distance", headerName: "Distance", width: 80 },
    ];
  }, [isMobile]);

  return (
    <>
      <PageHeader
        title="Acquisitions"
        subtitle="Active deal pipeline and underwriting — Robert Sheppard"
      />

      {/* Pipeline Stepper */}
      <div className="bg-white border border-[#d4dede] rounded p-5 mb-6">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-4">Pipeline Status — Alderwood Park</h2>
        <div className="flex items-center gap-0">
          {pipelineStages.map((s, i) => (
            <div key={s.stage} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${
                    s.status === "complete"
                      ? "bg-[#1a2e2e] text-white"
                      : s.status === "active"
                      ? "bg-[#f5f8f8] border-2 border-[#4a6b6b] text-[#1a2e2e]"
                      : "bg-[#eaf0f0] text-[#8aabab] border border-[#d4dede]"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-[10px] mt-1.5 text-center max-w-[70px] leading-tight ${
                    s.status === "active" ? "font-medium text-[#1a2e2e]" : "text-[#8aabab]"
                  }`}
                >
                  {s.stage}
                </span>
              </div>
              {i < pipelineStages.length - 1 && (
                <div
                  className={`h-px w-8 lg:w-14 mt-[-16px] ${
                    s.status === "complete" ? "bg-[#1a2e2e]" : "bg-[#d4dede]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deal Summary */}
      <div className="bg-white border border-[#d4dede] rounded p-5 mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a2e2e] mb-4">
          Alderwood Park — Deal Summary
        </h2>

        {/* Key metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { l: "Units", v: "188" },
            { l: "Location", v: "Lynnwood, WA" },
            { l: "Occupancy", v: `${deal.occupancy}%` },
            { l: "Trailing NOI", v: formatCurrency(deal.trailingNOI) },
          ].map((k) => (
            <div key={k.l} className="bg-[#f5f8f8] rounded px-3.5 py-3">
              <span className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">{k.l}</span>
              <p className="text-[18px] font-semibold text-[#1a2e2e]">{k.v}</p>
            </div>
          ))}
        </div>

        {/* Property details */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-[13px] mb-5">
          <div><span className="text-[#8aabab]">Vintage:</span> <span className="font-medium">{deal.vintage}</span></div>
          <div><span className="text-[#8aabab]">Acreage:</span> <span className="font-medium">{deal.acreage} acres</span></div>
          <div><span className="text-[#8aabab]">Buildings:</span> <span className="font-medium">{deal.buildings}</span></div>
          <div><span className="text-[#8aabab]">Total SF:</span> <span className="font-medium">{deal.totalSF.toLocaleString()}</span></div>
          <div><span className="text-[#8aabab]">Avg Rent/Unit:</span> <span className="font-medium">${deal.avgRentPerUnit.toLocaleString()}/mo</span></div>
          <div><span className="text-[#8aabab]">Avg Rent/SF:</span> <span className="font-medium">${deal.avgRentPerSF}/SF</span></div>
          <div><span className="text-[#8aabab]">Asking Price:</span> <span className="font-medium text-[#dc2626]">Undisclosed</span></div>
          <div><span className="text-[#8aabab]">Bad Debt (T12):</span> <span className="font-medium text-[#d97706]">{formatCurrency(deal.badDebt)}</span></div>
        </div>

        {/* Renovation status */}
        <div className="mb-5">
          <p className="text-[11px] font-medium text-[#4a6b6b] uppercase tracking-wide mb-2">Renovation Status</p>
          <div className="flex gap-4">
            <div className="bg-[#f5f8f8] rounded px-3 py-2 flex-1">
              <p className="text-[20px] font-semibold text-[#1a2e2e]">{deal.renovationStatus.classic}</p>
              <p className="text-[11px] text-[#5a7272]">Classic (unrenovated)</p>
            </div>
            <div className="bg-[#f5f8f8] rounded px-3 py-2 flex-1">
              <p className="text-[20px] font-semibold text-[#16a34a]">{deal.renovationStatus.renovated}</p>
              <p className="text-[11px] text-[#5a7272]">Renovated</p>
            </div>
          </div>
        </div>

        {/* Unit Mix AG Grid */}
        <div className="mb-5">
          <p className="text-[11px] font-medium text-[#4a6b6b] uppercase tracking-wide mb-2">Unit Mix</p>
          <div className="ag-theme-alpine" style={{ height: 170, width: "100%" }}>
            <AgGridReact
              rowData={deal.unitMix}
              columnDefs={unitMixColDefs}
              defaultColDef={{ sortable: true, resizable: true }}
              animateRows
              suppressCellFocus
            />
          </div>
        </div>
      </div>

      {/* Risks & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-[#d4dede] rounded p-4">
          <p className="text-[11px] font-medium text-[#dc2626] uppercase tracking-wide mb-3">Key Risks</p>
          <div className="space-y-2">
            {deal.risks.map((risk, i) => (
              <p key={i} className="text-[12px] text-[#1a2e2e] leading-relaxed pl-3 border-l-2 border-[#dc2626]/30">{risk}</p>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#d4dede] rounded p-4">
          <p className="text-[11px] font-medium text-[#16a34a] uppercase tracking-wide mb-3">Opportunities</p>
          <div className="space-y-2">
            {deal.opportunities.map((opp, i) => (
              <p key={i} className="text-[12px] text-[#1a2e2e] leading-relaxed pl-3 border-l-2 border-[#16a34a]/30">{opp}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Rent Comps AG Grid */}
      <div className="bg-white border border-[#d4dede] rounded p-4">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">
          Rent Comparables — Lynnwood Submarket
        </h2>
        <div className="ag-theme-alpine" style={{ height: 320, width: "100%" }}>
          <AgGridReact
            rowData={alderwoodRentComps}
            columnDefs={compColDefs}
            defaultColDef={{ sortable: true, resizable: true }}
            animateRows
            suppressCellFocus
          />
        </div>
        <p className="text-[10px] text-[#8aabab] mt-2">Subject property (Alderwood Park) shown as first row for comparison.</p>
      </div>
    </>
  );
}
