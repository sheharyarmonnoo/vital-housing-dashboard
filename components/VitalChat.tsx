"use client";
import { useState, useRef, useEffect } from "react";
import {
  properties,
  monthlyReviews,
  investorReports,
  actionItems,
  alderwoodDeal,
  formatCurrency,
} from "@/data/portfolio";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function answerQuestion(q: string): string {
  const lower = q.toLowerCase().trim();
  const active = properties.filter(
    (p) => p.status === "active" || p.status === "pre-conversion"
  );

  // Portfolio overview
  if (
    lower.includes("portfolio") ||
    lower.includes("summary") ||
    lower.includes("overview") ||
    lower.includes("how many")
  ) {
    const totalUnits = active.reduce((s, p) => s + p.units, 0);
    const avgOcc =
      Math.round(
        (active.reduce((s, p) => s + p.occupancy * p.units, 0) / totalUnits) * 10
      ) / 10;
    const totalNOI = active.reduce((s, p) => s + p.noi, 0);
    return `**Portfolio Summary:**\n- ${active.length} active properties, ${totalUnits} total units\n- Weighted occupancy: **${avgOcc}%**\n- Combined annual NOI: **${formatCurrency(totalNOI)}**\n- PM Systems: Yardi, AppFolio, Resmin\n- Roles: ${properties.filter(p => p.role === "core").length} core, ${properties.filter(p => p.role === "co-gp").length} co-GP, ${properties.filter(p => p.role === "third-party").length} third-party AM`;
  }

  // Courtside specific
  if (lower.includes("courtside")) {
    const p = properties.find((x) => x.id === "courtside")!;
    const reviews = monthlyReviews.filter((r) => r.propertyId === "courtside").slice(-3);
    return `**${p.name}** — ${p.location}\n- ${p.units} units, acquired ${p.acquisitionDate} for ${formatCurrency(p.acquisitionPrice!)}\n- Occupancy: **${p.occupancy}%**\n- Annual NOI: **${formatCurrency(p.noi)}**\n- Loan: ${formatCurrency(p.loan!.amount)} at ${p.loan!.rate}% (${p.loan!.lender})\n- Investor: ${p.investorGroup}\n- PM: ${p.pmSystem} (${p.pmCompany})\n- Review: ${p.reviewStatus}\n\nLast 3 months:\n${reviews.map((r) => `- ${r.month}: NOI ${formatCurrency(r.noi)}, Occ ${r.occupancy}%, DSCR ${r.dscr}`).join("\n")}`;
  }

  // Occupancy
  if (lower.includes("occupancy") || lower.includes("vacancy")) {
    const list = active
      .sort((a, b) => a.occupancy - b.occupancy)
      .map((p) => `- **${p.name}**: ${p.occupancy}%`)
      .join("\n");
    return `**Occupancy by Property** (lowest first):\n${list}`;
  }

  // Revenue / NOI
  if (lower.includes("revenue") || lower.includes("noi") || lower.includes("income")) {
    const list = active
      .sort((a, b) => b.noi - a.noi)
      .map((p) => `- **${p.name}**: ${formatCurrency(p.noi)}/yr, ${formatCurrency(p.monthlyRevenue)}/mo`)
      .join("\n");
    return `**NOI by Property:**\n${list}\n\nTotal: **${formatCurrency(active.reduce((s, p) => s + p.noi, 0))}/yr**`;
  }

  // Pending reviews
  if (lower.includes("pending") || lower.includes("overdue") || lower.includes("review") || lower.includes("which")) {
    const overdue = active.filter((p) => p.reviewStatus === "overdue");
    const pending = active.filter((p) => p.reviewStatus === "pending");
    return `**Review Status:**\n- ${overdue.length} overdue: ${overdue.map((p) => p.name).join(", ") || "none"}\n- ${pending.length} pending: ${pending.map((p) => p.name).join(", ") || "none"}\n- ${active.filter((p) => p.reviewStatus === "current").length} current`;
  }

  // Investor reports
  if (lower.includes("investor") || lower.includes("report") || lower.includes("distribution")) {
    const published = investorReports.filter((r) => r.status === "published");
    const draft = investorReports.filter((r) => r.status === "draft");
    const pend = investorReports.filter((r) => r.status === "pending");
    const totalDist = published.reduce((s, r) => s + r.distributionAmount, 0);
    return `**Investor Reports:**\n- ${published.length} published (${formatCurrency(totalDist)} distributed)\n- ${draft.length} in draft\n- ${pend.length} pending\n\nPublished:\n${published.map((r) => `- ${properties.find((p) => p.id === r.propertyId)?.name} ${r.quarter}: ${formatCurrency(r.distributionAmount)}`).join("\n")}\n\nDraft: Belmont Q4 2025 — Cesca finalizing waterfall calc`;
  }

  // Acquisitions / Alderwood / pipeline
  if (lower.includes("acquisition") || lower.includes("pipeline") || lower.includes("alderwood") || lower.includes("deal")) {
    return `**Acquisition Pipeline — Alderwood Park**\n\n- ${alderwoodDeal.buildings} buildings on ${alderwoodDeal.acreage} acres, Lynnwood WA\n- 188 units, ${alderwoodDeal.vintage} vintage\n- ${alderwoodDeal.occupancy}% occupied\n- Trailing NOI: **${formatCurrency(alderwoodDeal.trailingNOI)}**\n- Avg rent: $${alderwoodDeal.avgRentPerUnit}/mo ($${alderwoodDeal.avgRentPerSF}/SF)\n- Renovation: ${alderwoodDeal.renovationStatus.renovated} renovated, ${alderwoodDeal.renovationStatus.classic} classic\n- Status: **Due Diligence** (LOI accepted)\n\n**Key risks:** Undisclosed price, elevated water/sewer, $88K bad debt\n**Opportunity:** Tax exemption (${alderwoodDeal.taxExemption}) — potential $280K savings`;
  }

  // PM / call prep
  if (lower.includes("pm") || lower.includes("property manag") || lower.includes("call prep")) {
    const pmSystems = active.reduce((acc: Record<string, string[]>, p) => {
      const key = p.pmSystem;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p.name);
      return acc;
    }, {});
    const lines = Object.entries(pmSystems).map(([sys, props]) => `- **${sys}**: ${props.join(", ")}`).join("\n");
    return `**PM Systems & Companies:**\n${lines}\n\n**Action items:**\n- Coronado: Follow up with Cascade Living — Feb package overdue\n- LEDG River Bend: Resmin export issue delaying Feb financials`;
  }

  // Financial flags
  if (lower.includes("financial") || lower.includes("flag")) {
    const flagged = monthlyReviews
      .filter((r) => r.flagCount > 0)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 5);
    if (flagged.length === 0) return "No flagged financial reviews.";
    const list = flagged
      .map((r) => {
        const prop = properties.find((p) => p.id === r.propertyId);
        return `- **${prop?.name || r.propertyId}** (${r.month}): ${r.flagCount} flag${r.flagCount > 1 ? "s" : ""}, variance ${r.budgetVariance > 0 ? "+" : ""}${r.budgetVariance}%`;
      })
      .join("\n");
    return `**Recent Financial Review Flags:**\n${list}`;
  }

  // DSCR
  if (lower.includes("dscr") || lower.includes("debt service")) {
    const latest = properties
      .filter((p) => p.status !== "pipeline")
      .map((p) => {
        const review = monthlyReviews.filter((r) => r.propertyId === p.id).slice(-1)[0];
        return { name: p.name, dscr: review?.dscr || 0 };
      })
      .filter((p) => p.dscr > 0)
      .sort((a, b) => a.dscr - b.dscr);
    return `**DSCR by Property** (latest month):\n${latest.map((p) => `- **${p.name}**: ${p.dscr.toFixed(2)}x`).join("\n")}`;
  }

  // Past due / collections
  if (lower.includes("past due") || lower.includes("delinquen") || lower.includes("collection")) {
    const lowCollections = monthlyReviews
      .filter((r) => r.collections < 96)
      .sort((a, b) => a.collections - b.collections);
    if (lowCollections.length === 0) return "No properties with collections below 96% in recent months.";
    const list = lowCollections
      .map((r) => {
        const prop = properties.find((p) => p.id === r.propertyId);
        return `- **${prop?.name || r.propertyId}** (${r.month}): ${r.collections}% collected`;
      })
      .join("\n");
    return `**Properties with Collections Below 96%:**\n${list}`;
  }

  // Action items
  if (lower.includes("action") || lower.includes("todo") || lower.includes("task")) {
    return `**Action Items:**\n${actionItems.map((a) => `- [${a.priority.toUpperCase()}] ${a.property}: ${a.description} (${a.assignee}, due ${a.dueDate})`).join("\n")}`;
  }

  // Reclass command: "reclass [property]: [details]"
  if (lower.startsWith("reclass ")) {
    const parts = q.substring(8).split(":");
    const propName = parts[0]?.trim() || "";
    const details = parts[1]?.trim() || "No details provided";
    const matchProp = properties.find((p) => p.name.toLowerCase().includes(propName.toLowerCase()));
    if (matchProp) {
      return `**Reclassification Request Created:**\n- Property: **${matchProp.name}**\n- Details: ${details}\n- Status: Requested\n- Assigned to: Christina\n\nView and manage all reclassification requests on the Financial Review page.`;
    }
    return `Could not find property matching "${propName}". Try using the full property name.`;
  }

  // Email command: "email [property]"
  if (lower.startsWith("email ")) {
    const propName = q.substring(6).trim();
    const matchProp = properties.find((p) => p.name.toLowerCase().includes(propName.toLowerCase()));
    if (matchProp) {
      const pmCompany = matchProp.pmCompany || "Property Management Team";
      const latestReview = monthlyReviews.filter((r) => r.propertyId === matchProp.id).sort((a, b) => b.month.localeCompare(a.month))[0];
      const month = latestReview ? latestReview.month : "recent period";
      return `**Directive Email Draft — ${matchProp.name}:**\n\nDear ${pmCompany},\n\nFollowing our review of ${matchProp.name} financials for ${month}, the following items require your attention:\n\n- Please review and address any flagged GL items\n- Confirm current replacement reserve balance\n- Return updated financials within 2 business days (draft) or 7 business days (final)\n\nThank you,\nChristina Adams\nDirector of Finance, Vital Housing Group\n\n_Full email composer available on the Financial Review page._`;
    }
    return `Could not find property matching "${propName}". Try using the full property name.`;
  }

  // Covenant status command
  if (lower.includes("covenant") || lower.includes("covenant status")) {
    const covenants = [
      { name: "Courtside", threshold: 1.15, current: 1.41 },
      { name: "Belmont Dairy", threshold: 1.15, current: 1.27 },
      { name: "Coronado", threshold: 1.10, current: 1.30 },
      { name: "Orchard Park", threshold: 1.10, current: 1.09 },
      { name: "Valencia", threshold: 1.15, current: 1.53 },
    ];
    const lines = covenants.map((c) => {
      const buffer = (c.current - c.threshold) / c.threshold;
      const status = c.current < c.threshold ? "BREACH" : buffer < 0.10 ? "WARNING" : "Compliant";
      return `- **${c.name}**: DSCR ${c.current.toFixed(2)}x vs ${c.threshold.toFixed(2)}x min — **${status}**`;
    });
    return `**Loan Covenant Status:**\n${lines.join("\n")}\n\nFull covenant monitoring available on the Portfolio page.`;
  }

  // Deal memory command: "deal memory [property]"
  if (lower.includes("deal memory")) {
    const propName = q.replace(/deal memory/i, "").trim();
    const matchProp = propName ? properties.find((p) => p.name.toLowerCase().includes(propName.toLowerCase())) : null;
    if (matchProp) {
      return `**Deal Memory — ${matchProp.name}:**\n- Location: ${matchProp.location}\n- PM: ${matchProp.pmSystem} (${matchProp.pmCompany || "N/A"})\n- Investor: ${matchProp.investorGroup}\n- Role: ${matchProp.role}\n\nProperty-specific notes, KPI rules, and COA mappings are stored on the **Deal Memory** page. Visit /deal-memory to view and edit.`;
    }
    return `**Deal Memory:**\nThe Deal Memory page stores per-property knowledge including:\n- Account treatment rules\n- Reserve eligibility rules\n- PM contact info and response patterns\n- Historical directive emails\n- Materiality thresholds\n- KPI rulebooks\n- Chart of accounts mappings\n\nVisit the **Deal Memory** page from the sidebar to view and edit.`;
  }

  // Specific property lookup
  const propMatch = properties.find((p) =>
    lower.includes(p.name.toLowerCase().split(" ")[0].toLowerCase())
  );
  if (propMatch) {
    const reviews = monthlyReviews.filter((r) => r.propertyId === propMatch.id).slice(-3);
    return `**${propMatch.name}** — ${propMatch.location}\n- ${propMatch.units} units, ${propMatch.occupancy}% occupied\n- Role: ${propMatch.role} | PM: ${propMatch.pmSystem}${propMatch.pmCompany ? ` (${propMatch.pmCompany})` : ""}\n- Investor: ${propMatch.investorGroup}\n- Annual NOI: ${formatCurrency(propMatch.noi)}\n- Monthly Revenue: ${formatCurrency(propMatch.monthlyRevenue)}\n- Review: ${propMatch.reviewStatus}\n\nLast months:\n${reviews.map((r) => `- ${r.month}: NOI ${formatCurrency(r.noi)}, Occ ${r.occupancy}%, DSCR ${r.dscr}`).join("\n")}`;
  }

  // Help / fallback
  return `I can help with:\n- **"Portfolio summary"** — units, occupancy, NOI\n- **"Courtside occupancy?"** — property details\n- **"Which reviews are pending?"** — review status\n- **"Investor reports"** — distributions and status\n- **"Alderwood deal"** — pipeline info\n- **"Financial flags"** — flagged reviews\n- **"DSCR"** — debt service coverage\n- **"PM call prep"** — PM systems and action items\n- **"Action items"** — open tasks\n- **"reclass [property]: [details]"** — create reclassification request\n- **"email [property]"** — generate directive email draft\n- **"covenant status"** — loan covenant compliance\n- **"deal memory [property]"** — property-specific knowledge\n- Property name (e.g. **"Belmont"**) — specific details\n\nAsk anything about the Vital Housing portfolio.`;
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const rendered = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return (
      <span key={i}>
        {i > 0 && <br />}
        <span dangerouslySetInnerHTML={{ __html: rendered }} />
      </span>
    );
  });
}

const CHAT_KEY = "vital_chat_messages";
const defaultMessage: Message = {
  role: "assistant",
  content:
    'Hi! I\'m your Vital Housing portfolio assistant. Ask about properties, financials, investor reports, or the Alderwood acquisition. Try **"portfolio summary"**.',
};

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [defaultMessage];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return p.length > 0 ? p : [defaultMessage];
    }
  } catch {
    /* ignore */
  }
  return [defaultMessage];
}

function saveMessages(msgs: Message[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));
}

export default function VitalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "auto" }), 50);
  }, [isOpen]);

  function send() {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    const updated: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setIsTyping(true);
    setTimeout(() => {
      const resp = answerQuestion(msg);
      const withResp: Message[] = [...updated, { role: "assistant", content: resp }];
      setMessages(withResp);
      saveMessages(withResp);
      setIsTyping(false);
    }, 400);
  }

  function clear() {
    const fresh = [defaultMessage];
    setMessages(fresh);
    saveMessages(fresh);
  }

  const quickActions = [
    "Portfolio summary",
    "Pending reviews",
    "Covenant status",
    "Investor reports",
    "Action items",
    "Deal memory",
  ];

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-[#1a2e2e] text-white rounded w-10 h-10 flex items-center justify-center hover:bg-[#4a6b6b] cursor-pointer transition-colors"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[380px] h-[85vh] sm:h-[50vh] lg:h-screen bg-white border-l border-[#d4dede] flex flex-col">
          {/* Header */}
          <div className="bg-[#1a2e2e] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[13px] font-semibold">Portfolio Chat</p>
              <p className="text-[10px] text-[#6b9b9b]">{messages.length - 1} messages</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clear} className="text-[10px] text-[#8aabab] hover:text-white cursor-pointer">Clear</button>
              <button onClick={() => setIsOpen(false)} className="text-[#8aabab] hover:text-white cursor-pointer">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded px-3 py-2 text-[12px] leading-relaxed ${
                    msg.role === "user" ? "bg-[#1a2e2e] text-white" : "bg-[#eaf0f0] text-[#1a2e2e]"
                  }`}
                >
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#eaf0f0] rounded px-3 py-2 text-[12px] text-[#5a7272]">Thinking...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick actions */}
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto shrink-0 border-t border-[#d4dede]">
            {quickActions.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="shrink-0 text-[10px] px-2.5 py-1 bg-[#eaf0f0] hover:bg-[#d4dede] text-[#5a7272] rounded cursor-pointer whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-[#d4dede] shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about properties, financials..."
                className="flex-1 text-[12px] px-3 py-2 bg-[#f7f8f8] border border-[#d4dede] rounded focus:outline-none focus:border-[#6b9b9b]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-[#1a2e2e] hover:bg-[#4a6b6b] disabled:bg-[#d4dede] text-white rounded p-2 cursor-pointer transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
