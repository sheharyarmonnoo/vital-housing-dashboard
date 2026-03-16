"use client";

import { useState, useEffect, useMemo } from "react";
import { properties } from "@/data/portfolio";
import { generateFindings, generateEmailDraft, MaterialFinding, Severity } from "@/lib/material-drivers";
import PageHeader from "@/components/PageHeader";

const LS_RESOLVED_KEY = "vital_resolved_findings";

function loadResolved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_RESOLVED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveResolved(ids: Set<string>) {
  if (typeof window !== "undefined")
    localStorage.setItem(LS_RESOLVED_KEY, JSON.stringify([...ids]));
}

const severityConfig: Record<Severity, { bg: string; text: string; border: string; dot: string }> = {
  Critical: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", border: "border-[#fecaca]", dot: "bg-[#dc2626]" },
  Watch: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", border: "border-[#fde68a]", dot: "bg-[#d97706]" },
  Info: { bg: "bg-[#f0f9ff]", text: "text-[#4a6b6b]", border: "border-[#d4dede]", dot: "bg-[#6b9b9b]" },
};

const categoryLabels: Record<string, string> = {
  "budget-variance": "Budget Variance",
  occupancy: "Occupancy",
  collections: "Collections",
  dscr: "DSCR",
  reclassification: "Reclassification",
  reserve: "Reserve Eligibility",
};

function EmailModal({ finding, onClose }: { finding: MaterialFinding; onClose: () => void }) {
  const draft = generateEmailDraft(finding);

  function copyToClipboard() {
    navigator.clipboard.writeText(draft).catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-[#d4dede] rounded w-full max-w-[560px] mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#d4dede] shrink-0">
          <p className="text-[14px] font-semibold text-[#1a2e2e]">Send to PM — {finding.propertyName}</p>
          <button onClick={onClose} className="text-[#8aabab] hover:text-[#1a2e2e] cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <pre className="text-[12px] text-[#1a2e2e] whitespace-pre-wrap font-[inherit] leading-relaxed">{draft}</pre>
        </div>
        <div className="flex gap-2 justify-end px-5 py-3 border-t border-[#d4dede] shrink-0">
          <button onClick={onClose} className="text-[12px] text-[#5a7272] px-3 py-1.5 cursor-pointer hover:text-[#1a2e2e]">Close</button>
          <button
            onClick={copyToClipboard}
            className="text-[12px] font-medium px-4 py-1.5 bg-[#1a2e2e] text-white rounded hover:bg-[#4a6b6b] cursor-pointer transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MaterialDriversPage() {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [showResolved, setShowResolved] = useState(false);
  const [emailFinding, setEmailFinding] = useState<MaterialFinding | null>(null);

  useEffect(() => {
    setResolvedIds(loadResolved());
  }, []);

  const activeProperties = properties.filter(
    (p) => p.status === "active" || p.status === "pre-conversion"
  );

  const allFindings = useMemo(() => generateFindings(), []);

  const filteredFindings = useMemo(() => {
    return allFindings.filter((f) => {
      if (propertyFilter !== "all" && f.propertyId !== propertyFilter) return false;
      if (severityFilter !== "all" && f.severity !== severityFilter) return false;
      if (!showResolved && resolvedIds.has(f.id)) return false;
      return true;
    });
  }, [allFindings, propertyFilter, severityFilter, showResolved, resolvedIds]);

  function toggleResolved(id: string) {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveResolved(next);
      return next;
    });
  }

  const criticalCount = allFindings.filter((f) => f.severity === "Critical" && !resolvedIds.has(f.id)).length;
  const watchCount = allFindings.filter((f) => f.severity === "Watch" && !resolvedIds.has(f.id)).length;
  const resolvedCount = resolvedIds.size;

  // Group findings by property
  const groupedByProperty = useMemo(() => {
    const groups: Record<string, MaterialFinding[]> = {};
    for (const f of filteredFindings) {
      if (!groups[f.propertyName]) groups[f.propertyName] = [];
      groups[f.propertyName].push(f);
    }
    return groups;
  }, [filteredFindings]);

  return (
    <>
      <PageHeader
        title="Material Drivers &rarr; PM Questionnaire"
        subtitle="Executive briefing — prioritized findings that need action"
      />

      {/* Workflow context */}
      <div className="bg-[#f7f8f8] border border-[#d4dede] rounded px-4 py-3 mb-6">
        <p className="text-[12px] font-medium text-[#1a2e2e] mb-1">
          These findings generate the directive questionnaire sent to property management companies
        </p>
        <p className="text-[11px] text-[#5a7272]">
          Christina&apos;s workflow: Receive drafts 6th-8th &rarr; Review by 10th &rarr; Send questionnaire same day &rarr; PM responds &rarr; Final close 14th-16th
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-[#d4dede] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#5a7272] uppercase tracking-wide mb-1">Total Findings</p>
          <p className="text-[22px] font-semibold text-[#1a2e2e]">{allFindings.length}</p>
        </div>
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#dc2626] uppercase tracking-wide mb-1">Critical</p>
          <p className="text-[22px] font-semibold text-[#dc2626]">{criticalCount}</p>
        </div>
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#d97706] uppercase tracking-wide mb-1">Watch</p>
          <p className="text-[22px] font-semibold text-[#d97706]">{watchCount}</p>
        </div>
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded px-4 py-3">
          <p className="text-[11px] font-medium text-[#16a34a] uppercase tracking-wide mb-1">Resolved</p>
          <p className="text-[22px] font-semibold text-[#16a34a]">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="text-[12px] border border-[#d4dede] rounded px-3 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
        >
          <option value="all">All Properties</option>
          {activeProperties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-[12px] border border-[#d4dede] rounded px-3 py-1.5 bg-white text-[#1a2e2e] outline-none focus:border-[#6b9b9b]"
        >
          <option value="all">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="Watch">Watch</option>
          <option value="Info">Info</option>
        </select>
        <label className="flex items-center gap-1.5 text-[12px] text-[#5a7272] cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="accent-[#4a6b6b]"
          />
          Show resolved
        </label>
      </div>

      {/* Findings grouped by property */}
      {Object.keys(groupedByProperty).length === 0 ? (
        <div className="bg-white border border-[#d4dede] rounded p-8 text-center">
          <p className="text-[14px] text-[#5a7272]">No findings match the current filters.</p>
          <p className="text-[12px] text-[#8aabab] mt-1">
            {resolvedIds.size > 0 ? `${resolvedIds.size} finding(s) have been resolved. Toggle "Show resolved" to see them.` : "All properties are performing within thresholds."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByProperty).map(([propName, findings]) => (
            <div key={propName} className="bg-white border border-[#d4dede] rounded overflow-hidden">
              {/* Property header */}
              <div className="px-4 py-3 border-b border-[#d4dede] bg-[#f7f8f8]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-[#1a2e2e]">{propName}</h3>
                    <span className="text-[10px] font-medium text-[#5a7272] bg-[#eaf0f0] px-2 py-0.5 rounded">
                      {findings.length} finding{findings.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {findings.some((f) => f.severity === "Critical") && (
                      <span className="text-[10px] font-medium text-[#dc2626] bg-[#fef2f2] px-2 py-0.5 rounded">
                        {findings.filter((f) => f.severity === "Critical").length} Critical
                      </span>
                    )}
                    {findings.some((f) => f.severity === "Watch") && (
                      <span className="text-[10px] font-medium text-[#d97706] bg-[#fffbeb] px-2 py-0.5 rounded">
                        {findings.filter((f) => f.severity === "Watch").length} Watch
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Finding cards */}
              <div className="divide-y divide-[#eaf0f0]">
                {findings.map((finding) => {
                  const isResolved = resolvedIds.has(finding.id);
                  const config = severityConfig[finding.severity];
                  return (
                    <div
                      key={finding.id}
                      className={`px-4 py-3.5 transition-colors ${isResolved ? "opacity-50 bg-[#f0fdf4]" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Severity indicator */}
                        <div className="shrink-0 mt-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-medium uppercase tracking-wide ${config.text}`}>
                              {finding.severity}
                            </span>
                            <span className="text-[10px] text-[#8aabab] uppercase tracking-wide">
                              {categoryLabels[finding.category] || finding.category}
                            </span>
                            {finding.dataPoint && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.text}`}>
                                {finding.dataPoint}
                              </span>
                            )}
                          </div>

                          <p className={`text-[13px] font-medium mb-1 ${isResolved ? "line-through text-[#8aabab]" : "text-[#1a2e2e]"}`}>
                            {finding.finding}
                          </p>

                          <div className="flex items-start gap-1.5 mt-1.5">
                            <svg className="shrink-0 mt-0.5" width="12" height="12" fill="none" stroke="#6b9b9b" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                            <p className="text-[12px] text-[#5a7272] leading-relaxed">
                              {finding.recommendation}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2.5">
                            <button
                              onClick={() => toggleResolved(finding.id)}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded cursor-pointer transition-colors ${
                                isResolved
                                  ? "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] hover:bg-[#dcfce7]"
                                  : "bg-[#f5f8f8] text-[#5a7272] border border-[#d4dede] hover:bg-[#eaf0f0]"
                              }`}
                            >
                              {isResolved ? "Resolved" : "Mark Resolved"}
                            </button>
                            <button
                              onClick={() => setEmailFinding(finding)}
                              className="text-[11px] font-medium px-2.5 py-1 rounded bg-[#1a2e2e] text-white hover:bg-[#4a6b6b] cursor-pointer transition-colors"
                            >
                              Send to PM
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email modal */}
      {emailFinding && (
        <EmailModal finding={emailFinding} onClose={() => setEmailFinding(null)} />
      )}
    </>
  );
}
