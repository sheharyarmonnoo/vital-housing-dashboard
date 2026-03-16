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

function generateDefaultReport(propertyId: string, quarter: string): string {
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
          return `<span style="padding:2px 8px;border-radius:3px;font-size:11px;font-weight:500;background:${c.bg};color:${c.fg}">${params.value}</span>`;
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
