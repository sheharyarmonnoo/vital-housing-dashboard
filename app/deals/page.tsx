"use client";
import { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import PageHeader from "@/components/PageHeader";
import Drawer from "@/components/Drawer";
import {
  properties,
  alderwoodDeal,
  alderwoodRentComps,
  formatCurrency,
  type UnitMix,
} from "@/data/portfolio";

ModuleRegistry.registerModules([AllCommunityModule]);

const PIPELINE_STEPS = [
  "Prescreen",
  "Model",
  "IC Review",
  "LOI",
  "Due Diligence",
  "Close",
];
const CURRENT_STEP = 4; // Due Diligence (0-indexed)

interface CompRow {
  name: string;
  location: string;
  units: number;
  yearBuilt: number;
  avgRent: number;
  occupancy: number;
  distance: string;
  rentPerSF: number;
}

export default function DealsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const alderwood = properties.find((p) => p.id === "alderwood");

  const compColDefs = useMemo<ColDef<CompRow>[]>(
    () => [
      {
        field: "name",
        headerName: "Property",
        flex: 2,
        minWidth: 160,
        cellRenderer: (params: { value: string }) => {
          const isSubject = params.value.includes("Subject");
          return `<span style="font-weight:${isSubject ? 700 : 400}">${params.value}</span>`;
        },
      },
      { field: "units", headerName: "Units", width: 75 },
      { field: "yearBuilt", headerName: "Built", width: 75 },
      {
        field: "avgRent",
        headerName: "Avg Rent",
        width: 100,
        valueFormatter: (p: { value: number }) => `$${p.value.toLocaleString()}`,
      },
      {
        field: "occupancy",
        headerName: "Occ %",
        width: 80,
        valueFormatter: (p: { value: number }) => `${p.value}%`,
      },
      {
        field: "rentPerSF",
        headerName: "$/SF",
        width: 75,
        valueFormatter: (p: { value: number }) => `$${p.value.toFixed(2)}`,
      },
      { field: "distance", headerName: "Distance", width: 90 },
    ],
    []
  );

  const unitMixColDefs = useMemo<ColDef<UnitMix>[]>(
    () => [
      { field: "type", headerName: "Unit Type", flex: 1 },
      { field: "count", headerName: "Count", width: 80 },
      { field: "avgSF", headerName: "Avg SF", width: 90 },
      {
        field: "avgRent",
        headerName: "Avg Rent",
        width: 100,
        valueFormatter: (p: { value: number }) => `$${p.value.toLocaleString()}`,
      },
    ],
    []
  );

  if (!alderwood) return <div>No deals in pipeline.</div>;

  return (
    <>
      <PageHeader
        title="Acquisition Pipeline"
        subtitle="Active deals and due diligence tracking"
      />

      {/* Deal card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #d4dede",
          borderRadius: "4px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1a2e2e",
                margin: 0,
              }}
            >
              {alderwood.name}
            </h2>
            <p style={{ fontSize: "13px", color: "#5a7272", margin: "2px 0 0" }}>
              {alderwood.address || alderwood.location} &middot;{" "}
              {alderwoodDeal.vintage} &middot; {alderwoodDeal.acreage} acres
              &middot; {alderwoodDeal.buildings} buildings
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
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
            Full Details
          </button>
        </div>

        {/* Key metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            { label: "Units", value: String(alderwood.units) },
            { label: "Occupancy", value: `${alderwoodDeal.occupancy}%` },
            { label: "Trailing NOI", value: formatCurrency(alderwoodDeal.trailingNOI) },
            { label: "Avg Rent/Unit", value: `$${alderwoodDeal.avgRentPerUnit.toLocaleString()}` },
            { label: "Avg Rent/SF", value: `$${alderwoodDeal.avgRentPerSF.toFixed(2)}` },
            { label: "Total SF", value: alderwoodDeal.totalSF.toLocaleString() },
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
            </div>
          ))}
        </div>

        {/* Pipeline stepper */}
        <div style={{ marginBottom: "20px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#1a2e2e",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Pipeline Status
          </h3>
          <div style={{ display: "flex", gap: "4px" }}>
            {PIPELINE_STEPS.map((step, i) => {
              const isComplete = i < CURRENT_STEP;
              const isCurrent = i === CURRENT_STEP;
              return (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      height: "6px",
                      borderRadius: "3px",
                      background: isComplete
                        ? "#2e7d32"
                        : isCurrent
                        ? "#4a6b6b"
                        : "#d4dede",
                      marginBottom: "6px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: isCurrent ? 700 : 400,
                      color: isCurrent
                        ? "#1a2e2e"
                        : isComplete
                        ? "#2e7d32"
                        : "#5a7272",
                    }}
                  >
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Renovation status */}
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
            Renovation Status
          </h3>
          <div style={{ display: "flex", gap: "3px", height: "24px", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                flex: alderwoodDeal.renovationStatus.renovated,
                background: "#4a6b6b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: "#fff",
                fontWeight: 500,
              }}
            >
              {alderwoodDeal.renovationStatus.renovated} Renovated
            </div>
            <div
              style={{
                flex: alderwoodDeal.renovationStatus.classic,
                background: "#d4dede",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: "#5a7272",
                fontWeight: 500,
              }}
            >
              {alderwoodDeal.renovationStatus.classic} Classic
            </div>
          </div>
        </div>

        {/* Risks and Opportunities */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#c62828",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Risks
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {alderwoodDeal.risks.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 10px",
                    background: "#fef2f2",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#1a2e2e",
                    lineHeight: "1.5",
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#2e7d32",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Opportunities
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {alderwoodDeal.opportunities.map((o, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 10px",
                    background: "#f0faf0",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#1a2e2e",
                    lineHeight: "1.5",
                  }}
                >
                  {o}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rent Comps Grid */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1a2e2e",
            marginBottom: "8px",
          }}
        >
          Rent Comparables
        </h3>
        <div className="ag-theme-alpine" style={{ width: "100%", height: "280px" }}>
          <AgGridReact<CompRow>
            rowData={alderwoodRentComps}
            columnDefs={compColDefs}
            suppressCellFocus
            animateRows={false}
          />
        </div>
      </div>

      {/* Unit Mix Grid */}
      <div>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1a2e2e",
            marginBottom: "8px",
          }}
        >
          Unit Mix
        </h3>
        <div className="ag-theme-alpine" style={{ width: "100%", height: "180px" }}>
          <AgGridReact<UnitMix>
            rowData={alderwoodDeal.unitMix}
            columnDefs={unitMixColDefs}
            suppressCellFocus
            animateRows={false}
          />
        </div>
      </div>

      {/* Full details drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`${alderwood.name} — Full Deal Summary`}
        width="650px"
      >
        <div>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e2e", marginBottom: "6px" }}>
              Property Details
            </h3>
            <div style={{ fontSize: "13px", lineHeight: "1.8", color: "#1a2e2e" }}>
              <div>
                <span style={{ color: "#5a7272" }}>Location:</span>{" "}
                {alderwood.address || alderwood.location}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Built:</span>{" "}
                {alderwoodDeal.vintage}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Acreage:</span>{" "}
                {alderwoodDeal.acreage}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Buildings:</span>{" "}
                {alderwoodDeal.buildings}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Total SF:</span>{" "}
                {alderwoodDeal.totalSF.toLocaleString()}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Units:</span>{" "}
                {alderwood.units}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e2e", marginBottom: "6px" }}>
              Financial Summary
            </h3>
            <div style={{ fontSize: "13px", lineHeight: "1.8", color: "#1a2e2e" }}>
              <div>
                <span style={{ color: "#5a7272" }}>Trailing NOI:</span>{" "}
                {formatCurrency(alderwoodDeal.trailingNOI)}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Avg Rent/Unit:</span>{" "}
                ${alderwoodDeal.avgRentPerUnit.toLocaleString()}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Avg Rent/SF:</span>{" "}
                ${alderwoodDeal.avgRentPerSF.toFixed(2)}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Bad Debt (T12):</span>{" "}
                {formatCurrency(alderwoodDeal.badDebt)}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Tax Exemption:</span>{" "}
                {alderwoodDeal.taxExemption}
              </div>
              <div>
                <span style={{ color: "#5a7272" }}>Water/Sewer Concern:</span>{" "}
                {alderwoodDeal.waterSewerConcern ? "Yes — above market" : "No"}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e2e", marginBottom: "6px" }}>
              Unit Mix
            </h3>
            {alderwoodDeal.unitMix.map((u) => (
              <div
                key={u.type}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #f0f4f4",
                  fontSize: "13px",
                }}
              >
                <span>{u.type}</span>
                <span style={{ color: "#5a7272" }}>
                  {u.count} units &middot; {u.avgSF} SF &middot; $
                  {u.avgRent.toLocaleString()}/mo
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#c62828", marginBottom: "6px" }}>
              Risks
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.7", color: "#1a2e2e" }}>
              {alderwoodDeal.risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#2e7d32", marginBottom: "6px" }}>
              Opportunities
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.7", color: "#1a2e2e" }}>
              {alderwoodDeal.opportunities.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </Drawer>
    </>
  );
}
