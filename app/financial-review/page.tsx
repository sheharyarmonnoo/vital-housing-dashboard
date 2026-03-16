"use client";

import { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties, monthlyReviews, formatCurrency, Property } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";

// --- Create Package Upload Modal ---
const REQUIRED_FILES = [
  { key: "balance_sheet", label: "Balance Sheet", format: ".xlsx", required: true },
  { key: "budget_variance", label: "Budget Variance Report", format: ".xlsx", required: true },
  { key: "ytd_gl", label: "YTD General Ledger (with comments in col L/M)", format: ".xlsx", required: true },
  { key: "operating_budget", label: "Operating Budget", format: ".xlsx", required: true },
  { key: "reserve_budget", label: "Reserve / Capital Budget", format: ".xlsx", required: false },
  { key: "rent_roll", label: "Rent Roll", format: ".xlsx", required: false },
  { key: "utility_report", label: "Utility Report", format: ".xlsx, .pdf", required: false },
];

type UploadStep = "property" | "files" | "review_type" | "processing" | "done";

function CreatePackageModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<UploadStep>("property");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [reviewType, setReviewType] = useState<"draft" | "final">("draft");
  const [notes, setNotes] = useState("");

  const activeProps = properties.filter(p => p.status !== "pipeline");
  const requiredUploaded = REQUIRED_FILES.filter(f => f.required).every(f => files[f.key]);
  const totalUploaded = Object.values(files).filter(Boolean).length;

  function handleFileSelect(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFiles(prev => ({ ...prev, [key]: f }));
  }

  function handleProcess() {
    setStep("processing");
    setTimeout(() => setStep("done"), 3000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-[#d4dede] rounded w-full max-w-[560px] mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#d4dede]">
          <div>
            <p className="text-[14px] font-semibold text-[#1a2e2e]">Create Financial Package</p>
            <p className="text-[11px] text-[#8aabab] mt-0.5">
              {step === "property" && "Step 1 — Select property"}
              {step === "files" && `Step 2 — Upload files for ${selectedProperty?.name}`}
              {step === "review_type" && "Step 3 — Review type & notes"}
              {step === "processing" && "Processing..."}
              {step === "done" && "Complete"}
            </p>
          </div>
          <button onClick={onClose} className="text-[#8aabab] hover:text-[#1a2e2e] cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Step 1: Select Property */}
          {step === "property" && (
            <div className="space-y-2">
              <p className="text-[12px] text-[#5a7272]">Which property is this financial package for?</p>
              {activeProps.map(p => (
                <button key={p.id} onClick={() => { setSelectedProperty(p); setStep("files"); }}
                  className="w-full text-left px-3 py-2.5 border border-[#d4dede] rounded hover:border-[#4a6b6b] hover:bg-[#f5f8f8] cursor-pointer transition-colors">
                  <p className="text-[13px] font-medium text-[#1a2e2e]">{p.name}</p>
                  <p className="text-[10px] text-[#8aabab]">{p.location} · {p.units} units · {p.pmSystem}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Upload Files */}
          {step === "files" && (
            <div className="space-y-3">
              <p className="text-[12px] text-[#5a7272]">Upload Christina's financial package files. Required files are marked with *</p>
              {REQUIRED_FILES.map(rf => (
                <div key={rf.key} className="flex items-center justify-between py-2 border-b border-[#eaf0f0] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#1a2e2e]">
                      {rf.label} {rf.required && <span className="text-[#dc2626]">*</span>}
                    </p>
                    {files[rf.key] && (
                      <p className="text-[10px] text-[#4a6b6b] mt-0.5 truncate">{files[rf.key]!.name} ({(files[rf.key]!.size / 1024).toFixed(0)} KB)</p>
                    )}
                  </div>
                  <label className={`text-[10px] font-medium px-2.5 py-1 rounded cursor-pointer transition-colors ${
                    files[rf.key]
                      ? "bg-[#4a6b6b] text-white"
                      : "border border-[#d4dede] text-[#5a7272] hover:border-[#4a6b6b] hover:text-[#1a2e2e]"
                  }`}>
                    {files[rf.key] ? "Replace" : "Choose"}
                    <input type="file" className="hidden" accept={rf.format} onChange={e => handleFileSelect(rf.key, e)} />
                  </label>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-[#8aabab]">{totalUploaded} of {REQUIRED_FILES.length} files uploaded</p>
                <div className="flex gap-2">
                  <button onClick={() => setStep("property")} className="text-[11px] text-[#5a7272] cursor-pointer px-2 py-1">Back</button>
                  <button onClick={() => setStep("review_type")} disabled={!requiredUploaded}
                    className={`text-[11px] font-medium px-3 py-1.5 rounded cursor-pointer transition-colors ${
                      requiredUploaded ? "bg-[#1a2e2e] text-white hover:bg-[#4a6b6b]" : "bg-[#d4dede] text-[#8aabab] cursor-not-allowed"
                    }`}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review Type */}
          {step === "review_type" && (
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-medium text-[#1a2e2e] mb-2">Review Type</p>
                <div className="flex gap-2">
                  {(["draft", "final"] as const).map(t => (
                    <button key={t} onClick={() => setReviewType(t)}
                      className={`flex-1 text-left px-3 py-2.5 border rounded cursor-pointer transition-colors ${
                        reviewType === t ? "border-[#4a6b6b] bg-[#f0f4f4]" : "border-[#d4dede] hover:border-[#8aabab]"
                      }`}>
                      <p className="text-[12px] font-medium text-[#1a2e2e] capitalize">{t}</p>
                      <p className="text-[10px] text-[#8aabab] mt-0.5">
                        {t === "draft" ? "2 business day response deadline — pre-close review" : "7 business day response deadline — final close"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#1a2e2e] mb-1">Notes for this review (optional)</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any context, known issues, or specific items to check..."
                  rows={3}
                  className="w-full text-[12px] px-3 py-2 border border-[#d4dede] rounded bg-[#f5f8f8] focus:outline-none focus:border-[#4a6b6b] placeholder-[#8aabab] resize-none" />
              </div>
              <div className="bg-[#f0f4f4] border border-[#d4dede] rounded p-3">
                <p className="text-[11px] font-medium text-[#1a2e2e] mb-1">Package Summary</p>
                <p className="text-[11px] text-[#5a7272]">Property: {selectedProperty?.name}</p>
                <p className="text-[11px] text-[#5a7272]">Files: {totalUploaded} uploaded ({REQUIRED_FILES.filter(f => f.required && files[f.key]).length} required)</p>
                <p className="text-[11px] text-[#5a7272]">Review: {reviewType === "draft" ? "Draft (2 day SLA)" : "Final (7 day SLA)"}</p>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => setStep("files")} className="text-[11px] text-[#5a7272] cursor-pointer px-2 py-1">Back</button>
                <button onClick={handleProcess}
                  className="text-[11px] font-medium px-4 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors">
                  Process Package
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div className="text-center py-8">
              <div className="w-5 h-5 border-2 border-[#1a2e2e] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[13px] font-medium text-[#1a2e2e] mt-4">Processing {selectedProperty?.name}</p>
              <p className="text-[11px] text-[#8aabab] mt-1">Parsing financials, mapping accounts, generating 7-tab dashboard...</p>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="text-center py-8">
              <p className="text-[15px] font-semibold text-[#1a2e2e]">Package processed</p>
              <p className="text-[12px] text-[#5a7272] mt-2 leading-relaxed">
                {selectedProperty?.name} — {reviewType === "draft" ? "Draft" : "Final"} review complete.
                7-tab dashboard generated. Directive emails drafted.
                Check the review tabs below for findings.
              </p>
              <button onClick={onClose}
                className="mt-4 text-[11px] font-medium px-4 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors">
                View Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

const REVIEW_TABS = [
  "Summary Findings",
  "Budget Variance",
  "Reclassification Directives",
  "Reserve Opportunities",
  "GL Detail Flags",
  "Rent Roll Insights",
  "Property Drivers",
] as const;

type ReviewTab = typeof REVIEW_TABS[number];

// Sample data for the 7-tab concept
const tabContent: Record<ReviewTab, { description: string; items: string[] }> = {
  "Summary Findings": {
    description: "High-level findings from the most recent financial review cycle.",
    items: [
      "Courtside Feb NOI beat budget by 2.3% — collections at 98.6%, highest in trailing 6 months",
      "Coronado Jan review flagged 3 items: elevated R&M, below-target collections (95.5%), DSCR dipped to 1.20",
      "Orchard Park pre-conversion GL mapping 60% complete — Feb review pending verification",
      "Belmont Q4 investor report in draft — Cesca finalizing waterfall distribution calculation",
      "Valencia continues outperformance: 97.9% occupancy with zero flags across last 5 months",
    ],
  },
  "Budget Variance": {
    description: "Actual vs. budget vs. proforma comparison across all reviewed properties.",
    items: [
      "Courtside: Feb revenue $384K (actual) vs $375K (budget) vs $365K (proforma) — +2.3% / +5.2%",
      "Belmont: Jan revenue $168K (actual) vs $173K (budget) — -3.0%, driven by 2 vacant commercial units",
      "Orchard Park: Jan NOI $31K vs $30.8K budget — slight beat despite pre-conversion overhead",
      "Coronado: Jan NOI $15K vs $15.6K budget — -3.8%, R&M overspend on plumbing emergency",
      "LEDG portfolio aggregate: within 1.5% of budget across all 5 managed properties",
    ],
  },
  "Reclassification Directives": {
    description: "GL line items requiring reclassification per Christina's review.",
    items: [
      "Courtside: $4,200 HVAC repair (Bldg C) — reclassify from R&M to CapEx per threshold policy",
      "Belmont: $2,800 commercial TI contribution — reclassify from Operating to Below-the-Line",
      "Coronado: $1,500 security deposit refund coded to R&M — reclassify to Deposits Payable",
      "Orchard Park: $3,100 in pre-conversion consulting fees — reclassify from Admin to Conversion Cost center",
    ],
  },
  "Reserve Opportunities": {
    description: "Identified opportunities to build or reallocate property reserves.",
    items: [
      "Courtside: $18K YTD operating surplus — recommend transferring $12K to replacement reserves",
      "Valencia: Consistent outperformance supports $8K reserve contribution in Q1",
      "Belmont: Fire alarm panel came in under budget by $2,200 — redirect to CapEx reserve",
      "LEDG Cedar Heights: Insurance renewal saved $4,800 — allocate to deferred maintenance fund",
    ],
  },
  "GL Detail Flags": {
    description: "Specific general ledger anomalies flagged during review.",
    items: [
      "Coronado Jan: $2,400 R&M charge without work order documentation — request backup from Cascade Living",
      "Orchard Park Oct: 4 flags including $1,800 duplicate vendor payment (AppFolio sync issue)",
      "Belmont Sep: 3 flags — $3,200 unallocated expense, $890 misposted utility charge, vendor mismatch",
      "Courtside Nov: 2 flags — $1,100 timing difference on insurance accrual, $450 rounding variance",
    ],
  },
  "Rent Roll Insights": {
    description: "Key observations from rent roll analysis across the portfolio.",
    items: [
      "Courtside: 12 leases expiring Q2 2026 — avg in-place rent $1,710 vs market $1,785 (4.4% loss-to-lease)",
      "Belmont: Commercial tenant #2 lease signed at $22/SF NNN, 5-year term starting Nov 2025",
      "Orchard Park: 8 units below 90% of market — candidates for renovation upon turnover",
      "Coronado: 3 month-to-month tenants (8.3% of units) — target for lease-up in Q2",
      "Valencia: Zero loss-to-lease — all units at or above market; 2 renewals achieved 3.5% increase",
    ],
  },
  "Property Drivers": {
    description: "Property-specific performance drivers and watchlist items.",
    items: [
      "Courtside: Online maintenance portal reduced work order completion from 3.2 to 1.8 days — resident satisfaction up",
      "Belmont: New coffee roaster tenant driving foot traffic — positive impact on residential retention",
      "Orchard Park: Pre-conversion accounting transition creating temporary review delays; target completion Apr 2026",
      "Coronado: Cascade Living PM response times remain slow — escalation call scheduled Mar 18",
      "LEDG portfolio: Resmin export issue at River Bend delaying Feb financials — tech support engaged",
    ],
  },
};

export default function FinancialReviewPage() {
  const isMobile = useIsMobile();
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<ReviewTab>("Summary Findings");
  const [showUpload, setShowUpload] = useState(false);

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
            if (p.value === 0) return <span className="text-[#8aabab]">0</span>;
            return <span className="text-[#dc2626] font-medium">{p.value}</span>;
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
        headerName: "Budget Var %",
        width: 110,
        cellRenderer: (p: any) => {
          const v = p.value;
          const color = v < -3 ? "text-[#dc2626]" : v < 0 ? "text-[#d97706]" : "text-[#16a34a]";
          return <span className={`${color} font-medium`}>{v > 0 ? "+" : ""}{v}%</span>;
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
        headerName: "Collections %",
        width: 110,
        valueFormatter: (p: any) => `${p.value}%`,
      },
      {
        field: "dscr",
        headerName: "DSCR",
        width: 80,
        cellRenderer: (p: any) => {
          const color = p.value < 1.15 ? "text-[#dc2626]" : p.value < 1.25 ? "text-[#d97706]" : "text-[#1a2e2e]";
          return <span className={`${color} font-medium`}>{p.value.toFixed(2)}</span>;
        },
      },
      {
        field: "flagCount",
        headerName: "Flags",
        width: 75,
        cellRenderer: (p: any) => {
          if (p.value === 0) return <span className="text-[#8aabab]">0</span>;
          return <span className="text-[#dc2626] font-medium">{p.value}</span>;
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
            pending: "text-[#5a7272]",
          };
          return <span className={`${colors[p.value] || ""} text-[12px] font-medium capitalize`}>{p.value}</span>;
        },
      },
    ];
  }, [isMobile]);

  const reviewedProperties = useMemo(() => {
    const ids = [...new Set(monthlyReviews.map((r) => r.propertyId))];
    return ids.map((id) => ({ id, name: propertyMap[id] || id }));
  }, [propertyMap]);

  const content = tabContent[activeTab];

  return (
    <>
      <PageHeader
        title="Financial Review"
        subtitle="Christina's monthly financial package review hub"
      >
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2e2e] text-white text-[12px] font-medium rounded hover:bg-[#4a6b6b] transition-colors cursor-pointer">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          Upload Package
        </button>
      </PageHeader>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-[12px] font-medium text-[#5a7272]">Property:</label>
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#8aabab]"
        >
          <option value="all">All Properties</option>
          {reviewedProperties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* AG Grid — Monthly Review Data */}
      <div className="bg-white border border-[#d4dede] rounded p-4 mb-6">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">Monthly Review Status</h2>
        <div className="ag-theme-alpine" style={{ height: 440, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, resizable: true }}
            animateRows
            suppressCellFocus
          />
        </div>
      </div>

      {/* 7-Tab Dashboard Concept */}
      <div className="bg-white border border-[#d4dede] rounded p-4">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">Review Dashboard</h2>

        {/* Tab bar */}
        <div className="flex gap-0 overflow-x-auto mb-4 border-b border-[#d4dede]">
          {REVIEW_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-3 py-2 text-[11px] font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? "border-[#4a6b6b] text-[#1a2e2e]"
                  : "border-transparent text-[#8aabab] hover:text-[#5a7272]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          <p className="text-[12px] text-[#5a7272] mb-3">{content.description}</p>
          <div className="space-y-2">
            {content.items.map((item, i) => (
              <div key={i} className="py-2 px-3 bg-[#f5f8f8] rounded text-[13px] text-[#1a2e2e] leading-relaxed">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
