"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  RowClickedEvent,
} from "ag-grid-community";
import { properties, investorReports, formatCurrency } from "@/data/portfolio";
import {
  investorReportSamples,
  type InvestorReportSample,
} from "@/data/investor-report-samples";
import PageHeader from "@/components/PageHeader";
import { FileText, X, ChevronRight } from "lucide-react";

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

/* ── Detail panel shown when a row with sample data is clicked ── */
function ReportDetailPanel({
  report,
  onClose,
}: {
  report: InvestorReportSample;
  onClose: () => void;
}) {
  const statusStyle: Record<string, string> = {
    published: "text-[#16a34a] bg-[#f0fdf4]",
    draft: "text-[#d97706] bg-[#fffbeb]",
    pending: "text-[#5a7272] bg-[#eaf0f0]",
  };

  return (
    <div className="bg-white border border-[#d4dede] rounded p-5 mt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-semibold text-[#1a2e2e]">
            {report.propertyName} — {report.quarter}
          </h3>
          <p className="text-[12px] text-[#5a7272] mt-0.5">
            {report.investorGroup}
            {report.publishedDate
              ? ` | Published ${report.publishedDate}`
              : " | Draft — not yet published"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded ${statusStyle[report.status] || ""}`}
          >
            {report.status}
          </span>
          <button
            onClick={onClose}
            className="text-[#5a7272] hover:text-[#1a2e2e] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Distribution", value: formatCurrency(report.distributionAmount) },
          { label: "Occupancy", value: `${report.occupancy}%` },
          { label: "NOI", value: formatCurrency(report.noi) },
          { label: "Collections", value: `${report.collections}%` },
          { label: "DSCR", value: `${report.dscr.toFixed(2)}x` },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#f5f8f8] rounded px-3 py-2">
            <p className="text-[10px] font-medium text-[#5a7272] uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className="text-[15px] font-semibold text-[#1a2e2e]">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Narrative */}
      <div className="mb-5">
        <h4 className="text-[12px] font-semibold text-[#1a2e2e] uppercase tracking-wide mb-2">
          Narrative Summary
        </h4>
        <p className="text-[13px] text-[#1a2e2e] leading-relaxed">
          {report.narrativeSummary}
        </p>
      </div>

      {/* Financial highlights */}
      <div className="mb-5">
        <h4 className="text-[12px] font-semibold text-[#1a2e2e] uppercase tracking-wide mb-2">
          Financial Highlights
        </h4>
        <ul className="space-y-1.5">
          {report.financialHighlights.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[13px] text-[#1a2e2e]"
            >
              <ChevronRight
                size={12}
                className="text-[#6b9b9b] mt-1 shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Capital projects */}
      <div>
        <h4 className="text-[12px] font-semibold text-[#1a2e2e] uppercase tracking-wide mb-2">
          Capital Projects
        </h4>
        <ul className="space-y-1.5">
          {report.capitalProjects.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[13px] text-[#1a2e2e]"
            >
              <ChevronRight
                size={12}
                className="text-[#6b9b9b] mt-1 shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Build a lookup from sample data ── */
const sampleLookup: Record<string, InvestorReportSample> = {};
investorReportSamples.forEach((s) => {
  sampleLookup[`${s.propertyId}-${s.quarter}`] = s;
});

/* ── Page ── */
export default function InvestorReportsPage() {
  const isMobile = useIsMobile();
  const gridRef = useRef<AgGridReact>(null);
  const [selectedReport, setSelectedReport] =
    useState<InvestorReportSample | null>(null);

  const propertyMap = useMemo(() => {
    const m: Record<string, string> = {};
    properties.forEach((p) => (m[p.id] = p.name));
    return m;
  }, []);

  const rowData = useMemo(
    () =>
      investorReports.map((r) => {
        const key = `${r.propertyId}-${r.quarter}`;
        return {
          ...r,
          propertyName: propertyMap[r.propertyId] || r.propertyId,
          reportKey: key,
          hasPreview: !!sampleLookup[key],
        };
      }),
    [propertyMap]
  );

  const columnDefs: ColDef[] = useMemo(() => {
    if (isMobile) {
      return [
        {
          field: "propertyName",
          headerName: "Property",
          flex: 1,
          minWidth: 120,
        },
        { field: "quarter", headerName: "Qtr", width: 80 },
        {
          field: "status",
          headerName: "Status",
          width: 90,
          cellRenderer: (p: any) => {
            const colors: Record<string, string> = {
              published: "text-[#16a34a]",
              draft: "text-[#d97706]",
              pending: "text-[#5a7272]",
            };
            return <span className={`${colors[p.value] || ""} text-[12px] font-medium capitalize`}>{p.value}</span>;
          },
        },
      ];
    }
    return [
      {
        field: "propertyName",
        headerName: "Property",
        flex: 1,
        minWidth: 160,
      },
      { field: "quarter", headerName: "Quarter", width: 110 },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            published: "text-[#16a34a]",
            draft: "text-[#d97706]",
            pending: "text-[#5a7272]",
          };
          const bg: Record<string, string> = {
            published: "bg-[#f0fdf4]",
            draft: "bg-[#fffbeb]",
            pending: "bg-[#eaf0f0]",
          };
          return <span className={`${colors[p.value] || ""} ${bg[p.value] || ""} text-[11px] font-medium capitalize px-2 py-0.5 rounded`}>{p.value}</span>;
        },
      },
      {
        field: "distributionAmount",
        headerName: "Distribution",
        width: 120,
        valueFormatter: (p: any) =>
          p.value > 0 ? formatCurrency(p.value) : "--",
        type: "numericColumn",
      },
      {
        field: "publishedDate",
        headerName: "Published",
        width: 120,
        valueFormatter: (p: any) => p.value || "--",
      },
    ];
  }, [isMobile]);

  const published = investorReports.filter((r) => r.status === "published");

  return (
    <>
      <PageHeader
        title="Investor Reports"
        subtitle="Quarterly report schedule and distribution tracking"
      >
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2e2e] text-white text-[12px] font-medium rounded hover:bg-[#4a6b6b] transition-colors">
          <FileText size={13} />
          Generate Report
        </button>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#d4dede] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide">
            Published
          </p>
          <p className="text-[20px] font-semibold text-[#16a34a]">
            {published.length}
          </p>
        </div>
        <div className="bg-white border border-[#d4dede] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide">
            Drafts
          </p>
          <p className="text-[20px] font-semibold text-[#d97706]">
            {investorReports.filter((r) => r.status === "draft").length}
          </p>
        </div>
        <div className="bg-white border border-[#d4dede] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide">
            Pending
          </p>
          <p className="text-[20px] font-semibold text-[#5a7272]">
            {investorReports.filter((r) => r.status === "pending").length}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#d4dede] rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-[#5a7272]">
            Click a row to view the full report detail
          </p>
          {selectedReport && (
            <button
              onClick={() => setSelectedReport(null)}
              className="text-[11px] text-[#5a7272] hover:text-[#1a2e2e] cursor-pointer"
            >
              Close detail
            </button>
          )}
        </div>
        <div
          className="ag-theme-alpine"
          style={{ height: 360, width: "100%" }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
            animateRows
            suppressCellFocus
            onRowClicked={(e: RowClickedEvent) => {
              const data = e.data;
              if (data && data.hasPreview) {
                setSelectedReport(sampleLookup[data.reportKey]);
              }
            }}
          />
        </div>
      </div>

      {/* Detail panel */}
      {selectedReport && (
        <ReportDetailPanel
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
}
