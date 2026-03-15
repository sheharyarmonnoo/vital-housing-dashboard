"use client";

import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef, GridReadyEvent } from "ag-grid-community";
import { properties, formatCurrency, Property } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";

ModuleRegistry.registerModules([AllCommunityModule]);

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => { const c = () => setM(window.innerWidth < 768); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  return m;
}

type PipelineStage = "Sourcing" | "Prescreen" | "Underwriting" | "LOI" | "Due Diligence" | "Closing";

interface PipelineDeal {
  id: string;
  name: string;
  location: string;
  units: number;
  askingPrice: string;
  capRate: string;
  noi: number;
  stage: PipelineStage;
  daysInStage: number;
  assignee: string;
  lastActivity: string;
  notes: string;
}

const stageOrder: PipelineStage[] = ["Sourcing", "Prescreen", "Underwriting", "LOI", "Due Diligence", "Closing"];

const pipelineDeals: PipelineDeal[] = [
  { id: "d1", name: "Alderwood Park", location: "Lynnwood, WA", units: 188, askingPrice: "TBD", capRate: "~5.2%", noi: 2640000, stage: "Due Diligence", daysInStage: 18, assignee: "Cesca", lastActivity: "2026-03-12", notes: "Site visit completed 02/26. Tax exemption analysis in progress." },
  { id: "d2", name: "Tualatin Meadows", location: "Tualatin, OR", units: 96, askingPrice: "$18.5M", capRate: "5.0%", noi: 925000, stage: "Underwriting", daysInStage: 8, assignee: "Rob", lastActivity: "2026-03-10", notes: "Rent comp analysis complete. Waiting on T12 from broker." },
  { id: "d3", name: "Forest Creek", location: "Lake Oswego, OR", units: 44, askingPrice: "$9.2M", capRate: "5.4%", noi: 497000, stage: "LOI", daysInStage: 3, assignee: "Rob", lastActivity: "2026-03-13", notes: "LOI submitted 03/13. Broker expects response by 03/18." },
  { id: "d4", name: "Cascade Pointe", location: "Renton, WA", units: 120, askingPrice: "$24M", capRate: "4.8%", noi: 1152000, stage: "Prescreen", daysInStage: 5, assignee: "Cesca", lastActivity: "2026-03-11", notes: "OM received. Running prescreen prompts." },
  { id: "d5", name: "Riverview Gardens", location: "Vancouver, WA", units: 72, askingPrice: "$13.8M", capRate: "5.1%", noi: 704000, stage: "Sourcing", daysInStage: 2, assignee: "Rob", lastActivity: "2026-03-14", notes: "Broker intro via CBRE. Requesting OM." },
  { id: "d6", name: "Canterbury Square", location: "Beaverton, OR", units: 56, askingPrice: "$11M", capRate: "5.3%", noi: 583000, stage: "Sourcing", daysInStage: 12, assignee: "Cesca", lastActivity: "2026-03-04", notes: "Off-market lead from Enterprise. Initial call scheduled." },
];

function StageBadge(props: { value: string }) {
  const colors: Record<string, string> = {
    Sourcing: "text-[#71717a]",
    Prescreen: "text-[#2563eb]",
    Underwriting: "text-[#d97706]",
    LOI: "text-[#7c3aed]",
    "Due Diligence": "text-[#16a34a]",
    Closing: "text-[#dc2626]",
  };
  const dots: Record<string, string> = {
    Sourcing: "bg-[#a1a1aa]",
    Prescreen: "bg-[#2563eb]",
    Underwriting: "bg-[#d97706]",
    LOI: "bg-[#7c3aed]",
    "Due Diligence": "bg-[#16a34a]",
    Closing: "bg-[#dc2626]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${colors[props.value] || ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[props.value] || "bg-[#a1a1aa]"}`} />
      {props.value}
    </span>
  );
}

export default function PipelinePage() {
  const gridRef = useRef<AgGridReact>(null);
  const isMobile = useIsMobile();
  const [activeStage, setActiveStage] = useState<PipelineStage | "all">("all");

  const filteredDeals = useMemo(() => {
    if (activeStage === "all") return pipelineDeals;
    return pipelineDeals.filter(d => d.stage === activeStage);
  }, [activeStage]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    stageOrder.forEach(s => { counts[s] = pipelineDeals.filter(d => d.stage === s).length; });
    return counts;
  }, []);

  const columnDefs = useMemo<ColDef[]>(() => {
    if (isMobile) {
      return [
        { field: "name", headerName: "Deal", minWidth: 140, flex: 1 },
        { field: "units", headerName: "Units", width: 70, type: "numericColumn" },
        { field: "stage", headerName: "Stage", width: 130, cellRenderer: StageBadge },
      ];
    }
    return [
      { field: "name", headerName: "Deal", minWidth: 180, flex: 1 },
      { field: "location", headerName: "Location", width: 140 },
      { field: "units", headerName: "Units", width: 80, type: "numericColumn" },
      { field: "askingPrice", headerName: "Ask", width: 100 },
      { field: "capRate", headerName: "Cap Rate", width: 90 },
      { field: "noi", headerName: "Trailing NOI", width: 120, type: "numericColumn",
        valueFormatter: (p: { value: number }) => formatCurrency(p.value) },
      { field: "stage", headerName: "Stage", width: 140, cellRenderer: StageBadge, filter: true },
      { field: "daysInStage", headerName: "Days", width: 70, type: "numericColumn" },
      { field: "assignee", headerName: "Owner", width: 90 },
      { field: "lastActivity", headerName: "Last Activity", width: 120 },
      { field: "notes", headerName: "Notes", minWidth: 200, flex: 1 },
    ];
  }, [isMobile]);

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true, filter: true }), []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    if (window.innerWidth >= 768) params.api.sizeColumnsToFit();
  }, []);

  const totalUnits = pipelineDeals.reduce((s, d) => s + d.units, 0);

  return (
    <div>
      <PageHeader title="Acquisition Pipeline" subtitle={`${pipelineDeals.length} active deals · ${totalUnits} units`} />

      {/* Stage filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => setActiveStage("all")}
          className={`text-[11px] font-medium px-2.5 py-1.5 rounded border cursor-pointer transition-colors ${
            activeStage === "all" ? "bg-[#18181b] text-white border-[#18181b]" : "bg-white text-[#71717a] border-[#e4e4e7] hover:text-[#18181b]"
          }`}>
          All ({pipelineDeals.length})
        </button>
        {stageOrder.map(stage => (
          <button key={stage} onClick={() => setActiveStage(stage)}
            className={`text-[11px] font-medium px-2.5 py-1.5 rounded border cursor-pointer transition-colors ${
              activeStage === stage ? "bg-[#18181b] text-white border-[#18181b]" : "bg-white text-[#71717a] border-[#e4e4e7] hover:text-[#18181b]"
            }`}>
            {stage} ({stageCounts[stage] || 0})
          </button>
        ))}
      </div>

      {/* Kanban-style stage summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {stageOrder.map(stage => (
          <div key={stage} className="bg-white border border-[#e4e4e7] rounded p-2 text-center cursor-pointer hover:bg-[#fafafa] transition-colors"
            onClick={() => setActiveStage(stage)}>
            <p className="text-[16px] font-semibold text-[#18181b]">{stageCounts[stage] || 0}</p>
            <p className="text-[9px] text-[#a1a1aa] uppercase tracking-wide">{stage}</p>
          </div>
        ))}
      </div>

      {/* AG Grid */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] text-[#71717a]">{filteredDeals.length} deals</p>
        <input type="text" placeholder="Search deals..."
          className="px-3 py-1.5 bg-white border border-[#e4e4e7] rounded text-[12px] text-[#18181b] placeholder-[#a1a1aa] focus:outline-none focus:border-[#71717a] w-full sm:w-48"
          onChange={(e) => gridRef.current?.api?.setGridOption("quickFilterText", e.target.value)} />
      </div>

      <div className="ag-theme-alpine w-full rounded overflow-auto border border-[#e4e4e7]" style={{ height: "min(calc(100vh - 380px), 400px)", minHeight: 250 }}>
        <AgGridReact
          ref={gridRef}
          rowData={filteredDeals}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          animateRows={true}
          pagination={true}
          paginationPageSize={500}
          getRowId={(params) => params.data.id}
        />
      </div>
    </div>
  );
}
