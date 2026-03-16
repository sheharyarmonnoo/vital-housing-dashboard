"use client";
import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";
import {
  properties,
  investorReports,
  monthlyReviews,
  formatCurrency,
  type InvestorReport,
} from "@/data/portfolio";

ModuleRegistry.registerModules([AllCommunityModule]);

interface ReportRow {
  id: string;
  property: string;
  propertyId: string;
  quarter: string;
  status: string;
  distribution: number;
  publishedDate: string;
  investorGroup: string;
}

function buildRows(): ReportRow[] {
  return investorReports.map((r, i) => {
    const prop = properties.find((p) => p.id === r.propertyId);
    return {
      id: `${r.propertyId}-${r.quarter}-${i}`,
      property: prop?.name || r.propertyId,
      propertyId: r.propertyId,
      quarter: r.quarter,
      status: r.status,
      distribution: r.distributionAmount,
      publishedDate: r.publishedDate || "",
      investorGroup: prop?.investorGroup || "",
    };
  });
}

const DRAFT_KEY = "vital_report_drafts";

function loadDraft(reportId: string): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const drafts = raw ? JSON.parse(raw) : {};
    return drafts[reportId] || "";
  } catch {
    return "";
  }
}

function saveDraft(reportId: string, text: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const drafts = raw ? JSON.parse(raw) : {};
    drafts[reportId] = text;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  } catch {}
}

// Real investor report data from actual PDF files provided by Vital Housing
const REAL_REPORTS: Record<string, string> = {
  "courtside-Q3 2025": `QUARTERLY INVESTOR REPORT — Q3 2025
Courtside Apartments
Prepared by: Christina Adams + Randall McElfresh, Vital Housing
==================================================================

SUMMARY STATISTICS
  Property Name:        Courtside Apartments
  Address:              515 Courtside St SW, Olympia, WA
  Unit Count:           211
  Year Built:           1996
  Occupancy:            97.63%
  Pre-Leased:           98.58%

INVESTMENT DETAILS
  Investment Close:     January 17, 2025
  Acquisition Price:    $31,750,000
  Outstanding Equity:   $10,835,000
  Distributions to Date: $253,268

CURRENT LOAN DETAILS
  Loan Amount:          $22,500,000
  Lender:               NEF
  Term:                 5 Years
  Rate:                 Fixed, 7.02%
  Mortgage Maturity:    January 16, 2030

EXECUTIVE SUMMARY

Courtside Apartments continues to demonstrate strong operational performance in Q3 2025, maintaining high occupancy at 97.63% and lease rates at 98.58%. The property's strategic location in Olympia continues to benefit from regional economic stability and measured development growth. Capital projects are progressing on schedule, enhancing both operational efficiency and tenant satisfaction. The property remains well-positioned to capture continued demand in this fundamentally sound market.

FINANCIAL PERFORMANCE (9/30 YTD)

  Line Item                    | YTD Actual  | YTD Budget  | Var to Budget | Var %
  -----------------------------|-------------|-------------|---------------|-------
  REVENUE
    Rental Income              | 2,377,939   | 2,413,691   | (36,052)      | -1.5%
    Economic Loss              | (97,542)    | (145,698)   | 48,156        | -33.0%
    Other Income               | 215,322     | 123,291     | 92,031        | 74.6%
  Total Income                 | 2,495,718   | 2,391,284   | 104,434       | 4.4%

  EXPENSES
    Payroll                    | 273,335     | 283,276     | 8,444         | 3.0%
    Management                 | 63,852      | 60,613      | (3,239)       | -5.3%
    Admin                      | 58,759      | 67,041      | 8,047         | 12.0%
    Marketing                  | 2,334       | 9,475       | 7,141         | 75.4%
    Utilities                  | 227,740     | 207,919     | (20,658)      | -9.8%
    Repairs & Maintenance      | 45,469      | 93,486      | 47,287        | 50.6%
    Taxes/Insurance            | 104,343     | 92,016      | (12,271)      | -13.3%
  Total Expenses               | 844,758     | 903,328     | 58,548        | 6.5%

  Net Operating Income         | 1,650,960   | 1,487,958   | 163,002       | 11.0%

  NON-OPERATING
    Reserve Deposits           | 44,838      | 44,838      | —             | 0.0%
    CAPEX                      | 19,975      | 52,211      | 32,236        | 61.7%
    Planned Capital Expenses   | 302,966     | 465,000     | 162,034       | 34.8%
    Renovation Reserve Withdrawal | (302,966) | (465,000)   | 162,034       | 34.8%
    Principal & Interest       | 1,156,320   | 1,193,009   | 36,689        | 3.1%
  Total Non-Operating          | 1,253,206   | 1,290,538   | 36,852        | 2.9%

  Net Cash Flow                | 397,754     | 197,900     | 199,854       | 101.0%

MARKET ANALYSIS

Olympia's multifamily market remains steady, with vacancy holding near 5% and average asking rents around $1,510 as of October 2025. Annual rent growth has moderated to 3-4%, reflecting balanced demand amid measured new supply. Development is selective, most new deliveries are concentrated in Lacey and Tumwater, while Olympia itself sees limited pipeline pressure. Demand is anchored by state government employment, healthcare, and higher education, providing a stable tenant base and consistent absorption.

OPERATIONS & LEASING UPDATE

Courtside Apartments remains strong at 97.63% occupancy and 98.58% leased, with stable leasing activity and active compliance management. The Utility Allowance (UA) change was effective in May 2025, and all new move-ins are achieving maximum tax credit rents with ECM UA's. Currently, four households are in eviction status, totaling $14,874 in outstanding balances, with remaining balances within 30 days. Management is enforcing an aggressive collection policy, particularly in light of the Olympia Rental Housing Code.

CAPITAL PROJECTS SUMMARY — Q3 2025

  Project Name                   | Budget    | Actual    | Variance  | Status
  -------------------------------|-----------|-----------|-----------|----------
  Toilet / Aerator Upgrades      | $127,897  | $127,897  | $0        | Complete
  Landscaping Mulch Application  | $18,941   | $18,940   | $1        | Complete
  Roof & Gutter Cleaning         | $14,659   | $14,659   | $0        | Complete
  Moss Treatment                 | $3,298    | $3,238    | $60       | Complete
  Pool Heat Pump Water Heater    | $17,324   | $17,324   | $0        | Complete
  Locking Gate / Camera at Pool  | $17,944   | $19,332   | ($1,388)  | Complete
  Tree Trimming                  | $17,409   | $16,229   | $1,180    | Complete
  Utility Gator Replacement      | $16,025   | $16,025   | $0        | Complete
  Flock Safety Installation      | $11,092   | $0        | $11,092   | In Progress
  Pressure Washing               | $24,285   | $1,685    | $22,600   | In Progress
  Storm Drain & Sewer Clean Out  | $15,000   | $13,164   | $1,836    | Complete
  Exterior LED Lighting          | $25,000   | $0        | $25,000   | Deferred
  Asphalt Repair, Sealing        | $41,520   | $0        | $41,520   | Deferred
  Unit Turnover                  | $93,586   | $52,565   | $41,021   | In Progress
  Construction Management Fee    | $21,020   | $1,908    | $19,112   | In Progress
  TOTAL CAPITAL PROJECTS         | $465,000  | $302,966  | $162,034  | 65% Complete

OUTLOOK & NEXT STEPS (Q4 2025)
• Completion of Phase 2 capital improvements and weatherization program
• Continuing targeted interior unit updates and amenity enhancements
• Reallocation of deferred renovation budget/reconciliation to occur in Q4
• Finalizing recruitment for full-time maintenance technician position
• Continue to maximize resident renewals to LIHTC max where possible

This report contains confidential and proprietary information. Distribution is restricted to authorized investors and stakeholders only.`,

  "belmont-Q3 2025": `QUARTERLY INVESTOR REPORT — Q3 2025
Belmont Dairy
Prepared by: Vital Housing
==================================================================

PROPERTY DETAILS
  Property Name:        Belmont Dairy
  Address:              3340 Morrison St, Portland, OR
  Unit Count:           85 Residential, 5 Commercial
  Year Built:           1996
  Occupancy:            100%

INVESTMENT DETAILS
  Investment Close:     January 23, 2025
  Acquisition Price:    $21,700,000
  Outstanding Equity:   $4,145,232
  Distributions to Date: $262,187

CURRENT LOAN DETAILS
  Loan Amount:          $13,862,000
  Lender:               Berkadia
  Term:                 10 Years (I/O ends 2/28/2031)
  Rate:                 Fixed, 5.7%
  Amortization Period:  35 years
  Mortgage Maturity:    February 1, 2035

EXECUTIVE SUMMARY

Belmont Dairy continues to demonstrate strong operational performance in Q3 2025, maintaining exceptional occupancy at 100% with both upcoming vacancies pre-leased at or above proforma rents. The property's strategic location in Portland's Sunnyside submarket continues to benefit from the area's walkability, boutique retail corridor, and transit access. All five commercial tenants remain current and stable. Capital projects progressed through Q3 with Phase 1 improvements completed while seeking funding for comprehensive decarbonization initiatives.

FINANCIAL PERFORMANCE (YTD)

  Line Item                    | YTD Actual  | YTD Budget  | Var to Budget | Var %
  -----------------------------|-------------|-------------|---------------|-------
  REVENUE
    Rental Income              | 991,060     | 986,787     | 4,273         | 0.43%
    Economic Loss              | (32,525)    | (41,831)    | 9,306         | 22.25%
    Other Income               | 102,405     | 123,102     | (20,697)      | -16.81%
  Total Income                 | 1,513,500   | 1,551,847   | (38,347)      | -2.47%

  EXPENSES
    Payroll                    | 117,366     | 158,182     | 40,816        | 25.80%
    Management                 | 52,211      | 52,882      | 671           | 1.27%
    Admin                      | 36,347      | 34,020      | (2,327)       | -6.84%
    Marketing                  | 3,087       | 7,493       | 4,406         | 58.80%
    Utilities                  | 114,733     | 121,281     | 6,548         | 5.40%
    Repairs & Maintenance      | 60,777      | 55,753      | (5,024)       | -9.01%
    Taxes/Insurance            | 157,810     | 201,169     | 43,359        | 21.56%
  Total Expenses               | 545,326     | 650,540     | 105,214       | 16.17%

  Net Operating Income         | 968,173     | 901,307     | 66,866        | 7.42%

  NON-OPERATING
    Reserve Deposits           | 17,353      | 17,353      | —             | —
    CAPEX                      | 14,023      | 17,353      | 3,330         | 19.19%
    Planned Capital Expenses   | 146,975     | 146,975     | —             | —
    Renovation Reserve Withdrawal | (146,975) | (146,975)   | —             | —
    Interest Only              | 485,055     | 506,567     | 21,512        | 4.25%
  Total Non-Operating          | 516,431     | 541,273     | 24,842        | 4.59%

  Net Cash Flow                | 451,742     | 360,034     | 91,708        | 25.47%

MARKET ANALYSIS

The Sunnyside neighborhood near Belmont Dairy is seeing renewed stability within Portland's core multifamily market. Vacancy sits near the metro average of 7.5-8%, supported by steady absorption and limited new deliveries in nearby submarkets such as Hawthorne and Buckman. Rent growth has flattened around 0-1%, with leasing activity improving thanks to the area's walkability, boutique retail corridor, and access to transit.

OPERATIONS & LEASING UPDATE

The property continues to perform well, maintaining 100% occupancy with leasing activity at or above targeted rent levels. Both upcoming vacancies are pre-leased at or above proforma rents. In June, Belmont was approved for Portland's RAMP (Regulated Affordable Multifamily Assistance Program) Tier B utility discount, effective July 1, 2025, providing 35% savings on sewer/stormwater and 14% on water charges.

CAPITAL PROJECTS SUMMARY — Q3 2025

  Project Name                   | Budget    | Actual    | Status
  -------------------------------|-----------|-----------|------------------
  Tree Trimming                  | $20,000   | $17,649   | In Progress
  HVAC                           | $103,000  | $11,724   | Completed/Deferred
  Awnings/Balconies/Metal Rail   | $42,000   | $6,487    | Completed/Deferred
  Skylights                      | $33,000   | $0        | In Progress
  Roofing Work                   | $10,000   | $10,894   | In Progress
  Gate Sensors                   | $2,200    | $0        | In Progress
  Plumbing (Proactive/Repair)    | $41,189   | $50,422   | In Progress
  Maintenance Area Reconfigure   | $37,800   | $15,757   | Completed
  Flooring - Affordable/Lot      | $10,000   | $7,731    | In Progress
  Loft Upgrades on Turnover      | $15,000   | $599      | In Progress
  Painting                       | $25,000   | $7,986    | In Progress
  Appliances                     | $28,000   | $11,106   | In Progress
  Interior Lighting              | $10,000   | $3,911    | Completed/Deferred
  MEP Design                     | $6,794    | $0        | In Progress
  CM Fee                         | $19,199   | $2,708    | In Progress
  TOTAL CAPITAL PROJECTS         | $403,182  | $146,975  | 36% Complete

OUTLOOK & NEXT STEPS (Q4 2025)
• Completion of targeted roof repairs, skylight replacements
• Planning for 2026 exterior painting project
• Awaiting PCEF funding decision (expected late October/early November) for decarbonization Phase 2
• Resolution of outstanding subsidy and invoice reimbursements from seller
• Continuing strong leasing performance, maximizing rents at renewal
• Monitoring Portland market conditions and lease rate opportunities

This report contains confidential and proprietary information. Distribution is restricted to authorized investors and stakeholders only.`,
};

function generateDefaultReport(propertyId: string, quarter: string): string {
  // Check for real report data first
  const realKey = `${propertyId}-${quarter}`;
  if (REAL_REPORTS[realKey]) return REAL_REPORTS[realKey];

  // Fallback: generate from data
  const prop = properties.find((p) => p.id === propertyId);
  if (!prop) return "No data available.";

  const reviews = monthlyReviews
    .filter((r) => r.propertyId === propertyId)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 3);

  const avgOcc =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.occupancy, 0) / reviews.length) * 10) / 10
      : prop.occupancy;
  const avgNOI =
    reviews.length > 0
      ? Math.round(reviews.reduce((s, r) => s + r.noi, 0) / reviews.length)
      : Math.round(prop.noi / 12);
  const avgColl =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.collections, 0) / reviews.length) * 10) / 10
      : 0;
  const avgDSCR =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.dscr, 0) / reviews.length) * 100) / 100
      : 0;

  return `${prop.name} — ${quarter} Investor Report
${prop.investorGroup}
${"=".repeat(50)}

EXECUTIVE SUMMARY

${prop.name} (${prop.units} units, ${prop.location}) delivered steady operating performance during ${quarter}. Average occupancy held at ${avgOcc}%, and monthly NOI averaged ${formatCurrency(avgNOI)} over the reporting period. Collections averaged ${avgColl}%, with a debt service coverage ratio of ${avgDSCR.toFixed(2)}x.

${prop.managementTransition ? "Note: This property is currently undergoing a management transition. Additional oversight protocols are in place during this period.\n" : ""}
FINANCIAL PERFORMANCE

  Metric              | Value
  --------------------|------------------
  Average Occupancy   | ${avgOcc}%
  Monthly NOI (avg)   | ${formatCurrency(avgNOI)}
  Annual NOI (proj)   | ${formatCurrency(avgNOI * 12)}
  Collections Rate    | ${avgColl}%
  DSCR                | ${avgDSCR.toFixed(2)}x
  PM System           | ${prop.pmSystem}

MONTHLY DETAIL

${reviews
  .map(
    (r) =>
      `  ${r.month}: Revenue ${formatCurrency(r.revenue)} | Expenses ${formatCurrency(r.expenses)} | NOI ${formatCurrency(r.noi)} | Budget Var ${r.budgetVariance > 0 ? "+" : ""}${r.budgetVariance}%`
  )
  .join("\n")}

OUTLOOK

The property management team continues to execute on the operating plan.${
    prop.managementTransition
      ? " The upcoming management transition is being closely monitored to ensure continuity of operations."
      : ""
  } We expect stable performance through the next quarter barring unexpected market disruptions.

---
Prepared by Vital Housing Group
Director of Finance: Christina Adams`;
}

export default function DocumentsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [editText, setEditText] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const rows = useMemo(() => buildRows(), []);

  const columnDefs = useMemo<ColDef<ReportRow>[]>(
    () => [
      { field: "property", headerName: "Property", flex: 2, minWidth: 150 },
      { field: "quarter", headerName: "Quarter", width: 110 },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        cellRenderer: (params: { value: string }) => {
          const colors: Record<string, { bg: string; fg: string }> = {
            published: { bg: "#e8f5e9", fg: "#2e7d32" },
            draft: { bg: "#e8f0fe", fg: "#1565c0" },
            pending: { bg: "#fff3e0", fg: "#e65100" },
          };
          const c = colors[params.value] || colors.pending;
          return <span style={{ padding: "2px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: 500, background: c.bg, color: c.fg }}>{params.value}</span>;
        },
      },
      {
        field: "distribution",
        headerName: "Distribution",
        width: 130,
        valueFormatter: (p: { value: number }) =>
          p.value ? formatCurrency(p.value) : "TBD",
      },
      { field: "investorGroup", headerName: "Investor Group", flex: 1, minWidth: 140 },
      { field: "publishedDate", headerName: "Published", width: 120 },
    ],
    []
  );

  const onRowClicked = useCallback((e: { data: ReportRow | undefined }) => {
    if (e.data) {
      const report = e.data;
      setSelectedReport(report);
      const saved = loadDraft(report.id);
      setEditText(
        saved || generateDefaultReport(report.propertyId, report.quarter)
      );
      setIsSaved(false);
      setDrawerOpen(true);
    }
  }, []);

  function handleSave() {
    if (selectedReport) {
      saveDraft(selectedReport.id, editText);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  }

  return (
    <>
      <PageHeader
        title="Document Studio"
        subtitle="Investor reports — click a row to preview and edit"
      >
        <button
          onClick={() => {
            setSelectedReport({
              id: `new-${Date.now()}`,
              property: "New Report",
              propertyId: "",
              quarter: "Q1 2026",
              status: "draft",
              distribution: 0,
              publishedDate: "",
              investorGroup: "",
            });
            setEditText(
              "# New Investor Report\n\nProperty: \nQuarter: Q1 2026\n\n---\n\nEnter report content here..."
            );
            setIsSaved(false);
            setDrawerOpen(true);
          }}
          style={{
            padding: "7px 14px",
            fontSize: "12px",
            fontWeight: 500,
            background: "#1a2e2e",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Create New Report
        </button>
      </PageHeader>

      <div className="overflow-auto rounded border border-[#d4dede]">
        <div className="ag-theme-alpine" style={{ width: "100%", minWidth: "600px", height: "400px" }}>
          <AgGridReact<ReportRow>
            rowData={rows}
            columnDefs={columnDefs}
            onRowClicked={onRowClicked}
            suppressCellFocus
            animateRows={false}
          />
        </div>
      </div>

      {/* Report editor drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          selectedReport
            ? `${selectedReport.property} — ${selectedReport.quarter}`
            : "Report"
        }
        width="700px"
      >
        {selectedReport && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Status bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                gap: "8px",
              }}
            >
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "3px",
                  fontSize: "11px",
                  fontWeight: 500,
                  background:
                    selectedReport.status === "published"
                      ? "#e8f5e9"
                      : selectedReport.status === "draft"
                      ? "#e8f0fe"
                      : "#fff3e0",
                  color:
                    selectedReport.status === "published"
                      ? "#2e7d32"
                      : selectedReport.status === "draft"
                      ? "#1565c0"
                      : "#e65100",
                }}
              >
                {selectedReport.status}
              </span>
              {selectedReport.distribution > 0 && (
                <span style={{ fontSize: "12px", color: "#5a7272" }}>
                  Distribution: {formatCurrency(selectedReport.distribution)}
                </span>
              )}
            </div>

            {/* Editor */}
            <textarea
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                setIsSaved(false);
              }}
              style={{
                flex: 1,
                minHeight: "400px",
                fontSize: "13px",
                lineHeight: "1.7",
                padding: "16px",
                border: "1px solid #d4dede",
                borderRadius: "4px",
                resize: "vertical",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                color: "#1a2e2e",
                background: "#fafbfb",
              }}
            />

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleSave}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: "#1a2e2e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save Draft
              </button>
              <button
                onClick={() => {
                  handleSave();
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: "#2e7d32",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Publish
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([editText], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${selectedReport.property}_${selectedReport.quarter}_report.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: "#fff",
                  color: "#1a2e2e",
                  border: "1px solid #d4dede",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Export
              </button>
              {isSaved && (
                <span style={{ fontSize: "12px", color: "#2e7d32", marginLeft: "8px" }}>
                  Saved
                </span>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
