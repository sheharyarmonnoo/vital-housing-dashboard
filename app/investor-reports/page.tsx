"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef, RowClickedEvent } from "ag-grid-community";
import { properties, investorReports, formatCurrency } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import { FileText, X } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => { const c = () => setM(window.innerWidth < 768); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  return m;
}

const sampleReports: Record<string, {
  property: string; quarter: string; investor: string;
  occupancy: number; noi: number; collections: number; dscr: number;
  revenue: { category: string; actual: number; budget: number }[];
  expenses: { category: string; actual: number; budget: number }[];
  highlights: string[];
  capitalProjects: string[];
  distribution: number;
}> = {
  "courtside-Q4 2025": {
    property: "Courtside Apartments", quarter: "Q4 2025", investor: "Enterprise Community Partners, Vital 12",
    occupancy: 96.7, noi: 195000, collections: 98.0, dscr: 1.36,
    revenue: [
      { category: "Gross Potential Rent", actual: 648000, budget: 640000 },
      { category: "Vacancy Loss", actual: -21384, budget: -25600 },
      { category: "Concessions", actual: -3200, budget: -5000 },
      { category: "Other Income", actual: 18500, budget: 16000 },
    ],
    expenses: [
      { category: "Payroll", actual: 98000, budget: 102000 },
      { category: "Repairs & Maintenance", actual: 45000, budget: 42000 },
      { category: "Utilities", actual: 38000, budget: 36000 },
      { category: "Insurance", actual: 28000, budget: 28000 },
      { category: "Property Tax", actual: 52000, budget: 52000 },
      { category: "Management Fee", actual: 32000, budget: 31000 },
      { category: "Administrative", actual: 14000, budget: 15000 },
    ],
    highlights: [
      "Occupancy stabilized at 96.7%, above submarket average of 94.2%",
      "Collections improved to 98.0% from 96.8% in Q3",
      "Two units completed renovation; $150 avg premium vs unrenovated",
      "Water/sewer renegotiation saved $1,200/month effective November",
    ],
    capitalProjects: [
      "Unit renovation: 8 of 24 planned units completed ($12,500 avg)",
      "Parking lot reseal — $18,400",
      "HVAC replacement Building C — 4 units, $22,000",
      "Landscape refresh and signage — $8,500",
    ],
    distribution: 52000,
  },
  "courtside-Q3 2025": {
    property: "Courtside Apartments", quarter: "Q3 2025", investor: "Enterprise Community Partners, Vital 12",
    occupancy: 95.8, noi: 186000, collections: 97.2, dscr: 1.35,
    revenue: [
      { category: "Gross Potential Rent", actual: 636000, budget: 634000 },
      { category: "Vacancy Loss", actual: -26712, budget: -25360 },
      { category: "Other Income", actual: 17200, budget: 16000 },
    ],
    expenses: [
      { category: "Payroll", actual: 96000, budget: 100000 },
      { category: "Repairs & Maintenance", actual: 52000, budget: 42000 },
      { category: "Utilities", actual: 41000, budget: 38000 },
      { category: "Insurance", actual: 28000, budget: 28000 },
      { category: "Property Tax", actual: 52000, budget: 52000 },
      { category: "Management Fee", actual: 31200, budget: 31000 },
    ],
    highlights: [
      "Summer occupancy dip recovered by end of September",
      "R&M over budget due to emergency plumbing ($8,200)",
    ],
    capitalProjects: [
      "Unit renovation: 4 units completed in Q3",
      "Emergency plumbing — Building A ($8,200)",
      "LED lighting upgrade — $4,200",
    ],
    distribution: 45000,
  },
  "belmont-Q3 2025": {
    property: "Belmont Dairy", quarter: "Q3 2025", investor: "Freestone Capital",
    occupancy: 93.0, noi: 132000, collections: 95.8, dscr: 1.22,
    revenue: [
      { category: "Gross Potential Rent", actual: 486000, budget: 492000 },
      { category: "Vacancy Loss", actual: -34020, budget: -24600 },
      { category: "Other Income", actual: 12000, budget: 11000 },
    ],
    expenses: [
      { category: "Payroll", actual: 72000, budget: 70000 },
      { category: "Repairs & Maintenance", actual: 38000, budget: 35000 },
      { category: "Utilities", actual: 32000, budget: 30000 },
      { category: "Insurance", actual: 22000, budget: 22000 },
      { category: "Property Tax", actual: 42000, budget: 42000 },
      { category: "Management Fee", actual: 24000, budget: 24000 },
    ],
    highlights: [
      "Occupancy below target — 3 units turned over, 2 still vacant",
      "DSCR at 1.22 — above 1.15 covenant threshold",
    ],
    capitalProjects: [
      "Elevator modernization Phase 1 — $45,000",
      "Unit turnover: 3 units at $6,800 avg",
    ],
    distribution: 28000,
  },
};

function ReportPreview({ reportKey, onClose }: { reportKey: string; onClose: () => void }) {
  const report = sampleReports[reportKey];
  if (!report) return null;
  const totalRev = report.revenue.reduce((s, r) => s + r.actual, 0);
  const totalExp = report.expenses.reduce((s, r) => s + r.actual, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full sm:w-[560px] bg-white h-full overflow-y-auto border-l border-[#e4e4e7]">
        <div className="sticky top-0 bg-white border-b border-[#e4e4e7] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[16px] font-semibold text-[#18181b]">{report.property}</p>
            <p className="text-[11px] text-[#a1a1aa]">{report.quarter} · {report.investor}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#f4f4f5] rounded cursor-pointer"><X size={16} className="text-[#a1a1aa]" /></button>
        </div>
        <div className="px-5 py-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { l: "Occupancy", v: report.occupancy + "%" },
              { l: "NOI", v: formatCurrency(report.noi) },
              { l: "Collections", v: report.collections + "%" },
              { l: "DSCR", v: report.dscr.toFixed(2) },
            ].map(k => (
              <div key={k.l} className="bg-[#fafafa] border border-[#e4e4e7] rounded p-2">
                <p className="text-[9px] text-[#a1a1aa] uppercase tracking-wide">{k.l}</p>
                <p className="text-[15px] font-semibold text-[#18181b] mt-0.5">{k.v}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] text-[#a1a1aa] uppercase tracking-wide font-medium mb-1.5">Revenue</p>
            <div className="border border-[#e4e4e7] rounded overflow-hidden">
              <div className="flex px-3 py-1.5 bg-[#fafafa] text-[9px] text-[#a1a1aa] uppercase tracking-wide font-medium"><span className="flex-1">Category</span><span className="w-20 text-right">Actual</span><span className="w-20 text-right">Budget</span></div>
              {report.revenue.map((r, i) => (
                <div key={i} className="flex px-3 py-1.5 border-t border-[#f4f4f5] text-[12px]">
                  <span className="flex-1 text-[#18181b]">{r.category}</span>
                  <span className="w-20 text-right font-medium text-[#18181b]">{formatCurrency(r.actual)}</span>
                  <span className="w-20 text-right text-[#a1a1aa]">{formatCurrency(r.budget)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[#a1a1aa] uppercase tracking-wide font-medium mb-1.5">Expenses</p>
            <div className="border border-[#e4e4e7] rounded overflow-hidden">
              <div className="flex px-3 py-1.5 bg-[#fafafa] text-[9px] text-[#a1a1aa] uppercase tracking-wide font-medium"><span className="flex-1">Category</span><span className="w-20 text-right">Actual</span><span className="w-20 text-right">Budget</span></div>
              {report.expenses.map((r, i) => (
                <div key={i} className="flex px-3 py-1.5 border-t border-[#f4f4f5] text-[12px]">
                  <span className="flex-1 text-[#18181b]">{r.category}</span>
                  <span className="w-20 text-right font-medium text-[#18181b]">{formatCurrency(r.actual)}</span>
                  <span className="w-20 text-right text-[#a1a1aa]">{formatCurrency(r.budget)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#18181b] text-white rounded p-3 flex justify-between"><span className="font-semibold">NOI</span><span className="text-[16px] font-semibold">{formatCurrency(totalRev - totalExp)}</span></div>
          <div>
            <p className="text-[10px] text-[#a1a1aa] uppercase tracking-wide font-medium mb-1.5">Highlights</p>
            {report.highlights.map((h, i) => <p key={i} className="text-[12px] text-[#71717a] leading-relaxed">• {h}</p>)}
          </div>
          <div>
            <p className="text-[10px] text-[#a1a1aa] uppercase tracking-wide font-medium mb-1.5">Capital Projects</p>
            {report.capitalProjects.map((c, i) => <p key={i} className="text-[12px] text-[#71717a] leading-relaxed">• {c}</p>)}
          </div>
          <div className="border border-[#16a34a]/20 bg-[#f0fdf4] rounded p-3">
            <p className="text-[9px] text-[#16a34a] uppercase tracking-wide font-medium">Distribution</p>
            <p className="text-[18px] font-semibold text-[#16a34a] mt-0.5">{formatCurrency(report.distribution)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestorReportsPage() {
  const isMobile = useIsMobile();
  const gridRef = useRef<AgGridReact>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const propertyMap = useMemo(() => { const m: Record<string, string> = {}; properties.forEach(p => m[p.id] = p.name); return m; }, []);

  const rowData = useMemo(() => investorReports.map(r => ({
    ...r, propertyName: propertyMap[r.propertyId] || r.propertyId,
    reportKey: r.propertyId + "-" + r.quarter,
    hasPreview: !!(sampleReports[r.propertyId + "-" + r.quarter]),
  })), [propertyMap]);

  function StatusRenderer(p: { value: string }) {
    const c: Record<string, string> = { published: "text-[#16a34a]", draft: "text-[#d97706]", pending: "text-[#a1a1aa]" };
    return <span className={`text-[11px] font-medium capitalize ${c[p.value] || ""}`}>{p.value}</span>;
  }

  function ViewRenderer(p: { data: any }) {
    if (!p.data.hasPreview) return <span className="text-[10px] text-[#d4d4d8]">—</span>;
    return <button onClick={(e) => { e.stopPropagation(); setSelectedReport(p.data.reportKey); }} className="text-[10px] font-medium text-[#71717a] hover:text-[#18181b] underline cursor-pointer">View</button>;
  }

  const columnDefs: ColDef[] = useMemo(() => {
    if (isMobile) return [
      { field: "propertyName", headerName: "Property", flex: 1, minWidth: 120 },
      { field: "quarter", headerName: "Qtr", width: 80 },
      { field: "status", headerName: "Status", width: 80, cellRenderer: StatusRenderer },
      { headerName: "", width: 50, cellRenderer: ViewRenderer, sortable: false, filter: false },
    ];
    return [
      { field: "propertyName", headerName: "Property", flex: 1, minWidth: 180 },
      { field: "quarter", headerName: "Quarter", width: 110 },
      { field: "status", headerName: "Status", width: 110, cellRenderer: StatusRenderer },
      { field: "distributionAmount", headerName: "Distribution", width: 130, type: "numericColumn", valueFormatter: (p: any) => p.value > 0 ? formatCurrency(p.value) : "—" },
      { field: "publishedDate", headerName: "Published", width: 120, valueFormatter: (p: any) => p.value || "—" },
      { headerName: "", width: 70, cellRenderer: ViewRenderer, sortable: false, filter: false },
    ];
  }, [isMobile]);

  const published = investorReports.filter(r => r.status === "published");

  return (
    <>
      <PageHeader title="Investor Reports" subtitle={`${published.length} published · ${formatCurrency(published.reduce((s, r) => s + r.distributionAmount, 0))} distributed`}>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] text-white text-[12px] font-medium rounded hover:bg-[#27272a] cursor-pointer"><FileText size={13} /> Generate Report</button>
      </PageHeader>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { l: "Published", v: investorReports.filter(r => r.status === "published").length, c: "text-[#16a34a]" },
          { l: "Drafts", v: investorReports.filter(r => r.status === "draft").length, c: "text-[#d97706]" },
          { l: "Pending", v: investorReports.filter(r => r.status === "pending").length, c: "text-[#a1a1aa]" },
        ].map(s => (
          <div key={s.l} className="bg-white border border-[#e4e4e7] rounded px-3 py-2.5">
            <p className="text-[10px] text-[#a1a1aa] uppercase tracking-wide font-medium">{s.l}</p>
            <p className={`text-[20px] font-semibold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>
      <div className="ag-theme-alpine w-full rounded overflow-hidden border border-[#e4e4e7]" style={{ height: 320 }}>
        <AgGridReact ref={gridRef} rowData={rowData} columnDefs={columnDefs} defaultColDef={{ sortable: true, resizable: true }}
          onRowClicked={(e: RowClickedEvent) => { if (e.data.hasPreview) setSelectedReport(e.data.reportKey); }}
          animateRows getRowId={p => p.data.reportKey} />
      </div>
      <p className="text-[10px] text-[#a1a1aa] mt-2">Click any published report to view full details.</p>
      {selectedReport && <ReportPreview reportKey={selectedReport} onClose={() => setSelectedReport(null)} />}
    </>
  );
}
