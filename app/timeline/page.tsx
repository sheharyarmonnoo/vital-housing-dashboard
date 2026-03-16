"use client";
import { useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { properties, monthlyReviews } from "@/data/portfolio";

const PHASES = [
  { key: "draft", label: "Draft Available", days: [6, 8] },
  { key: "review", label: "Christina Reviews", days: [8, 10] },
  { key: "feedback", label: "PM Feedback", days: [10, 14] },
  { key: "close", label: "Final Close", days: [14, 16] },
  { key: "drivers", label: "Material Drivers", days: [16, 18] },
  { key: "questionnaire", label: "Questionnaire", days: [18, 20] },
];

interface PropertyTimeline {
  propertyId: string;
  propertyName: string;
  currentPhase: number; // index into PHASES, -1 if all done
  status: "ahead" | "on-track" | "behind" | "complete";
  reviewStatus: string;
  lastReviewDate: string;
}

function getPropertyTimelines(): PropertyTimeline[] {
  const currentDay = 16; // March 16
  const activeProps = properties.filter(
    (p) => p.status === "active" || p.status === "pre-conversion"
  );

  return activeProps.map((prop) => {
    const latestReview = monthlyReviews
      .filter((r) => r.propertyId === prop.id)
      .sort((a, b) => b.month.localeCompare(a.month))[0];

    let currentPhase = -1;
    for (let i = 0; i < PHASES.length; i++) {
      if (currentDay >= PHASES[i].days[0] && currentDay < PHASES[i].days[1]) {
        currentPhase = i;
        break;
      }
    }
    if (currentDay >= PHASES[PHASES.length - 1].days[1]) currentPhase = PHASES.length;

    // Determine status based on review data
    let status: PropertyTimeline["status"] = "on-track";
    if (prop.reviewStatus === "overdue") {
      status = "behind";
    } else if (latestReview?.status === "reviewed") {
      // If the latest month is already reviewed and current phase is past review
      if (currentPhase >= 2) status = "ahead";
      if (currentPhase >= PHASES.length) status = "complete";
    } else if (latestReview?.status === "pending") {
      // Pending: still waiting for draft
      if (currentDay > 8) status = "behind";
    } else if (latestReview?.status === "draft") {
      // Draft received but not reviewed
      if (currentDay > 10) status = "behind";
      else status = "on-track";
    }

    return {
      propertyId: prop.id,
      propertyName: prop.name,
      currentPhase,
      status,
      reviewStatus: prop.reviewStatus,
      lastReviewDate: prop.lastReviewDate,
    };
  });
}

const phaseColors = {
  complete: "#2e7d32",
  current: "#4a6b6b",
  behind: "#c62828",
  upcoming: "#d4dede",
};

export default function TimelinePage() {
  const timelines = useMemo(() => {
    const all = getPropertyTimelines();
    // Sort: behind first, then on-track, then ahead/complete
    const order = { behind: 0, "on-track": 1, ahead: 2, complete: 3 };
    return all.sort((a, b) => order[a.status] - order[b.status]);
  }, []);

  const currentDay = 16;

  return (
    <>
      <PageHeader
        title="Timeline"
        subtitle="Monthly close cycle by property — March 2026"
      />

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
          fontSize: "11px",
        }}
      >
        {[
          { color: phaseColors.complete, label: "Complete" },
          { color: phaseColors.current, label: "Current Phase" },
          { color: phaseColors.behind, label: "Behind Schedule" },
          { color: phaseColors.upcoming, label: "Upcoming" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                background: item.color,
              }}
            />
            <span style={{ color: "#5a7272" }}>{item.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "2px",
              height: "12px",
              background: "#c62828",
            }}
          />
          <span style={{ color: "#5a7272" }}>Today (Mar 16)</span>
        </div>
      </div>

      {/* Timeline rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {timelines.map((tl) => {
          const isBehind = tl.status === "behind";
          return (
            <div
              key={tl.propertyId}
              style={{
                background: "#fff",
                border: `1px solid ${isBehind ? "#ffcdd2" : "#d4dede"}`,
                borderRadius: "4px",
                padding: "14px 16px",
              }}
            >
              {/* Property header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#1a2e2e",
                    }}
                  >
                    {tl.propertyName}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontWeight: 600,
                      background:
                        tl.status === "behind"
                          ? "#ffebee"
                          : tl.status === "complete"
                          ? "#e8f5e9"
                          : tl.status === "ahead"
                          ? "#e8f5e9"
                          : "#f0f4f4",
                      color:
                        tl.status === "behind"
                          ? "#c62828"
                          : tl.status === "complete" || tl.status === "ahead"
                          ? "#2e7d32"
                          : "#4a6b6b",
                      textTransform: "uppercase",
                    }}
                  >
                    {tl.status === "on-track" ? "On Track" : tl.status}
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "#5a7272" }}>
                  Last review: {tl.lastReviewDate || "—"}
                </span>
              </div>

              {/* Phase bars */}
              <div style={{ display: "flex", gap: "3px", position: "relative" }}>
                {PHASES.map((phase, i) => {
                  let bg = phaseColors.upcoming;
                  if (isBehind && i <= tl.currentPhase) {
                    bg = phaseColors.behind;
                  } else if (i < tl.currentPhase) {
                    bg = phaseColors.complete;
                  } else if (i === tl.currentPhase) {
                    bg = phaseColors.current;
                  }
                  if (tl.status === "complete" || tl.status === "ahead") {
                    bg = i <= tl.currentPhase ? phaseColors.complete : phaseColors.upcoming;
                  }

                  // Calculate position for the today marker
                  const totalDays = PHASES[PHASES.length - 1].days[1] - PHASES[0].days[0];
                  const phaseFraction = (phase.days[1] - phase.days[0]) / totalDays;

                  return (
                    <div
                      key={phase.key}
                      style={{
                        flex: phaseFraction,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          height: "28px",
                          background: bg,
                          borderRadius: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 500,
                            color:
                              bg === phaseColors.upcoming
                                ? "#5a7272"
                                : "#fff",
                            whiteSpace: "nowrap",
                            padding: "0 4px",
                          }}
                        >
                          {phase.label}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#8aabab",
                          textAlign: "center",
                          marginTop: "3px",
                        }}
                      >
                        {phase.days[0]}th–{phase.days[1]}th
                      </div>
                    </div>
                  );
                })}

                {/* Today marker */}
                {(() => {
                  const startDay = PHASES[0].days[0];
                  const endDay = PHASES[PHASES.length - 1].days[1];
                  const pct =
                    ((currentDay - startDay) / (endDay - startDay)) * 100;
                  if (pct < 0 || pct > 100) return null;
                  return (
                    <div
                      style={{
                        position: "absolute",
                        left: `${pct}%`,
                        top: 0,
                        bottom: 0,
                        width: "2px",
                        background: "#c62828",
                        zIndex: 2,
                      }}
                    />
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
