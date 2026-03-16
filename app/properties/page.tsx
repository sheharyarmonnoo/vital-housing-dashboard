"use client";
import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";
import {
  properties,
  monthlyReviews,
  investorReports,
  formatCurrency,
  type Property,
} from "@/data/portfolio";
import { calculatePropertyKPIs } from "@/lib/material-drivers";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function PropertiesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  const rowData = useMemo(
    () => properties.filter((p) => p.status !== "pipeline"),
    []
  );

  const columnDefs = useMemo<ColDef<Property>[]>(
    () => [
      { field: "name", headerName: "Property", flex: 2, minWidth: 160 },
      { field: "location", headerName: "Location", flex: 1, minWidth: 120 },
      { field: "units", headerName: "Units", width: 80 },
      {
        field: "role",
        headerName: "Role",
        width: 100,
        cellRenderer: (params: { value: string }) => {
          const labels: Record<string, string> = {
            core: "Core",
            "co-gp": "Co-GP",
            "third-party": "3rd Party",
            lp: "LP",
          };
          return labels[params.value] || params.value;
        },
      },
      {
        field: "occupancy",
        headerName: "Occ %",
        width: 85,
        cellRenderer: (params: { value: number }) => {
          const color = params.value < 93 ? "#c62828" : params.value < 95 ? "#e65100" : "#1a2e2e";
          return `<span style="font-weight:600;color:${color}">${params.value}%</span>`;
        },
      },
      {
        field: "noi",
        headerName: "Annual NOI",
        width: 120,
        valueFormatter: (p: { value: number }) => formatCurrency(p.value),
      },
      { field: "pmSystem", headerName: "PM System", width: 100 },
      {
        field: "reviewStatus",
        headerName: "Review",
        width: 100,
        cellRenderer: (params: { value: string }) => {
          const colors: Record<string, { bg: string; fg: string }> = {
            current: { bg: "#e8f5e9", fg: "#2e7d32" },
            pending: { bg: "#fff3e0", fg: "#e65100" },
            overdue: { bg: "#ffebee", fg: "#c62828" },
          };
          const c = colors[params.value] || colors.pending;
          return `<span style="padding:2px 8px;border-radius:3px;font-size:11px;font-weight:500;background:${c.bg};color:${c.fg}">${params.value}</span>`;
        },
      },
    ],
    []
  );

  const onRowClicked = useCallback((e: { data: Property | undefined }) => {
    if (e.data) {
      setSelectedProp(e.data);
      setDrawerOpen(true);
    }
  }, []);

  const kpis = selectedProp ? calculatePropertyKPIs(selectedProp.id) : null;
  const reviews = selectedProp
    ? monthlyReviews
        .filter((r) => r.propertyId === selectedProp.id)
        .sort((a, b) => b.month.localeCompare(a.month))
    : [];
  const reports = selectedProp
    ? investorReports.filter((r) => r.propertyId === selectedProp.id)
    : [];

  return (
    <>
      <PageHeader
        title="Properties"
        subtitle={`${rowData.length} active properties across the portfolio`}
      />

      <div className="overflow-auto rounded border border-[#d4dede]">
        <div className="ag-theme-alpine" style={{ width: "100%", minWidth: "600px", height: "500px" }}>
          <AgGridReact<Property>
            rowData={rowData}
            columnDefs={columnDefs}
            onRowClicked={onRowClicked}
            suppressCellFocus
            animateRows={false}
          />
        </div>
      </div>

      {/* Property detail drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedProp?.name || "Property Detail"}
        width="650px"
      >
        {selectedProp && (
          <div>
            {/* Management transition warning */}
            {selectedProp.managementTransition && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#fff3e0",
                  border: "1px solid #ffe0b2",
                  borderRadius: "4px",
                  marginBottom: "16px",
                  fontSize: "12px",
                  color: "#e65100",
                  fontWeight: 500,
                }}
              >
                Management transition in progress — additional oversight required
              </div>
            )}

            {/* KPIs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {[
                {
                  label: "Occupancy",
                  value: `${kpis?.currentOccupancy || selectedProp.occupancy}%`,
                  sub: kpis?.occupancyTrend
                    ? `${kpis.occupancyTrend > 0 ? "+" : ""}${kpis.occupancyTrend}% trend`
                    : "",
                },
                {
                  label: "Monthly NOI",
                  value: formatCurrency(kpis?.currentNOI || Math.round(selectedProp.noi / 12)),
                  sub: kpis?.noiTrend
                    ? `${kpis.noiTrend > 0 ? "+" : ""}${kpis.noiTrend}% trend`
                    : "",
                },
                {
                  label: "Avg DSCR",
                  value: kpis?.avgDSCR ? kpis.avgDSCR.toFixed(2) : "—",
                  sub: "",
                },
                {
                  label: "Avg Collections",
                  value: kpis?.avgCollections ? `${kpis.avgCollections}%` : "—",
                  sub: "",
                },
                {
                  label: "Budget Adherence",
                  value: kpis?.avgBudgetVariance
                    ? `${kpis.avgBudgetVariance > 0 ? "+" : ""}${kpis.avgBudgetVariance}%`
                    : "—",
                  sub: "",
                },
                {
                  label: "Total Flags",
                  value: String(kpis?.flagCount || 0),
                  sub: "",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "10px 12px",
                    background: "#f7f8f8",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#5a7272",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#1a2e2e",
                      marginTop: "2px",
                    }}
                  >
                    {item.value}
                  </div>
                  {item.sub && (
                    <div style={{ fontSize: "10px", color: "#5a7272", marginTop: "1px" }}>
                      {item.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Loan details */}
            {selectedProp.loan && (
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1a2e2e",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Loan Details
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <span style={{ color: "#5a7272" }}>Amount: </span>
                    <span style={{ color: "#1a2e2e", fontWeight: 500 }}>
                      {formatCurrency(selectedProp.loan.amount)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#5a7272" }}>Rate: </span>
                    <span style={{ color: "#1a2e2e", fontWeight: 500 }}>
                      {selectedProp.loan.rate}%
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#5a7272" }}>Lender: </span>
                    <span style={{ color: "#1a2e2e", fontWeight: 500 }}>
                      {selectedProp.loan.lender}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#5a7272" }}>Maturity: </span>
                    <span style={{ color: "#1a2e2e", fontWeight: 500 }}>
                      {selectedProp.loan.maturity}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PM info */}
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1a2e2e",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Property Management
              </h3>
              <div style={{ fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#5a7272" }}>Company: </span>
                  <span style={{ color: "#1a2e2e", fontWeight: 500 }}>
                    {selectedProp.pmCompany || "N/A"}
                  </span>
                </div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "#5a7272" }}>System: </span>
                  <span style={{ color: "#1a2e2e", fontWeight: 500 }}>
                    {selectedProp.pmSystem}
                  </span>
                </div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "#5a7272" }}>Investor: </span>
                  <span style={{ color: "#1a2e2e", fontWeight: 500 }}>
                    {selectedProp.investorGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* Review history */}
            {reviews.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1a2e2e",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Review History
                </h3>
                <table
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #d4dede" }}>
                      {["Month", "NOI", "Occ", "DSCR", "Coll", "Var", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: h === "Month" || h === "Status" ? "left" : "right",
                              padding: "5px 6px",
                              color: "#5a7272",
                              fontWeight: 500,
                              fontSize: "10px",
                              textTransform: "uppercase",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr
                        key={r.month}
                        style={{ borderBottom: "1px solid #f0f4f4" }}
                      >
                        <td style={{ padding: "5px 6px" }}>{r.month}</td>
                        <td style={{ padding: "5px 6px", textAlign: "right" }}>
                          {formatCurrency(r.noi)}
                        </td>
                        <td style={{ padding: "5px 6px", textAlign: "right" }}>
                          {r.occupancy}%
                        </td>
                        <td style={{ padding: "5px 6px", textAlign: "right" }}>
                          {r.dscr.toFixed(2)}
                        </td>
                        <td style={{ padding: "5px 6px", textAlign: "right" }}>
                          {r.collections}%
                        </td>
                        <td
                          style={{
                            padding: "5px 6px",
                            textAlign: "right",
                            color: r.budgetVariance < -3 ? "#c62828" : "#1a2e2e",
                          }}
                        >
                          {r.budgetVariance > 0 ? "+" : ""}
                          {r.budgetVariance}%
                        </td>
                        <td style={{ padding: "5px 6px", fontSize: "11px" }}>
                          {r.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Investor reports */}
            {reports.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1a2e2e",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Investor Reports
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {reports.map((r) => (
                    <div
                      key={r.quarter}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        background: "#f7f8f8",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      <span style={{ fontWeight: 500, color: "#1a2e2e" }}>
                        {r.quarter}
                      </span>
                      <span>
                        {r.distributionAmount > 0
                          ? formatCurrency(r.distributionAmount)
                          : "TBD"}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "10px",
                          fontWeight: 500,
                          background:
                            r.status === "published"
                              ? "#e8f5e9"
                              : r.status === "draft"
                              ? "#e8f0fe"
                              : "#fff3e0",
                          color:
                            r.status === "published"
                              ? "#2e7d32"
                              : r.status === "draft"
                              ? "#1565c0"
                              : "#e65100",
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
