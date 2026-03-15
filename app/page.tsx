"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties, monthlyReviews, formatCurrency } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";
import { Building2, Users, DollarSign, AlertTriangle } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

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
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: any;
  color?: string;
}) {
  return (
    <div className="bg-white border border-[#e4e4e7] rounded px-4 py-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wide">
          {label}
        </span>
        <Icon size={15} className="text-[#a1a1aa]" />
      </div>
      <div className={`text-[22px] font-semibold tracking-tight ${color || "text-[#18181b]"}`}>
        {value}
      </div>
      {sub && <p className="text-[11px] text-[#a1a1aa] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const isMobile = useIsMobile();

  const activeProperties = properties.filter((p) => p.status === "active");

  const totalUnits = activeProperties.reduce((s, p) => s + p.units, 0);

  const weightedOcc =
    activeProperties.reduce((s, p) => s + p.occupancy * p.units, 0) /
    totalUnits;

  const monthlyNOI = activeProperties.reduce(
    (s, p) => s + p.noi / 12,
    0
  );

  const overdueCount = activeProperties.filter(
    (p) => p.reviewStatus === "overdue"
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
            return `<span class="${colors[p.value] || ""} text-[12px] font-medium capitalize">${p.value}</span>`;
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
          return `<span class="${colors[p.value] || ""} text-[12px] font-medium capitalize">${p.value}</span>`;
        },
      },
      { field: "pmSystem", headerName: "PM System", width: 110 },
    ];
  }, [isMobile]);

  // Recent flagged reviews
  const recentFlags = monthlyReviews
    .filter((r) => r.flagCount > 0)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 5);

  // Chart data — occupancy by property
  const chartOptions: any = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, system-ui, sans-serif",
    },
    plotOptions: {
      bar: { borderRadius: 2, columnWidth: "55%" },
    },
    colors: ["#18181b"],
    xaxis: {
      categories: activeProperties.map((p) => p.name.replace(/ — .*/, "").replace("LEDG Portfolio", "LEDG")),
      labels: { style: { fontSize: "11px", colors: "#71717a" } },
    },
    yaxis: {
      min: 85,
      max: 100,
      labels: {
        style: { fontSize: "11px", colors: "#71717a" },
        formatter: (v: number) => `${v}%`,
      },
    },
    grid: { borderColor: "#f4f4f5", strokeDashArray: 3 },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (v: number) => `${v}%` },
    },
  };

  const chartSeries = [
    {
      name: "Occupancy",
      data: activeProperties.map((p) => p.occupancy),
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Portfolio overview and key performance indicators"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard
          label="Total Units"
          value={totalUnits.toLocaleString()}
          sub={`${activeProperties.length} active properties`}
          icon={Building2}
        />
        <KPICard
          label="Portfolio Occupancy"
          value={`${weightedOcc.toFixed(1)}%`}
          sub="Weighted average"
          icon={Users}
        />
        <KPICard
          label="Monthly NOI"
          value={formatCurrency(Math.round(monthlyNOI))}
          sub="Active portfolio"
          icon={DollarSign}
        />
        <KPICard
          label="Needs Review"
          value={String(overdueCount)}
          sub="Overdue financial reviews"
          icon={AlertTriangle}
          color={overdueCount > 0 ? "text-[#dc2626]" : undefined}
        />
      </div>

      {/* Occupancy Chart */}
      <div className="bg-white border border-[#e4e4e7] rounded p-4 mb-6">
        <h2 className="text-[13px] font-medium text-[#18181b] mb-3">
          Occupancy by Property
        </h2>
        <ApexChart
          type="bar"
          height={220}
          options={chartOptions}
          series={chartSeries}
        />
      </div>

      {/* Portfolio Summary Grid */}
      <div className="bg-white border border-[#e4e4e7] rounded p-4 mb-6">
        <h2 className="text-[13px] font-medium text-[#18181b] mb-3">
          Portfolio Summary
        </h2>
        <div className="ag-theme-alpine" style={{ height: 340, width: "100%" }}>
          <AgGridReact
            rowData={activeProperties}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
            animateRows
            suppressCellFocus
          />
        </div>
      </div>

      {/* Recent Flags */}
      <div className="bg-white border border-[#e4e4e7] rounded p-4">
        <h2 className="text-[13px] font-medium text-[#18181b] mb-3">
          Recent Financial Review Flags
        </h2>
        <div className="space-y-2">
          {recentFlags.map((r, i) => {
            const prop = properties.find((p) => p.id === r.propertyId);
            return (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 bg-[#fafafa] rounded text-[13px]"
              >
                <div>
                  <span className="font-medium text-[#18181b]">
                    {prop?.name}
                  </span>
                  <span className="text-[#a1a1aa] ml-2">{r.month}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#dc2626] font-medium">
                    {r.flagCount} flag{r.flagCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-[#71717a]">
                    Variance: {r.budgetVariance > 0 ? "+" : ""}
                    {r.budgetVariance}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
