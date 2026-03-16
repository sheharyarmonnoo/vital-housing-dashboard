import { properties, monthlyReviews, formatCurrency, Property, MonthlyReview } from "@/data/portfolio";

export type Severity = "Critical" | "Watch" | "Info";

export interface MaterialFinding {
  id: string;
  propertyId: string;
  propertyName: string;
  finding: string;
  recommendation: string;
  severity: Severity;
  category: "budget-variance" | "occupancy" | "collections" | "dscr" | "reclassification" | "reserve";
  dataPoint?: string;
}

function getReviewsForProperty(propertyId: string): MonthlyReview[] {
  return monthlyReviews
    .filter((r) => r.propertyId === propertyId)
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function generateFindings(propertyFilter?: string): MaterialFinding[] {
  const active = properties.filter(
    (p) => p.status === "active" || p.status === "pre-conversion"
  );

  const findings: MaterialFinding[] = [];
  let idCounter = 0;

  const target = propertyFilter
    ? active.filter((p) => p.id === propertyFilter || p.name.toLowerCase().includes(propertyFilter.toLowerCase()))
    : active;

  for (const prop of target) {
    const reviews = getReviewsForProperty(prop.id);
    if (reviews.length === 0) continue;

    const latest = reviews[reviews.length - 1];
    const prior = reviews.length >= 2 ? reviews[reviews.length - 2] : null;
    const threeAgo = reviews.length >= 3 ? reviews[reviews.length - 3] : null;

    // 1. Budget variance > 3% or >$2000 absolute
    if (Math.abs(latest.budgetVariance) > 3) {
      const direction = latest.budgetVariance < 0 ? "under" : "over";
      const absVar = Math.abs(latest.budgetVariance);
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `Budget variance of ${latest.budgetVariance > 0 ? "+" : ""}${latest.budgetVariance}% in ${latest.month} — NOI ${direction} budget by ${formatCurrency(Math.abs(latest.noi * absVar / 100))}`,
        recommendation: `Review GL detail for ${latest.month}. Identify top 2-3 line items driving the ${direction}spend. Request PM explanation for any items > $1,000.`,
        severity: absVar > 5 ? "Critical" : "Watch",
        category: "budget-variance",
        dataPoint: `${latest.budgetVariance > 0 ? "+" : ""}${latest.budgetVariance}%`,
      });
    }

    // Also check for persistent variance (2+ months with >3%)
    const recentReviews = reviews.slice(-3);
    const highVarMonths = recentReviews.filter((r) => Math.abs(r.budgetVariance) > 3);
    if (highVarMonths.length >= 2) {
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `Persistent budget variance — ${highVarMonths.length} of last 3 months exceeded 3% threshold (${highVarMonths.map((r) => `${r.month}: ${r.budgetVariance > 0 ? "+" : ""}${r.budgetVariance}%`).join(", ")})`,
        recommendation: `Escalate to PM. Request a line-by-line budget reforecast. Consider whether budget assumptions need revision for remainder of year.`,
        severity: "Critical",
        category: "budget-variance",
        dataPoint: `${highVarMonths.length}/3 months`,
      });
    }

    // 2. Occupancy change vs prior month
    if (prior && latest.occupancy !== prior.occupancy) {
      const delta = latest.occupancy - prior.occupancy;
      if (Math.abs(delta) >= 1.0) {
        findings.push({
          id: `md-${++idCounter}`,
          propertyId: prop.id,
          propertyName: prop.name,
          finding: `Occupancy ${delta > 0 ? "increased" : "dropped"} ${Math.abs(delta).toFixed(1)}pp (${prior.occupancy}% to ${latest.occupancy}%) from ${prior.month} to ${latest.month}`,
          recommendation: delta < 0
            ? `Investigate cause — check move-out reasons, pending applications, and market rent competitiveness. Request PM action plan.`
            : `Positive trend. Verify no concession-driven leasing that may impact future NOI.`,
          severity: delta < -2 ? "Critical" : delta < 0 ? "Watch" : "Info",
          category: "occupancy",
          dataPoint: `${delta > 0 ? "+" : ""}${delta.toFixed(1)}pp`,
        });
      }
    }

    // Also check occupancy vs 3 months ago
    if (threeAgo && prop.occupancy < 93) {
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `Occupancy at ${prop.occupancy}% — below 93% stabilized threshold. 3-month trend: ${threeAgo.occupancy}% → ${latest.occupancy}%`,
        recommendation: `Flag for PM call. Request lease-up plan with timeline. Review marketing spend and leasing velocity.`,
        severity: prop.occupancy < 90 ? "Critical" : "Watch",
        category: "occupancy",
        dataPoint: `${prop.occupancy}%`,
      });
    }

    // 3. Collections issues (<96%)
    if (latest.collections < 96) {
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `Collections at ${latest.collections}% in ${latest.month} — below 96% threshold`,
        recommendation: `Request aged receivables report from PM. Identify units with 60+ days past due. Verify eviction process is active where appropriate.`,
        severity: latest.collections < 93 ? "Critical" : "Watch",
        category: "collections",
        dataPoint: `${latest.collections}%`,
      });
    }

    // Check persistent collections issues
    const lowCollectionMonths = recentReviews.filter((r) => r.collections < 96);
    if (lowCollectionMonths.length >= 2) {
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `Chronic collections concern — below 96% in ${lowCollectionMonths.length} of last 3 months`,
        recommendation: `Schedule collections review call with PM. Assess whether bad debt reserve is adequate. Consider implementing stricter screening criteria.`,
        severity: "Critical",
        category: "collections",
        dataPoint: `${lowCollectionMonths.length}/3 months`,
      });
    }

    // 4. DSCR concerns (<1.15x)
    if (latest.dscr < 1.15 && latest.dscr > 0) {
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `DSCR at ${latest.dscr.toFixed(2)}x in ${latest.month} — below 1.15x covenant comfort zone`,
        recommendation: latest.dscr < 1.10
          ? `URGENT: Review loan covenant requirements. Model 3-month forward DSCR. Identify levers to improve (rent increases, expense cuts, reserve draws).`
          : `Monitor closely. Ensure next month's projected NOI keeps DSCR above covenant threshold. Prepare lender communication if trending down.`,
        severity: latest.dscr < 1.10 ? "Critical" : "Watch",
        category: "dscr",
        dataPoint: `${latest.dscr.toFixed(2)}x`,
      });
    }

    // DSCR trending down
    if (reviews.length >= 3) {
      const last3DSCR = reviews.slice(-3).map((r) => r.dscr);
      if (last3DSCR[0] > last3DSCR[1] && last3DSCR[1] > last3DSCR[2] && last3DSCR[2] < 1.25) {
        findings.push({
          id: `md-${++idCounter}`,
          propertyId: prop.id,
          propertyName: prop.name,
          finding: `DSCR declining for 3 consecutive months: ${last3DSCR.map((d) => d.toFixed(2) + "x").join(" → ")}`,
          recommendation: `Investigate root cause — expense growth outpacing revenue? Model forward projections to assess covenant risk.`,
          severity: last3DSCR[2] < 1.15 ? "Critical" : "Watch",
          category: "dscr",
          dataPoint: `${last3DSCR[2].toFixed(2)}x`,
        });
      }
    }

    // 5. Items needing reclassification (flagged anomalies)
    if (latest.flagCount > 0) {
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `${latest.flagCount} GL anomal${latest.flagCount === 1 ? "y" : "ies"} flagged in ${latest.month} — potential reclassification needed`,
        recommendation: `Review flagged line items. Determine if expenses should be reclassified (R&M vs CapEx, operating vs non-recurring). Document decisions.`,
        severity: latest.flagCount >= 3 ? "Watch" : "Info",
        category: "reclassification",
        dataPoint: `${latest.flagCount} flags`,
      });
    }

    // 6. Reserve eligibility — high expense months may indicate reserve-eligible items
    const avgExpenses = reviews.reduce((s, r) => s + r.expenses, 0) / reviews.length;
    if (latest.expenses > avgExpenses * 1.1) {
      const overage = latest.expenses - avgExpenses;
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `Expenses ${formatCurrency(latest.expenses)} in ${latest.month} — ${((latest.expenses / avgExpenses - 1) * 100).toFixed(0)}% above 6-month average (${formatCurrency(Math.round(avgExpenses))})`,
        recommendation: `Review for replacement reserve eligible items (roofing, HVAC, appliances, flooring). Items over $2,500 may qualify. File reserve draw request if applicable.`,
        severity: overage > 10000 ? "Watch" : "Info",
        category: "reserve",
        dataPoint: formatCurrency(Math.round(overage)) + " above avg",
      });
    }

    // Review status check
    if (prop.reviewStatus === "overdue") {
      findings.push({
        id: `md-${++idCounter}`,
        propertyId: prop.id,
        propertyName: prop.name,
        finding: `Financial review is OVERDUE — last reviewed ${prop.lastReviewDate}`,
        recommendation: `Contact PM immediately for outstanding financial package. This blocks the monthly close cycle and investor reporting.`,
        severity: "Critical",
        category: "budget-variance",
        dataPoint: "Overdue",
      });
    }
  }

  // Sort by severity (Critical first, then Watch, then Info)
  const severityOrder: Record<Severity, number> = { Critical: 0, Watch: 1, Info: 2 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return findings;
}

export function generateEmailDraft(finding: MaterialFinding): string {
  const prop = properties.find((p) => p.id === finding.propertyId);
  const pmCompany = prop?.pmCompany || "Property Management Team";

  return `Subject: Action Required — ${prop?.name} — ${finding.category.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}

Dear ${pmCompany},

Following our review of ${prop?.name} financials, the following item requires your attention:

FINDING: ${finding.finding}

REQUESTED ACTION: ${finding.recommendation}

Please respond with your assessment and corrective action plan within 2 business days.

Thank you,
Christina Adams
Director of Finance, Vital Housing Group`;
}

// KPI calculation utilities for PropertyDetail
export interface PropertyKPIs {
  revenueTrend: "up" | "down" | "flat";
  revenueTrendPct: number;
  expenseTrend: "up" | "down" | "flat";
  expenseTrendPct: number;
  noiMargin: number;
  occupancyChange3m: number;
  collectionsTrend: "up" | "down" | "flat";
  collectionsAvg: number;
  dscrTrend: "up" | "down" | "flat";
  dscrCurrent: number;
  budgetAdherence: number; // % of months within 3% of budget
}

export function calculatePropertyKPIs(propertyId: string): PropertyKPIs | null {
  const reviews = getReviewsForProperty(propertyId);
  if (reviews.length < 2) return null;

  const latest = reviews[reviews.length - 1];
  const threeAgo = reviews.length >= 4 ? reviews[reviews.length - 4] : reviews[0];

  // Revenue trend (latest 3 months)
  const recent3 = reviews.slice(-3);
  const revFirst = recent3[0].revenue;
  const revLast = recent3[recent3.length - 1].revenue;
  const revPct = ((revLast - revFirst) / revFirst) * 100;
  const revenueTrend = revPct > 1 ? "up" : revPct < -1 ? "down" : "flat";

  // Expense trend
  const expFirst = recent3[0].expenses;
  const expLast = recent3[recent3.length - 1].expenses;
  const expPct = ((expLast - expFirst) / expFirst) * 100;
  const expenseTrend = expPct > 1 ? "up" : expPct < -1 ? "down" : "flat";

  // NOI margin
  const noiMargin = latest.revenue > 0 ? (latest.noi / latest.revenue) * 100 : 0;

  // Occupancy change vs 3 months ago
  const occupancyChange3m = latest.occupancy - threeAgo.occupancy;

  // Collections trend
  const collectionsAvg = recent3.reduce((s, r) => s + r.collections, 0) / recent3.length;
  const collFirst = recent3[0].collections;
  const collLast = recent3[recent3.length - 1].collections;
  const collectionsTrend = collLast > collFirst + 0.5 ? "up" : collLast < collFirst - 0.5 ? "down" : "flat";

  // DSCR trend
  const dscrFirst = recent3[0].dscr;
  const dscrLast = recent3[recent3.length - 1].dscr;
  const dscrTrend = dscrLast > dscrFirst + 0.02 ? "up" : dscrLast < dscrFirst - 0.02 ? "down" : "flat";

  // Budget adherence (% of months within 3%)
  const withinBudget = reviews.filter((r) => Math.abs(r.budgetVariance) <= 3).length;
  const budgetAdherence = (withinBudget / reviews.length) * 100;

  return {
    revenueTrend,
    revenueTrendPct: Math.round(revPct * 10) / 10,
    expenseTrend,
    expenseTrendPct: Math.round(expPct * 10) / 10,
    noiMargin: Math.round(noiMargin * 10) / 10,
    occupancyChange3m: Math.round(occupancyChange3m * 10) / 10,
    collectionsTrend,
    collectionsAvg: Math.round(collectionsAvg * 10) / 10,
    dscrTrend,
    dscrCurrent: dscrLast,
    budgetAdherence: Math.round(budgetAdherence),
  };
}
