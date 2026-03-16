import {
  properties,
  monthlyReviews,
  type MonthlyReview,
  type Property,
  formatCurrency,
} from "@/data/portfolio";

export interface Finding {
  id: string;
  propertyId: string;
  propertyName: string;
  severity: "Critical" | "Watch" | "Info";
  finding: string;
  action: string;
  month: string;
  resolved: boolean;
}

export interface PropertyKPIs {
  propertyId: string;
  propertyName: string;
  currentOccupancy: number;
  occupancyTrend: number; // change over period
  currentNOI: number;
  noiTrend: number;
  avgCollections: number;
  avgDSCR: number;
  avgBudgetVariance: number;
  flagCount: number;
}

const RESOLVED_KEY = "vital_resolved_findings";

export function loadResolved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(RESOLVED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveResolved(ids: Set<string>) {
  if (typeof window !== "undefined")
    localStorage.setItem(RESOLVED_KEY, JSON.stringify([...ids]));
}

export function generateFindings(propertyId?: string): Finding[] {
  const findings: Finding[] = [];
  const resolved = loadResolved();
  const props = propertyId
    ? properties.filter((p) => p.id === propertyId)
    : properties.filter((p) => p.status !== "pipeline");

  for (const prop of props) {
    const reviews = monthlyReviews
      .filter((r) => r.propertyId === prop.id)
      .sort((a, b) => a.month.localeCompare(b.month));
    if (reviews.length === 0) continue;

    const latest = reviews[reviews.length - 1];
    const prev = reviews.length > 1 ? reviews[reviews.length - 2] : null;

    // Overdue review
    if (prop.reviewStatus === "overdue") {
      findings.push({
        id: `${prop.id}-overdue`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: "Critical",
        finding: `Monthly review is overdue. Last reviewed ${prop.lastReviewDate || "never"}.`,
        action: "Contact PM immediately for financial package delivery.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-overdue`),
      });
    }

    // Low occupancy
    if (prop.occupancy < 93) {
      findings.push({
        id: `${prop.id}-occ`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: prop.occupancy < 90 ? "Critical" : "Watch",
        finding: `Occupancy at ${prop.occupancy}% — below 93% threshold.`,
        action: "Request leasing activity report and marketing plan from PM.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-occ`),
      });
    }

    // Low collections
    if (latest.collections < 96) {
      findings.push({
        id: `${prop.id}-coll-${latest.month}`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: latest.collections < 94 ? "Critical" : "Watch",
        finding: `Collections at ${latest.collections}% for ${latest.month} — below 96% target.`,
        action: "Request delinquency aging report and eviction status update.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-coll-${latest.month}`),
      });
    }

    // Budget variance
    if (latest.budgetVariance < -3) {
      findings.push({
        id: `${prop.id}-bvar-${latest.month}`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: latest.budgetVariance < -5 ? "Critical" : "Watch",
        finding: `Budget variance of ${latest.budgetVariance}% for ${latest.month} — expense overrun.`,
        action: "Request line-item expense detail. Identify top 3 variance drivers.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-bvar-${latest.month}`),
      });
    }

    // DSCR concern
    if (latest.dscr < 1.15) {
      findings.push({
        id: `${prop.id}-dscr-${latest.month}`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: latest.dscr < 1.1 ? "Critical" : "Watch",
        finding: `DSCR at ${latest.dscr.toFixed(2)} for ${latest.month} — approaching covenant threshold.`,
        action: "Prepare lender communication. Model NOI improvement scenarios.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-dscr-${latest.month}`),
      });
    }

    // Management transition
    if (prop.managementTransition) {
      findings.push({
        id: `${prop.id}-transition`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: "Watch",
        finding: "Property flagged for management transition. Additional oversight required.",
        action: "Schedule transition planning call with current and incoming PM.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-transition`),
      });
    }

    // NOI decline
    if (prev && latest.noi < prev.noi * 0.95) {
      const drop = Math.round(
        ((prev.noi - latest.noi) / prev.noi) * 100 * 10
      ) / 10;
      findings.push({
        id: `${prop.id}-noi-drop-${latest.month}`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: drop > 10 ? "Critical" : "Watch",
        finding: `NOI declined ${drop}% month-over-month (${formatCurrency(prev.noi)} to ${formatCurrency(latest.noi)}).`,
        action: "Investigate revenue shortfall vs. expense increase. Request PM narrative.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-noi-drop-${latest.month}`),
      });
    }

    // Pending draft
    if (latest.status === "pending") {
      findings.push({
        id: `${prop.id}-pending-${latest.month}`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: "Info",
        finding: `${latest.month} financial package is pending — awaiting PM delivery.`,
        action: "Confirm expected delivery date with PM.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-pending-${latest.month}`),
      });
    }

    // Flag count
    if (latest.flagCount >= 3) {
      findings.push({
        id: `${prop.id}-flags-${latest.month}`,
        propertyId: prop.id,
        propertyName: prop.name,
        severity: "Watch",
        finding: `${latest.flagCount} anomalies flagged in ${latest.month} review.`,
        action: "Review flagged line items. Prepare questions for PM questionnaire.",
        month: latest.month,
        resolved: resolved.has(`${prop.id}-flags-${latest.month}`),
      });
    }
  }

  // Sort: Critical first, then Watch, then Info; unresolved first
  const order = { Critical: 0, Watch: 1, Info: 2 };
  findings.sort((a, b) => {
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
    return order[a.severity] - order[b.severity];
  });

  return findings;
}

export function generateEmailDraft(
  propertyName: string,
  pmCompany: string | undefined,
  findings: Finding[]
): string {
  const items = findings
    .filter((f) => !f.resolved)
    .map((f, i) => `${i + 1}. ${f.finding}\n   Action needed: ${f.action}`)
    .join("\n\n");

  return `Subject: ${propertyName} — Monthly Review Follow-Up Items

Dear ${pmCompany || "Property Management"} Team,

Following our review of the latest financial package for ${propertyName}, we have identified the following items requiring your attention:

${items}

Please provide responses to each item by end of business this week. If any items require additional time to research, please confirm expected delivery date.

Thank you,
Christina Adams
Director of Finance, Vital Housing Group`;
}

export function calculatePropertyKPIs(propertyId: string): PropertyKPIs | null {
  const prop = properties.find((p) => p.id === propertyId);
  if (!prop) return null;

  const reviews = monthlyReviews
    .filter((r) => r.propertyId === propertyId)
    .sort((a, b) => a.month.localeCompare(b.month));

  if (reviews.length === 0) {
    return {
      propertyId: prop.id,
      propertyName: prop.name,
      currentOccupancy: prop.occupancy,
      occupancyTrend: 0,
      currentNOI: prop.noi / 12,
      noiTrend: 0,
      avgCollections: 0,
      avgDSCR: 0,
      avgBudgetVariance: 0,
      flagCount: 0,
    };
  }

  const latest = reviews[reviews.length - 1];
  const first = reviews[0];

  return {
    propertyId: prop.id,
    propertyName: prop.name,
    currentOccupancy: latest.occupancy,
    occupancyTrend: Math.round((latest.occupancy - first.occupancy) * 10) / 10,
    currentNOI: latest.noi,
    noiTrend:
      first.noi !== 0
        ? Math.round(((latest.noi - first.noi) / first.noi) * 100 * 10) / 10
        : 0,
    avgCollections:
      Math.round(
        (reviews.reduce((s, r) => s + r.collections, 0) / reviews.length) * 10
      ) / 10,
    avgDSCR:
      Math.round(
        (reviews.reduce((s, r) => s + r.dscr, 0) / reviews.length) * 100
      ) / 100,
    avgBudgetVariance:
      Math.round(
        (reviews.reduce((s, r) => s + r.budgetVariance, 0) / reviews.length) *
          10
      ) / 10,
    flagCount: reviews.reduce((s, r) => s + r.flagCount, 0),
  };
}
