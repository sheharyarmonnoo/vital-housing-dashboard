"use client";
import { useState, useRef, useEffect } from "react";
import { properties, monthlyReviews, investorReports, formatCurrency, Property } from "@/data/portfolio";

interface Message { role: "user" | "assistant"; content: string; }

function answerQuestion(q: string): string {
  const lower = q.toLowerCase().trim();
  const active = properties.filter(p => p.status === "active" || p.status === "pre-conversion");

  // Portfolio overview
  if (lower.includes("portfolio") || lower.includes("overview") || lower.includes("how many")) {
    const totalUnits = active.reduce((s, p) => s + p.units, 0);
    const avgOcc = Math.round(active.reduce((s, p) => s + p.occupancy * p.units, 0) / totalUnits * 10) / 10;
    const totalNOI = active.reduce((s, p) => s + p.noi, 0);
    return `**Portfolio Overview:**\n- ${active.length} active properties, ${totalUnits} total units\n- Weighted occupancy: **${avgOcc}%**\n- Combined annual NOI: **${formatCurrency(totalNOI)}**\n- PM Systems: Yardi, AppFolio, Resmin`;
  }

  // Occupancy
  if (lower.includes("occupancy") || lower.includes("vacancy")) {
    const list = active.sort((a, b) => a.occupancy - b.occupancy).map(p => `- **${p.name}**: ${p.occupancy}%`).join("\n");
    return `**Occupancy by Property** (lowest first):\n${list}`;
  }

  // Revenue / NOI
  if (lower.includes("revenue") || lower.includes("noi") || lower.includes("income")) {
    const list = active.sort((a, b) => b.noi - a.noi).map(p => `- **${p.name}**: ${formatCurrency(p.noi)}/yr · ${formatCurrency(p.monthlyRevenue)}/mo`).join("\n");
    return `**NOI by Property:**\n${list}\n\nTotal: **${formatCurrency(active.reduce((s, p) => s + p.noi, 0))}/yr**`;
  }

  // Review status
  if (lower.includes("review") || lower.includes("overdue") || lower.includes("pending")) {
    const overdue = active.filter(p => p.reviewStatus === "overdue");
    const pending = active.filter(p => p.reviewStatus === "pending");
    return `**Review Status:**\n- ${overdue.length} overdue: ${overdue.map(p => p.name).join(", ") || "none"}\n- ${pending.length} pending: ${pending.map(p => p.name).join(", ") || "none"}\n- ${active.filter(p => p.reviewStatus === "current").length} current`;
  }

  // Investor reports
  if (lower.includes("investor") || lower.includes("report") || lower.includes("distribution")) {
    const published = investorReports.filter(r => r.status === "published");
    const draft = investorReports.filter(r => r.status === "draft");
    const pend = investorReports.filter(r => r.status === "pending");
    const totalDist = published.reduce((s, r) => s + r.distributionAmount, 0);
    return `**Investor Reports:**\n- ${published.length} published (${formatCurrency(totalDist)} distributed)\n- ${draft.length} in draft\n- ${pend.length} pending\n\nPublished:\n${published.map(r => `- ${properties.find(p => p.id === r.propertyId)?.name} ${r.quarter}: ${formatCurrency(r.distributionAmount)}`).join("\n")}`;
  }

  // Acquisitions
  if (lower.includes("acquisition") || lower.includes("pipeline") || lower.includes("alderwood")) {
    const alderwood = properties.find(p => p.id === "alderwood");
    if (!alderwood) return "No acquisitions in pipeline.";
    return `**Acquisition Pipeline:**\n\n**${alderwood.name}** — ${alderwood.location}\n- ${alderwood.units} units · ${alderwood.occupancy}% occupied\n- Trailing NOI: ${formatCurrency(alderwood.noi)}\n- Status: Pipeline / Due Diligence\n- Investment thesis: Renovation-driven rent growth + affordability conversion under WA RCW 84.36.560`;
  }

  // Specific property
  const propMatch = properties.find(p => lower.includes(p.name.toLowerCase().split(" ")[0].toLowerCase()));
  if (propMatch) {
    const reviews = monthlyReviews.filter(r => r.propertyId === propMatch.id).slice(-3);
    return `**${propMatch.name}** — ${propMatch.location}\n- ${propMatch.units} units · ${propMatch.occupancy}% occupied\n- Role: ${propMatch.role} · PM: ${propMatch.pmSystem}\n- Investor: ${propMatch.investorGroup}\n- Annual NOI: ${formatCurrency(propMatch.noi)}\n- Monthly Revenue: ${formatCurrency(propMatch.monthlyRevenue)}\n- Review: ${propMatch.reviewStatus}\n\nLast 3 months:\n${reviews.map(r => `- ${r.month}: NOI ${formatCurrency(r.noi)}, Occ ${r.occupancy}%, DSCR ${r.dscr}`).join("\n")}`;
  }

  // DSCR
  if (lower.includes("dscr") || lower.includes("debt service")) {
    const latest = properties.filter(p => p.status !== "pipeline").map(p => {
      const review = monthlyReviews.filter(r => r.propertyId === p.id).slice(-1)[0];
      return { name: p.name, dscr: review?.dscr || 0 };
    }).sort((a, b) => a.dscr - b.dscr);
    return `**DSCR by Property** (latest month):\n${latest.map(p => `- **${p.name}**: ${p.dscr.toFixed(2)} ${p.dscr < 1.15 ? "⚠️" : ""}`).join("\n")}`;
  }

  // Help
  return `I can help with:\n- **"Portfolio overview"** — units, occupancy, NOI\n- **"Occupancy"** — by property\n- **"Revenue"** — NOI breakdown\n- **"Review status"** — overdue/pending reviews\n- **"Investor reports"** — distributions, status\n- **"Acquisitions"** — pipeline deals\n- **"DSCR"** — debt service coverage\n- **"Courtside"** / **"Belmont"** — specific property details\n\nAsk anything about the Vital Housing portfolio!`;
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const rendered = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <span key={i}>{i > 0 && <br />}<span dangerouslySetInnerHTML={{ __html: rendered }} /></span>;
  });
}

const CHAT_KEY = "vital_chat_messages";
const defaultMessage: Message = { role: "assistant", content: "Hi! I'm your Vital Housing portfolio assistant. Ask about properties, financials, investor reports, or acquisitions. Try **\"portfolio overview\"**." };

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [defaultMessage];
  try { const raw = localStorage.getItem(CHAT_KEY); if (raw) { const p = JSON.parse(raw); return p.length > 0 ? p : [defaultMessage]; } } catch {} return [defaultMessage];
}
function saveMessages(msgs: Message[]) { if (typeof window !== "undefined") localStorage.setItem(CHAT_KEY, JSON.stringify(msgs)); }

export default function DataChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages(loadMessages()); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (isOpen) setTimeout(() => endRef.current?.scrollIntoView({ behavior: "auto" }), 50); }, [isOpen]);

  function send() {
    if (!input.trim()) return;
    const msg = input.trim(); setInput("");
    const updated = [...messages, { role: "user" as const, content: msg }];
    setMessages(updated); setIsTyping(true);
    setTimeout(() => {
      const resp = answerQuestion(msg);
      const withResp = [...updated, { role: "assistant" as const, content: resp }];
      setMessages(withResp); saveMessages(withResp); setIsTyping(false);
    }, 400);
  }

  function clear() { const fresh = [defaultMessage]; setMessages(fresh); saveMessages(fresh); }

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-[#18181b] text-white rounded w-10 h-10 flex items-center justify-center hover:bg-[#27272a] cursor-pointer">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[380px] h-[85vh] sm:h-[50vh] lg:h-screen bg-white border-l border-[#e4e4e7] flex flex-col">
          <div className="bg-[#18181b] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[13px] font-semibold">Portfolio Chat</p>
              <p className="text-[10px] text-[#71717a]">{messages.length - 1} messages</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clear} className="text-[10px] text-[#71717a] hover:text-white cursor-pointer">Clear</button>
              <button onClick={() => setIsOpen(false)} className="text-[#71717a] hover:text-white cursor-pointer">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded px-3 py-2 text-[12px] leading-relaxed ${msg.role === "user" ? "bg-[#18181b] text-white" : "bg-[#f4f4f5] text-[#18181b]"}`}>
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            ))}
            {isTyping && <div className="flex justify-start"><div className="bg-[#f4f4f5] rounded px-3 py-2 text-[12px] text-[#a1a1aa]">Thinking...</div></div>}
            <div ref={endRef} />
          </div>
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto shrink-0 border-t border-[#f4f4f5]">
            {["Portfolio overview", "Review status", "Investor reports", "Alderwood"].map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="shrink-0 text-[10px] px-2.5 py-1 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#71717a] rounded cursor-pointer whitespace-nowrap">{q}</button>
            ))}
          </div>
          <div className="px-3 py-2.5 border-t border-[#e4e4e7] shrink-0">
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask about properties, financials..."
                className="flex-1 text-[12px] px-3 py-2 bg-[#fafafa] border border-[#e4e4e7] rounded focus:outline-none focus:border-[#71717a]" />
              <button type="submit" disabled={!input.trim()}
                className="bg-[#18181b] hover:bg-[#27272a] disabled:bg-[#e4e4e7] text-white rounded p-2 cursor-pointer">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
