"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  properties,
  monthlyReviews,
  investorReports,
  actionItems,
  formatCurrency,
  loadAllProperties,
  editProperty,
} from "@/data/portfolio";
import { generateFindings, generateEmailDraft } from "@/lib/material-drivers";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CC_KEY = "vital_command_messages";
const ACTION_ITEMS_KEY = "vital_action_items";

const defaultMessage: Message = {
  role: "assistant",
  content:
    'Vital Command Center ready. Try: "what needs attention", "go to drivers", "show courtside", or "add task: follow up with PM".',
};

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [defaultMessage];
  try {
    const raw = localStorage.getItem(CC_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return p.length > 0 ? p : [defaultMessage];
    }
  } catch {}
  return [defaultMessage];
}

function saveMessages(msgs: Message[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(CC_KEY, JSON.stringify(msgs));
}

function loadCustomActions(): { id: string; text: string; done: boolean }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTION_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomActions(items: { id: string; text: string; done: boolean }[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(ACTION_ITEMS_KEY, JSON.stringify(items));
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

export default function CommandCenter() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        endRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    }
  }, [open]);

  // Cmd+K handler
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const processCommand = useCallback(
    (q: string): string => {
      const lower = q.toLowerCase().trim();
      const active = properties.filter(
        (p) => p.status === "active" || p.status === "pre-conversion"
      );

      // Navigation commands
      if (lower.includes("go to driver") || lower.includes("show driver") || lower === "drivers") {
        setTimeout(() => router.push("/drivers"), 100);
        return "Navigating to **Material Drivers**...";
      }
      if (lower.includes("go to inbox") || lower.includes("show inbox") || lower === "inbox") {
        setTimeout(() => router.push("/"), 100);
        return "Navigating to **Inbox**...";
      }
      if (lower.includes("go to document") || lower.includes("show document") || lower.includes("document studio")) {
        setTimeout(() => router.push("/documents"), 100);
        return "Navigating to **Document Studio**...";
      }
      if (lower.includes("go to timeline") || lower.includes("show timeline") || lower === "timeline") {
        setTimeout(() => router.push("/timeline"), 100);
        return "Navigating to **Timeline**...";
      }
      if (lower.includes("go to propert") || lower.includes("show propert") || lower === "properties") {
        setTimeout(() => router.push("/properties"), 100);
        return "Navigating to **Properties**...";
      }
      if (lower.includes("go to deal") || lower.includes("show deal") || lower === "deals") {
        setTimeout(() => router.push("/deals"), 100);
        return "Navigating to **Deals**...";
      }

      // Add task
      if (lower.startsWith("add task:") || lower.startsWith("add action:") || lower.startsWith("create task:")) {
        const text = q.replace(/^(add|create)\s*(task|action)\s*:\s*/i, "").trim();
        if (text) {
          const items = loadCustomActions();
          items.push({ id: `task-${Date.now()}`, text, done: false });
          saveCustomActions(items);
          return `Added action item: **${text}**`;
        }
        return "Please provide task text after the colon.";
      }

      // Update property
      const updateMatch = lower.match(
        /update\s+(\w+)\s+occupancy\s+to\s+([\d.]+)/
      );
      if (updateMatch) {
        const [, name, val] = updateMatch;
        const prop = properties.find((p) =>
          p.name.toLowerCase().includes(name)
        );
        if (prop) {
          editProperty(prop.id, { occupancy: parseFloat(val) });
          return `Updated **${prop.name}** occupancy to **${val}%**. Refresh the page to see changes.`;
        }
        return `Property "${name}" not found.`;
      }

      // Email generation
      if (lower.includes("email") && lower.includes("pm")) {
        const prop = properties.find((p) =>
          lower.includes(p.name.toLowerCase().split(" ")[0].toLowerCase())
        );
        if (prop) {
          const findings = generateFindings(prop.id).filter((f) => !f.resolved);
          if (findings.length === 0)
            return `No outstanding findings for **${prop.name}**.`;
          const email = generateEmailDraft(prop.name, prop.pmCompany, findings);
          return `**Draft Email for ${prop.name}:**\n\n${email}`;
        }
        return "Specify a property name, e.g. **email courtside PM**";
      }

      // What needs attention
      if (lower.includes("needs attention") || lower.includes("what needs") || lower.includes("urgent")) {
        const findings = generateFindings();
        const critical = findings.filter(
          (f) => f.severity === "Critical" && !f.resolved
        );
        const watch = findings.filter(
          (f) => f.severity === "Watch" && !f.resolved
        );
        return `**Items Needing Attention:**\n\n**Critical (${critical.length}):**\n${critical.map((f) => `- ${f.propertyName}: ${f.finding}`).join("\n") || "None"}\n\n**Watch (${watch.length}):**\n${watch.map((f) => `- ${f.propertyName}: ${f.finding}`).join("\n") || "None"}`;
      }

      // Portfolio overview
      if (lower.includes("portfolio") || lower.includes("summary") || lower.includes("overview")) {
        const totalUnits = active.reduce((s, p) => s + p.units, 0);
        const avgOcc =
          Math.round(
            (active.reduce((s, p) => s + p.occupancy * p.units, 0) /
              totalUnits) *
              10
          ) / 10;
        const totalNOI = active.reduce((s, p) => s + p.noi, 0);
        return `**Portfolio Summary:**\n- ${active.length} active properties, ${totalUnits} total units\n- Weighted occupancy: **${avgOcc}%**\n- Combined annual NOI: **${formatCurrency(totalNOI)}**`;
      }

      // Occupancy
      if (lower.includes("occupancy") || lower.includes("vacancy")) {
        const list = active
          .sort((a, b) => a.occupancy - b.occupancy)
          .map((p) => `- **${p.name}**: ${p.occupancy}%`)
          .join("\n");
        return `**Occupancy by Property** (lowest first):\n${list}`;
      }

      // NOI
      if (lower.includes("revenue") || lower.includes("noi") || lower.includes("income")) {
        const list = active
          .sort((a, b) => b.noi - a.noi)
          .map((p) => `- **${p.name}**: ${formatCurrency(p.noi)}/yr`)
          .join("\n");
        return `**NOI by Property:**\n${list}`;
      }

      // Reviews
      if (lower.includes("overdue") || lower.includes("review")) {
        const overdue = active.filter((p) => p.reviewStatus === "overdue");
        const pending = active.filter((p) => p.reviewStatus === "pending");
        return `**Review Status:**\n- ${overdue.length} overdue: ${overdue.map((p) => p.name).join(", ") || "none"}\n- ${pending.length} pending: ${pending.map((p) => p.name).join(", ") || "none"}`;
      }

      // Investor reports
      if (lower.includes("investor") || lower.includes("report") || lower.includes("distribution")) {
        const published = investorReports.filter((r) => r.status === "published");
        const totalDist = published.reduce((s, r) => s + r.distributionAmount, 0);
        return `**Investor Reports:** ${published.length} published (${formatCurrency(totalDist)} distributed), ${investorReports.filter((r) => r.status === "draft").length} draft, ${investorReports.filter((r) => r.status === "pending").length} pending`;
      }

      // Specific property
      const propMatch = properties.find((p) =>
        lower.includes(p.name.toLowerCase().split(" ")[0].toLowerCase())
      );
      if (propMatch) {
        const reviews = monthlyReviews
          .filter((r) => r.propertyId === propMatch.id)
          .slice(-2);
        return `**${propMatch.name}** - ${propMatch.location}\n- ${propMatch.units} units, ${propMatch.occupancy}% occupied\n- Role: ${propMatch.role} | PM: ${propMatch.pmCompany || propMatch.pmSystem}\n- Annual NOI: ${formatCurrency(propMatch.noi)}\n- Review: ${propMatch.reviewStatus}${reviews.length > 0 ? "\n\nRecent:\n" + reviews.map((r) => `- ${r.month}: NOI ${formatCurrency(r.noi)}, DSCR ${r.dscr}`).join("\n") : ""}`;
      }

      return `Try: **"portfolio summary"**, **"what needs attention"**, **"go to drivers"**, **"add task: ..."**, **"email courtside PM"**, or a property name.`;
    },
    [router]
  );

  function send() {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    const updated: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setIsTyping(true);
    setTimeout(() => {
      const resp = processCommand(msg);
      const withResp: Message[] = [
        ...updated,
        { role: "assistant", content: resp },
      ];
      setMessages(withResp);
      saveMessages(withResp);
      setIsTyping(false);
    }, 300);
  }

  function clear() {
    const fresh = [defaultMessage];
    setMessages(fresh);
    saveMessages(fresh);
  }

  return (
    <>
      {/* Bottom bar toggle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 55,
            height: "40px",
            background: "#1a2e2e",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "#8aabab",
            fontSize: "12px",
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Command Center</span>
          <span
            style={{
              fontSize: "10px",
              padding: "1px 5px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "3px",
            }}
          >
            {"\u2318"}K
          </span>
        </button>
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 55,
          height: open ? "50vh" : "0",
          maxHeight: "600px",
          background: "#fff",
          borderTop: open ? "1px solid #d4dede" : "none",
          transition: "height 200ms ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#1a2e2e",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="#8aabab"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
              Command Center
            </span>
            <span style={{ fontSize: "10px", color: "#6b9b9b" }}>
              {messages.length - 1} messages
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={clear}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "10px",
                color: "#8aabab",
              }}
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#8aabab",
                lineHeight: 0,
              }}
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
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  background:
                    msg.role === "user" ? "#1a2e2e" : "#f0f4f4",
                  color: msg.role === "user" ? "#fff" : "#1a2e2e",
                }}
              >
                {renderMarkdown(msg.content)}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  borderRadius: "4px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  background: "#f0f4f4",
                  color: "#5a7272",
                }}
              >
                Processing...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #d4dede",
            flexShrink: 0,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            style={{ display: "flex", gap: "8px" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Try "what needs attention" or "go to drivers"...'
              style={{
                flex: 1,
                fontSize: "13px",
                padding: "8px 12px",
                background: "#f7f8f8",
                border: "1px solid #d4dede",
                borderRadius: "4px",
                outline: "none",
                color: "#1a2e2e",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                background: input.trim() ? "#1a2e2e" : "#d4dede",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "8px 14px",
                cursor: input.trim() ? "pointer" : "default",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Page bottom padding */}
      {!open && <div style={{ height: "40px" }} />}
    </>
  );
}
