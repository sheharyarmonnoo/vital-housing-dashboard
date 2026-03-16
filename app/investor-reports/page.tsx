"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef, RowClickedEvent } from "ag-grid-community";
import { properties, investorReports, formatCurrency } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";

ModuleRegistry.registerModules([AllCommunityModule]);

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < 768);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);
  return m;
}

// Full Courtside Q4 2025 investor report — REAL data from proposal
function CourtsideQ4Report({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full sm:w-[620px] bg-white h-full overflow-y-auto border-l border-[#d4dede]">
        {/* Header bar */}
        <div className="sticky top-0 bg-[#1a2e2e] text-white px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] text-[#6b9b9b] uppercase tracking-[0.15em] font-medium">Vital Housing Group</p>
            <p className="text-[16px] font-semibold mt-0.5">Quarterly Investor Report</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#4a6b6b] rounded cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* PAGE 1 */}
        <div className="px-5 py-5 space-y-5">
          <div className="border-b border-[#d4dede] pb-3">
            <p className="text-[18px] font-semibold text-[#1a2e2e]">Courtside Apartments</p>
            <p className="text-[12px] text-[#5a7272]">Q4 2025 (October - December) | Published January 18, 2026</p>
            <p className="text-[12px] text-[#5a7272]">Investor: Enterprise Community Partners</p>
          </div>

          {/* Dashboard Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { l: "Occupancy", v: "96.7%" },
              { l: "Quarterly NOI", v: "$195,000" },
              { l: "Net Cash Flow", v: "$52,000" },
              { l: "DSCR", v: "1.38x" },
            ].map((k) => (
              <div key={k.l} className="bg-[#f5f8f8] border border-[#d4dede] rounded p-2.5">
                <p className="text-[9px] text-[#5a7272] uppercase tracking-wide">{k.l}</p>
                <p className="text-[16px] font-semibold text-[#1a2e2e] mt-0.5">{k.v}</p>
              </div>
            ))}
          </div>

          {/* Property Overview */}
          <div>
            <p className="text-[11px] text-[#4a6b6b] uppercase tracking-wide font-medium mb-2">Property Overview</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
              {[
                ["Location", "Olympia, WA"],
                ["Units", "211"],
                ["Acquired", "January 2025"],
                ["Purchase Price", "$31,750,000"],
                ["Loan Amount", "$22,500,000"],
                ["Interest Rate", "7.02%"],
                ["Lender", "Freddie Mac"],
                ["PM System", "Yardi"],
              ].map(([label, val]) => (
                <div key={label}><span className="text-[#8aabab]">{label}:</span> <span className="text-[#1a2e2e]">{val}</span></div>
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <p className="text-[11px] text-[#4a6b6b] uppercase tracking-wide font-medium mb-2">Executive Summary</p>
            <p className="text-[12px] text-[#1a2e2e] leading-relaxed">
              Courtside Apartments closed 2025 on a strong note with occupancy reaching 96.7%, the highest level since acquisition in January 2025. Q4 performance benefited from seasonal reduction in turnover and completion of the common area lighting upgrade, which received positive feedback from residents. Total annual NOI came in at $768,000, exceeding the original underwritten projection by 3.1%. The property manager implemented a new online maintenance request portal in November, reducing average work order completion time from 3.2 days to 1.8 days. We are recommending a modest rent adjustment of 3.0% for leases renewing in Q1 2026, consistent with the Olympia metro CPI and affordable housing guideline thresholds.
            </p>
          </div>

          {/* Financial Performance Table */}
          <div>
            <p className="text-[11px] text-[#4a6b6b] uppercase tracking-wide font-medium mb-2">Financial Performance — Q4 2025</p>
            <div className="border border-[#d4dede] rounded overflow-hidden">
              <div className="flex px-3 py-1.5 bg-[#f0f4f4] text-[9px] text-[#5a7272] uppercase tracking-wide font-medium">
                <span className="flex-1">Category</span>
                <span className="w-20 text-right">Actual</span>
                <span className="w-20 text-right">Budget</span>
                <span className="w-16 text-right">Var %</span>
              </div>

              <div className="px-3 py-1 bg-[#f5f8f8] text-[10px] font-medium text-[#4a6b6b] uppercase tracking-wide">Revenue</div>
              {[
                { cat: "Gross Potential Rent", actual: 648000, budget: 640000 },
                { cat: "Vacancy Loss", actual: -21384, budget: -25600 },
                { cat: "Concessions", actual: -3200, budget: -5000 },
                { cat: "Other Income", actual: 18500, budget: 16000 },
              ].map((r) => {
                const varPct = ((r.actual - r.budget) / Math.abs(r.budget) * 100).toFixed(1);
                return (
                  <div key={r.cat} className="flex px-3 py-1.5 border-t border-[#eaf0f0] text-[12px]">
                    <span className="flex-1 text-[#1a2e2e]">{r.cat}</span>
                    <span className="w-20 text-right font-medium text-[#1a2e2e]">{formatCurrency(r.actual)}</span>
                    <span className="w-20 text-right text-[#8aabab]">{formatCurrency(r.budget)}</span>
                    <span className={`w-16 text-right font-medium ${parseFloat(varPct) >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{parseFloat(varPct) > 0 ? "+" : ""}{varPct}%</span>
                  </div>
                );
              })}
              <div className="flex px-3 py-1.5 border-t border-[#d4dede] text-[12px] font-semibold bg-[#f5f8f8]">
                <span className="flex-1 text-[#1a2e2e]">Effective Gross Income</span>
                <span className="w-20 text-right text-[#1a2e2e]">$641,916</span>
                <span className="w-20 text-right text-[#8aabab]">$625,400</span>
                <span className="w-16 text-right text-[#16a34a]">+2.6%</span>
              </div>

              <div className="px-3 py-1 bg-[#f5f8f8] text-[10px] font-medium text-[#4a6b6b] uppercase tracking-wide border-t border-[#d4dede]">Operating Expenses</div>
              {[
                { cat: "Payroll", actual: 98000, budget: 102000 },
                { cat: "Repairs & Maintenance", actual: 45000, budget: 42000 },
                { cat: "Utilities", actual: 38000, budget: 36000 },
                { cat: "Insurance", actual: 28000, budget: 28000 },
                { cat: "Property Tax", actual: 52000, budget: 52000 },
                { cat: "Management Fee", actual: 32000, budget: 31000 },
                { cat: "Administrative", actual: 14000, budget: 15000 },
              ].map((r) => {
                const varPct = ((r.actual - r.budget) / Math.abs(r.budget) * 100).toFixed(1);
                return (
                  <div key={r.cat} className="flex px-3 py-1.5 border-t border-[#eaf0f0] text-[12px]">
                    <span className="flex-1 text-[#1a2e2e]">{r.cat}</span>
                    <span className="w-20 text-right font-medium text-[#1a2e2e]">{formatCurrency(r.actual)}</span>
                    <span className="w-20 text-right text-[#8aabab]">{formatCurrency(r.budget)}</span>
                    <span className={`w-16 text-right font-medium ${parseFloat(varPct) <= 0 ? "text-[#16a34a]" : "text-[#d97706]"}`}>{parseFloat(varPct) > 0 ? "+" : ""}{varPct}%</span>
                  </div>
                );
              })}
              <div className="flex px-3 py-1.5 border-t border-[#d4dede] text-[12px] font-semibold bg-[#f5f8f8]">
                <span className="flex-1 text-[#1a2e2e]">Total Operating Expenses</span>
                <span className="w-20 text-right text-[#1a2e2e]">$307,000</span>
                <span className="w-20 text-right text-[#8aabab]">$306,000</span>
                <span className="w-16 text-right text-[#d97706]">+0.3%</span>
              </div>

              <div className="px-3 py-1 bg-[#f5f8f8] text-[10px] font-medium text-[#4a6b6b] uppercase tracking-wide border-t border-[#d4dede]">Non-Operating</div>
              <div className="flex px-3 py-1.5 border-t border-[#eaf0f0] text-[12px]">
                <span className="flex-1 text-[#1a2e2e]">Debt Service</span>
                <span className="w-20 text-right font-medium text-[#1a2e2e]">$139,916</span>
                <span className="w-20 text-right text-[#8aabab]">$139,916</span>
                <span className="w-16 text-right text-[#5a7272]">0.0%</span>
              </div>

              <div className="flex px-3 py-2 border-t-2 border-[#1a2e2e] text-[13px] font-bold bg-[#1a2e2e] text-white">
                <span className="flex-1">Net Operating Income</span>
                <span className="w-20 text-right">$195,000</span>
                <span className="w-20 text-right text-[#8aabab]">$179,484</span>
                <span className="w-16 text-right text-[#6b9b9b]">+8.6%</span>
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="border border-[#16a34a]/20 bg-[#f0fdf4] rounded p-3">
            <p className="text-[9px] text-[#16a34a] uppercase tracking-wide font-medium">Q4 2025 Distribution</p>
            <p className="text-[20px] font-semibold text-[#16a34a] mt-0.5">$52,000</p>
            <p className="text-[11px] text-[#5a7272] mt-0.5">Year-to-date distributions: $97,000 ($45K Q3 + $52K Q4)</p>
          </div>

          {/* PAGE 2 separator */}
          <div className="border-t-2 border-[#d4dede] pt-5">
            <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-4">Page 2</p>
          </div>

          {/* Operations */}
          <div>
            <p className="text-[11px] text-[#4a6b6b] uppercase tracking-wide font-medium mb-2">Operations</p>
            <div className="space-y-2 text-[12px] text-[#1a2e2e] leading-relaxed">
              <p>Occupancy stabilized at 96.7% through Q4, above the Olympia submarket average of 94.2%. The seasonal reduction in move-outs contributed to strong retention, with 18 of 20 expiring leases renewed at an average increase of 2.8%.</p>
              <p>Collections improved to 98.1% from 97.2% in Q3, reflecting the successful resolution of two delinquent accounts. One account was brought current through a payment plan arrangement; the second unit was vacated and re-leased within 14 days.</p>
              <p>The new online maintenance portal launched in November has been well received. Average work order completion time decreased from 3.2 days to 1.8 days. Resident satisfaction scores from the December survey improved to 4.3 out of 5.0, up from 4.1 in Q3.</p>
            </div>
          </div>

          {/* Capital Projects */}
          <div>
            <p className="text-[11px] text-[#4a6b6b] uppercase tracking-wide font-medium mb-2">Capital Projects</p>
            <div className="space-y-1.5">
              {[
                "Common area LED lighting upgrade completed — final cost $34,500 (budgeted $38,000)",
                "Elevator modernization study completed — recommended phased approach over 18 months, estimated $210,000",
                "Unit renovation: 8 of 24 planned units completed ($12,500 avg cost), achieving $150/mo rent premium",
                "Parking lot resurfacing scheduled for Q2 2026 — $45,000 budgeted from reserves",
                "HVAC replacement Building C — 4 units completed, $22,000 total",
              ].map((item, i) => (
                <p key={i} className="text-[12px] text-[#1a2e2e] leading-relaxed pl-3 border-l-2 border-[#d4dede]">{item}</p>
              ))}
            </div>
          </div>

          {/* Market Analysis */}
          <div>
            <p className="text-[11px] text-[#4a6b6b] uppercase tracking-wide font-medium mb-2">Market Analysis</p>
            <div className="space-y-2 text-[12px] text-[#1a2e2e] leading-relaxed">
              <p>The Olympia multifamily market remains stable with an average vacancy rate of 5.8% across the submarket. New supply has been limited, with only 120 units delivered in 2025 compared to 340 in 2024. This supply constraint supports continued occupancy strength.</p>
              <p>Average asking rents in the Olympia submarket increased 3.2% year-over-year to $1,680/mo for comparable vintage properties. Courtside&apos;s average in-place rent of $1,710 positions the property slightly above market, reflecting the ongoing unit renovation program.</p>
              <p>Employment growth in Thurston County remained positive at 1.8% in Q4, anchored by state government, healthcare, and education sectors.</p>
            </div>
          </div>

          {/* Strategic Priorities */}
          <div>
            <p className="text-[11px] text-[#4a6b6b] uppercase tracking-wide font-medium mb-2">Strategic Priorities — Q1 2026</p>
            <div className="space-y-1.5">
              {[
                "Continue unit renovation program — target 4 additional units in Q1 at $12,500 avg budget",
                "Implement 3.0% rent increase on Q1 lease renewals (12 leases expiring)",
                "Begin elevator modernization Phase 1 — Building A, estimated $70,000",
                "Launch water conservation audit to identify utility cost reduction opportunities",
                "Negotiate insurance renewal — current policy expires April 2026",
              ].map((item, i) => (
                <p key={i} className="text-[12px] text-[#1a2e2e] leading-relaxed pl-3 border-l-2 border-[#4a6b6b]">{item}</p>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#d4dede] pt-3 mt-6">
            <p className="text-[10px] text-[#8aabab]">Prepared by Vital Housing Group | Robert Sheppard, Principal | Christina Adams, Director of Finance</p>
            <p className="text-[10px] text-[#8aabab]">Distribution calculations by Cesca | Waterfall model per operating agreement</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple report preview for other quarters
const sampleReports: Record<string, {
  property: string; quarter: string; investor: string;
  occupancy: number; noi: number; collections: number; dscr: number;
  revenue: { category: string; actual: number; budget: number }[];
  expenses: { category: string; actual: number; budget: number }[];
  highlights: string[];
  capitalProjects: string[];
  distribution: number;
}> = {
  "courtside-Q3 2025": {
    property: "Courtside Apartments", quarter: "Q3 2025", investor: "Enterprise Community Partners",
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
      "Occupancy recovered to 95.8% by end of September after summer dip",
      "R&M over budget due to emergency plumbing in Building A ($8,200)",
      "Collections at 97.2% — one tenant on payment plan",
    ],
    capitalProjects: [
      "Roof membrane replacement Building C — $82,000 (budgeted $90,000)",
      "Unit renovation: 4 units completed in Q3 at $12,500 avg",
      "Emergency plumbing repair — Building A ($8,200)",
      "LED lighting upgrade — 60% complete, on schedule",
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
      "Blended occupancy at 93.0% — commercial vacancy impacted total",
      "One commercial unit re-leased to coffee roaster, 5-year term starting Nov 2025",
      "DSCR at 1.22x — above 1.15x lender covenant",
    ],
    capitalProjects: [
      "Commercial Unit B tenant improvement — $62,000 (landlord cap $55K)",
      "Boiler system inspection — minor repairs $8,200",
      "Fire alarm panel upgrade scheduled for Q4 — est. $22,000",
    ],
    distribution: 28000,
  },
};

function SimpleReportPreview({ reportKey, onClose }: { reportKey: string; onClose: () => void }) {
  const report = sampleReports[reportKey];
  if (!report) return null;
  const totalRev = report.revenue.reduce((s, r) => s + r.actual, 0);
  const totalExp = report.expenses.reduce((s, r) => s + r.actual, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full sm:w-[560px] bg-white h-full overflow-y-auto border-l border-[#d4dede]">
        <div className="sticky top-0 bg-[#1a2e2e] text-white px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] text-[#6b9b9b] uppercase tracking-[0.15em] font-medium">Vital Housing Group</p>
            <p className="text-[14px] font-semibold mt-0.5">{report.property} — {report.quarter}</p>
            <p className="text-[11px] text-[#8aabab]">{report.investor}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#4a6b6b] rounded cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-5 py-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { l: "Occupancy", v: report.occupancy + "%" },
              { l: "NOI", v: formatCurrency(report.noi) },
              { l: "Collections", v: report.collections + "%" },
              { l: "DSCR", v: report.dscr.toFixed(2) + "x" },
            ].map((k) => (
              <div key={k.l} className="bg-[#f5f8f8] border border-[#d4dede] rounded p-2">
                <p className="text-[9px] text-[#5a7272] uppercase tracking-wide">{k.l}</p>
                <p className="text-[15px] font-semibold text-[#1a2e2e] mt-0.5">{k.v}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] text-[#5a7272] uppercase tracking-wide font-medium mb-1.5">Revenue</p>
            <div className="border border-[#d4dede] rounded overflow-hidden">
              <div className="flex px-3 py-1.5 bg-[#f0f4f4] text-[9px] text-[#5a7272] uppercase tracking-wide font-medium">
                <span className="flex-1">Category</span><span className="w-20 text-right">Actual</span><span className="w-20 text-right">Budget</span>
              </div>
              {report.revenue.map((r, i) => (
                <div key={i} className="flex px-3 py-1.5 border-t border-[#eaf0f0] text-[12px]">
                  <span className="flex-1 text-[#1a2e2e]">{r.category}</span>
                  <span className="w-20 text-right font-medium text-[#1a2e2e]">{formatCurrency(r.actual)}</span>
                  <span className="w-20 text-right text-[#8aabab]">{formatCurrency(r.budget)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[#5a7272] uppercase tracking-wide font-medium mb-1.5">Expenses</p>
            <div className="border border-[#d4dede] rounded overflow-hidden">
              <div className="flex px-3 py-1.5 bg-[#f0f4f4] text-[9px] text-[#5a7272] uppercase tracking-wide font-medium">
                <span className="flex-1">Category</span><span className="w-20 text-right">Actual</span><span className="w-20 text-right">Budget</span>
              </div>
              {report.expenses.map((r, i) => (
                <div key={i} className="flex px-3 py-1.5 border-t border-[#eaf0f0] text-[12px]">
                  <span className="flex-1 text-[#1a2e2e]">{r.category}</span>
                  <span className="w-20 text-right font-medium text-[#1a2e2e]">{formatCurrency(r.actual)}</span>
                  <span className="w-20 text-right text-[#8aabab]">{formatCurrency(r.budget)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1a2e2e] text-white rounded p-3 flex justify-between">
            <span className="font-semibold">NOI</span>
            <span className="text-[16px] font-semibold">{formatCurrency(totalRev - totalExp)}</span>
          </div>
          <div>
            <p className="text-[10px] text-[#5a7272] uppercase tracking-wide font-medium mb-1.5">Highlights</p>
            {report.highlights.map((h, i) => (
              <p key={i} className="text-[12px] text-[#1a2e2e] leading-relaxed pl-3 border-l-2 border-[#d4dede] mb-1">{h}</p>
            ))}
          </div>
          <div>
            <p className="text-[10px] text-[#5a7272] uppercase tracking-wide font-medium mb-1.5">Capital Projects</p>
            {report.capitalProjects.map((c, i) => (
              <p key={i} className="text-[12px] text-[#1a2e2e] leading-relaxed pl-3 border-l-2 border-[#d4dede] mb-1">{c}</p>
            ))}
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
  const [showCourtsideQ4, setShowCourtsideQ4] = useState(false);

  const propertyMap = useMemo(() => {
    const m: Record<string, string> = {};
    properties.forEach((p) => (m[p.id] = p.name));
    return m;
  }, []);

  const rowData = useMemo(
    () =>
      investorReports.map((r) => ({
        ...r,
        propertyName: propertyMap[r.propertyId] || r.propertyId,
        reportKey: r.propertyId + "-" + r.quarter,
        hasPreview: r.status === "published" || r.status === "draft",
      })),
    [propertyMap]
  );

  function StatusRenderer(p: { value: string }) {
    const c: Record<string, string> = { published: "text-[#16a34a]", draft: "text-[#d97706]", pending: "text-[#8aabab]" };
    return <span className={`text-[11px] font-medium capitalize ${c[p.value] || ""}`}>{p.value}</span>;
  }

  function ViewRenderer(p: { data: any }) {
    if (!p.data.hasPreview) return <span className="text-[10px] text-[#d4dede]">--</span>;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (p.data.reportKey === "courtside-Q4 2025") {
            setShowCourtsideQ4(true);
          } else {
            setSelectedReport(p.data.reportKey);
          }
        }}
        className="text-[10px] font-medium text-[#4a6b6b] hover:text-[#1a2e2e] underline cursor-pointer"
      >
        View
      </button>
    );
  }

  const columnDefs: ColDef[] = useMemo(() => {
    if (isMobile)
      return [
        { field: "propertyName", headerName: "Property", flex: 1, minWidth: 120 },
        { field: "quarter", headerName: "Qtr", width: 80 },
        { field: "status", headerName: "Status", width: 80, cellRenderer: StatusRenderer },
        { headerName: "", width: 50, cellRenderer: ViewRenderer, sortable: false, filter: false },
      ];
    return [
      { field: "propertyName", headerName: "Property", flex: 1, minWidth: 180 },
      { field: "quarter", headerName: "Quarter", width: 110 },
      { field: "status", headerName: "Status", width: 110, cellRenderer: StatusRenderer },
      {
        field: "distributionAmount",
        headerName: "Distribution",
        width: 130,
        type: "numericColumn",
        valueFormatter: (p: any) => (p.value > 0 ? formatCurrency(p.value) : "--"),
      },
      { field: "publishedDate", headerName: "Published", width: 120, valueFormatter: (p: any) => p.value || "--" },
      { headerName: "", width: 70, cellRenderer: ViewRenderer, sortable: false, filter: false },
    ];
  }, [isMobile]);

  const published = investorReports.filter((r) => r.status === "published");

  return (
    <>
      <PageHeader
        title="Investor Reports"
        subtitle={`${published.length} published | ${formatCurrency(published.reduce((s, r) => s + r.distributionAmount, 0))} distributed`}
      >
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2e2e] text-white text-[12px] font-medium rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
          Generate Report
        </button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { l: "Published", v: investorReports.filter((r) => r.status === "published").length, c: "text-[#16a34a]" },
          { l: "Drafts", v: investorReports.filter((r) => r.status === "draft").length, c: "text-[#d97706]" },
          { l: "Pending", v: investorReports.filter((r) => r.status === "pending").length, c: "text-[#8aabab]" },
        ].map((s) => (
          <div key={s.l} className="bg-white border border-[#d4dede] rounded px-3 py-2.5">
            <p className="text-[10px] text-[#5a7272] uppercase tracking-wide font-medium">{s.l}</p>
            <p className={`text-[20px] font-semibold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#d4dede] rounded p-4 mb-4">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">Report Schedule</h2>
        <div className="ag-theme-alpine" style={{ height: 280, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, resizable: true }}
            onRowClicked={(e: RowClickedEvent) => {
              if (e.data.reportKey === "courtside-Q4 2025") {
                setShowCourtsideQ4(true);
              } else if (e.data.hasPreview) {
                setSelectedReport(e.data.reportKey);
              }
            }}
            animateRows
            getRowId={(p) => p.data.reportKey}
          />
        </div>
        <p className="text-[10px] text-[#8aabab] mt-2">Click Courtside Q4 2025 to view the full branded sample report.</p>
      </div>

      {/* ── Distribution Waterfall — Courtside Q4 2025 ── */}
      <div className="bg-white border border-[#d4dede] rounded p-4 mt-4">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-1">Distribution Waterfall — Courtside Q4 2025</h2>
        <p className="text-[11px] text-[#8aabab] mb-4">Calculated by Cesca using operating agreement waterfall model</p>

        <div className="space-y-0">
          {[
            { label: "Net Cash Flow Available", amount: 52000, pct: "100%", color: "bg-[#1a2e2e]", textColor: "text-white" },
            { label: "Preferred Return (8% annualized)", amount: 28600, pct: "55.0%", color: "bg-[#4a6b6b]", textColor: "text-white" },
            { label: "LP Share (70% of remaining)", amount: 16380, pct: "31.5%", color: "bg-[#6b9b9b]", textColor: "text-white" },
            { label: "GP Promote (30% of remaining)", amount: 7020, pct: "13.5%", color: "bg-[#d4dede]", textColor: "text-[#1a2e2e]" },
          ].map((row, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-3 ${row.color} ${row.textColor} ${i === 0 ? "rounded-t" : ""} ${i === 3 ? "rounded-b" : ""}`}>
              <div>
                <p className="text-[12px] font-medium">{row.label}</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-semibold">{formatCurrency(row.amount)}</p>
                <p className="text-[10px] opacity-70">{row.pct}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { l: "Total Distribution", v: "$52,000" },
            { l: "LP Payout", v: "$44,980" },
            { l: "GP Promote", v: "$7,020" },
            { l: "Annualized Return", v: "8.2%" },
          ].map((k) => (
            <div key={k.l} className="bg-[#f5f8f8] border border-[#d4dede] rounded p-2.5">
              <p className="text-[9px] text-[#5a7272] uppercase tracking-wide">{k.l}</p>
              <p className="text-[15px] font-semibold text-[#1a2e2e] mt-0.5">{k.v}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-[#8aabab] mt-3">
          Year-to-date distributions: $97,000 ($45K Q3 + $52K Q4). Waterfall per Courtside operating agreement Section 7.2.
        </p>
      </div>

      {showCourtsideQ4 && <CourtsideQ4Report onClose={() => setShowCourtsideQ4(false)} />}
      {selectedReport && !showCourtsideQ4 && <SimpleReportPreview reportKey={selectedReport} onClose={() => setSelectedReport(null)} />}
    </>
  );
}
