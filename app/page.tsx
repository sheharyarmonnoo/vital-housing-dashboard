"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef, RowClickedEvent } from "ag-grid-community";
import { properties, monthlyReviews, actionItems as seedActionItems, formatCurrency, Property, ActionItem } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";
import PropertyDetail from "@/components/PropertyDetail";

ModuleRegistry.registerModules([AllCommunityModule]);

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const LS_ACTION_ITEMS_KEY = "vital_action_items";

function loadActionItems(): ActionItem[] {
  if (typeof window === "undefined") return seedActionItems;
  try {
    const raw = localStorage.getItem(LS_ACTION_ITEMS_KEY);
    return raw ? JSON.parse(raw) : seedActionItems;
  } catch {
    return seedActionItems;
  }
}

function saveActionItems(items: ActionItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_ACTION_ITEMS_KEY, JSON.stringify(items));
}

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

function KPICard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white border border-[#d4dede] rounded px-4 py-3.5">
      <span className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-2">
        {label}
      </span>
      <div className={`text-[22px] font-semibold tracking-tight ${color || "text-[#1a2e2e]"}`}>
        {value}
      </div>
      {sub && <p className="text-[11px] text-[#8aabab] mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Add Action Item Modal ── */

function AddActionModal({
  onSave,
  onClose,
}: {
  onSave: (item: ActionItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    assignee: "",
    property: "",
    description: "",
    priority: "medium" as "high" | "medium" | "low",
    dueDate: "",
    type: "review" as ActionItem["type"],
  });

  const activeProps = properties.filter((p) => p.status !== "pipeline");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-[#d4dede] rounded w-full max-w-[480px] mx-4">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#d4dede]">
          <p className="text-[14px] font-semibold text-[#1a2e2e]">Add Action Item</p>
          <button onClick={onClose} className="text-[#8aabab] hover:text-[#1a2e2e] cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Assignee</label>
              <input
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
                placeholder="e.g. Christina"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Property</label>
              <select
                value={form.property}
                onChange={(e) => setForm({ ...form, property: e.target.value })}
                className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              >
                <option value="">Select...</option>
                {activeProps.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b] resize-y"
              placeholder="Action item description"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as "high" | "medium" | "low" })}
                className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ActionItem["type"] })}
                className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              >
                <option value="review">Review</option>
                <option value="reclassification">Reclassification</option>
                <option value="pm-followup">PM Follow-up</option>
                <option value="report">Report</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="text-[12px] text-[#5a7272] px-3 py-1.5 cursor-pointer hover:text-[#1a2e2e]">Cancel</button>
            <button
              onClick={() => {
                onSave({
                  id: "a" + Date.now(),
                  type: form.type,
                  property: form.property,
                  description: form.description,
                  assignee: form.assignee,
                  dueDate: form.dueDate,
                  priority: form.priority,
                });
              }}
              disabled={!form.description || !form.property}
              className="text-[12px] font-medium px-4 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors disabled:bg-[#d4dede] disabled:text-[#8aabab] disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [items, setItems] = useState<ActionItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showAddAction, setShowAddAction] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadActionItems());
    try {
      const raw = localStorage.getItem("vital_action_completed");
      if (raw) setCompletedIds(new Set(JSON.parse(raw)));
    } catch { /* noop */ }
  }, []);

  function persistItems(updated: ActionItem[]) {
    setItems(updated);
    saveActionItems(updated);
  }

  function toggleComplete(id: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("vital_action_completed", JSON.stringify([...next]));
      return next;
    });
  }

  function deleteItem(id: string) {
    persistItems(items.filter((i) => i.id !== id));
  }

  function addItem(item: ActionItem) {
    persistItems([...items, item]);
    setShowAddAction(false);
  }

  function startEdit(item: ActionItem) {
    setEditingItemId(item.id);
    setEditingText(item.description);
  }

  function saveEdit() {
    if (!editingItemId) return;
    persistItems(items.map((i) => (i.id === editingItemId ? { ...i, description: editingText } : i)));
    setEditingItemId(null);
    setEditingText("");
  }

  const onRowClicked = useCallback((event: RowClickedEvent) => {
    setSelectedProp(event.data as Property);
  }, []);

  const activeProperties = properties.filter((p) => p.status === "active" || p.status === "pre-conversion");

  const totalUnits = activeProperties.reduce((s, p) => s + p.units, 0);

  const weightedOcc =
    activeProperties.reduce((s, p) => s + p.occupancy * p.units, 0) / totalUnits;

  const monthlyNOI = activeProperties.reduce((s, p) => s + p.noi / 12, 0);

  const needsReview = activeProperties.filter(
    (p) => p.reviewStatus === "overdue" || p.reviewStatus === "pending"
  ).length;

  const columnDefs: ColDef[] = useMemo(() => {
    if (isMobile) {
      return [
        { field: "name", headerName: "Property", flex: 1, minWidth: 140 },
        {
          field: "occupancy",
          headerName: "Occ %",
          width: 80,
          valueFormatter: (p: any) => `${p.value}%`,
        },
        {
          field: "reviewStatus",
          headerName: "Status",
          width: 90,
          cellRenderer: (p: any) => {
            const colors: Record<string, string> = {
              current: "text-[#16a34a]",
              pending: "text-[#d97706]",
              overdue: "text-[#dc2626]",
            };
            return <span className={`${colors[p.value] || ""} text-[12px] font-medium capitalize`}>{p.value}</span>;
          },
        },
      ];
    }
    return [
      { field: "name", headerName: "Property", flex: 1, minWidth: 160 },
      { field: "location", headerName: "Location", width: 130 },
      { field: "units", headerName: "Units", width: 80, type: "numericColumn" },
      {
        field: "occupancy",
        headerName: "Occupancy",
        width: 100,
        valueFormatter: (p: any) => `${p.value}%`,
      },
      {
        field: "noi",
        headerName: "Annual NOI",
        width: 120,
        valueFormatter: (p: any) => formatCurrency(p.value),
        type: "numericColumn",
      },
      {
        field: "reviewStatus",
        headerName: "Review Status",
        width: 120,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            current: "text-[#16a34a]",
            pending: "text-[#d97706]",
            overdue: "text-[#dc2626]",
          };
          return <span className={`${colors[p.value] || ""} text-[12px] font-medium capitalize`}>{p.value}</span>;
        },
      },
      { field: "pmSystem", headerName: "PM System", width: 110 },
    ];
  }, [isMobile]);

  // Occupancy trend chart — monthly data for key properties
  const trendMonths = ["Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26"];
  const trendProps = ["courtside", "belmont", "orchard-park"];
  const trendNames = ["Courtside", "Belmont Dairy", "Orchard Park"];
  const trendColors = ["#1a2e2e", "#4a6b6b", "#6b9b9b"];

  const trendSeries = trendProps.map((pid, idx) => {
    const reviews = monthlyReviews.filter((r) => r.propertyId === pid).sort((a, b) => a.month.localeCompare(b.month));
    return {
      name: trendNames[idx],
      data: reviews.map((r) => r.occupancy),
    };
  });

  const chartOptions: any = {
    chart: {
      type: "line",
      toolbar: { show: false },
      fontFamily: "Inter, system-ui, sans-serif",
    },
    colors: trendColors,
    stroke: { width: 2, curve: "smooth" },
    xaxis: {
      categories: trendMonths,
      labels: { style: { fontSize: "11px", colors: "#5a7272" } },
    },
    yaxis: {
      min: 88,
      max: 100,
      labels: {
        style: { fontSize: "11px", colors: "#5a7272" },
        formatter: (v: number) => `${v}%`,
      },
    },
    grid: { borderColor: "#eaf0f0", strokeDashArray: 3 },
    legend: {
      fontSize: "11px",
      labels: { colors: "#5a7272" },
      markers: { size: 4 },
    },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v: number) => `${v}%` } },
  };

  const priorityColors: Record<string, string> = {
    high: "text-[#dc2626]",
    medium: "text-[#d97706]",
    low: "text-[#5a7272]",
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Christina's daily view — portfolio overview and action items"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard
          label="Total Units"
          value={totalUnits.toLocaleString()}
          sub={`${activeProperties.length} active properties`}
        />
        <KPICard
          label="Weighted Occupancy"
          value={`${weightedOcc.toFixed(1)}%`}
          sub="Across active portfolio"
        />
        <KPICard
          label="Monthly NOI"
          value={formatCurrency(Math.round(monthlyNOI))}
          sub="Active portfolio"
        />
        <KPICard
          label="Needs Review"
          value={String(needsReview)}
          sub="Pending or overdue"
          color={needsReview > 0 ? "text-[#dc2626]" : undefined}
        />
      </div>

      {/* Occupancy Trend Chart */}
      <div className="bg-white border border-[#d4dede] rounded p-4 mb-6">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">
          Occupancy Trend — Core Properties
        </h2>
        <ApexChart type="line" height={220} options={chartOptions} series={trendSeries} />
      </div>

      {/* Portfolio Summary Grid */}
      <div className="bg-white border border-[#d4dede] rounded p-4 mb-6">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">
          Portfolio Summary
        </h2>
        <div className="ag-theme-alpine" style={{ height: 380, width: "100%" }}>
          <AgGridReact
            rowData={activeProperties}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, resizable: true }}
            onRowClicked={onRowClicked}
            animateRows
            suppressCellFocus
          />
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white border border-[#d4dede] rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium text-[#1a2e2e]">
            Action Items
          </h2>
          <button
            onClick={() => setShowAddAction(true)}
            className="flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors"
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            Add
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item) => {
            const isCompleted = completedIds.has(item.id);
            const isEditing = editingItemId === item.id;
            return (
              <div
                key={item.id}
                className={`group flex items-start justify-between py-2.5 px-3 rounded text-[13px] transition-colors ${
                  isCompleted ? "bg-[#f0fdf4] opacity-60" : "bg-[#f5f8f8]"
                }`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {/* Complete checkbox */}
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className={`mt-0.5 shrink-0 w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-[#16a34a] border-[#16a34a]"
                        : "border-[#d4dede] hover:border-[#4a6b6b]"
                    }`}
                  >
                    {isCompleted && (
                      <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-medium uppercase tracking-wide ${priorityColors[item.priority]}`}>
                        {item.priority}
                      </span>
                      <span className="text-[10px] text-[#8aabab] uppercase tracking-wide">
                        {item.type.replace("-", " ")}
                      </span>
                    </div>
                    <p className={`font-medium ${isCompleted ? "line-through text-[#8aabab]" : "text-[#1a2e2e]"}`}>{item.property}</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingItemId(null); }}
                          autoFocus
                          className="flex-1 text-[12px] text-[#1a2e2e] border border-[#6b9b9b] rounded px-2 py-1 bg-white outline-none"
                        />
                        <button onClick={saveEdit} className="text-[10px] font-medium text-[#16a34a] cursor-pointer">Save</button>
                        <button onClick={() => setEditingItemId(null)} className="text-[10px] text-[#8aabab] cursor-pointer">Cancel</button>
                      </div>
                    ) : (
                      <p
                        className={`text-[12px] mt-0.5 cursor-pointer hover:bg-[#eaf0f0] rounded px-1 -mx-1 ${isCompleted ? "line-through text-[#8aabab]" : "text-[#5a7272]"}`}
                        onClick={() => startEdit(item)}
                        title="Click to edit"
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-3 shrink-0 flex items-start gap-2">
                  <div>
                    <p className="text-[11px] text-[#8aabab]">{item.assignee}</p>
                    <p className="text-[11px] text-[#5a7272]">Due {item.dueDate}</p>
                  </div>
                  {/* Delete button — visible on hover */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className={`mt-0.5 text-[#dc2626] hover:text-[#b91c1c] cursor-pointer transition-opacity ${
                      hoveredItem === item.id ? "opacity-100" : "opacity-0"
                    }`}
                    title="Delete"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="text-[12px] text-[#8aabab] py-4 text-center">No action items.</p>
          )}
        </div>
      </div>

      {/* Animated side drawer for property detail */}
      <Drawer
        open={!!selectedProp}
        onClose={() => setSelectedProp(null)}
        title={selectedProp?.name}
        subtitle={selectedProp ? `${selectedProp.location} · ${selectedProp.units} units · ${selectedProp.role}` : ""}
      >
        {selectedProp && <PropertyDetail property={selectedProp} />}
      </Drawer>

      {/* Add Action Item Modal */}
      {showAddAction && (
        <AddActionModal onSave={addItem} onClose={() => setShowAddAction(false)} />
      )}
    </>
  );
}
