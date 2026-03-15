// Vital Housing portfolio data — derived from meeting recordings and proposal

export type PropertyRole = "core" | "co-gp" | "third-party" | "acquisition";
export type PMSystem = "Yardi" | "AppFolio" | "Resmin" | "Other";

export interface Property {
  id: string;
  name: string;
  location: string;
  units: number;
  role: PropertyRole;
  pmSystem: PMSystem;
  investorGroup: string;
  occupancy: number;
  noi: number; // annual
  monthlyRevenue: number;
  status: "active" | "pre-conversion" | "pipeline";
  lastReviewDate: string;
  reviewStatus: "current" | "pending" | "overdue";
}

export const properties: Property[] = [
  // Core properties
  { id: "courtside", name: "Courtside Apartments", location: "Portland, OR", units: 120, role: "core", pmSystem: "Yardi", investorGroup: "Enterprise Community Partners", occupancy: 96.7, noi: 1850000, monthlyRevenue: 215000, status: "active", lastReviewDate: "2026-02-28", reviewStatus: "current" },
  { id: "belmont", name: "Belmont Dairy", location: "Portland, OR", units: 85, role: "core", pmSystem: "AppFolio", investorGroup: "Freestone Capital", occupancy: 94.1, noi: 1250000, monthlyRevenue: 168000, status: "active", lastReviewDate: "2026-02-28", reviewStatus: "current" },
  { id: "orchard-park", name: "Orchard Park", location: "Portland, OR", units: 64, role: "core", pmSystem: "Resmin", investorGroup: "Vital 12", occupancy: 91.0, noi: 780000, monthlyRevenue: 102000, status: "pre-conversion", lastReviewDate: "2026-02-15", reviewStatus: "pending" },

  // Co-GP properties
  { id: "valencia", name: "Valencia", location: "Portland, OR", units: 48, role: "co-gp", pmSystem: "Yardi", investorGroup: "Vital 12", occupancy: 97.9, noi: 620000, monthlyRevenue: 78000, status: "active", lastReviewDate: "2026-02-28", reviewStatus: "current" },
  { id: "coronado", name: "Coronado", location: "Portland, OR", units: 36, role: "co-gp", pmSystem: "AppFolio", investorGroup: "Vital 12", occupancy: 94.4, noi: 440000, monthlyRevenue: 56000, status: "active", lastReviewDate: "2026-01-31", reviewStatus: "overdue" },

  // Third-party AM (sampling — LEDG portfolio)
  { id: "ledg-1", name: "LEDG Portfolio — Cedar Heights", location: "Seattle, WA", units: 72, role: "third-party", pmSystem: "Yardi", investorGroup: "LEDG", occupancy: 95.8, noi: 980000, monthlyRevenue: 126000, status: "active", lastReviewDate: "2026-02-28", reviewStatus: "current" },
  { id: "ledg-2", name: "LEDG Portfolio — Cascade View", location: "Tacoma, WA", units: 96, role: "third-party", pmSystem: "Yardi", investorGroup: "LEDG", occupancy: 93.7, noi: 1120000, monthlyRevenue: 148000, status: "active", lastReviewDate: "2026-02-28", reviewStatus: "current" },
  { id: "ledg-3", name: "LEDG Portfolio — River Bend", location: "Vancouver, WA", units: 44, role: "third-party", pmSystem: "Resmin", investorGroup: "LEDG", occupancy: 97.7, noi: 510000, monthlyRevenue: 64000, status: "active", lastReviewDate: "2026-02-15", reviewStatus: "pending" },

  // Acquisition pipeline
  { id: "alderwood", name: "Alderwood Park", location: "Lynnwood, WA", units: 188, role: "acquisition", pmSystem: "Other", investorGroup: "TBD", occupancy: 92.6, noi: 2640000, monthlyRevenue: 342000, status: "pipeline", lastReviewDate: "", reviewStatus: "pending" },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

// Monthly financial review data (per property, last 6 months)
export interface MonthlyReview {
  propertyId: string;
  month: string;
  revenue: number;
  expenses: number;
  noi: number;
  budgetVariance: number; // % over/under budget
  occupancy: number;
  collections: number; // % collected
  dscr: number;
  status: "reviewed" | "draft" | "pending";
  flagCount: number; // anomalies flagged
}

export const monthlyReviews: MonthlyReview[] = [
  // Courtside
  { propertyId: "courtside", month: "2025-09", revenue: 210000, expenses: 148000, noi: 62000, budgetVariance: -2.1, occupancy: 95.8, collections: 97.2, dscr: 1.35, status: "reviewed", flagCount: 0 },
  { propertyId: "courtside", month: "2025-10", revenue: 212000, expenses: 145000, noi: 67000, budgetVariance: 1.4, occupancy: 96.7, collections: 98.1, dscr: 1.38, status: "reviewed", flagCount: 1 },
  { propertyId: "courtside", month: "2025-11", revenue: 213500, expenses: 151000, noi: 62500, budgetVariance: -3.2, occupancy: 96.7, collections: 97.8, dscr: 1.32, status: "reviewed", flagCount: 2 },
  { propertyId: "courtside", month: "2025-12", revenue: 214000, expenses: 149000, noi: 65000, budgetVariance: 0.8, occupancy: 96.7, collections: 98.3, dscr: 1.36, status: "reviewed", flagCount: 0 },
  { propertyId: "courtside", month: "2026-01", revenue: 215000, expenses: 152000, noi: 63000, budgetVariance: -1.5, occupancy: 96.7, collections: 97.5, dscr: 1.33, status: "reviewed", flagCount: 1 },
  { propertyId: "courtside", month: "2026-02", revenue: 215000, expenses: 147000, noi: 68000, budgetVariance: 2.3, occupancy: 96.7, collections: 98.6, dscr: 1.41, status: "draft", flagCount: 0 },

  // Belmont
  { propertyId: "belmont", month: "2025-09", revenue: 162000, expenses: 118000, noi: 44000, budgetVariance: -4.5, occupancy: 93.0, collections: 95.8, dscr: 1.22, status: "reviewed", flagCount: 3 },
  { propertyId: "belmont", month: "2025-10", revenue: 165000, expenses: 115000, noi: 50000, budgetVariance: 0.2, occupancy: 94.1, collections: 96.5, dscr: 1.28, status: "reviewed", flagCount: 1 },
  { propertyId: "belmont", month: "2025-11", revenue: 166000, expenses: 120000, noi: 46000, budgetVariance: -2.8, occupancy: 94.1, collections: 96.0, dscr: 1.24, status: "reviewed", flagCount: 2 },
  { propertyId: "belmont", month: "2025-12", revenue: 167000, expenses: 117000, noi: 50000, budgetVariance: 1.1, occupancy: 94.1, collections: 97.2, dscr: 1.29, status: "reviewed", flagCount: 0 },
  { propertyId: "belmont", month: "2026-01", revenue: 168000, expenses: 122000, noi: 46000, budgetVariance: -3.0, occupancy: 94.1, collections: 96.3, dscr: 1.23, status: "reviewed", flagCount: 2 },
  { propertyId: "belmont", month: "2026-02", revenue: 168000, expenses: 119000, noi: 49000, budgetVariance: -0.5, occupancy: 94.1, collections: 97.0, dscr: 1.27, status: "pending", flagCount: 0 },

  // Orchard Park
  { propertyId: "orchard-park", month: "2025-10", revenue: 98000, expenses: 72000, noi: 26000, budgetVariance: -5.2, occupancy: 89.0, collections: 93.5, dscr: 1.08, status: "reviewed", flagCount: 4 },
  { propertyId: "orchard-park", month: "2025-11", revenue: 100000, expenses: 70000, noi: 30000, budgetVariance: -1.8, occupancy: 90.0, collections: 94.2, dscr: 1.12, status: "reviewed", flagCount: 2 },
  { propertyId: "orchard-park", month: "2025-12", revenue: 101000, expenses: 73000, noi: 28000, budgetVariance: -3.5, occupancy: 90.6, collections: 93.8, dscr: 1.10, status: "reviewed", flagCount: 3 },
  { propertyId: "orchard-park", month: "2026-01", revenue: 102000, expenses: 71000, noi: 31000, budgetVariance: 0.5, occupancy: 91.0, collections: 94.5, dscr: 1.14, status: "reviewed", flagCount: 1 },
  { propertyId: "orchard-park", month: "2026-02", revenue: 102000, expenses: 74000, noi: 28000, budgetVariance: -4.0, occupancy: 91.0, collections: 93.0, dscr: 1.09, status: "pending", flagCount: 0 },
];

// Investor report schedule
export interface InvestorReport {
  propertyId: string;
  quarter: string;
  status: "published" | "draft" | "pending";
  distributionAmount: number;
  publishedDate?: string;
}

export const investorReports: InvestorReport[] = [
  { propertyId: "courtside", quarter: "Q3 2025", status: "published", distributionAmount: 45000, publishedDate: "2025-10-21" },
  { propertyId: "courtside", quarter: "Q4 2025", status: "published", distributionAmount: 52000, publishedDate: "2026-01-18" },
  { propertyId: "courtside", quarter: "Q1 2026", status: "pending", distributionAmount: 0 },
  { propertyId: "belmont", quarter: "Q3 2025", status: "published", distributionAmount: 28000, publishedDate: "2025-10-25" },
  { propertyId: "belmont", quarter: "Q4 2025", status: "draft", distributionAmount: 31000 },
  { propertyId: "belmont", quarter: "Q1 2026", status: "pending", distributionAmount: 0 },
];
