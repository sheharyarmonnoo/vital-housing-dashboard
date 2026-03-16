"use client";
import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";
import {
  properties,
  monthlyReviews,
  actionItems,
  formatCurrency,
} from "@/data/portfolio";

ModuleRegistry.registerModules([AllCommunityModule]);

interface InboxPackage {
  id: string;
  property: string;
  propertyId: string;
  month: string;
  status: "pending" | "draft" | "reviewed";
  revenue: number;
  noi: number;
  flagCount: number;
  daysWaiting: number;
}

function daysSince(dateStr: string): number {
  if (!dateStr) return 999;
  const d = new Date(dateStr + "-01");
  const now = new Date("2026-03-16");
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
}

function buildPackages(): InboxPackage[] {
  const latest = new Map<string, typeof monthlyReviews[0]>();
  for (const r of monthlyReviews) {
    const existing = latest.get(r.propertyId);
    if (!existing || r.month > existing.month) {
      latest.set(r.propertyId, r);
    }
  }

  return [...latest.values()].map((r) => {
    const prop = properties.find((p) => p.id === r.propertyId);
    return {
      id: `${r.propertyId}-${r.month}`,
      property: prop?.name || r.propertyId,
      propertyId: r.propertyId,
      month: r.month,
      status: r.status,
      revenue: r.revenue,
      noi: r.noi,
      flagCount: r.flagCount,
      daysWaiting: daysSince(r.month),
    };
  });
}

const recentActivity = [
  { time: "Mar 15, 10:42 AM", event: "Courtside Feb financial package uploaded to Yardi", type: "upload" },
  { time: "Mar 15, 9:15 AM", event: "Valencia Feb review marked complete", type: "review" },
  { time: "Mar 14, 4:30 PM", event: "Belmont Q4 investor report draft saved", type: "report" },
  { time: "Mar 14, 2:10 PM", event: "Coronado PM follow-up email sent to Cascade Living", type: "email" },
  { time: "Mar 13, 11:00 AM", event: "Orchard Park pre-conversion GL mapping started", type: "task" },
  { time: "Mar 12, 3:45 PM", event: "LEDG Cedar Heights Feb package received", type: "upload" },
  { time: "Mar 12, 9:00 AM", event: "Courtside Q4 2025 investor report published", type: "report" },
  { time: "Mar 11, 2:00 PM", event: "LP Texas portfolio Q4 distribution confirmed", type: "report" },
  { time: "Mar 10, 10:30 AM", event: "Alderwood Park rent comp analysis updated", type: "task" },
  { time: "Mar 9, 4:00 PM", event: "LEDG Summit Ridge Feb review flagged 0 items", type: "review" },
];

export default function InboxPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<InboxPackage | null>(null);

  const packages = useMemo(() => buildPackages(), []);

  const pendingCount = packages.filter((p) => p.status === "pending").length;
  const needsReviewCount = properties.filter(
    (p) => p.reviewStatus === "overdue" || p.reviewStatus === "pending"
  ).length;
  const lastCloseDate = properties
    .filter((p) => p.status === "active" && p.lastReviewDate)
    .map((p) => p.lastReviewDate)
    .sort()
    .reverse()[0];
  const daysSinceClose = lastCloseDate
    ? Math.floor(
        (new Date("2026-03-16").getTime() -
          new Date(lastCloseDate).getTime()) /
          86400000
      )
    : 0;

  const columnDefs = useMemo<ColDef<InboxPackage>[]>(
    () => [
      { field: "property", headerName: "Property", flex: 2, minWidth: 150 },
      { field: "month", headerName: "Month", width: 110 },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        cellRenderer: (params: { value: string }) => {
          const colors: Record<string, { bg: string; fg: string }> = {
            pending: { bg: "#fff3e0", fg: "#e65100" },
            draft: { bg: "#e8f0fe", fg: "#1565c0" },
            reviewed: { bg: "#e8f5e9", fg: "#2e7d32" },
          };
          const c = colors[params.value] || colors.pending;
          return `<span style="padding:2px 8px;border-radius:3px;font-size:11px;font-weight:500;background:${c.bg};color:${c.fg}">${params.value}</span>`;
        },
      },
      {
        field: "revenue",
        headerName: "Revenue",
        width: 120,
        valueFormatter: (p: { value: number }) => formatCurrency(p.value),
      },
      {
        field: "noi",
        headerName: "NOI",
        width: 110,
        valueFormatter: (p: { value: number }) => formatCurrency(p.value),
      },
      {
        field: "flagCount",
        headerName: "Flags",
        width: 80,
        cellRenderer: (params: { value: number }) => {
          if (!params.value) return "-";
          return `<span style="color:#c62828;font-weight:600">${params.value}</span>`;
        },
      },
    ],
    []
  );

  const onRowClicked = useCallback((e: { data: InboxPackage | undefined }) => {
    if (e.data) {
      setSelectedPkg(e.data);
      setDrawerOpen(true);
    }
  }, []);

  const selectedProp = selectedPkg
    ? properties.find((p) => p.id === selectedPkg.propertyId)
    : null;
  const selectedReviews = selectedPkg
    ? monthlyReviews
        .filter((r) => r.propertyId === selectedPkg.propertyId)
        .sort((a, b) => b.month.localeCompare(a.month))
    : [];

  return (
    <>
      <PageHeader
        title="Inbox"
        subtitle="Financial packages, PM responses, and items needing review"
      />

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Packages in queue", value: String(pendingCount), color: pendingCount > 2 ? "#c62828" : "#1a2e2e" },
          { label: "Properties needing review", value: String(needsReviewCount), color: needsReviewCount > 2 ? "#e65100" : "#1a2e2e" },
          { label: "Days since last close", value: String(daysSinceClose), color: daysSinceClose > 30 ? "#c62828" : "#1a2e2e" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fff",
              border: "1px solid #d4dede",
              borderRadius: "4px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{ fontSize: "10px", color: "#5a7272", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}
            >
              {kpi.label}
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: 700, color: kpi.color, marginTop: "4px", lineHeight: 1 }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Packages grid */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#1a2e2e", marginBottom: "8px" }}>
          Financial Packages
        </h2>
        <div className="ag-theme-alpine" style={{ width: "100%", height: "300px" }}>
          <AgGridReact<InboxPackage>
            rowData={packages}
            columnDefs={columnDefs}
            onRowClicked={onRowClicked}
            suppressCellFocus
            animateRows={false}
          />
        </div>
      </div>

      {/* Action items */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#1a2e2e", marginBottom: "8px" }}>
          Action Items
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {actionItems.slice(0, 5).map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                background: "#fff",
                border: "1px solid #d4dede",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background:
                    item.priority === "high"
                      ? "#c62828"
                      : item.priority === "medium"
                      ? "#e65100"
                      : "#5a7272",
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, color: "#1a2e2e" }}>
                {item.description}
              </span>
              <span style={{ fontSize: "11px", color: "#5a7272", flexShrink: 0 }}>
                {item.dueDate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#1a2e2e", marginBottom: "8px" }}>
          Recent Activity
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {recentActivity.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "8px 14px",
                background: i % 2 === 0 ? "#fff" : "#f7f8f8",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  color: "#5a7272",
                  fontSize: "11px",
                  minWidth: "120px",
                  flexShrink: 0,
                }}
              >
                {item.time}
              </span>
              <span style={{ color: "#1a2e2e" }}>{item.event}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Package detail drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedPkg ? `${selectedPkg.property} — ${selectedPkg.month}` : ""}
      >
        {selectedPkg && selectedProp && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Status", value: selectedPkg.status },
                { label: "Flags", value: String(selectedPkg.flagCount) },
                { label: "Revenue", value: formatCurrency(selectedPkg.revenue) },
                { label: "NOI", value: formatCurrency(selectedPkg.noi) },
                { label: "Occupancy", value: `${selectedProp.occupancy}%` },
                { label: "PM System", value: selectedProp.pmSystem },
              ].map((kv) => (
                <div key={kv.label}>
                  <div style={{ fontSize: "10px", color: "#5a7272", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>
                    {kv.label}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#1a2e2e", marginTop: "2px" }}>
                    {kv.value}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e2e", marginBottom: "8px" }}>
              Review History
            </h3>
            <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #d4dede" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: "#5a7272", fontWeight: 500, fontSize: "11px", textTransform: "uppercase" }}>Month</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "#5a7272", fontWeight: 500, fontSize: "11px", textTransform: "uppercase" }}>NOI</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "#5a7272", fontWeight: 500, fontSize: "11px", textTransform: "uppercase" }}>Occ</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "#5a7272", fontWeight: 500, fontSize: "11px", textTransform: "uppercase" }}>DSCR</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "#5a7272", fontWeight: 500, fontSize: "11px", textTransform: "uppercase" }}>Coll</th>
                  <th style={{ textAlign: "center", padding: "6px 8px", color: "#5a7272", fontWeight: 500, fontSize: "11px", textTransform: "uppercase" }}>Flags</th>
                </tr>
              </thead>
              <tbody>
                {selectedReviews.map((r) => (
                  <tr key={r.month} style={{ borderBottom: "1px solid #f0f4f4" }}>
                    <td style={{ padding: "6px 8px", color: "#1a2e2e" }}>{r.month}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{formatCurrency(r.noi)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{r.occupancy}%</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{r.dscr.toFixed(2)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{r.collections}%</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", color: r.flagCount > 0 ? "#c62828" : "#5a7272" }}>
                      {r.flagCount || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Drawer>
    </>
  );
}
