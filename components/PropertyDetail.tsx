"use client";
import { Property, monthlyReviews, investorReports, formatCurrency } from "@/data/portfolio";
import { calculatePropertyKPIs, PropertyKPIs } from "@/lib/material-drivers";

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] text-[#8aabab] uppercase tracking-wide">{label}</p>
      <p className={`text-[13px] mt-0.5 ${color || "text-[#1a2e2e]"}`}>{value}</p>
    </div>
  );
}

function TrendIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "up")
    return <svg width="12" height="12" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M7 17l5-5 5 5" /><path d="M7 7l5 5 5-5" strokeOpacity="0" /></svg>;
  if (direction === "down")
    return <svg width="12" height="12" fill="none" stroke="#dc2626" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M7 7l5 5 5-5" /></svg>;
  return <svg width="12" height="12" fill="none" stroke="#d97706" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14" /></svg>;
}

function KPISmallCard({
  label,
  value,
  trend,
  trendLabel,
  good,
}: {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  good?: boolean;
}) {
  return (
    <div className="bg-[#f5f8f8] rounded px-3 py-2">
      <p className="text-[9px] text-[#8aabab] uppercase tracking-wide mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className={`text-[14px] font-semibold ${good === false ? "text-[#dc2626]" : good === true ? "text-[#16a34a]" : "text-[#1a2e2e]"}`}>
          {value}
        </span>
        {trend && <TrendIcon direction={trend} />}
      </div>
      {trendLabel && <p className="text-[9px] text-[#8aabab] mt-0.5">{trendLabel}</p>}
    </div>
  );
}

function KPISection({ kpis }: { kpis: PropertyKPIs }) {
  return (
    <div>
      <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Automated KPIs (3-Month)</p>
      <div className="grid grid-cols-2 gap-2">
        <KPISmallCard
          label="Revenue Trend"
          value={`${kpis.revenueTrendPct > 0 ? "+" : ""}${kpis.revenueTrendPct}%`}
          trend={kpis.revenueTrend}
          trendLabel="3-month direction"
          good={kpis.revenueTrend === "up" ? true : kpis.revenueTrend === "down" ? false : undefined}
        />
        <KPISmallCard
          label="Expense Trend"
          value={`${kpis.expenseTrendPct > 0 ? "+" : ""}${kpis.expenseTrendPct}%`}
          trend={kpis.expenseTrend}
          trendLabel="3-month direction"
          good={kpis.expenseTrend === "down" ? true : kpis.expenseTrend === "up" ? false : undefined}
        />
        <KPISmallCard
          label="NOI Margin"
          value={`${kpis.noiMargin}%`}
          good={kpis.noiMargin >= 35 ? true : kpis.noiMargin < 25 ? false : undefined}
        />
        <KPISmallCard
          label="Occupancy Change"
          value={`${kpis.occupancyChange3m > 0 ? "+" : ""}${kpis.occupancyChange3m}pp`}
          trend={kpis.occupancyChange3m > 0 ? "up" : kpis.occupancyChange3m < 0 ? "down" : "flat"}
          trendLabel="vs 3 months ago"
          good={kpis.occupancyChange3m > 0 ? true : kpis.occupancyChange3m < -1 ? false : undefined}
        />
        <KPISmallCard
          label="Collections Rate"
          value={`${kpis.collectionsAvg}%`}
          trend={kpis.collectionsTrend}
          trendLabel="3-month avg"
          good={kpis.collectionsAvg >= 97 ? true : kpis.collectionsAvg < 95 ? false : undefined}
        />
        <KPISmallCard
          label="DSCR"
          value={`${kpis.dscrCurrent.toFixed(2)}x`}
          trend={kpis.dscrTrend}
          good={kpis.dscrCurrent >= 1.25 ? true : kpis.dscrCurrent < 1.15 ? false : undefined}
        />
        <KPISmallCard
          label="Budget Adherence"
          value={`${kpis.budgetAdherence}%`}
          trendLabel="Months within 3%"
          good={kpis.budgetAdherence >= 80 ? true : kpis.budgetAdherence < 50 ? false : undefined}
        />
      </div>
    </div>
  );
}

export default function PropertyDetail({ property }: { property: Property }) {
  const reviews = monthlyReviews.filter(r => r.propertyId === property.id).sort((a, b) => b.month.localeCompare(a.month));
  const reports = investorReports.filter(r => r.propertyId === property.id);
  const latestReview = reviews[0];
  const kpis = calculatePropertyKPIs(property.id);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {kpis && <KPISection kpis={kpis} />}

      {/* Property info */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location" value={property.address || property.location} />
        <Field label="Units" value={`${property.units} units`} />
        <Field label="Year Built" value={property.yearBuilt ? String(property.yearBuilt) : "—"} />
        <Field label="Role" value={property.role.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())} />
        <Field label="PM System" value={property.pmSystem} />
        {property.pmCompany && <Field label="PM Company" value={property.pmCompany} />}
        <Field label="Investor Group" value={property.investorGroup} />
        <Field label="Status" value={property.status.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())} />
      </div>

      {/* Key metrics */}
      <div>
        <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Key Metrics</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Occupancy" value={`${property.occupancy}%`} color={property.occupancy >= 95 ? "text-[#16a34a]" : property.occupancy >= 90 ? "text-[#1a2e2e]" : "text-[#dc2626]"} />
          <Field label="Annual NOI" value={formatCurrency(property.noi)} />
          <Field label="Monthly Revenue" value={formatCurrency(property.monthlyRevenue)} />
          <Field label="Review Status" value={property.reviewStatus.charAt(0).toUpperCase() + property.reviewStatus.slice(1)}
            color={property.reviewStatus === "current" ? "text-[#16a34a]" : property.reviewStatus === "overdue" ? "text-[#dc2626]" : "text-[#d97706]"} />
        </div>
      </div>

      {/* Loan details */}
      {property.loan && (
        <div>
          <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Loan Details</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lender" value={property.loan.lender} />
            <Field label="Amount" value={formatCurrency(property.loan.amount)} />
            <Field label="Rate" value={`${property.loan.rate}%`} />
            <Field label="Maturity" value={property.loan.maturity} />
          </div>
          {property.acquisitionPrice && <Field label="Acquisition Price" value={formatCurrency(property.acquisitionPrice)} />}
        </div>
      )}

      {/* Latest financial review */}
      {latestReview && (
        <div>
          <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Latest Review — {latestReview.month}</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Revenue" value={formatCurrency(latestReview.revenue)} />
            <Field label="Expenses" value={formatCurrency(latestReview.expenses)} />
            <Field label="NOI" value={formatCurrency(latestReview.noi)} />
            <Field label="Budget Variance" value={`${latestReview.budgetVariance > 0 ? "+" : ""}${latestReview.budgetVariance}%`}
              color={latestReview.budgetVariance >= 0 ? "text-[#16a34a]" : Math.abs(latestReview.budgetVariance) > 3 ? "text-[#dc2626]" : "text-[#d97706]"} />
            <Field label="Collections" value={`${latestReview.collections}%`} />
            <Field label="DSCR" value={latestReview.dscr.toFixed(2)}
              color={latestReview.dscr >= 1.25 ? "text-[#16a34a]" : latestReview.dscr >= 1.1 ? "text-[#d97706]" : "text-[#dc2626]"} />
            <Field label="Flags" value={`${latestReview.flagCount} anomalies`} color={latestReview.flagCount > 0 ? "text-[#d97706]" : undefined} />
            <Field label="Status" value={latestReview.status.charAt(0).toUpperCase() + latestReview.status.slice(1)} />
          </div>
        </div>
      )}

      {/* Review history */}
      {reviews.length > 1 && (
        <div>
          <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Review History</p>
          <div className="border border-[#d4dede] rounded overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-[#f0f4f4]">
                <tr className="text-[#5a7272] uppercase tracking-wide text-[9px]">
                  <th className="text-left px-3 py-2">Month</th>
                  <th className="text-right px-3 py-2">NOI</th>
                  <th className="text-right px-3 py-2">Var %</th>
                  <th className="text-right px-3 py-2">Occ</th>
                  <th className="text-right px-3 py-2">DSCR</th>
                </tr>
              </thead>
              <tbody>
                {reviews.slice(0, 6).map(r => (
                  <tr key={r.month} className="border-t border-[#eaf0f0]">
                    <td className="px-3 py-1.5 text-[#1a2e2e]">{r.month}</td>
                    <td className="px-3 py-1.5 text-right text-[#1a2e2e]">{formatCurrency(r.noi)}</td>
                    <td className={`px-3 py-1.5 text-right font-medium ${r.budgetVariance >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                      {r.budgetVariance > 0 ? "+" : ""}{r.budgetVariance}%
                    </td>
                    <td className="px-3 py-1.5 text-right text-[#1a2e2e]">{r.occupancy}%</td>
                    <td className={`px-3 py-1.5 text-right font-medium ${r.dscr >= 1.25 ? "text-[#16a34a]" : r.dscr >= 1.1 ? "text-[#d97706]" : "text-[#dc2626]"}`}>
                      {r.dscr.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Investor reports */}
      {reports.length > 0 && (
        <div>
          <p className="text-[10px] text-[#8aabab] uppercase tracking-wide font-medium mb-2">Investor Reports</p>
          <div className="space-y-1.5">
            {reports.map(r => (
              <div key={r.quarter} className="flex items-center justify-between py-1.5 border-b border-[#eaf0f0] last:border-0 text-[12px]">
                <span className="text-[#1a2e2e] font-medium">{r.quarter}</span>
                <div className="flex items-center gap-3">
                  {r.distributionAmount > 0 && <span className="text-[#5a7272]">{formatCurrency(r.distributionAmount)}</span>}
                  <span className={`text-[11px] font-medium ${
                    r.status === "published" ? "text-[#16a34a]" : r.status === "draft" ? "text-[#d97706]" : "text-[#8aabab]"
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
