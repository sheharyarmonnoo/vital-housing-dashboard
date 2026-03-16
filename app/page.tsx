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
  status: "pending" | "draft" | "reviewed" | "ignored";
  revenue: number;
  noi: number;
  flagCount: number;
  daysWaiting: number;
  source: "ai" | "manual";
  confidence?: number; // AI confidence 0-100
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
      source: "ai" as const,
      confidence: Math.floor(85 + Math.random() * 15), // 85-100% AI confidence
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

const INBOX_KEY = "vital_inbox_overrides";
function loadInboxOverrides(): Record<string, { propertyId?: string; status?: string }> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(INBOX_KEY) || "{}"); } catch { return {}; }
}
function saveInboxOverrides(data: Record<string, { propertyId?: string; status?: string }>) {
  if (typeof window !== "undefined") localStorage.setItem(INBOX_KEY, JSON.stringify(data));
}

const MANUAL_INBOX_KEY = "vital_manual_inbox";
function loadManualItems(): InboxPackage[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(MANUAL_INBOX_KEY) || "[]"); } catch { return []; }
}
function saveManualItems(items: InboxPackage[]) {
  if (typeof window !== "undefined") localStorage.setItem(MANUAL_INBOX_KEY, JSON.stringify(items));
}

export default function InboxPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<InboxPackage | null>(null);
  const [showManualFlag, setShowManualFlag] = useState(false);
  const [manualProp, setManualProp] = useState("");
  const [manualMonth, setManualMonth] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [reassignProp, setReassignProp] = useState("");
  const [version, setVersion] = useState(0);

  const packages = useMemo(() => {
    const aiPackages = buildPackages();
    const manualItems = typeof window !== "undefined" ? loadManualItems() : [];
    const overrides = typeof window !== "undefined" ? loadInboxOverrides() : {};

    // Apply overrides (reassign, ignore)
    const merged = [...aiPackages, ...manualItems].map(pkg => {
      const override = overrides[pkg.id];
      if (!override) return pkg;
      const newPropId = override.propertyId || pkg.propertyId;
      const newProp = properties.find(p => p.id === newPropId);
      return {
        ...pkg,
        propertyId: newPropId,
        property: newProp?.name || pkg.property,
        status: (override.status as InboxPackage["status"]) || pkg.status,
      };
    });

    return merged.filter(p => p.status !== "ignored");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  function handleManualFlag() {
    if (!manualProp || !manualMonth) return;
    const prop = properties.find(p => p.id === manualProp);
    const item: InboxPackage = {
      id: `manual-${Date.now()}`,
      property: prop?.name || manualProp,
      propertyId: manualProp,
      month: manualMonth,
      status: "pending",
      revenue: 0,
      noi: 0,
      flagCount: 0,
      daysWaiting: 0,
      source: "manual",
    };
    const items = loadManualItems();
    saveManualItems([item, ...items]);
    setShowManualFlag(false);
    setManualProp("");
    setManualMonth("");
    setManualNote("");
    setVersion(v => v + 1);
  }

  function handleIgnore(id: string) {
    const overrides = loadInboxOverrides();
    overrides[id] = { ...overrides[id], status: "ignored" };
    saveInboxOverrides(overrides);
    setVersion(v => v + 1);
  }

  function handleReassign(id: string, newPropId: string) {
    const overrides = loadInboxOverrides();
    overrides[id] = { ...overrides[id], propertyId: newPropId };
    saveInboxOverrides(overrides);
    setReassigning(null);
    setVersion(v => v + 1);
  }

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

  function ActionsCell(params: { data: InboxPackage }) {
    const pkg = params.data;
    if (reassigning === pkg.id) {
      return (
        <div className="flex items-center gap-1">
          <select value={reassignProp} onChange={e => setReassignProp(e.target.value)}
            className="text-[10px] px-1 py-0.5 border border-[#d4dede] rounded bg-white">
            <option value="">Select...</option>
            {properties.filter(p => p.status !== "pipeline").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => { if (reassignProp) handleReassign(pkg.id, reassignProp); }}
            className="text-[9px] px-1.5 py-0.5 bg-[#2a4040] text-white rounded cursor-pointer">Go</button>
          <button onClick={() => setReassigning(null)} className="text-[9px] text-[#5a7272] cursor-pointer">X</button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); setReassigning(pkg.id); setReassignProp(""); }}
          className="text-[9px] text-[#4a6b6b] hover:text-[#1a2e2e] cursor-pointer px-1.5 py-0.5 border border-[#d4dede] rounded hover:bg-[#f0f4f4]">
          Reassign
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleIgnore(pkg.id); }}
          className="text-[9px] text-[#5a7272] hover:text-[#dc2626] cursor-pointer px-1.5 py-0.5 border border-[#d4dede] rounded hover:border-[#dc2626]">
          Ignore
        </button>
      </div>
    );
  }

  const columnDefs = useMemo<ColDef<InboxPackage>[]>(
    () => [
      { field: "property", headerName: "Property", flex: 2, minWidth: 150 },
      { field: "month", headerName: "Month", width: 100 },
      { field: "source", headerName: "Source", width: 80,
        cellRenderer: (params: { data: InboxPackage }) => {
          const isAi = params.data.source === "ai";
          return (
            <span className={`text-[10px] font-medium ${isAi ? "text-[#4a6b6b]" : "text-[#1a2e2e]"}`}>
              {isAi ? `AI ${params.data.confidence}%` : "Manual"}
            </span>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 100,
        cellRenderer: (params: { value: string }) => {
          const colors: Record<string, string> = {
            pending: "text-[#d97706]",
            draft: "text-[#2563eb]",
            reviewed: "text-[#16a34a]",
          };
          return <span className={`text-[11px] font-medium capitalize ${colors[params.value] || ""}`}>{params.value}</span>;
        },
      },
      {
        field: "revenue",
        headerName: "Revenue",
        width: 110,
        valueFormatter: (p: { value: number }) => p.value ? formatCurrency(p.value) : "—",
      },
      {
        field: "noi",
        headerName: "NOI",
        width: 100,
        valueFormatter: (p: { value: number }) => p.value ? formatCurrency(p.value) : "—",
      },
      {
        field: "flagCount",
        headerName: "Flags",
        width: 70,
        cellRenderer: (params: { value: number }) => {
          return <span className={params.value > 0 ? "text-[#dc2626] font-semibold" : "text-[#8aabab]"}>{params.value || "—"}</span>;
        },
      },
      { headerName: "", width: 160, cellRenderer: ActionsCell, sortable: false, filter: false },
    ],
    [reassigning, reassignProp]
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
        subtitle="AI auto-flags documents by property — manually flag or reassign if needed"
      >
        <button onClick={() => setShowManualFlag(!showManualFlag)}
          className="text-[11px] font-medium px-3 py-1.5 bg-[#2a4040] text-white rounded hover:bg-[#3a5555] cursor-pointer transition-colors">
          Manual Flag
        </button>
      </PageHeader>

      {showManualFlag && (
        <div style={{ background: "#fff", border: "1px solid #d4dede", borderRadius: "4px", padding: "14px", marginBottom: "16px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e2e", marginBottom: "10px" }}>Manually Flag a Document</p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr] gap-2 mb-2">
            <select value={manualProp} onChange={e => setManualProp(e.target.value)}
              style={{ fontSize: "12px", padding: "6px 8px", border: "1px solid #d4dede", borderRadius: "4px", background: "#f7f8f8" }}>
              <option value="">Select property...</option>
              {properties.filter(p => p.status !== "pipeline").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="text" value={manualMonth} onChange={e => setManualMonth(e.target.value)}
              placeholder="Month (e.g. 2026-03)"
              style={{ fontSize: "12px", padding: "6px 8px", border: "1px solid #d4dede", borderRadius: "4px", background: "#f7f8f8" }} />
            <input type="text" value={manualNote} onChange={e => setManualNote(e.target.value)}
              placeholder="Note (optional)"
              style={{ fontSize: "12px", padding: "6px 8px", border: "1px solid #d4dede", borderRadius: "4px", background: "#f7f8f8" }} />
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowManualFlag(false)}
              style={{ fontSize: "11px", color: "#5a7272", cursor: "pointer", padding: "4px 12px", background: "none", border: "none" }}>Cancel</button>
            <button onClick={handleManualFlag} disabled={!manualProp || !manualMonth}
              style={{ fontSize: "11px", fontWeight: 500, padding: "6px 16px", background: !manualProp || !manualMonth ? "#d4dede" : "#2a4040", color: !manualProp || !manualMonth ? "#8aabab" : "#fff", border: "none", borderRadius: "4px", cursor: !manualProp || !manualMonth ? "not-allowed" : "pointer" }}>
              Flag
            </button>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">

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
        <div className="overflow-auto rounded border border-[#d4dede]">
          <div className="ag-theme-alpine" style={{ width: "100%", minWidth: "600px", height: "300px" }}>
            <AgGridReact<InboxPackage>
              rowData={packages}
              columnDefs={columnDefs}
              onRowClicked={onRowClicked}
              suppressCellFocus
              animateRows={false}
            />
          </div>
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
              className="flex flex-wrap sm:flex-nowrap items-start gap-1 sm:gap-3"
              style={{
                padding: "8px 14px",
                background: i % 2 === 0 ? "#fff" : "#f7f8f8",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <span
                className="hidden sm:inline"
                style={{
                  color: "#5a7272",
                  fontSize: "11px",
                  minWidth: "120px",
                  flexShrink: 0,
                }}
              >
                {item.time}
              </span>
              <span style={{ color: "#1a2e2e" }}>
                <span className="sm:hidden" style={{ color: "#5a7272", fontSize: "11px" }}>{item.time} — </span>
                {item.event}
              </span>
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
