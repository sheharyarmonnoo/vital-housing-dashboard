"use client";
import { useState, useRef, useEffect } from "react";
import {
  properties,
  monthlyReviews,
  investorReports,
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
        (active.reduce((s, p) => s + p.occupancy * p.units, 0) / totalUnits) *
          10
      ) / 10;
    const totalNOI = active.reduce((s, p) => s + p.noi, 0);
    return `**Portfolio Summary:**\n- ${active.length} active properties, ${totalUnits} total units\n- Weighted occupancy: **${avgOcc}%**\n- Combined annual NOI: **${formatCurrency(totalNOI)}**\n- PM Systems: Yardi, AppFolio, Resmin`;
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
  if (
    lower.includes("revenue") ||
    lower.includes("noi") ||
    lower.includes("income")
  ) {
    const list = active
      .sort((a, b) => b.noi - a.noi)
      .map(
        (p) =>
          `- **${p.name}**: ${formatCurrency(p.noi)}/yr, ${formatCurrency(p.monthlyRevenue)}/mo`
      )
      .join("\n");
    return `**NOI by Property:**\n${list}\n\nTotal: **${formatCurrency(active.reduce((s, p) => s + p.noi, 0))}/yr**`;
  }

  // Past due
  if (lower.includes("past due") || lower.includes("delinquen")) {
    const lowCollections = monthlyReviews
      .filter((r) => r.collections < 96)
      .sort((a, b) => a.collections - b.collections);
    if (lowCollections.length === 0)
      return "No properties with collections below 96% in recent months.";
    const list = lowCollections
      .map((r) => {
        const prop = properties.find((p) => p.id === r.propertyId);
        return `- **${prop?.name || r.propertyId}** (${r.month}): ${r.collections}% collected`;
      })
      .join("\n");
    return `**Properties with Collections Below 96%:**\n${list}`;
  }

  // Overdue reviews
  if (lower.includes("overdue") || lower.includes("review")) {
    const overdue = active.filter((p) => p.reviewStatus === "overdue");
    const pending = active.filter((p) => p.reviewStatus === "pending");
    return `**Review Status:**\n- ${overdue.length} overdue: ${overdue.map((p) => p.name).join(", ") || "none"}\n- ${pending.length} pending: ${pending.map((p) => p.name).join(", ") || "none"}\n- ${active.filter((p) => p.reviewStatus === "current").length} current`;
  }

  // Investor reports
  if (
    lower.includes("investor") ||
    lower.includes("report") ||
    lower.includes("distribution")
  ) {
    const published = investorReports.filter((r) => r.status === "published");
    const draft = investorReports.filter((r) => r.status === "draft");
    const pend = investorReports.filter((r) => r.status === "pending");
    const totalDist = published.reduce(
      (s, r) => s + r.distributionAmount,
      0
    );
    return `**Investor Reports:**\n- ${published.length} published (${formatCurrency(totalDist)} distributed)\n- ${draft.length} in draft\n- ${pend.length} pending\n\nPublished:\n${published.map((r) => `- ${properties.find((p) => p.id === r.propertyId)?.name} ${r.quarter}: ${formatCurrency(r.distributionAmount)}`).join("\n")}`;
  }

  // Acquisitions / Alderwood
  if (
    lower.includes("acquisition") ||
    lower.includes("pipeline") ||
    lower.includes("alderwood") ||
    lower.includes("deal")
  ) {
    const alderwood = properties.find((p) => p.id === "alderwood");
    if (!alderwood) return "No acquisitions in pipeline.";
    return `**Acquisition Pipeline:**\n\n**${alderwood.name}** - ${alderwood.location}\n- ${alderwood.units} units, ${alderwood.occupancy}% occupied\n- Trailing NOI: ${formatCurrency(alderwood.noi)}\n- Status: Pipeline / Due Diligence\n- Investment thesis: Renovation-driven rent growth + affordability conversion under WA RCW 84.36.560`;
  }

  // Financial review summary
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
        const review = monthlyReviews
          .filter((r) => r.propertyId === p.id)
          .slice(-1)[0];
        return { name: p.name, dscr: review?.dscr || 0 };
      })
      .sort((a, b) => a.dscr - b.dscr);
    return `**DSCR by Property** (latest month):\n${latest.map((p) => `- **${p.name}**: ${p.dscr.toFixed(2)}`).join("\n")}`;
  }

  // Specific property lookup
  const propMatch = properties.find((p) =>
    lower.includes(p.name.toLowerCase().split(" ")[0].toLowerCase())
  );
  if (propMatch) {
    const reviews = monthlyReviews
      .filter((r) => r.propertyId === propMatch.id)
      .slice(-3);
    return `**${propMatch.name}** - ${propMatch.location}\n- ${propMatch.units} units, ${propMatch.occupancy}% occupied\n- Role: ${propMatch.role} | PM: ${propMatch.pmSystem}\n- Investor: ${propMatch.investorGroup}\n- Annual NOI: ${formatCurrency(propMatch.noi)}\n- Monthly Revenue: ${formatCurrency(propMatch.monthlyRevenue)}\n- Review: ${propMatch.reviewStatus}\n\nLast 3 months:\n${reviews.map((r) => `- ${r.month}: NOI ${formatCurrency(r.noi)}, Occ ${r.occupancy}%, DSCR ${r.dscr}`).join("\n")}`;
  }

  // Help / fallback
  return `I can help with:\n- **"Portfolio summary"** - units, occupancy, NOI\n- **"Occupancy"** - by property\n- **"Revenue"** - NOI breakdown\n- **"Overdue reviews"** - review status\n- **"Investor reports"** - distributions and status\n- **"Past due"** - collection issues\n- **"Financial flags"** - flagged reviews\n- **"Alderwood deal"** - acquisition pipeline\n- **"DSCR"** - debt service coverage\n- Property name (e.g. **"Courtside"**) - specific details\n\nAsk anything about the Vital Housing portfolio!`;
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const rendered = line.replace(
      /\*\*(.+?)\*\*/g,
      "<strong>$1</strong>"
    );
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
    'Hi! I\'m your Vital Housing portfolio assistant. Ask about properties, financials, investor reports, or acquisitions. Try **"portfolio summary"**.',
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

export default function DataChat() {
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
    const updated: Message[] = [
      ...messages,
      { role: "user", content: msg },
    ];
    setMessages(updated);
    setIsTyping(true);
    setTimeout(() => {
      const resp = answerQuestion(msg);
      const withResp: Message[] = [
        ...updated,
        { role: "assistant", content: resp },
      ];
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
    "Overdue reviews",
    "Investor reports",
    "Alderwood deal",
  ];

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-[#1a2e2e] text-white rounded w-10 h-10 flex items-center justify-center hover:bg-[#4a6b6b] cursor-pointer transition-colors"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
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
              <p className="text-[10px] text-[#8aabab]">
                {messages.length - 1} messages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clear}
                className="text-[10px] text-[#8aabab] hover:text-white cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8aabab] hover:text-white cursor-pointer"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded px-3 py-2 text-[12px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1a2e2e] text-white"
                      : "bg-[#eaf0f0] text-[#1a2e2e]"
                  }`}
                >
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#eaf0f0] rounded px-3 py-2 text-[12px] text-[#5a7272]">
                  Thinking...
                </div>
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
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
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
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
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
