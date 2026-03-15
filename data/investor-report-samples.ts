export interface InvestorReportSample {
  id: string;
  propertyId: string;
  propertyName: string;
  quarter: string;
  status: "published" | "draft" | "pending";
  publishedDate: string | null;
  investorGroup: string;
  distributionAmount: number;
  occupancy: number;
  noi: number;
  collections: number;
  dscr: number;
  narrativeSummary: string;
  financialHighlights: string[];
  capitalProjects: string[];
}

export const investorReportSamples: InvestorReportSample[] = [
  {
    id: "courtside-q3-2025",
    propertyId: "courtside",
    propertyName: "Courtside Apartments",
    quarter: "Q3 2025",
    status: "published",
    publishedDate: "2025-10-21",
    investorGroup: "Enterprise Community Partners",
    distributionAmount: 45000,
    occupancy: 95.8,
    noi: 191000,
    collections: 97.2,
    dscr: 1.35,
    narrativeSummary:
      "Courtside Apartments continued to perform above stabilized projections through Q3 2025. Occupancy held steady at 95.8%, driven by strong lease renewals and minimal turnover during the summer months. Revenue growth was supported by a 2.8% average rent increase on renewed leases, keeping effective rents aligned with the affordable housing market in the Portland metro. Management successfully negotiated a new landscaping contract, reducing grounds maintenance costs by 12% on an annualized basis. Resident satisfaction scores improved to 4.2 out of 5 based on the quarterly survey conducted in September.",
    financialHighlights: [
      "Effective gross income of $636,000, 1.4% above budget",
      "Operating expenses of $445,000, on target with underwriting",
      "Net operating income of $191,000 for the quarter",
      "Debt service coverage ratio of 1.35x, exceeding lender covenant of 1.20x",
      "Collections rate of 97.2%, up from 96.5% in Q2 2025",
      "Distribution of $45,000 to investor group",
    ],
    capitalProjects: [
      "Roof membrane replacement on Building C completed — $82,000 (budgeted $90,000)",
      "Common area LED lighting upgrade in progress — 60% complete, on schedule for Q4 completion",
      "Elevator modernization study initiated for Buildings A and B — report expected December 2025",
    ],
  },
  {
    id: "courtside-q4-2025",
    propertyId: "courtside",
    propertyName: "Courtside Apartments",
    quarter: "Q4 2025",
    status: "published",
    publishedDate: "2026-01-18",
    investorGroup: "Enterprise Community Partners",
    distributionAmount: 52000,
    occupancy: 96.7,
    noi: 195000,
    collections: 98.1,
    dscr: 1.38,
    narrativeSummary:
      "Courtside Apartments closed 2025 on a strong note with occupancy reaching 96.7%, the highest level since stabilization. The Q4 performance benefited from the seasonal reduction in turnover and completion of the common area lighting upgrade, which received positive feedback from residents. Total annual NOI came in at $768,000, exceeding the original underwritten projection by 3.1%. The property manager implemented a new online maintenance request portal in November, reducing average work order completion time from 3.2 days to 1.8 days. We are recommending a modest rent adjustment of 3.0% for leases renewing in Q1 2026, consistent with the Portland metro CPI and affordable housing guideline thresholds.",
    financialHighlights: [
      "Effective gross income of $647,000, 2.3% above budget",
      "Operating expenses of $452,000, 1.2% under budget due to maintenance efficiencies",
      "Net operating income of $195,000 for the quarter, best quarter of the year",
      "Debt service coverage ratio of 1.38x",
      "Collections rate improved to 98.1%",
      "Year-end distribution of $52,000, bringing annual total to $97,000",
    ],
    capitalProjects: [
      "Common area LED lighting upgrade completed — final cost $34,500 (budgeted $38,000)",
      "Elevator modernization study completed — recommended phased approach over 18 months, estimated $210,000",
      "Parking lot resurfacing scheduled for Q2 2026 — $45,000 budgeted from reserves",
      "Unit interior refresh program planned: 12 units targeted for updated fixtures and flooring in 2026",
    ],
  },
  {
    id: "belmont-q3-2025",
    propertyId: "belmont",
    propertyName: "Belmont Dairy",
    quarter: "Q3 2025",
    status: "published",
    publishedDate: "2025-10-25",
    investorGroup: "Freestone Capital",
    distributionAmount: 28000,
    occupancy: 93.0,
    noi: 132000,
    collections: 95.8,
    dscr: 1.22,
    narrativeSummary:
      "Belmont Dairy experienced a transitional Q3 as the property worked through elevated turnover related to two lease expirations in the commercial ground-floor spaces. Residential occupancy remained solid at 95.2%, while the blended rate including commercial came to 93.0%. The property team successfully re-leased one of the two commercial units to a local coffee roaster on a five-year term starting November 2025. Collections dipped slightly to 95.8% due to one residential tenant entering a payment plan arrangement following a job loss. Management is monitoring the situation closely and expects collections to normalize by Q1 2026. Despite the temporary headwinds, NOI of $132,000 was within 4.5% of budget.",
    financialHighlights: [
      "Effective gross income of $492,000, 3.8% below budget due to commercial vacancy",
      "Operating expenses of $360,000, on target",
      "Net operating income of $132,000 for the quarter",
      "Debt service coverage ratio of 1.22x, above lender covenant of 1.15x",
      "Collections rate of 95.8%, down from 96.8% in Q2",
      "Distribution of $28,000 to Freestone Capital",
    ],
    capitalProjects: [
      "Commercial Unit B tenant improvement buildout — $62,000 (landlord contribution capped at $55,000, remainder tenant-funded)",
      "Boiler system inspection completed — minor repairs totaling $8,200",
      "Fire alarm panel upgrade mandated by city inspection — scheduled for Q4, estimated $22,000",
      "Courtyard landscaping refresh completed — $6,500",
    ],
  },
  {
    id: "belmont-q4-2025",
    propertyId: "belmont",
    propertyName: "Belmont Dairy",
    quarter: "Q4 2025",
    status: "draft",
    publishedDate: null,
    investorGroup: "Freestone Capital",
    distributionAmount: 31000,
    occupancy: 94.1,
    noi: 147000,
    collections: 96.5,
    dscr: 1.28,
    narrativeSummary:
      "Belmont Dairy showed meaningful recovery in Q4 2025 as the new commercial tenant commenced operations and the residential payment plan arrangement was brought current. Blended occupancy improved to 94.1% and collections rebounded to 96.5%. The fire alarm panel upgrade was completed ahead of schedule and under budget, and the property passed its year-end city compliance inspection without deficiencies. NOI of $147,000 represents an 11.4% improvement over Q3. Looking ahead to 2026, we anticipate stable performance with residential renewal rates projected at 3.2% and the commercial portfolio now fully leased. The asset management team is evaluating a water conservation retrofit program that could reduce utility expenses by an estimated 8-10% annually.",
    financialHighlights: [
      "Effective gross income of $504,000, 0.5% below budget — significant improvement over Q3",
      "Operating expenses of $357,000, 2.1% under budget",
      "Net operating income of $147,000 for the quarter, up 11.4% from Q3",
      "Debt service coverage ratio improved to 1.28x",
      "Collections rate recovered to 96.5%",
      "Proposed distribution of $31,000 — pending final review and approval",
    ],
    capitalProjects: [
      "Fire alarm panel upgrade completed — final cost $19,800 (budgeted $22,000)",
      "Commercial Unit B tenant improvement completed — tenant opened in November",
      "Water conservation retrofit feasibility study initiated — report expected Q1 2026",
      "Window sealant replacement on north facade — scheduled for spring 2026, estimated $28,000",
    ],
  },
];

export function getReportsForProperty(
  propertyId: string
): InvestorReportSample[] {
  return investorReportSamples.filter((r) => r.propertyId === propertyId);
}
