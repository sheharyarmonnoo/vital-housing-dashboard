"use client";
import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";
import { properties } from "@/data/portfolio";
import {
  generateFindings,
  generateEmailDraft,
  loadResolved,
  saveResolved,
  type Finding,
} from "@/lib/material-drivers";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DriversPage() {
  const [filterProperty, setFilterProperty] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [resolvedSet, setResolvedSet] = useState<Set<string>>(() => loadResolved());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"email" | "detail">("detail");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [emailText, setEmailText] = useState("");

  const allFindings = useMemo(
    () => generateFindings(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedSet]
  );

  const findings = useMemo(() => {
    let f = allFindings.map((item) => ({
      ...item,
      resolved: resolvedSet.has(item.id),
    }));
    if (filterProperty) f = f.filter((item) => item.propertyId === filterProperty);
    if (filterSeverity) f = f.filter((item) => item.severity === filterSeverity);
    return f;
  }, [allFindings, filterProperty, filterSeverity, resolvedSet]);

  const criticalCount = findings.filter((f) => f.severity === "Critical" && !f.resolved).length;
  const watchCount = findings.filter((f) => f.severity === "Watch" && !f.resolved).length;

  const propOptions = useMemo(
    () =>
      [...new Set(allFindings.map((f) => f.propertyId))].map((id) => ({
        id,
        name: properties.find((p) => p.id === id)?.name || id,
      })),
    [allFindings]
  );

  function toggleResolved(id: string) {
    const next = new Set(resolvedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    saveResolved(next);
    setResolvedSet(next);
  }

  function openEmail(finding: Finding) {
    const prop = properties.find((p) => p.id === finding.propertyId);
    const propFindings = allFindings.filter(
      (f) => f.propertyId === finding.propertyId && !resolvedSet.has(f.id)
    );
    const email = generateEmailDraft(
      prop?.name || finding.propertyName,
      prop?.pmCompany,
      propFindings
    );
    setEmailText(email);
    setSelectedFinding(finding);
    setDrawerMode("email");
    setDrawerOpen(true);
  }

  function openDetail(finding: Finding) {
    setSelectedFinding(finding);
    setDrawerMode("detail");
    setDrawerOpen(true);
  }

  const columnDefs = useMemo<ColDef<Finding>[]>(
    () => [
      {
        field: "severity",
        headerName: "Severity",
        width: 100,
        cellRenderer: (params: { value: string }) => {
          const colors: Record<string, { bg: string; fg: string }> = {
            Critical: { bg: "#ffebee", fg: "#c62828" },
            Watch: { bg: "#fff3e0", fg: "#e65100" },
            Info: { bg: "#e8f0fe", fg: "#1565c0" },
          };
          const c = colors[params.value] || colors.Info;
          return `<span style="padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;background:${c.bg};color:${c.fg}">${params.value}</span>`;
        },
      },
      { field: "propertyName", headerName: "Property", flex: 1, minWidth: 140 },
      { field: "finding", headerName: "Finding", flex: 2, minWidth: 200 },
      { field: "action", headerName: "Recommended Action", flex: 2, minWidth: 200 },
      { field: "month", headerName: "Month", width: 100 },
      {
        field: "resolved",
        headerName: "Status",
        width: 90,
        cellRenderer: (params: { value: boolean }) => {
          return params.value
            ? '<span style="color:#2e7d32;font-size:11px;font-weight:500">Resolved</span>'
            : '<span style="color:#e65100;font-size:11px;font-weight:500">Open</span>';
        },
      },
    ],
    []
  );

  const onRowClicked = useCallback(
    (e: { data: Finding | undefined }) => {
      if (e.data) openDetail(e.data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <PageHeader
        title="Material Drivers"
        subtitle="Christina's workflow: Receive drafts 6th-8th -> Review by 10th -> Send same day"
      />

      {/* Summary bar */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              padding: "6px 14px",
              background: criticalCount > 0 ? "#ffebee" : "#e8f5e9",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 600,
              color: criticalCount > 0 ? "#c62828" : "#2e7d32",
            }}
          >
            {criticalCount} Critical
          </div>
          <div
            style={{
              padding: "6px 14px",
              background: "#fff3e0",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#e65100",
            }}
          >
            {watchCount} Watch
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Filters */}
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          style={{
            fontSize: "12px",
            padding: "6px 10px",
            border: "1px solid #d4dede",
            borderRadius: "4px",
            background: "#fff",
            color: "#1a2e2e",
          }}
        >
          <option value="">All Properties</option>
          {propOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          style={{
            fontSize: "12px",
            padding: "6px 10px",
            border: "1px solid #d4dede",
            borderRadius: "4px",
            background: "#fff",
            color: "#1a2e2e",
          }}
        >
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="Watch">Watch</option>
          <option value="Info">Info</option>
        </select>
      </div>

      {/* Findings grid */}
      <div className="ag-theme-alpine" style={{ width: "100%", height: "500px" }}>
        <AgGridReact<Finding>
          rowData={findings}
          columnDefs={columnDefs}
          onRowClicked={onRowClicked}
          suppressCellFocus
          animateRows={false}
          getRowStyle={(params) => {
            if (params.data?.resolved) return { opacity: "0.5" };
            return undefined;
          }}
        />
      </div>

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          drawerMode === "email"
            ? `Email Draft — ${selectedFinding?.propertyName || ""}`
            : `Finding — ${selectedFinding?.propertyName || ""}`
        }
      >
        {selectedFinding && drawerMode === "detail" && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "3px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background:
                    selectedFinding.severity === "Critical"
                      ? "#ffebee"
                      : selectedFinding.severity === "Watch"
                      ? "#fff3e0"
                      : "#e8f0fe",
                  color:
                    selectedFinding.severity === "Critical"
                      ? "#c62828"
                      : selectedFinding.severity === "Watch"
                      ? "#e65100"
                      : "#1565c0",
                }}
              >
                {selectedFinding.severity}
              </span>
              {selectedFinding.resolved && (
                <span
                  style={{
                    marginLeft: "8px",
                    padding: "3px 10px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: "#e8f5e9",
                    color: "#2e7d32",
                  }}
                >
                  Resolved
                </span>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: "#5a7272", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, marginBottom: "4px" }}>
                Finding
              </div>
              <div style={{ fontSize: "14px", color: "#1a2e2e", lineHeight: "1.5" }}>
                {selectedFinding.finding}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: "#5a7272", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, marginBottom: "4px" }}>
                Recommended Action
              </div>
              <div style={{ fontSize: "14px", color: "#1a2e2e", lineHeight: "1.5" }}>
                {selectedFinding.action}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button
                onClick={() => toggleResolved(selectedFinding.id)}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: selectedFinding.resolved ? "#fff" : "#e8f5e9",
                  color: selectedFinding.resolved ? "#1a2e2e" : "#2e7d32",
                  border: "1px solid #d4dede",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {selectedFinding.resolved ? "Reopen" : "Mark Resolved"}
              </button>
              <button
                onClick={() => openEmail(selectedFinding)}
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
                Send to PM
              </button>
            </div>
          </div>
        )}

        {selectedFinding && drawerMode === "email" && (
          <div>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              style={{
                width: "100%",
                height: "400px",
                fontSize: "13px",
                lineHeight: "1.6",
                padding: "14px",
                border: "1px solid #d4dede",
                borderRadius: "4px",
                resize: "vertical",
                fontFamily: "Inter, system-ui, sans-serif",
                color: "#1a2e2e",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(emailText);
                }}
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
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
