"use client";

import { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties, formatCurrency } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import { Target, MapPin, Building2, TrendingUp, DollarSign } from "lucide-react";

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

const alderwood = properties.find((p) => p.id === "alderwood")!;

const rentComps = [
  { name: "Cedar Terrace", location: "Lynnwood, WA", units: 144, avgRent: 1420, occupancy: 94.8, distance: "0.8 mi" },
  { name: "Meadow Ridge", location: "Lynnwood, WA", units: 96, avgRent: 1380, occupancy: 96.1, distance: "1.2 mi" },
  { name: "Pacific Crest", location: "Lynnwood, WA", units: 210, avgRent: 1510, occupancy: 93.2, distance: "1.6 mi" },
  { name: "Alderwood Village", location: "Lynnwood, WA", units: 168, avgRent: 1350, occupancy: 95.5, distance: "2.1 mi" },
  { name: "Spruce Landing", location: "Edmonds, WA", units: 72, avgRent: 1480, occupancy: 97.0, distance: "3.0 mi" },
];

const pipelineStages = [
  { stage: "Sourcing", status: "complete" },
  { stage: "Preliminary Underwriting", status: "complete" },
  { stage: "LOI Submitted", status: "complete" },
  { stage: "Due Diligence", status: "active" },
  { stage: "Investor Committee", status: "upcoming" },
  { stage: "Closing", status: "upcoming" },
];

export default function AcquisitionsPage() {
  const isMobile = useIsMobile();

  const compColumnDefs: ColDef[] = useMemo(() => {
    if (isMobile) {
      return [
        { field: "name", headerName: "Property", flex: 1, minWidth: 120 },
        {
          field: "avgRent",
          headerName: "Avg Rent",
          width: 90,
          valueFormatter: (p: any) => formatCurrency(p.value),
        },
        {
          field: "occupancy",
          headerName: "Occ %",
          width: 75,
          valueFormatter: (p: any) => `${p.value}%`,
        },
      ];
    }
    return [
      { field: "name", headerName: "Property", flex: 1, minWidth: 140 },
      { field: "location", headerName: "Location", width: 130 },
      { field: "units", headerName: "Units", width: 80, type: "numericColumn" },
      {
        field: "avgRent",
        headerName: "Avg Rent",
        width: 100,
        valueFormatter: (p: any) => formatCurrency(p.value),
        type: "numericColumn",
      },
      {
        field: "occupancy",
        headerName: "Occupancy",
        width: 100,
        valueFormatter: (p: any) => `${p.value}%`,
      },
      { field: "distance", headerName: "Distance", width: 90 },
    ];
  }, [isMobile]);

  return (
    <>
      <PageHeader
        title="Acquisitions"
        subtitle="Active deal pipeline and underwriting"
      />

      {/* Alderwood Park Deal Summary */}
      <div className="bg-white border border-[#d4dede] rounded p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-[#1a2e2e]" />
          <h2 className="text-[15px] font-semibold text-[#1a2e2e]">
            Alderwood Park — Active Deal
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-[#f5f8f8] rounded px-3.5 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 size={13} className="text-[#8aabab]" />
              <span className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide">
                Units
              </span>
            </div>
            <p className="text-[20px] font-semibold text-[#1a2e2e]">
              {alderwood.units}
            </p>
          </div>
          <div className="bg-[#f5f8f8] rounded px-3.5 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={13} className="text-[#8aabab]" />
              <span className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide">
                Location
              </span>
            </div>
            <p className="text-[15px] font-semibold text-[#1a2e2e]">
              {alderwood.location}
            </p>
          </div>
          <div className="bg-[#f5f8f8] rounded px-3.5 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={13} className="text-[#8aabab]" />
              <span className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide">
                Occupancy
              </span>
            </div>
            <p className="text-[20px] font-semibold text-[#1a2e2e]">
              {alderwood.occupancy}%
            </p>
          </div>
          <div className="bg-[#f5f8f8] rounded px-3.5 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign size={13} className="text-[#8aabab]" />
              <span className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide">
                Trailing NOI
              </span>
            </div>
            <p className="text-[20px] font-semibold text-[#1a2e2e]">
              {formatCurrency(alderwood.noi)}
            </p>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-[13px]">
          <div>
            <span className="text-[#8aabab]">Monthly Revenue:</span>{" "}
            <span className="font-medium">{formatCurrency(alderwood.monthlyRevenue)}</span>
          </div>
          <div>
            <span className="text-[#8aabab]">Cap Rate (est.):</span>{" "}
            <span className="font-medium">5.8%</span>
          </div>
          <div>
            <span className="text-[#8aabab]">Year Built:</span>{" "}
            <span className="font-medium">1998</span>
          </div>
          <div>
            <span className="text-[#8aabab]">LIHTC Compliance:</span>{" "}
            <span className="font-medium">Year 15 exit</span>
          </div>
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="bg-white border border-[#d4dede] rounded p-5 mb-6">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-4">
          Pipeline Status
        </h2>
        <div className="flex items-center gap-0">
          {pipelineStages.map((s, i) => (
            <div key={s.stage} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${
                    s.status === "complete"
                      ? "bg-[#1a2e2e] text-white"
                      : s.status === "active"
                      ? "bg-[#f5f8f8] border-2 border-[#1a2e2e] text-[#1a2e2e]"
                      : "bg-[#eaf0f0] text-[#8aabab] border border-[#d4dede]"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-[10px] mt-1.5 text-center max-w-[70px] leading-tight ${
                    s.status === "active"
                      ? "font-medium text-[#1a2e2e]"
                      : "text-[#8aabab]"
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

      {/* Rent Comps */}
      <div className="bg-white border border-[#d4dede] rounded p-4">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">
          Rent Comparables
        </h2>
        <div
          className="ag-theme-alpine"
          style={{ height: 260, width: "100%" }}
        >
          <AgGridReact
            rowData={rentComps}
            columnDefs={compColumnDefs}
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
