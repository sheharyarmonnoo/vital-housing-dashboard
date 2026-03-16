"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties, monthlyReviews, formatCurrency, Property, MonthlyReview } from "@/data/portfolio";
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

/* ── Upload Package Modal ── */

function UploadPackageModal({ onClose }: { onClose: () => void }) {
  const [selectedProperty, setSelectedProperty] = useState("");
  const [fileType, setFileType] = useState("Balance Sheet");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const activeProps = properties.filter((p) => p.status !== "pipeline");
  const fileTypes = [
    "Balance Sheet",
    "Budget Variance",
    "YTD GL",
    "Operating Budget",
    "Reserve Budget",
  ];

  function handleUpload() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-[#d4dede] rounded w-full max-w-[480px] mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#d4dede]">
          <p className="text-[14px] font-semibold text-[#1a2e2e]">Upload Package</p>
          <button onClick={onClose} className="text-[#8aabab] hover:text-[#1a2e2e] cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {!processing && !done && (
            <>
              <div>
                <label className="text-[12px] font-medium text-[#5a7272] block mb-1">Property</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#8aabab]"
                >
                  <option value="">Select property...</option>
                  {activeProps.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#5a7272] block mb-1">File Type</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#8aabab]"
                >
                  {fileTypes.map((ft) => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#5a7272] block mb-1">File</label>
                <input
                  type="file"
                  accept=".xlsx,.csv,.pdf"
                  className="w-full text-[12px] text-[#5a7272] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-medium file:bg-[#1a2e2e] file:text-white file:cursor-pointer hover:file:bg-[#4a6b6b]"
                />
              </div>
              <button
                onClick={handleUpload}
                disabled={!selectedProperty}
                className={`w-full text-[12px] font-medium py-2 rounded cursor-pointer transition-colors ${
                  selectedProperty
                    ? "bg-[#1a2e2e] text-white hover:bg-[#4a6b6b]"
                    : "bg-[#d4dede] text-[#8aabab] cursor-not-allowed"
                }`}
              >
                Upload & Process
              </button>
            </>
          )}
          {processing && (
            <div className="text-center py-8 space-y-3">
              <div className="w-5 h-5 border-2 border-[#4a6b6b] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[13px] font-medium text-[#1a2e2e]">Parsing...</p>
              <p className="text-[11px] text-[#8aabab]">Mapping to COA... Analysis running...</p>
            </div>
          )}
          {done && (
            <div className="text-center py-8 space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center mx-auto text-[14px]">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <p className="text-[14px] font-semibold text-[#1a2e2e]">Complete</p>
              <p className="text-[12px] text-[#5a7272]">Review dashboard updated.</p>
              <button
                onClick={onClose}
                className="text-[11px] font-medium px-4 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors"
              >
                View Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Review Tabs ── */

const REVIEW_TABS = [
  "Summary Findings",
  "Budget Variance",
  "Reclassification Directives",
  "Reserve Opportunities",
  "GL Detail Flags",
  "Rent Roll Insights",
  "Property Drivers",
] as const;

type ReviewTab = (typeof REVIEW_TABS)[number];

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

/* ── Reclassification Data ── */

const LS_RECLASS_KEY = "vital_reclass_requests";

interface ReclassRequest {
  id: string;
  propertyId: string;
  account: string;
  amount: number;
  fromCategory: string;
  toCategory: string;
  reason: string;
  status: "Requested" | "Approved" | "Applied";
  sentToPM: boolean;
}

const defaultReclassRequests: ReclassRequest[] = [
  { id: "rc1", propertyId: "courtside", account: "R&M — HVAC Bldg C", amount: 4200, fromCategory: "R&M", toCategory: "CapEx", reason: "Above $3K threshold policy", status: "Requested", sentToPM: true },
  { id: "rc2", propertyId: "belmont", account: "Commercial TI", amount: 2800, fromCategory: "Operating", toCategory: "Below-the-Line", reason: "TI contribution — non-operating", status: "Approved", sentToPM: true },
  { id: "rc3", propertyId: "coronado", account: "Security Deposit Refund", amount: 1500, fromCategory: "R&M", toCategory: "Deposits Payable", reason: "Miscoded — should be balance sheet", status: "Requested", sentToPM: false },
  { id: "rc4", propertyId: "orchard-park", account: "Pre-conversion Consulting", amount: 3100, fromCategory: "Admin", toCategory: "Conversion Cost", reason: "Conversion-related, separate cost center", status: "Applied", sentToPM: true },
];

function loadReclassRequests(): ReclassRequest[] {
  if (typeof window === "undefined") return defaultReclassRequests;
  try {
    const raw = localStorage.getItem(LS_RECLASS_KEY);
    return raw ? JSON.parse(raw) : defaultReclassRequests;
  } catch {
    return defaultReclassRequests;
  }
}

function saveReclassRequests(data: ReclassRequest[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_RECLASS_KEY, JSON.stringify(data));
}

/* ── Draft vs Final review data ── */

interface ReviewCycle {
  propertyId: string;
  propertyName: string;
  month: string;
  reviewType: "Draft" | "Final";
  receivedDate: string;
  deadlineDate: string;
  status: "On Track" | "Due Today" | "Overdue" | "Complete";
  phase: string;
}

const reviewCycles: ReviewCycle[] = [
  { propertyId: "courtside", propertyName: "Courtside Apartments", month: "Feb 2026", reviewType: "Draft", receivedDate: "Mar 6", deadlineDate: "Mar 10", status: "Complete", phase: "Direction sent" },
  { propertyId: "courtside", propertyName: "Courtside Apartments", month: "Feb 2026", reviewType: "Final", receivedDate: "Mar 12", deadlineDate: "Mar 19", status: "On Track", phase: "PM finalizing" },
  { propertyId: "belmont", propertyName: "Belmont Dairy", month: "Feb 2026", reviewType: "Draft", receivedDate: "Mar 7", deadlineDate: "Mar 11", status: "Complete", phase: "Direction sent" },
  { propertyId: "belmont", propertyName: "Belmont Dairy", month: "Feb 2026", reviewType: "Final", receivedDate: "—", deadlineDate: "Mar 20", status: "On Track", phase: "Awaiting PM" },
  { propertyId: "coronado", propertyName: "Coronado", month: "Feb 2026", reviewType: "Draft", receivedDate: "—", deadlineDate: "Mar 10", status: "Overdue", phase: "PM package overdue" },
  { propertyId: "orchard-park", propertyName: "Orchard Park", month: "Feb 2026", reviewType: "Draft", receivedDate: "Mar 8", deadlineDate: "Mar 12", status: "Due Today", phase: "Under review" },
  { propertyId: "valencia", propertyName: "Valencia", month: "Feb 2026", reviewType: "Final", receivedDate: "Mar 10", deadlineDate: "Mar 17", status: "Complete", phase: "Finalized" },
];

/* ── Email Composer ── */

function buildEmailDraft(propertyId: string, propertyMap: Record<string, string>): string {
  const prop = properties.find((p) => p.id === propertyId);
  if (!prop) return "";
  const pmCompany = prop.pmCompany || "Property Management Team";
  const name = prop.name;
  const latestReview = monthlyReviews
    .filter((r) => r.propertyId === propertyId)
    .sort((a, b) => b.month.localeCompare(a.month))[0];
  const month = latestReview ? latestReview.month : "recent period";

  const reclass = defaultReclassRequests.filter((r) => r.propertyId === propertyId);
  const reclassLines = reclass.length > 0
    ? reclass.map((r) => `  - ${r.account}: $${r.amount.toLocaleString()} — reclassify from ${r.fromCategory} to ${r.toCategory} (${r.reason})`).join("\n")
    : "  - No reclassification items this period";

  const flags = tabContent["GL Detail Flags"].items.filter((i) =>
    i.toLowerCase().includes(name.toLowerCase().split(" ")[0].toLowerCase())
  );
  const flagLines = flags.length > 0
    ? flags.map((f) => `  - ${f}`).join("\n")
    : "  - No GL flags this period";

  return `Dear ${pmCompany},

Following our review of ${name} financials for ${month}, the following items require your attention:

RECLASSIFICATION REQUESTS:
${reclassLines}

GL FLAGS / QUESTIONS:
${flagLines}

RESERVE ITEMS:
  - Please confirm current replacement reserve balance and any planned draws for the coming quarter.

Please address these items and return the updated financials within 2 business days (draft) or 7 business days (final close).

Thank you,
Christina Adams
Director of Finance, Vital Housing Group`;
}

/* ── Custom Reviews localStorage ── */

const LS_CUSTOM_REVIEWS_KEY = "vital_custom_reviews";

function loadCustomReviews(): MonthlyReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_CUSTOM_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomReviews(data: MonthlyReview[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_CUSTOM_REVIEWS_KEY, JSON.stringify(data));
}

/* ── Main Component ── */

export default function FinancialReviewPage() {
  const isMobile = useIsMobile();
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<ReviewTab>("Summary Findings");
  const [showUpload, setShowUpload] = useState(false);

  // Email composer state
  const [emailProperty, setEmailProperty] = useState("courtside");
  const [emailDraft, setEmailDraft] = useState("");
  const [emailCopied, setEmailCopied] = useState(false);

  // Reclassification state
  const [reclassRequests, setReclassRequests] = useState<ReclassRequest[]>(defaultReclassRequests);
  const [showNewReclass, setShowNewReclass] = useState(false);
  const [newReclass, setNewReclass] = useState({ propertyId: "courtside", account: "", amount: "", fromCategory: "", toCategory: "", reason: "" });

  // Custom reviews state
  const [customReviews, setCustomReviews] = useState<MonthlyReview[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    propertyId: "courtside",
    month: "",
    revenue: "",
    expenses: "",
    noi: "",
    budgetVariance: "",
    occupancy: "",
    collections: "",
    dscr: "",
    flagCount: "0",
  });

  // Track custom review keys for delete identification
  const customReviewKeys = useMemo(
    () => new Set(customReviews.map((r) => r.propertyId + "-" + r.month)),
    [customReviews]
  );

  const propertyMap = useMemo(() => {
    const m: Record<string, string> = {};
    properties.forEach((p) => (m[p.id] = p.name));
    return m;
  }, []);

  // Load localStorage on mount
  useEffect(() => {
    setReclassRequests(loadReclassRequests());
    setCustomReviews(loadCustomReviews());
  }, []);

  function addReview() {
    const review: MonthlyReview = {
      propertyId: newReview.propertyId,
      month: newReview.month,
      revenue: parseFloat(newReview.revenue) || 0,
      expenses: parseFloat(newReview.expenses) || 0,
      noi: parseFloat(newReview.noi) || 0,
      budgetVariance: parseFloat(newReview.budgetVariance) || 0,
      occupancy: parseFloat(newReview.occupancy) || 0,
      collections: parseFloat(newReview.collections) || 0,
      dscr: parseFloat(newReview.dscr) || 0,
      status: "draft",
      flagCount: parseInt(newReview.flagCount) || 0,
    };
    const updated = [...customReviews, review];
    setCustomReviews(updated);
    saveCustomReviews(updated);
    setShowAddReview(false);
    setNewReview({ propertyId: "courtside", month: "", revenue: "", expenses: "", noi: "", budgetVariance: "", occupancy: "", collections: "", dscr: "", flagCount: "0" });
  }

  function deleteCustomReview(propertyId: string, month: string) {
    const updated = customReviews.filter((r) => !(r.propertyId === propertyId && r.month === month));
    setCustomReviews(updated);
    saveCustomReviews(updated);
  }

  // Regenerate email when property changes
  useEffect(() => {
    setEmailDraft(buildEmailDraft(emailProperty, propertyMap));
    setEmailCopied(false);
  }, [emailProperty, propertyMap]);

  function copyEmail() {
    navigator.clipboard.writeText(emailDraft).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  }

  function addReclassRequest() {
    const req: ReclassRequest = {
      id: "rc" + Date.now(),
      propertyId: newReclass.propertyId,
      account: newReclass.account,
      amount: parseFloat(newReclass.amount) || 0,
      fromCategory: newReclass.fromCategory,
      toCategory: newReclass.toCategory,
      reason: newReclass.reason,
      status: "Requested",
      sentToPM: false,
    };
    const updated = [...reclassRequests, req];
    setReclassRequests(updated);
    saveReclassRequests(updated);
    setShowNewReclass(false);
    setNewReclass({ propertyId: "courtside", account: "", amount: "", fromCategory: "", toCategory: "", reason: "" });
  }

  const allReviews = useMemo(() => [...monthlyReviews, ...customReviews], [customReviews]);

  const rowData = useMemo(() => {
    const base = allReviews.map((r) => ({
      ...r,
      propertyName: propertyMap[r.propertyId] || r.propertyId,
      _isCustom: customReviewKeys.has(r.propertyId + "-" + r.month),
    }));
    if (propertyFilter === "all") return base;
    return base.filter((r) => r.propertyId === propertyFilter);
  }, [propertyFilter, propertyMap, allReviews, customReviewKeys]);

  function DeleteReviewRenderer(p: { data: any }) {
    if (!p.data._isCustom) return null;
    return (
      <button
        onClick={(e: any) => {
          e.stopPropagation();
          deleteCustomReview(p.data.propertyId, p.data.month);
        }}
        className="text-[10px] font-medium text-[#dc2626] hover:text-[#b91c1c] cursor-pointer"
      >
        Delete
      </button>
    );
  }

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
        { headerName: "", width: 60, cellRenderer: DeleteReviewRenderer, sortable: false, filter: false },
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
          return (
            <span className={`${color} font-medium`}>
              {v > 0 ? "+" : ""}
              {v}%
            </span>
          );
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
      { headerName: "", width: 65, cellRenderer: DeleteReviewRenderer, sortable: false, filter: false },
    ];
  }, [isMobile, customReviewKeys]);

  const reviewedProperties = useMemo(() => {
    const ids = [...new Set(allReviews.map((r) => r.propertyId))];
    return ids.map((id) => ({ id, name: propertyMap[id] || id }));
  }, [propertyMap, allReviews]);

  const content = tabContent[activeTab];

  const activeProperties = properties.filter((p) => p.status === "active" || p.status === "pre-conversion");

  const statusColors: Record<string, string> = {
    "On Track": "text-[#16a34a] bg-[#f0fdf4]",
    Complete: "text-[#4a6b6b] bg-[#f0f4f4]",
    "Due Today": "text-[#d97706] bg-[#fffbeb]",
    Overdue: "text-[#dc2626] bg-[#fef2f2]",
  };

  const reclassStatusColors: Record<string, string> = {
    Requested: "text-[#d97706] bg-[#fffbeb]",
    Approved: "text-[#16a34a] bg-[#f0fdf4]",
    Applied: "text-[#4a6b6b] bg-[#f0f4f4]",
  };

  const filteredReclass = propertyFilter === "all"
    ? reclassRequests
    : reclassRequests.filter((r) => r.propertyId === propertyFilter);

  return (
    <>
      <PageHeader
        title="Financial Review"
        subtitle="Christina's monthly financial package review hub"
      >
        <button
          onClick={() => setShowAddReview(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a6b6b] text-white text-[12px] font-medium rounded hover:bg-[#2a4040] transition-colors cursor-pointer"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Review
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2e2e] text-white text-[12px] font-medium rounded hover:bg-[#4a6b6b] transition-colors cursor-pointer"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          Upload Package
        </button>
      </PageHeader>

      {showUpload && <UploadPackageModal onClose={() => setShowUpload(false)} />}

      {/* Add Review Modal */}
      {showAddReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddReview(false)} />
          <div className="relative bg-white border border-[#d4dede] rounded w-full max-w-[520px] mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#d4dede]">
              <p className="text-[14px] font-semibold text-[#1a2e2e]">Add Monthly Review</p>
              <button onClick={() => setShowAddReview(false)} className="text-[#8aabab] hover:text-[#1a2e2e] cursor-pointer">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Property</label>
                  <select
                    value={newReview.propertyId}
                    onChange={(e) => setNewReview({ ...newReview, propertyId: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]"
                  >
                    {activeProperties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Month (YYYY-MM)</label>
                  <input
                    value={newReview.month}
                    onChange={(e) => setNewReview({ ...newReview, month: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]"
                    placeholder="2026-03"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Revenue</label>
                  <input type="number" value={newReview.revenue} onChange={(e) => setNewReview({ ...newReview, revenue: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]" placeholder="$0" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Expenses</label>
                  <input type="number" value={newReview.expenses} onChange={(e) => setNewReview({ ...newReview, expenses: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]" placeholder="$0" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">NOI</label>
                  <input type="number" value={newReview.noi} onChange={(e) => setNewReview({ ...newReview, noi: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]" placeholder="$0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Budget Var %</label>
                  <input type="number" step="0.1" value={newReview.budgetVariance} onChange={(e) => setNewReview({ ...newReview, budgetVariance: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]" placeholder="0.0" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Occupancy %</label>
                  <input type="number" step="0.1" value={newReview.occupancy} onChange={(e) => setNewReview({ ...newReview, occupancy: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]" placeholder="95.0" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Collections %</label>
                  <input type="number" step="0.1" value={newReview.collections} onChange={(e) => setNewReview({ ...newReview, collections: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]" placeholder="97.0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">DSCR</label>
                  <input type="number" step="0.01" value={newReview.dscr} onChange={(e) => setNewReview({ ...newReview, dscr: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]" placeholder="1.30" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Flags</label>
                  <input type="number" value={newReview.flagCount} onChange={(e) => setNewReview({ ...newReview, flagCount: e.target.value })}
                    className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#6b9b9b]" placeholder="0" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setShowAddReview(false)} className="text-[11px] text-[#5a7272] px-3 py-1 cursor-pointer">Cancel</button>
                <button
                  onClick={addReview}
                  disabled={!newReview.month || !newReview.revenue}
                  className="text-[11px] font-medium px-3 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors disabled:bg-[#d4dede] disabled:text-[#8aabab] disabled:cursor-not-allowed"
                >
                  Add Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Draft vs Final Review Workflow ── */}
      <div className="bg-white border border-[#d4dede] rounded p-4 mb-6">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">Review Cycle Timeline</h2>
        <p className="text-[11px] text-[#8aabab] mb-3">
          Draft: received 6th-8th, direction by 10th (2 bus. days) | Final: PM finalizes by 7 bus. days
        </p>
        <div className="space-y-2">
          {reviewCycles
            .filter((c) => propertyFilter === "all" || c.propertyId === propertyFilter)
            .map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 bg-[#f5f8f8] rounded text-[12px]">
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${
                  c.reviewType === "Draft" ? "bg-[#d97706]/10 text-[#d97706]" : "bg-[#4a6b6b]/10 text-[#4a6b6b]"
                }`}>
                  {c.reviewType}
                </span>
                <span className="font-medium text-[#1a2e2e] min-w-[140px]">{c.propertyName}</span>
                <span className="text-[#8aabab] min-w-[70px]">{c.month}</span>
                <span className="text-[#5a7272] min-w-[90px]">Recv: {c.receivedDate}</span>
                <span className="text-[#5a7272] min-w-[90px]">Due: {c.deadlineDate}</span>
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${statusColors[c.status] || ""}`}>
                  {c.status}
                </span>
                <span className="text-[11px] text-[#8aabab] ml-auto">{c.phase}</span>
              </div>
            ))}
        </div>
      </div>

      {/* ── AG Grid — Monthly Review Data ── */}
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

      {/* ── 7-Tab Review Dashboard ── */}
      <div className="bg-white border border-[#d4dede] rounded p-4 mb-6">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">Review Dashboard</h2>
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

      {/* ── Reclassification Request Workflow ── */}
      <div className="bg-white border border-[#d4dede] rounded p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium text-[#1a2e2e]">Reclassification Requests</h2>
          <button
            onClick={() => setShowNewReclass(true)}
            className="text-[11px] font-medium px-3 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors"
          >
            + New Request
          </button>
        </div>

        {showNewReclass && (
          <div className="border border-[#d4dede] rounded p-4 mb-4 bg-[#f5f8f8]">
            <p className="text-[12px] font-medium text-[#1a2e2e] mb-3">New Reclassification Request</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Property</label>
                <select
                  value={newReclass.propertyId}
                  onChange={(e) => setNewReclass({ ...newReclass, propertyId: e.target.value })}
                  className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#8aabab]"
                >
                  {activeProperties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Account</label>
                <input value={newReclass.account} onChange={(e) => setNewReclass({ ...newReclass, account: e.target.value })}
                  className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#8aabab]" placeholder="Account name" />
              </div>
              <div>
                <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Amount</label>
                <input value={newReclass.amount} onChange={(e) => setNewReclass({ ...newReclass, amount: e.target.value })}
                  className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#8aabab]" placeholder="$0" type="number" />
              </div>
              <div>
                <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">From Category</label>
                <input value={newReclass.fromCategory} onChange={(e) => setNewReclass({ ...newReclass, fromCategory: e.target.value })}
                  className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#8aabab]" placeholder="e.g. R&M" />
              </div>
              <div>
                <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">To Category</label>
                <input value={newReclass.toCategory} onChange={(e) => setNewReclass({ ...newReclass, toCategory: e.target.value })}
                  className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#8aabab]" placeholder="e.g. CapEx" />
              </div>
              <div>
                <label className="text-[10px] text-[#5a7272] uppercase tracking-wide block mb-1">Reason</label>
                <input value={newReclass.reason} onChange={(e) => setNewReclass({ ...newReclass, reason: e.target.value })}
                  className="w-full text-[12px] border border-[#d4dede] rounded px-2 py-1.5 bg-white outline-none focus:border-[#8aabab]" placeholder="Reason for reclassification" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewReclass(false)} className="text-[11px] text-[#5a7272] px-3 py-1 cursor-pointer">Cancel</button>
              <button
                onClick={addReclassRequest}
                disabled={!newReclass.account || !newReclass.amount}
                className="text-[11px] font-medium px-3 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors disabled:bg-[#d4dede] disabled:text-[#8aabab] disabled:cursor-not-allowed"
              >
                Add Request
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filteredReclass.map((req) => (
            <div key={req.id} className="flex items-center gap-3 py-2.5 px-3 bg-[#f5f8f8] rounded text-[12px]">
              <span className="font-medium text-[#1a2e2e] min-w-[120px]">{propertyMap[req.propertyId] || req.propertyId}</span>
              <span className="text-[#1a2e2e] flex-1 min-w-0">{req.account}</span>
              <span className="text-[#1a2e2e] font-medium shrink-0">{formatCurrency(req.amount)}</span>
              <span className="text-[#8aabab] shrink-0">{req.fromCategory} → {req.toCategory}</span>
              <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${reclassStatusColors[req.status] || ""}`}>
                {req.status}
              </span>
              <span className={`shrink-0 text-[10px] ${req.sentToPM ? "text-[#16a34a]" : "text-[#8aabab]"}`}>
                {req.sentToPM ? "Sent to PM" : "Not sent"}
              </span>
            </div>
          ))}
          {filteredReclass.length === 0 && (
            <p className="text-[12px] text-[#8aabab] py-4 text-center">No reclassification requests{propertyFilter !== "all" ? " for this property" : ""}.</p>
          )}
        </div>
      </div>

      {/* ── Email Composer ── */}
      <div className="bg-white border border-[#d4dede] rounded p-4">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">Email Composer</h2>
        <p className="text-[11px] text-[#8aabab] mb-3">
          Pre-generated directive email to PM company based on review findings. Select a property to generate.
        </p>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-[12px] font-medium text-[#5a7272]">Property:</label>
          <select
            value={emailProperty}
            onChange={(e) => setEmailProperty(e.target.value)}
            className="text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#8aabab]"
          >
            {activeProperties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={emailDraft}
          onChange={(e) => setEmailDraft(e.target.value)}
          rows={16}
          className="w-full text-[12px] text-[#1a2e2e] border border-[#d4dede] rounded px-3 py-2.5 bg-[#f7f8f8] outline-none focus:border-[#6b9b9b] resize-y font-mono leading-relaxed"
        />
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={copyEmail}
            className="text-[11px] font-medium px-4 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors"
          >
            {emailCopied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={() => setEmailDraft(buildEmailDraft(emailProperty, propertyMap))}
            className="text-[11px] text-[#5a7272] hover:text-[#1a2e2e] cursor-pointer"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </>
  );
}
