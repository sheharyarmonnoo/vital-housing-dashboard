// Vital Housing portfolio data — derived from meeting recordings and proposal
// Robert Sheppard (Principal), Christina Adams (Director of Finance), Cesca (distributions), Jamie (admin)

export type PropertyRole = "core" | "co-gp" | "third-party" | "acquisition" | "lp";
export type PMSystem = "Yardi" | "AppFolio" | "Resmin" | "Other";

export interface LoanDetails {
  amount: number;
  rate: number;
  maturity: string;
  lender: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  address?: string;
  units: number;
  yearBuilt?: number;
  acreage?: number;
  buildings?: number;
  role: PropertyRole;
  pmSystem: PMSystem;
  pmCompany?: string;
  investorGroup: string;
  occupancy: number;
  noi: number; // annual
  monthlyRevenue: number;
  status: "active" | "pre-conversion" | "pipeline";
  lastReviewDate: string;
  reviewStatus: "current" | "pending" | "overdue";
  acquisitionDate?: string;
  acquisitionPrice?: number;
  loan?: LoanDetails;
  managementTransition?: boolean;
}

export const properties: Property[] = [
  // Core properties
  {
    id: "courtside",
    name: "Courtside Apartments",
    location: "Olympia, WA",
    address: "1200 Court Dr, Olympia, WA 98501",
    units: 211,
    yearBuilt: 1995,
    role: "core",
    pmSystem: "Yardi",
    pmCompany: "Vital Housing Group",
    investorGroup: "Enterprise Community Partners",
    occupancy: 96.7,
    noi: 2880000,
    monthlyRevenue: 384000,
    status: "active",
    lastReviewDate: "2026-02-28",
    reviewStatus: "current",
    acquisitionDate: "2025-01-15",
    acquisitionPrice: 31750000,
    loan: { amount: 22500000, rate: 7.02, maturity: "2035-01-15", lender: "Freddie Mac" },
  },
  {
    id: "belmont",
    name: "Belmont Dairy",
    location: "Portland, OR",
    address: "3610 SE Belmont St, Portland, OR 97214",
    units: 85,
    yearBuilt: 2001,
    role: "core",
    pmSystem: "AppFolio",
    pmCompany: "Vital Housing Group",
    investorGroup: "Freestone Capital",
    occupancy: 94.1,
    noi: 1500000,
    monthlyRevenue: 168000,
    status: "active",
    lastReviewDate: "2026-02-28",
    reviewStatus: "current",
  },
  {
    id: "orchard-park",
    name: "Orchard Park",
    location: "Portland, OR",
    address: "4520 NE Orchard Ave, Portland, OR 97213",
    units: 64,
    yearBuilt: 1988,
    role: "core",
    pmSystem: "AppFolio",
    pmCompany: "Vital Housing Group",
    investorGroup: "Vital Investors",
    occupancy: 91.0,
    noi: 780000,
    monthlyRevenue: 102000,
    status: "pre-conversion",
    lastReviewDate: "2026-02-15",
    reviewStatus: "pending",
    managementTransition: true,
  },

  // Co-GP properties
  {
    id: "valencia",
    name: "Valencia",
    location: "Portland, OR",
    address: "2800 SE Valencia St, Portland, OR 97202",
    units: 48,
    yearBuilt: 1972,
    role: "co-gp",
    pmSystem: "Yardi",
    pmCompany: "Pinnacle Property Mgmt",
    investorGroup: "Vital / Pinnacle JV",
    occupancy: 97.9,
    noi: 620000,
    monthlyRevenue: 78000,
    status: "active",
    lastReviewDate: "2026-02-28",
    reviewStatus: "current",
  },
  {
    id: "coronado",
    name: "Coronado",
    location: "Portland, OR",
    address: "3100 NE Coronado St, Portland, OR 97211",
    units: 36,
    yearBuilt: 1968,
    role: "co-gp",
    pmSystem: "AppFolio",
    pmCompany: "Cascade Living",
    investorGroup: "Vital / Cascade JV",
    occupancy: 94.4,
    noi: 440000,
    monthlyRevenue: 56000,
    status: "active",
    lastReviewDate: "2026-01-31",
    reviewStatus: "overdue",
    managementTransition: true,
  },

  // Third-party AM — LEDG Portfolio (~12 properties, showing representative sample)
  {
    id: "ledg-1",
    name: "LEDG — Cedar Heights",
    location: "Seattle, WA",
    units: 72,
    yearBuilt: 2004,
    role: "third-party",
    pmSystem: "Yardi",
    pmCompany: "LEDG Management",
    investorGroup: "LEDG",
    occupancy: 95.8,
    noi: 980000,
    monthlyRevenue: 126000,
    status: "active",
    lastReviewDate: "2026-02-28",
    reviewStatus: "current",
  },
  {
    id: "ledg-2",
    name: "LEDG — Cascade View",
    location: "Tacoma, WA",
    units: 96,
    yearBuilt: 1999,
    role: "third-party",
    pmSystem: "Yardi",
    pmCompany: "LEDG Management",
    investorGroup: "LEDG",
    occupancy: 93.7,
    noi: 1120000,
    monthlyRevenue: 148000,
    status: "active",
    lastReviewDate: "2026-02-28",
    reviewStatus: "current",
  },
  {
    id: "ledg-3",
    name: "LEDG — River Bend",
    location: "Vancouver, WA",
    units: 44,
    yearBuilt: 2008,
    role: "third-party",
    pmSystem: "Resmin",
    pmCompany: "LEDG Management",
    investorGroup: "LEDG",
    occupancy: 97.7,
    noi: 510000,
    monthlyRevenue: 64000,
    status: "active",
    lastReviewDate: "2026-02-15",
    reviewStatus: "pending",
    managementTransition: true,
  },
  {
    id: "ledg-4",
    name: "LEDG — Pineview Terrace",
    location: "Olympia, WA",
    units: 58,
    yearBuilt: 2001,
    role: "third-party",
    pmSystem: "Yardi",
    pmCompany: "LEDG Management",
    investorGroup: "LEDG",
    occupancy: 94.5,
    noi: 720000,
    monthlyRevenue: 92000,
    status: "active",
    lastReviewDate: "2026-02-28",
    reviewStatus: "current",
  },
  {
    id: "ledg-5",
    name: "LEDG — Summit Ridge",
    location: "Bellevue, WA",
    units: 110,
    yearBuilt: 2012,
    role: "third-party",
    pmSystem: "Yardi",
    pmCompany: "LEDG Management",
    investorGroup: "LEDG",
    occupancy: 96.2,
    noi: 1640000,
    monthlyRevenue: 208000,
    status: "active",
    lastReviewDate: "2026-02-28",
    reviewStatus: "current",
  },

  // LP Portfolio
  {
    id: "lp-texas",
    name: "LP Portfolio — Texas",
    location: "Houston, TX",
    units: 1200,
    role: "lp",
    pmSystem: "Yardi",
    pmCompany: "Single Management Company",
    investorGroup: "Robert Sheppard LP",
    occupancy: 95.0,
    noi: 8400000,
    monthlyRevenue: 1080000,
    status: "active",
    lastReviewDate: "2026-02-28",
    reviewStatus: "current",
  },

  // Acquisition pipeline
  {
    id: "alderwood",
    name: "Alderwood Park",
    location: "Lynnwood, WA",
    address: "18800 44th Ave W, Lynnwood, WA 98036",
    units: 188,
    yearBuilt: 1983,
    acreage: 10.6,
    buildings: 14,
    role: "acquisition",
    pmSystem: "Other",
    investorGroup: "TBD",
    occupancy: 92.6,
    noi: 2640000,
    monthlyRevenue: 342000,
    status: "pipeline",
    lastReviewDate: "",
    reviewStatus: "pending",
  },
];

export const PROPERTIES_KEY = "vital_custom_properties";

export function loadAllProperties(): Property[] {
  if (typeof window === "undefined") return properties;
  try {
    const raw = localStorage.getItem(PROPERTIES_KEY);
    const custom: Property[] = raw ? JSON.parse(raw) : [];
    // Merge: seed first, then custom, skip custom ids that match seed ids (edits stored separately)
    const seedIds = new Set(properties.map((p) => p.id));
    const edited = loadPropertyEdits();
    const merged = properties.map((p) => (edited[p.id] ? { ...p, ...edited[p.id], id: p.id } : p));
    const deleted = loadDeletedPropertyIds();
    const filtered = merged.filter((p) => !deleted.has(p.id));
    const extras = custom.filter((p) => !seedIds.has(p.id) && !deleted.has(p.id));
    return [...filtered, ...extras];
  } catch {
    return properties;
  }
}

const PROPERTY_EDITS_KEY = "vital_property_edits";
const PROPERTY_DELETED_KEY = "vital_property_deleted";

function loadPropertyEdits(): Record<string, Partial<Property>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROPERTY_EDITS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePropertyEdits(data: Record<string, Partial<Property>>) {
  if (typeof window !== "undefined") localStorage.setItem(PROPERTY_EDITS_KEY, JSON.stringify(data));
}

function loadDeletedPropertyIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PROPERTY_DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDeletedPropertyIds(ids: Set<string>) {
  if (typeof window !== "undefined") localStorage.setItem(PROPERTY_DELETED_KEY, JSON.stringify([...ids]));
}

export function addCustomProperty(
  name: string,
  location: string,
  units: number,
  role: PropertyRole,
  pmSystem: PMSystem,
  investorGroup: string
): Property {
  const id = "custom-" + Date.now();
  const newProp: Property = {
    id,
    name,
    location,
    units,
    role,
    pmSystem,
    investorGroup,
    occupancy: 0,
    noi: 0,
    monthlyRevenue: 0,
    status: "active",
    lastReviewDate: "",
    reviewStatus: "pending",
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PROPERTIES_KEY);
      const custom: Property[] = raw ? JSON.parse(raw) : [];
      custom.push(newProp);
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(custom));
    } catch { /* noop */ }
  }
  return newProp;
}

export function editProperty(id: string, updates: Partial<Property>): void {
  // Check if it's a custom property first
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PROPERTIES_KEY);
      const custom: Property[] = raw ? JSON.parse(raw) : [];
      const idx = custom.findIndex((p) => p.id === id);
      if (idx >= 0) {
        custom[idx] = { ...custom[idx], ...updates, id };
        localStorage.setItem(PROPERTIES_KEY, JSON.stringify(custom));
        return;
      }
    } catch { /* noop */ }
  }
  // Otherwise it's a seed property — store edit overlay
  const edits = loadPropertyEdits();
  edits[id] = { ...(edits[id] || {}), ...updates };
  savePropertyEdits(edits);
}

export function deleteProperty(id: string): void {
  // Remove from custom list if present
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PROPERTIES_KEY);
      const custom: Property[] = raw ? JSON.parse(raw) : [];
      const filtered = custom.filter((p) => p.id !== id);
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(filtered));
    } catch { /* noop */ }
  }
  // Also mark as deleted (handles seed properties)
  const deleted = loadDeletedPropertyIds();
  deleted.add(id);
  saveDeletedPropertyIds(deleted);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
  // Courtside — 211 units, Olympia WA, Yardi
  { propertyId: "courtside", month: "2025-09", revenue: 378000, expenses: 252000, noi: 126000, budgetVariance: -2.1, occupancy: 95.8, collections: 97.2, dscr: 1.35, status: "reviewed", flagCount: 0 },
  { propertyId: "courtside", month: "2025-10", revenue: 380000, expenses: 248000, noi: 132000, budgetVariance: 1.4, occupancy: 96.3, collections: 98.1, dscr: 1.38, status: "reviewed", flagCount: 1 },
  { propertyId: "courtside", month: "2025-11", revenue: 382000, expenses: 258000, noi: 124000, budgetVariance: -3.2, occupancy: 96.5, collections: 97.8, dscr: 1.32, status: "reviewed", flagCount: 2 },
  { propertyId: "courtside", month: "2025-12", revenue: 383000, expenses: 250000, noi: 133000, budgetVariance: 0.8, occupancy: 96.7, collections: 98.3, dscr: 1.36, status: "reviewed", flagCount: 0 },
  { propertyId: "courtside", month: "2026-01", revenue: 384000, expenses: 256000, noi: 128000, budgetVariance: -1.5, occupancy: 96.7, collections: 97.5, dscr: 1.33, status: "reviewed", flagCount: 1 },
  { propertyId: "courtside", month: "2026-02", revenue: 384000, expenses: 244000, noi: 140000, budgetVariance: 2.3, occupancy: 96.7, collections: 98.6, dscr: 1.41, status: "draft", flagCount: 0 },

  // Belmont Dairy — 85 units, Portland OR, AppFolio
  { propertyId: "belmont", month: "2025-09", revenue: 162000, expenses: 118000, noi: 44000, budgetVariance: -4.5, occupancy: 93.0, collections: 95.8, dscr: 1.22, status: "reviewed", flagCount: 3 },
  { propertyId: "belmont", month: "2025-10", revenue: 165000, expenses: 115000, noi: 50000, budgetVariance: 0.2, occupancy: 94.1, collections: 96.5, dscr: 1.28, status: "reviewed", flagCount: 1 },
  { propertyId: "belmont", month: "2025-11", revenue: 166000, expenses: 120000, noi: 46000, budgetVariance: -2.8, occupancy: 94.1, collections: 96.0, dscr: 1.24, status: "reviewed", flagCount: 2 },
  { propertyId: "belmont", month: "2025-12", revenue: 167000, expenses: 117000, noi: 50000, budgetVariance: 1.1, occupancy: 94.1, collections: 97.2, dscr: 1.29, status: "reviewed", flagCount: 0 },
  { propertyId: "belmont", month: "2026-01", revenue: 168000, expenses: 122000, noi: 46000, budgetVariance: -3.0, occupancy: 94.1, collections: 96.3, dscr: 1.23, status: "reviewed", flagCount: 2 },
  { propertyId: "belmont", month: "2026-02", revenue: 168000, expenses: 119000, noi: 49000, budgetVariance: -0.5, occupancy: 94.1, collections: 97.0, dscr: 1.27, status: "pending", flagCount: 0 },

  // Orchard Park — 64 units, Portland OR, pre-conversion, AppFolio
  { propertyId: "orchard-park", month: "2025-10", revenue: 98000, expenses: 72000, noi: 26000, budgetVariance: -5.2, occupancy: 89.0, collections: 93.5, dscr: 1.08, status: "reviewed", flagCount: 4 },
  { propertyId: "orchard-park", month: "2025-11", revenue: 100000, expenses: 70000, noi: 30000, budgetVariance: -1.8, occupancy: 90.0, collections: 94.2, dscr: 1.12, status: "reviewed", flagCount: 2 },
  { propertyId: "orchard-park", month: "2025-12", revenue: 101000, expenses: 73000, noi: 28000, budgetVariance: -3.5, occupancy: 90.6, collections: 93.8, dscr: 1.10, status: "reviewed", flagCount: 3 },
  { propertyId: "orchard-park", month: "2026-01", revenue: 102000, expenses: 71000, noi: 31000, budgetVariance: 0.5, occupancy: 91.0, collections: 94.5, dscr: 1.14, status: "reviewed", flagCount: 1 },
  { propertyId: "orchard-park", month: "2026-02", revenue: 102000, expenses: 74000, noi: 28000, budgetVariance: -4.0, occupancy: 91.0, collections: 93.0, dscr: 1.09, status: "pending", flagCount: 0 },

  // Valencia — 48 units, co-GP
  { propertyId: "valencia", month: "2025-10", revenue: 77000, expenses: 52000, noi: 25000, budgetVariance: 1.2, occupancy: 97.9, collections: 98.4, dscr: 1.52, status: "reviewed", flagCount: 0 },
  { propertyId: "valencia", month: "2025-11", revenue: 78000, expenses: 53000, noi: 25000, budgetVariance: 0.8, occupancy: 97.9, collections: 98.2, dscr: 1.50, status: "reviewed", flagCount: 0 },
  { propertyId: "valencia", month: "2025-12", revenue: 78000, expenses: 51000, noi: 27000, budgetVariance: 2.5, occupancy: 97.9, collections: 98.8, dscr: 1.55, status: "reviewed", flagCount: 0 },
  { propertyId: "valencia", month: "2026-01", revenue: 78000, expenses: 54000, noi: 24000, budgetVariance: -0.5, occupancy: 97.9, collections: 98.0, dscr: 1.48, status: "reviewed", flagCount: 0 },
  { propertyId: "valencia", month: "2026-02", revenue: 78000, expenses: 52000, noi: 26000, budgetVariance: 1.8, occupancy: 97.9, collections: 98.5, dscr: 1.53, status: "reviewed", flagCount: 0 },

  // Coronado — 36 units, co-GP (overdue review)
  { propertyId: "coronado", month: "2025-10", revenue: 55000, expenses: 38000, noi: 17000, budgetVariance: -1.5, occupancy: 94.4, collections: 96.2, dscr: 1.28, status: "reviewed", flagCount: 1 },
  { propertyId: "coronado", month: "2025-11", revenue: 55000, expenses: 40000, noi: 15000, budgetVariance: -4.2, occupancy: 94.4, collections: 95.8, dscr: 1.22, status: "reviewed", flagCount: 2 },
  { propertyId: "coronado", month: "2025-12", revenue: 56000, expenses: 39000, noi: 17000, budgetVariance: -0.8, occupancy: 94.4, collections: 96.5, dscr: 1.29, status: "reviewed", flagCount: 0 },
  { propertyId: "coronado", month: "2026-01", revenue: 56000, expenses: 41000, noi: 15000, budgetVariance: -3.8, occupancy: 94.4, collections: 95.5, dscr: 1.20, status: "reviewed", flagCount: 3 },
  { propertyId: "coronado", month: "2026-02", revenue: 56000, expenses: 39000, noi: 17000, budgetVariance: -0.2, occupancy: 94.4, collections: 96.8, dscr: 1.30, status: "pending", flagCount: 0 },
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

// Alderwood Park detailed acquisition data (from deal summary)
export interface UnitMix {
  type: string;
  count: number;
  avgSF: number;
  avgRent: number;
}

export interface AcquisitionDeal {
  propertyId: string;
  vintage: number;
  acreage: number;
  buildings: number;
  totalSF: number;
  avgRentPerUnit: number;
  avgRentPerSF: number;
  trailingNOI: number;
  occupancy: number;
  unitMix: UnitMix[];
  renovationStatus: { classic: number; renovated: number };
  risks: string[];
  opportunities: string[];
  taxExemption: string;
  badDebt: number;
  waterSewerConcern: boolean;
}

export const alderwoodDeal: AcquisitionDeal = {
  propertyId: "alderwood",
  vintage: 1983,
  acreage: 10.6,
  buildings: 14,
  totalSF: 143200,
  avgRentPerUnit: 1822,
  avgRentPerSF: 2.39,
  trailingNOI: 2640000,
  occupancy: 92.6,
  unitMix: [
    { type: "1 BR / 1 BA", count: 84, avgSF: 680, avgRent: 1650 },
    { type: "2 BR / 1 BA", count: 32, avgSF: 820, avgRent: 1890 },
    { type: "2 BR / 2 BA", count: 72, avgSF: 880, avgRent: 1980 },
  ],
  renovationStatus: { classic: 132, renovated: 56 },
  risks: [
    "Asking price undisclosed — seller has not provided guidance",
    "Elevated water/sewer expenses — above market average for comparable vintage",
    "Bad debt of $88K trailing 12 months — concentrated in 6 units",
    "Deferred maintenance on Building 7 and 12 roofing",
    "14 units currently down for renovation — impacting effective occupancy",
  ],
  opportunities: [
    "Tax exemption under WA RCW 84.36.560 — potential $280K annual savings",
    "132 classic units available for value-add renovation at $15K–$20K/unit",
    "Rent premium of $150–$200/mo demonstrated on 56 renovated units",
    "Below-market rents relative to Lynnwood submarket comps",
    "Light rail extension to Lynnwood City Center opening 2026 — transit premium",
  ],
  taxExemption: "RCW 84.36.560",
  badDebt: 88000,
  waterSewerConcern: true,
};

export const alderwoodRentComps = [
  { name: "Alderwood Park (Subject)", location: "Lynnwood, WA", units: 188, yearBuilt: 1983, avgRent: 1822, occupancy: 92.6, distance: "—", rentPerSF: 2.39 },
  { name: "Willow Creek Apartments", location: "Lynnwood, WA", units: 156, yearBuilt: 1986, avgRent: 1945, occupancy: 94.8, distance: "0.6 mi", rentPerSF: 2.52 },
  { name: "Cedar Terrace", location: "Lynnwood, WA", units: 144, yearBuilt: 1990, avgRent: 1920, occupancy: 95.2, distance: "0.8 mi", rentPerSF: 2.48 },
  { name: "Meadow Ridge", location: "Lynnwood, WA", units: 96, yearBuilt: 1985, avgRent: 1880, occupancy: 96.1, distance: "1.2 mi", rentPerSF: 2.44 },
  { name: "Pacific Crest", location: "Lynnwood, WA", units: 210, yearBuilt: 1992, avgRent: 2010, occupancy: 93.2, distance: "1.6 mi", rentPerSF: 2.58 },
  { name: "Alderwood Village", location: "Lynnwood, WA", units: 168, yearBuilt: 1988, avgRent: 1850, occupancy: 95.5, distance: "2.1 mi", rentPerSF: 2.40 },
  { name: "Spruce Landing", location: "Edmonds, WA", units: 72, yearBuilt: 1994, avgRent: 1980, occupancy: 97.0, distance: "3.0 mi", rentPerSF: 2.55 },
];

// Action items for dashboard
export interface ActionItem {
  id: string;
  type: "reclassification" | "pm-followup" | "review" | "report";
  property: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

export const actionItems: ActionItem[] = [
  { id: "a1", type: "pm-followup", property: "Coronado", description: "Coronado: Cascade Living PM transition — verify Feb package delivery by 3/17", assignee: "Christina", dueDate: "2026-03-17", priority: "high" },
  { id: "a2", type: "review", property: "Orchard Park", description: "Orchard Park: Pre-conversion GL mapping needs verification before Feb review", assignee: "Christina", dueDate: "2026-03-20", priority: "high" },
  { id: "a3", type: "report", property: "Belmont Dairy", description: "Belmont Q4 2025: Finalize waterfall distribution calc with Cesca", assignee: "Cesca", dueDate: "2026-03-22", priority: "medium" },
  { id: "a4", type: "review", property: "General", description: "Robert: Send asset management model to Matt/Shea for mapping", assignee: "Robert", dueDate: "2026-03-21", priority: "medium" },
  { id: "a5", type: "review", property: "General", description: "Christina: Provide KPI list per deal for automated tracking", assignee: "Christina", dueDate: "2026-03-25", priority: "medium" },
  { id: "a6", type: "pm-followup", property: "LP Portfolio — Texas", description: "LP Texas portfolio: Confirm Yardi scheduled report cadence with management company", assignee: "Christina", dueDate: "2026-03-24", priority: "low" },
];
