"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import {
  properties,
  formatCurrency,
  Property,
  PropertyRole,
  PMSystem,
  loadAllProperties,
  addCustomProperty,
  editProperty,
  deleteProperty,
} from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";
import PropertyDetail from "@/components/PropertyDetail";

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

/* ── Add / Edit Property Modal ── */

interface PropertyFormData {
  name: string;
  location: string;
  units: string;
  role: PropertyRole;
  pmSystem: PMSystem;
  investorGroup: string;
}

const emptyForm: PropertyFormData = {
  name: "",
  location: "",
  units: "",
  role: "core",
  pmSystem: "Yardi",
  investorGroup: "",
};

function PropertyFormModal({
  initial,
  editId,
  onSave,
  onClose,
}: {
  initial: PropertyFormData;
  editId: string | null;
  onSave: (data: PropertyFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PropertyFormData>(initial);
  const isEdit = !!editId;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-[#d4dede] rounded w-full max-w-[480px] mx-4">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#d4dede]">
          <p className="text-[14px] font-semibold text-[#1a2e2e]">
            {isEdit ? "Edit Property" : "Add Property"}
          </p>
          <button onClick={onClose} className="text-[#8aabab] hover:text-[#1a2e2e] cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              placeholder="Property name"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              placeholder="City, State"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Units</label>
            <input
              value={form.units}
              onChange={(e) => setForm({ ...form, units: e.target.value })}
              type="number"
              className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as PropertyRole })}
                className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              >
                <option value="core">Core</option>
                <option value="co-gp">Co-GP</option>
                <option value="third-party">3rd Party AM</option>
                <option value="acquisition">Pipeline</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">PM System</label>
              <select
                value={form.pmSystem}
                onChange={(e) => setForm({ ...form, pmSystem: e.target.value as PMSystem })}
                className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              >
                <option value="Yardi">Yardi</option>
                <option value="AppFolio">AppFolio</option>
                <option value="Resmin">Resmin</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide block mb-1">Investor Group</label>
            <input
              value={form.investorGroup}
              onChange={(e) => setForm({ ...form, investorGroup: e.target.value })}
              className="w-full text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
              placeholder="Investor group"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              className="text-[12px] text-[#5a7272] px-3 py-1.5 cursor-pointer hover:text-[#1a2e2e]"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={!form.name || !form.location}
              className="text-[12px] font-medium px-4 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors disabled:bg-[#d4dede] disabled:text-[#8aabab] disabled:cursor-not-allowed"
            >
              {isEdit ? "Save Changes" : "Add Property"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirmation ── */

function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white border border-[#d4dede] rounded w-full max-w-[380px] mx-4 p-5">
        <p className="text-[14px] font-semibold text-[#1a2e2e] mb-2">Delete Property</p>
        <p className="text-[13px] text-[#5a7272] mb-4">
          Are you sure you want to delete <span className="font-medium text-[#1a2e2e]">{name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-[12px] text-[#5a7272] px-3 py-1.5 cursor-pointer hover:text-[#1a2e2e]">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-[12px] font-medium px-4 py-1.5 bg-[#dc2626] text-white rounded hover:bg-[#b91c1c] cursor-pointer transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const isMobile = useIsMobile();
  const [allProps, setAllProps] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [deletingProp, setDeletingProp] = useState<Property | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setAllProps(loadAllProperties());
  }, [version]);

  function handleAdd(data: PropertyFormData) {
    addCustomProperty(data.name, data.location, parseInt(data.units) || 0, data.role, data.pmSystem, data.investorGroup);
    setShowAddModal(false);
    setVersion((v) => v + 1);
  }

  function handleEdit(data: PropertyFormData) {
    if (!editingProp) return;
    editProperty(editingProp.id, {
      name: data.name,
      location: data.location,
      units: parseInt(data.units) || 0,
      role: data.role,
      pmSystem: data.pmSystem,
      investorGroup: data.investorGroup,
    });
    setEditingProp(null);
    setSelected(null);
    setVersion((v) => v + 1);
  }

  function handleDelete() {
    if (!deletingProp) return;
    deleteProperty(deletingProp.id);
    setDeletingProp(null);
    setSelected(null);
    setVersion((v) => v + 1);
  }

  function ActionsRenderer(p: { data: Property }) {
    return (
      <div className="flex items-center gap-1.5 h-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingProp(p.data);
          }}
          className="text-[10px] font-medium text-[#4a6b6b] hover:text-[#1a2e2e] underline cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeletingProp(p.data);
          }}
          className="text-[10px] font-medium text-[#dc2626] hover:text-[#b91c1c] underline cursor-pointer"
        >
          Delete
        </button>
      </div>
    );
  }

  const columnDefs: ColDef[] = useMemo(() => {
    if (isMobile) {
      return [
        { field: "name", headerName: "Property", flex: 1, minWidth: 140 },
        { field: "units", headerName: "Units", width: 70, type: "numericColumn" },
        {
          field: "occupancy",
          headerName: "Occ %",
          width: 75,
          valueFormatter: (p: any) => `${p.value}%`,
        },
        { headerName: "", width: 90, cellRenderer: ActionsRenderer, sortable: false, filter: false },
      ];
    }
    return [
      { field: "name", headerName: "Property", flex: 1, minWidth: 160 },
      { field: "location", headerName: "Location", width: 130 },
      { field: "units", headerName: "Units", width: 80, type: "numericColumn" },
      {
        field: "role",
        headerName: "Role",
        width: 110,
        cellRenderer: (p: any) => {
          const labels: Record<string, string> = {
            core: "Core",
            "co-gp": "Co-GP",
            "third-party": "3rd Party AM",
            acquisition: "Pipeline",
          };
          return <span className="capitalize text-[12px]">{labels[p.value] || p.value}</span>;
        },
      },
      { field: "pmSystem", headerName: "PM System", width: 100 },
      { field: "pmCompany", headerName: "PM Company", width: 150 },
      { field: "investorGroup", headerName: "Investor Group", width: 170 },
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
        field: "monthlyRevenue",
        headerName: "Monthly Rev",
        width: 120,
        valueFormatter: (p: any) => formatCurrency(p.value),
        type: "numericColumn",
      },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            active: "text-[#16a34a]",
            "pre-conversion": "text-[#d97706]",
            pipeline: "text-[#5a7272]",
          };
          return <span className={`${colors[p.value] || ""} text-[12px] font-medium capitalize`}>{p.value}</span>;
        },
      },
      {
        field: "reviewStatus",
        headerName: "Review",
        width: 100,
        cellRenderer: (p: any) => {
          const colors: Record<string, string> = {
            current: "text-[#16a34a]",
            pending: "text-[#d97706]",
            overdue: "text-[#dc2626]",
          };
          return <span className={`${colors[p.value] || ""} text-[12px] font-medium capitalize`}>{p.value}</span>;
        },
      },
      { headerName: "", width: 100, cellRenderer: ActionsRenderer, sortable: false, filter: false },
    ];
  }, [isMobile]);

  const onRowClicked = useCallback((event: any) => {
    setSelected(event.data);
  }, []);

  return (
    <>
      <PageHeader
        title="Portfolio"
        subtitle={`${allProps.length} properties across all roles — ${allProps.reduce((s, p) => s + p.units, 0)} total units`}
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2e2e] text-white text-[12px] font-medium rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Property
        </button>
      </PageHeader>

      <div className="bg-white border border-[#d4dede] rounded p-4">
        <div className="ag-theme-alpine" style={{ height: 520, width: "100%" }}>
          <AgGridReact
            rowData={allProps}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, resizable: true, filter: true }}
            animateRows
            suppressCellFocus
            onRowClicked={onRowClicked}
          />
        </div>
        <p className="text-[10px] text-[#8aabab] mt-2">Click any row to view property details.</p>
      </div>

      {/* ── Loan Covenant Monitoring ── */}
      <div className="bg-white border border-[#d4dede] rounded p-4 mt-6">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">Covenant Status</h2>
        <p className="text-[11px] text-[#8aabab] mb-3">
          Loan covenant compliance for properties with active debt. Color-coded: green = compliant, amber = warning (&lt;10% buffer), red = breach.
        </p>
        <div className="space-y-2">
          {(() => {
            const covenants = [
              { id: "courtside", name: "Courtside Apartments", metric: "DSCR", threshold: 1.15, current: 1.41, lender: "Freddie Mac" },
              { id: "belmont", name: "Belmont Dairy", metric: "DSCR", threshold: 1.15, current: 1.27, lender: "Wells Fargo" },
              { id: "coronado", name: "Coronado", metric: "DSCR", threshold: 1.10, current: 1.30, lender: "KeyBank" },
              { id: "orchard-park", name: "Orchard Park", metric: "DSCR", threshold: 1.10, current: 1.09, lender: "US Bank" },
              { id: "valencia", name: "Valencia", metric: "DSCR", threshold: 1.15, current: 1.53, lender: "Chase" },
              { id: "ledg-1", name: "LEDG — Cedar Heights", metric: "DSCR", threshold: 1.20, current: 1.35, lender: "Fannie Mae" },
              { id: "ledg-2", name: "LEDG — Cascade View", metric: "DSCR", threshold: 1.20, current: 1.28, lender: "Fannie Mae" },
            ];
            return covenants.map((c) => {
              const buffer = (c.current - c.threshold) / c.threshold;
              let statusLabel = "Compliant";
              let statusColor = "text-[#16a34a] bg-[#f0fdf4]";
              if (c.current < c.threshold) {
                statusLabel = "Breach";
                statusColor = "text-[#dc2626] bg-[#fef2f2]";
              } else if (buffer < 0.10) {
                statusLabel = "Warning";
                statusColor = "text-[#d97706] bg-[#fffbeb]";
              }
              return (
                <div key={c.id} className="py-2.5 px-3 bg-[#f5f8f8] rounded text-[12px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[#1a2e2e]">{c.name}</span>
                    <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1 text-[11px]">
                    <span className="text-[#5a7272]">Min: {c.threshold.toFixed(2)}x</span>
                    <span className="text-[#1a2e2e] font-medium">Current: {c.current.toFixed(2)}x</span>
                    <span className="text-[#8aabab]">{c.lender}</span>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={selected ? `${selected.location} · ${selected.units} units` : ""}
      >
        {selected && <PropertyDetail property={selected} />}
      </Drawer>

      {/* Add Modal */}
      {showAddModal && (
        <PropertyFormModal
          initial={emptyForm}
          editId={null}
          onSave={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingProp && (
        <PropertyFormModal
          initial={{
            name: editingProp.name,
            location: editingProp.location,
            units: String(editingProp.units),
            role: editingProp.role,
            pmSystem: editingProp.pmSystem,
            investorGroup: editingProp.investorGroup,
          }}
          editId={editingProp.id}
          onSave={handleEdit}
          onClose={() => setEditingProp(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingProp && (
        <DeleteConfirm
          name={deletingProp.name}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProp(null)}
        />
      )}
    </>
  );
}
