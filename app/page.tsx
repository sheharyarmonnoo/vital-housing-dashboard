"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties, monthlyReviews, actionItems, formatCurrency } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";

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

export default function DashboardPage() {
  const isMobile = useIsMobile();

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
            animateRows
            suppressCellFocus
          />
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white border border-[#d4dede] rounded p-4">
        <h2 className="text-[13px] font-medium text-[#1a2e2e] mb-3">
          Action Items
        </h2>
        <div className="space-y-2">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between py-2.5 px-3 bg-[#f5f8f8] rounded text-[13px]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-medium uppercase tracking-wide ${priorityColors[item.priority]}`}>
                    {item.priority}
                  </span>
                  <span className="text-[10px] text-[#8aabab] uppercase tracking-wide">
                    {item.type.replace("-", " ")}
                  </span>
                </div>
                <p className="font-medium text-[#1a2e2e]">{item.property}</p>
                <p className="text-[12px] text-[#5a7272] mt-0.5">{item.description}</p>
              </div>
              <div className="text-right ml-3 shrink-0">
                <p className="text-[11px] text-[#8aabab]">{item.assignee}</p>
                <p className="text-[11px] text-[#5a7272]">Due {item.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
