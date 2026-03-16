"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { properties } from "@/data/portfolio";
import PageHeader from "@/components/PageHeader";

ModuleRegistry.registerModules([AllCommunityModule]);

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

const TABS = ["Property Notes", "KPI Rulebook", "Chart of Accounts"] as const;
type Tab = (typeof TABS)[number];

const LS_NOTES_KEY = "vital_deal_memory_notes";
const LS_RULES_KEY = "vital_deal_memory_rules";
const LS_COA_KEY = "vital_deal_memory_coa";

interface PropertyNotes {
  accountRules: string;
  reserveRules: string;
  pmContactInfo: string;
  historicalEmails: string;
  materialityThresholds: string;
  generalNotes: string;
}

interface COAMapping {
  pmCode: string;
  pmDescription: string;
  vitalAccount: string;
}

const defaultNotes: PropertyNotes = {
  accountRules: "",
  reserveRules: "",
  pmContactInfo: "",
  historicalEmails: "",
  materialityThresholds: "",
  generalNotes: "",
};

const defaultCOAMappings: COAMapping[] = [
  { pmCode: "4000", pmDescription: "Gross Potential Rent", vitalAccount: "Revenue — Rental Income" },
  { pmCode: "4100", pmDescription: "Vacancy Loss", vitalAccount: "Revenue — Vacancy" },
  { pmCode: "4200", pmDescription: "Other Income", vitalAccount: "Revenue — Other" },
  { pmCode: "5000", pmDescription: "Payroll & Benefits", vitalAccount: "OpEx — Payroll" },
  { pmCode: "5100", pmDescription: "Management Fee", vitalAccount: "OpEx — Management" },
  { pmCode: "5200", pmDescription: "Administrative", vitalAccount: "OpEx — Administrative" },
  { pmCode: "5300", pmDescription: "Marketing & Advertising", vitalAccount: "OpEx — Marketing" },
  { pmCode: "5400", pmDescription: "Utilities", vitalAccount: "OpEx — Utilities" },
  { pmCode: "5500", pmDescription: "Repairs & Maintenance", vitalAccount: "OpEx — R&M" },
  { pmCode: "5600", pmDescription: "Property Tax", vitalAccount: "OpEx — Taxes" },
  { pmCode: "5700", pmDescription: "Insurance", vitalAccount: "OpEx — Insurance" },
  { pmCode: "6000", pmDescription: "Capital Expenditures", vitalAccount: "Below-the-Line — CapEx" },
  { pmCode: "6100", pmDescription: "Replacement Reserves", vitalAccount: "Below-the-Line — Reserves" },
];

const pmSystemByProperty: Record<string, string> = {};
properties.forEach((p) => {
  pmSystemByProperty[p.id] = p.pmSystem;
});

function loadNotes(): Record<string, PropertyNotes> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotes(data: Record<string, PropertyNotes>) {
  if (typeof window !== "undefined") localStorage.setItem(LS_NOTES_KEY, JSON.stringify(data));
}

function loadRules(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_RULES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRules(data: Record<string, string>) {
  if (typeof window !== "undefined") localStorage.setItem(LS_RULES_KEY, JSON.stringify(data));
}

function loadCOA(): COAMapping[] {
  if (typeof window === "undefined") return defaultCOAMappings;
  try {
    const raw = localStorage.getItem(LS_COA_KEY);
    return raw ? JSON.parse(raw) : defaultCOAMappings;
  } catch {
    return defaultCOAMappings;
  }
}

function saveCOA(data: COAMapping[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_COA_KEY, JSON.stringify(data));
}

const defaultRulesData: Record<string, string> = {
  courtside:
    "Flag if occupancy drops below 95%\nDSCR covenant 1.15x minimum — alert if below\nCapEx threshold: $3,000+ requires reclassification from R&M\nRent increase cap: 3.0% per renewal cycle",
  belmont:
    "DSCR threshold 1.20x — alert below\nCommercial vacancy impacts blended occupancy — track separately\nFire alarm panel budget: $22,000 — watch actual vs budget\nTI contributions above $50K require board approval",
  "orchard-park":
    "Watch R&M spend — pre-conversion budget sensitive\nGL mapping: verify all AppFolio codes map to Vital COA\nOccupancy target: 93% during conversion, 96% post-conversion\nConversion cost center: separate from operating expenses",
  valencia:
    "Zero tolerance for flags — historically clean property\nReserve contribution target: $8K/quarter\nPinnacle PM response time SLA: 48 hours",
  coronado:
    "Cascade Living PM response times slow — escalate if >72 hours\nR&M spend elevated — require work order documentation for all charges >$500\nMonth-to-month tenants: target lease-up in Q2 2026\nCollections below 96% triggers follow-up",
};

const activeProperties = properties.filter((p) => p.status === "active" || p.status === "pre-conversion");

const NOTE_FIELDS: { key: keyof PropertyNotes; label: string; placeholder: string }[] = [
  { key: "accountRules", label: "Account Treatment Rules", placeholder: "Which accounts get reclassified, CapEx thresholds, etc." },
  { key: "reserveRules", label: "Reserve Eligibility Rules", placeholder: "Reserve eligibility by funding source..." },
  { key: "pmContactInfo", label: "PM Contact Info & Response Patterns", placeholder: "PM contact name, email, typical response time..." },
  { key: "historicalEmails", label: "Historical Directive Emails & PM Responses", placeholder: "Paste key email threads or summaries..." },
  { key: "materialityThresholds", label: "Materiality Thresholds", placeholder: "Dollar thresholds for flagging, reclassification triggers..." },
  { key: "generalNotes", label: "General Notes", placeholder: "Any other property-specific knowledge..." },
];

export default function DealMemoryPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Tab>("Property Notes");
  const [selectedProperty, setSelectedProperty] = useState(activeProperties[0]?.id || "");
  const [allNotes, setAllNotes] = useState<Record<string, PropertyNotes>>({});
  const [allRules, setAllRules] = useState<Record<string, string>>({});
  const [coaMappings, setCoaMappings] = useState<COAMapping[]>(defaultCOAMappings);
  const [saved, setSaved] = useState(false);
  const [confirmingDeleteNote, setConfirmingDeleteNote] = useState<string | null>(null);
  const [confirmingDeleteRule, setConfirmingDeleteRule] = useState<string | null>(null);

  function clearNoteField(field: keyof PropertyNotes) {
    updateNote(field, "");
  }

  function deleteRule(propertyId: string) {
    const updated = { ...allRules };
    delete updated[propertyId];
    setAllRules(updated);
    saveRules(updated);
    flashSaved();
  }

  useEffect(() => {
    setAllNotes(loadNotes());
    const storedRules = loadRules();
    // Merge defaults with stored
    const merged = { ...defaultRulesData };
    Object.keys(storedRules).forEach((k) => {
      merged[k] = storedRules[k];
    });
    setAllRules(merged);
    setCoaMappings(loadCOA());
  }, []);

  const currentNotes = allNotes[selectedProperty] || defaultNotes;

  function updateNote(field: keyof PropertyNotes, value: string) {
    const updated = {
      ...allNotes,
      [selectedProperty]: { ...currentNotes, [field]: value },
    };
    setAllNotes(updated);
    saveNotes(updated);
    flashSaved();
  }

  function updateRule(propertyId: string, value: string) {
    const updated = { ...allRules, [propertyId]: value };
    setAllRules(updated);
    saveRules(updated);
    flashSaved();
  }

  function updateCOA(index: number, field: keyof COAMapping, value: string) {
    const updated = [...coaMappings];
    updated[index] = { ...updated[index], [field]: value };
    setCoaMappings(updated);
    saveCOA(updated);
    flashSaved();
  }

  function addCOARow() {
    const updated = [...coaMappings, { pmCode: "", pmDescription: "", vitalAccount: "" }];
    setCoaMappings(updated);
    saveCOA(updated);
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const coaColDefs: ColDef[] = useMemo(
    () => [
      { field: "pmCode", headerName: "PM System Code", width: 140, editable: true },
      { field: "pmDescription", headerName: "PM Description", flex: 1, minWidth: 200, editable: true },
      { field: "vitalAccount", headerName: "Vital Standard Account", flex: 1, minWidth: 200, editable: true },
    ],
    []
  );

  const onCellValueChanged = useCallback(
    (event: any) => {
      const updated = [...coaMappings];
      const idx = event.rowIndex;
      if (idx !== undefined && idx < updated.length) {
        updated[idx] = { ...updated[idx], [event.colDef.field]: event.newValue };
        setCoaMappings(updated);
        saveCOA(updated);
        flashSaved();
      }
    },
    [coaMappings]
  );

  // PM system mapping summary
  const pmSystemGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    activeProperties.forEach((p) => {
      if (!groups[p.pmSystem]) groups[p.pmSystem] = [];
      groups[p.pmSystem].push(p.name);
    });
    return groups;
  }, []);

  return (
    <>
      <PageHeader
        title="Deal Memory"
        subtitle="Property-specific knowledge base, KPI rules, and chart of accounts"
      >
        {saved && (
          <span className="text-[11px] text-[#16a34a] font-medium">Saved</span>
        )}
      </PageHeader>

      {/* Property Selector */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-[12px] font-medium text-[#5a7272]">Property:</label>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="text-[13px] border border-[#d4dede] rounded px-2.5 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#8aabab]"
        >
          {activeProperties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 overflow-x-auto mb-4 border-b border-[#d4dede]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 text-[12px] font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? "border-[#4a6b6b] text-[#1a2e2e]"
                : "border-transparent text-[#8aabab] hover:text-[#5a7272]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Property Notes Tab */}
      {activeTab === "Property Notes" && (
        <div className="space-y-4">
          {NOTE_FIELDS.map((field) => (
            <div key={field.key} className="bg-white border border-[#d4dede] rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium text-[#4a6b6b] uppercase tracking-wide">
                  {field.label}
                </label>
                {currentNotes[field.key] && (
                  confirmingDeleteNote === `${selectedProperty}-${field.key}` ? (
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-[#dc2626]">Are you sure?</span>
                      <button
                        onClick={() => { clearNoteField(field.key); setConfirmingDeleteNote(null); }}
                        className="text-[10px] font-medium text-[#dc2626] hover:text-[#b91c1c] cursor-pointer underline"
                      >
                        Yes, clear
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteNote(null)}
                        className="text-[10px] text-[#8aabab] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmingDeleteNote(`${selectedProperty}-${field.key}`)}
                      className="text-[10px] font-medium text-[#dc2626] hover:text-[#b91c1c] cursor-pointer"
                    >
                      Clear
                    </button>
                  )
                )}
              </div>
              <textarea
                value={currentNotes[field.key]}
                onChange={(e) => updateNote(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full text-[13px] text-[#1a2e2e] border border-[#d4dede] rounded px-3 py-2 bg-[#f7f8f8] outline-none focus:border-[#6b9b9b] resize-y"
              />
            </div>
          ))}
        </div>
      )}

      {/* KPI Rulebook Tab */}
      {activeTab === "KPI Rulebook" && (
        <div className="space-y-4">
          <p className="text-[12px] text-[#5a7272] mb-2">
            Define per-property monitoring rules. These are stored locally and used to flag exceptions.
          </p>
          {activeProperties.map((p) => (
            <div key={p.id} className="bg-white border border-[#d4dede] rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#1a2e2e]">{p.name}</span>
                  <span className="text-[10px] text-[#8aabab]">{p.location} | {p.pmSystem}</span>
                </div>
                {allRules[p.id] && (
                  confirmingDeleteRule === p.id ? (
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-[#dc2626]">Are you sure?</span>
                      <button
                        onClick={() => { deleteRule(p.id); setConfirmingDeleteRule(null); }}
                        className="text-[10px] font-medium text-[#dc2626] hover:text-[#b91c1c] cursor-pointer underline"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteRule(null)}
                        className="text-[10px] text-[#8aabab] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmingDeleteRule(p.id)}
                      className="text-[10px] font-medium text-[#dc2626] hover:text-[#b91c1c] cursor-pointer"
                    >
                      Delete Rules
                    </button>
                  )
                )}
              </div>
              <textarea
                value={allRules[p.id] || ""}
                onChange={(e) => updateRule(p.id, e.target.value)}
                placeholder={`Add KPI rules for ${p.name}...`}
                rows={4}
                className="w-full text-[13px] text-[#1a2e2e] border border-[#d4dede] rounded px-3 py-2 bg-[#f7f8f8] outline-none focus:border-[#6b9b9b] resize-y font-mono leading-relaxed"
              />
            </div>
          ))}
        </div>
      )}

      {/* Chart of Accounts Tab */}
      {activeTab === "Chart of Accounts" && (
        <div className="space-y-4">
          {/* PM System Summary */}
          <div className="bg-white border border-[#d4dede] rounded p-4">
            <h3 className="text-[13px] font-medium text-[#1a2e2e] mb-3">PM System by Property</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(pmSystemGroups).map(([system, props]) => (
                <div key={system} className="bg-[#f5f8f8] rounded p-3">
                  <p className="text-[11px] font-medium text-[#4a6b6b] uppercase tracking-wide mb-1">{system}</p>
                  <div className="space-y-0.5">
                    {props.map((name) => (
                      <p key={name} className="text-[12px] text-[#1a2e2e]">{name}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COA Mapping Grid */}
          <div className="bg-white border border-[#d4dede] rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[13px] font-medium text-[#1a2e2e]">
                  Yardi GL Code Mapping to Vital Standard Chart of Accounts
                </h3>
                <p className="text-[11px] text-[#8aabab] mt-0.5">
                  Double-click any cell to edit. Pre-populated for Yardi system codes.
                </p>
              </div>
              <button
                onClick={addCOARow}
                className="text-[11px] px-3 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors"
              >
                + Add Row
              </button>
            </div>
            <div className="ag-theme-alpine" style={{ height: 440, width: "100%" }}>
              <AgGridReact
                rowData={coaMappings}
                columnDefs={coaColDefs}
                defaultColDef={{ sortable: true, resizable: true }}
                onCellValueChanged={onCellValueChanged}
                animateRows
                suppressCellFocus={false}
                singleClickEdit
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
