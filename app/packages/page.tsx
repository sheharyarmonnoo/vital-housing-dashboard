"use client";
import { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties, formatCurrency } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";

ModuleRegistry.registerModules([AllCommunityModule]);

// --- Package types ---

type PackageType = "financial-review" | "investor-report" | "acquisition-prescreen" | "custom";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: "uploaded" | "processing" | "processed" | "error";
}

interface Package {
  id: string;
  propertyId: string;
  propertyName: string;
  type: PackageType;
  month?: string;
  quarter?: string;
  files: UploadedFile[];
  status: "draft" | "processing" | "ready" | "reviewed";
  createdAt: string;
  processedAt?: string;
  notes: string;
  outputs?: string[]; // generated reports/emails
}

const PACKAGES_KEY = "vital_packages";

const packageTypeLabels: Record<PackageType, string> = {
  "financial-review": "Monthly Financial Review",
  "investor-report": "Quarterly Investor Report",
  "acquisition-prescreen": "Acquisition Prescreen",
  "custom": "Custom Package",
};

const requiredFiles: Record<PackageType, string[]> = {
  "financial-review": [
    "Balance Sheet (.xlsx)",
    "Budget Variance Report (.xlsx)",
    "YTD General Ledger (.xlsx)",
    "Operating Budget (.xlsx)",
    "Reserve/Capital Budget (.xlsx) — optional",
  ],
  "investor-report": [
    "3 months of financial review dashboards",
    "Distribution calculation (Cesca's waterfall)",
    "Narrative inputs (will be prompted)",
  ],
  "acquisition-prescreen": [
    "Offering Memorandum (.pdf)",
    "Rent Roll (.xlsx)",
    "T-12 / Trailing Financials (.xlsx)",
    "Comp data (if available)",
  ],
  "custom": ["Upload any files relevant to this package"],
};

const expectedOutputs: Record<PackageType, string[]> = {
  "financial-review": [
    "7-Tab Financial Dashboard (.xlsx)",
    "Directive Email Drafts (reclassification requests, PM questions)",
    "Material Variance Summary",
    "Reserve Opportunity Report",
  ],
  "investor-report": [
    "Branded 2-Page Investor Report (.docx)",
    "Financial Performance Table",
    "Distribution Summary",
    "PDF for investor distribution",
  ],
  "acquisition-prescreen": [
    "Deal Summary Report",
    "Rent Comp Analysis",
    "Go/No-Go Recommendation",
    "Key Risks & Opportunities",
  ],
  "custom": ["Processed outputs based on uploaded files"],
};

function loadPackages(): Package[] {
  if (typeof window === "undefined") return defaultPackages;
  try { const raw = localStorage.getItem(PACKAGES_KEY); return raw ? JSON.parse(raw) : defaultPackages; }
  catch { return defaultPackages; }
}
function savePackages(pkgs: Package[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(pkgs));
}

const defaultPackages: Package[] = [
  {
    id: "pkg-1", propertyId: "courtside", propertyName: "Courtside Apartments",
    type: "financial-review", month: "2026-02",
    files: [
      { id: "f1", name: "Courtside_BalanceSheet_Feb2026.xlsx", size: "42 KB", type: "Balance Sheet", uploadedAt: "2026-03-08", status: "processed" },
      { id: "f2", name: "Courtside_BudgetVariance_Feb2026.xlsx", size: "38 KB", type: "Budget Variance", uploadedAt: "2026-03-08", status: "processed" },
      { id: "f3", name: "Courtside_YTD_GL_Feb2026.xlsx", size: "156 KB", type: "YTD GL", uploadedAt: "2026-03-08", status: "processed" },
      { id: "f4", name: "Courtside_OpBudget_2026.xlsx", size: "28 KB", type: "Operating Budget", uploadedAt: "2026-03-08", status: "processed" },
    ],
    status: "ready", createdAt: "2026-03-08", processedAt: "2026-03-08",
    notes: "Feb review — all files processed. 2 material variances flagged. Reclassification directive drafted.",
    outputs: ["7-Tab Dashboard", "2 Directive Emails", "Variance Summary"],
  },
  {
    id: "pkg-2", propertyId: "courtside", propertyName: "Courtside Apartments",
    type: "investor-report", quarter: "Q4 2025",
    files: [
      { id: "f5", name: "Courtside_Q4_FinReviews.zip", size: "320 KB", type: "3-Month Reviews", uploadedAt: "2026-01-10", status: "processed" },
      { id: "f6", name: "Courtside_Distribution_Q4.xlsx", size: "18 KB", type: "Waterfall", uploadedAt: "2026-01-10", status: "processed" },
    ],
    status: "reviewed", createdAt: "2026-01-10", processedAt: "2026-01-12",
    notes: "Q4 report published to Enterprise Community Partners. Distribution: $52,000.",
    outputs: ["2-Page Investor Report", "PDF Distribution"],
  },
  {
    id: "pkg-3", propertyId: "alderwood", propertyName: "Alderwood Park",
    type: "acquisition-prescreen",
    files: [
      { id: "f7", name: "Alderwood_Park_OM.pdf", size: "4.2 MB", type: "Offering Memorandum", uploadedAt: "2026-02-17", status: "processed" },
      { id: "f8", name: "Alderwood_RentRoll_Jan2026.xlsx", size: "86 KB", type: "Rent Roll", uploadedAt: "2026-02-17", status: "processed" },
      { id: "f9", name: "Alderwood_T12_Nov2025.xlsx", size: "52 KB", type: "T-12", uploadedAt: "2026-02-17", status: "processed" },
      { id: "f10", name: "AlderwoodPrk_AFFComps.xlsx", size: "34 KB", type: "Comp Data", uploadedAt: "2026-02-17", status: "processed" },
    ],
    status: "ready", createdAt: "2026-02-17", processedAt: "2026-02-18",
    notes: "Prescreen complete. Recommendation: Continue with conditions. Key risk: undisclosed asking price.",
    outputs: ["Deal Summary", "Rent Comp Analysis", "Go/No-Go: Continue"],
  },
  {
    id: "pkg-4", propertyId: "belmont", propertyName: "Belmont Dairy",
    type: "financial-review", month: "2026-02",
    files: [],
    status: "draft", createdAt: "2026-03-12",
    notes: "Waiting for AppFolio export from PM.",
  },
];

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => { const c = () => setM(window.innerWidth < 768); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  return m;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPkg, setNewPkg] = useState({ propertyId: "", type: "financial-review" as PackageType, month: "", notes: "" });
  const [viewingOutput, setViewingOutput] = useState<{ pkgId: string; output: string } | null>(null);
  const [confirmDeletePkg, setConfirmDeletePkg] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => { setPackages(loadPackages()); }, []);

  function createPackage() {
    const prop = properties.find(p => p.id === newPkg.propertyId);
    if (!prop) return;
    const pkg: Package = {
      id: `pkg-${Date.now()}`,
      propertyId: newPkg.propertyId,
      propertyName: prop.name,
      type: newPkg.type,
      month: newPkg.type === "financial-review" ? newPkg.month : undefined,
      quarter: newPkg.type === "investor-report" ? newPkg.month : undefined,
      files: [],
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      notes: newPkg.notes,
    };
    const updated = [pkg, ...packages];
    setPackages(updated);
    savePackages(updated);
    setShowCreate(false);
    setNewPkg({ propertyId: "", type: "financial-review", month: "", notes: "" });
    setSelectedPkg(pkg);
  }

  function simulateProcess(pkgId: string) {
    const updated = packages.map(p => {
      if (p.id !== pkgId) return p;
      return {
        ...p,
        status: "processing" as const,
        files: p.files.map(f => ({ ...f, status: "processing" as const })),
      };
    });
    setPackages(updated);
    savePackages(updated);

    setTimeout(() => {
      const processed = updated.map(p => {
        if (p.id !== pkgId) return p;
        const outputs = expectedOutputs[p.type];
        return {
          ...p,
          status: "ready" as const,
          processedAt: new Date().toISOString().slice(0, 10),
          files: p.files.map(f => ({ ...f, status: "processed" as const })),
          outputs,
        };
      });
      setPackages(processed);
      savePackages(processed);
      setSelectedPkg(processed.find(p => p.id === pkgId) || null);
    }, 3000);
  }

  function deletePackage(pkgId: string) {
    const updated = packages.filter(p => p.id !== pkgId);
    setPackages(updated);
    savePackages(updated);
    setSelectedPkg(null);
    setConfirmDeletePkg(null);
  }

  function rerunPackage(pkgId: string) {
    const updated = packages.map(p => {
      if (p.id !== pkgId) return p;
      return { ...p, status: "draft" as const, processedAt: undefined, outputs: undefined,
        files: p.files.map(f => ({ ...f, status: "uploaded" as const })) };
    });
    setPackages(updated);
    savePackages(updated);
    setSelectedPkg(updated.find(p => p.id === pkgId) || null);
  }

  function addFileToPkg(pkgId: string, file: File) {
    const f: UploadedFile = {
      id: `f-${Date.now()}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      type: detectFileType(file.name),
      uploadedAt: new Date().toISOString().slice(0, 10),
      status: "uploaded",
    };
    const updated = packages.map(p => p.id === pkgId ? { ...p, files: [...p.files, f] } : p);
    setPackages(updated);
    savePackages(updated);
    setSelectedPkg(updated.find(p => p.id === pkgId) || null);
  }

  function detectFileType(name: string): string {
    const l = name.toLowerCase();
    if (l.includes("balance")) return "Balance Sheet";
    if (l.includes("budget") && l.includes("variance")) return "Budget Variance";
    if (l.includes("gl") || l.includes("general ledger")) return "YTD GL";
    if (l.includes("budget")) return "Operating Budget";
    if (l.includes("reserve") || l.includes("capital")) return "Reserve Budget";
    if (l.includes("rent") && l.includes("roll")) return "Rent Roll";
    if (l.includes("t12") || l.includes("t-12") || l.includes("trailing")) return "T-12";
    if (l.includes("om") || l.includes("offering")) return "Offering Memorandum";
    if (l.includes("comp")) return "Comp Data";
    if (l.includes("waterfall") || l.includes("distribution")) return "Waterfall";
    return "Document";
  }

  const statusColors: Record<string, string> = {
    draft: "text-[#5a7272]",
    processing: "text-[#d97706]",
    ready: "text-[#16a34a]",
    reviewed: "text-[#4a6b6b]",
  };

  const columnDefs = useMemo<ColDef[]>(() => {
    if (isMobile) {
      return [
        { field: "propertyName", headerName: "Property", flex: 1, minWidth: 130 },
        { field: "type", headerName: "Type", width: 100, valueFormatter: (p: any) => packageTypeLabels[p.value as PackageType]?.split(" ")[0] || p.value },
        { field: "status", headerName: "Status", width: 80, cellRenderer: (p: any) => <span className={`text-[11px] font-medium capitalize ${statusColors[p.value] || ""}`}>{p.value}</span> },
      ];
    }
    return [
      { field: "propertyName", headerName: "Property", flex: 1, minWidth: 180 },
      { field: "type", headerName: "Package Type", width: 200, valueFormatter: (p: any) => packageTypeLabels[p.value as PackageType] || p.value },
      { field: "month", headerName: "Period", width: 100, valueFormatter: (p: any) => p.value || p.data.quarter || "—" },
      { field: "files", headerName: "Files", width: 80, valueGetter: (p: any) => p.data.files.length, type: "numericColumn" },
      { field: "status", headerName: "Status", width: 110, cellRenderer: (p: any) => <span className={`text-[12px] font-medium capitalize ${statusColors[p.value] || ""}`}>{p.value}</span> },
      { field: "createdAt", headerName: "Created", width: 110 },
      { field: "processedAt", headerName: "Processed", width: 110, valueFormatter: (p: any) => p.value || "—" },
    ];
  }, [isMobile]);

  return (
    <>
      <PageHeader title="Packages" subtitle="Create a package per property — dump files, process into reports">
        <button onClick={() => setShowCreate(true)}
          className="text-[11px] font-medium px-3 py-1.5 bg-[#2a4040] text-white rounded hover:bg-[#3a5555] cursor-pointer transition-colors">
          Create Package
        </button>
      </PageHeader>

      {/* Create Package Form */}
      {showCreate && (
        <div className="bg-white border border-[#d4dede] rounded p-4 mb-4 space-y-3">
          <p className="text-[13px] font-medium text-[#1a2e2e]">New Package</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select value={newPkg.propertyId} onChange={e => setNewPkg({ ...newPkg, propertyId: e.target.value })}
              className="text-[12px] px-2.5 py-1.5 border border-[#d4dede] rounded bg-[#f7f8f8] text-[#1a2e2e]">
              <option value="">Select property...</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={newPkg.type} onChange={e => setNewPkg({ ...newPkg, type: e.target.value as PackageType })}
              className="text-[12px] px-2.5 py-1.5 border border-[#d4dede] rounded bg-[#f7f8f8] text-[#1a2e2e]">
              {Object.entries(packageTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input type="text" value={newPkg.month} onChange={e => setNewPkg({ ...newPkg, month: e.target.value })}
              placeholder={newPkg.type === "investor-report" ? "Quarter (e.g. Q1 2026)" : "Month (e.g. 2026-03)"}
              className="text-[12px] px-2.5 py-1.5 border border-[#d4dede] rounded bg-[#f7f8f8] placeholder-[#8aabab]" />
          </div>
          <textarea value={newPkg.notes} onChange={e => setNewPkg({ ...newPkg, notes: e.target.value })}
            placeholder="Package notes (optional)..." rows={2}
            className="w-full text-[12px] px-2.5 py-1.5 border border-[#d4dede] rounded bg-[#f7f8f8] placeholder-[#8aabab] resize-none" />
          <div className="flex gap-2">
            <button onClick={createPackage} disabled={!newPkg.propertyId}
              className="text-[11px] font-medium px-4 py-1.5 bg-[#2a4040] text-white rounded hover:bg-[#3a5555] disabled:bg-[#d4dede] disabled:text-[#8aabab] cursor-pointer transition-colors">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="text-[11px] text-[#5a7272] cursor-pointer px-3 py-1">Cancel</button>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="ag-theme-alpine w-full rounded overflow-hidden border border-[#d4dede]" style={{ height: 400 }}>
        <AgGridReact
          rowData={packages}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, resizable: true }}
          onRowClicked={(e: any) => setSelectedPkg(e.data)}
          animateRows
          getRowId={(p: any) => p.data.id}
        />
      </div>

      {/* Package Detail Drawer */}
      <Drawer
        open={!!selectedPkg}
        onClose={() => setSelectedPkg(null)}
        title={selectedPkg ? packageTypeLabels[selectedPkg.type] : ""}
        subtitle={selectedPkg ? `${selectedPkg.propertyName} · ${selectedPkg.month || selectedPkg.quarter || ""}` : ""}
      >
        {selectedPkg && (
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`text-[13px] font-medium capitalize ${statusColors[selectedPkg.status]}`}>{selectedPkg.status}</span>
              {selectedPkg.processedAt && <span className="text-[11px] text-[#8aabab]">Processed {selectedPkg.processedAt}</span>}
            </div>

            {/* Required Files Checklist */}
            <div>
              <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Required Files</p>
              <div className="space-y-1">
                {requiredFiles[selectedPkg.type].map((req, i) => {
                  const hasFile = selectedPkg.files.some(f => f.type.toLowerCase().includes(req.split(" ")[0].toLowerCase()) || f.name.toLowerCase().includes(req.split(" ")[0].toLowerCase()));
                  return (
                    <div key={i} className="flex items-center gap-2 text-[12px]">
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${hasFile ? "bg-[#16a34a] border-[#16a34a]" : "border-[#d4dede]"}`}>
                        {hasFile && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </span>
                      <span className={hasFile ? "text-[#1a2e2e]" : "text-[#8aabab]"}>{req}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Uploaded Files */}
            <div>
              <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Uploaded Files ({selectedPkg.files.length})</p>
              {selectedPkg.files.length > 0 ? (
                <div className="space-y-1">
                  {selectedPkg.files.map(f => (
                    <div key={f.id} className="flex items-center justify-between py-1.5 border-b border-[#eaf0f0] last:border-0 text-[12px]">
                      <div className="min-w-0">
                        <p className="text-[#1a2e2e] truncate font-medium">{f.name}</p>
                        <p className="text-[10px] text-[#8aabab]">{f.type} · {f.size}</p>
                      </div>
                      <span className={`text-[10px] font-medium flex-shrink-0 ${
                        f.status === "processed" ? "text-[#16a34a]" : f.status === "processing" ? "text-[#d97706]" : "text-[#5a7272]"
                      }`}>{f.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#8aabab] italic">No files uploaded yet</p>
              )}

              {/* Upload button */}
              {selectedPkg.status === "draft" && (
                <label className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 border border-[#d4dede] text-[#5a7272] rounded hover:border-[#4a6b6b] hover:text-[#1a2e2e] cursor-pointer transition-colors">
                  Add Files
                  <input type="file" className="hidden" multiple accept=".xlsx,.csv,.pdf,.docx,.zip"
                    onChange={(e) => { if (e.target.files) Array.from(e.target.files).forEach(f => addFileToPkg(selectedPkg.id, f)); }} />
                </label>
              )}
            </div>

            {/* Process Button */}
            {selectedPkg.status === "draft" && selectedPkg.files.length > 0 && (
              <button onClick={() => simulateProcess(selectedPkg.id)}
                className="w-full text-[12px] font-medium py-2 bg-[#2a4040] text-white rounded hover:bg-[#3a5555] cursor-pointer transition-colors">
                Process Package
              </button>
            )}

            {selectedPkg.status === "processing" && (
              <div className="text-center py-4">
                <div className="w-5 h-5 border-2 border-[#4a6b6b] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[12px] text-[#5a7272] mt-2">Processing files...</p>
              </div>
            )}

            {/* Outputs */}
            {selectedPkg.outputs && selectedPkg.outputs.length > 0 && (
              <div>
                <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Generated Outputs</p>
                <div className="space-y-1.5">
                  {selectedPkg.outputs.map((out, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between py-1.5 bg-[#f0f4f4] rounded px-3 text-[12px]">
                        <span className="text-[#1a2e2e] font-medium">{out}</span>
                        <button
                          onClick={() => setViewingOutput(viewingOutput?.output === out ? null : { pkgId: selectedPkg.id, output: out })}
                          className={`text-[10px] font-medium cursor-pointer px-2 py-0.5 rounded transition-colors ${
                            viewingOutput?.output === out
                              ? "bg-[#2a4040] text-white"
                              : "text-[#4a6b6b] hover:text-[#1a2e2e] border border-[#d4dede] hover:bg-white"
                          }`}
                        >
                          {viewingOutput?.output === out ? "Close" : "View"}
                        </button>
                      </div>
                      {viewingOutput?.pkgId === selectedPkg.id && viewingOutput?.output === out && (
                        <div className="mt-2 bg-white border border-[#d4dede] rounded p-3 text-[11px] text-[#5a7272] leading-relaxed">
                          <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-1">{out}</p>
                          <p>Generated from {selectedPkg.files.length} uploaded file{selectedPkg.files.length !== 1 ? "s" : ""} on {selectedPkg.processedAt || "—"}.</p>
                          <p className="mt-1 text-[#8aabab]">Full output available for download in production.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Outputs */}
            {!selectedPkg.outputs && (
              <div>
                <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Expected Outputs</p>
                <div className="space-y-1 text-[12px] text-[#5a7272]">
                  {expectedOutputs[selectedPkg.type].map((out, i) => (
                    <p key={i}>• {out}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedPkg.notes && (
              <div>
                <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-1">Notes</p>
                <p className="text-[12px] text-[#1a2e2e] leading-relaxed">{selectedPkg.notes}</p>
              </div>
            )}

            {/* Re-run and Delete actions */}
            <div className="flex gap-2 pt-2 border-t border-[#eaf0f0]">
              {(selectedPkg.status === "ready" || selectedPkg.status === "reviewed") && (
                <button onClick={() => rerunPackage(selectedPkg.id)}
                  className="flex-1 text-[11px] font-medium py-1.5 border border-[#d4dede] text-[#5a7272] rounded hover:border-[#4a6b6b] hover:text-[#1a2e2e] cursor-pointer transition-colors">
                  Re-run
                </button>
              )}
              <button onClick={() => setConfirmDeletePkg(selectedPkg.id)}
                className="flex-1 text-[11px] font-medium py-1.5 border border-[#d4dede] text-[#5a7272] rounded hover:border-[#dc2626] hover:text-[#dc2626] cursor-pointer transition-colors">
                Delete Package
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmDeletePkg && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmDeletePkg(null)} />
            <div className="relative bg-white border border-[#d4dede] rounded p-5 w-[340px] mx-4">
              <p className="text-[14px] font-semibold text-[#1a2e2e]">Delete Package</p>
              <p className="text-[12px] text-[#5a7272] mt-2 leading-relaxed">
                This will permanently remove this package and all its files. This cannot be undone.
              </p>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setConfirmDeletePkg(null)}
                  className="text-[12px] text-[#5a7272] px-3 py-1.5 cursor-pointer hover:text-[#1a2e2e]">Cancel</button>
                <button onClick={() => deletePackage(confirmDeletePkg)}
                  className="text-[12px] font-medium px-4 py-1.5 bg-[#dc2626] text-white rounded hover:bg-[#b91c1c] cursor-pointer transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
