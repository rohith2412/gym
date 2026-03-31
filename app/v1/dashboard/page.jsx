"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ProfilePicture from "@/components/ProfilePicture";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function totalVol(log) {
  return log.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
    0,
  );
}
function totalSets(log) {
  return log.exercises.reduce((s, ex) => s + ex.sets.length, 0);
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
function getWeekActivity(logs) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const hasLog = logs.some(
      (l) => new Date(l.date).toISOString().slice(0, 10) === iso,
    );
    days.push({
      label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
      active: hasLog,
      today: i === 0,
    });
  }
  return days;
}

// ─── Build year contribution grid ────────────────────────────────────────────
// Returns 52 full weeks (+ partial) as columns of 7 days, ISO date → volume map
function buildYearGrid(logs) {
  // Map date string → total volume that day
  const volByDate = {};
  logs.forEach((log) => {
    const iso = new Date(log.date).toISOString().slice(0, 10);
    volByDate[iso] = (volByDate[iso] || 0) + totalVol(log);
  });

  // Start from 52 weeks ago (Sunday of that week)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364); // 52 weeks back
  // Rewind to previous Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  const cursor = new Date(startDate);

  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      if (cursor > today) {
        week.push(null); // future days
      } else {
        const iso = cursor.toISOString().slice(0, 10);
        week.push({
          date: iso,
          vol: volByDate[iso] || 0,
          hasLog: !!volByDate[iso],
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Max volume for intensity scaling
  const maxVol = Math.max(...Object.values(volByDate), 1);
  return { weeks, maxVol, volByDate };
}

// Month labels for the contribution grid
function getMonthLabels(weeks) {
  const labels = [];
  weeks.forEach((week, wi) => {
    const firstDay = week.find((d) => d !== null);
    if (!firstDay) return;
    const date = new Date(firstDay.date);
    if (date.getDate() <= 7) {
      labels.push({
        wi,
        label: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
  });
  return labels;
}

// ─── Year Contribution Chart ──────────────────────────────────────────────────
function YearContributionChart({ logs }) {
  const scrollRef = useRef(null);
  const { weeks, maxVol } = buildYearGrid(logs);
  const monthLabels = getMonthLabels(weeks);
  const [tooltip, setTooltip] = useState(null);

  // Auto-scroll to end (most recent) on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  // Count this year's sessions
  const yearStart = new Date();
  yearStart.setMonth(0, 1);
  yearStart.setHours(0, 0, 0, 0);
  const yearSessions = logs.filter((l) => new Date(l.date) >= yearStart).length;
  const longestStreak = (() => {
    let best = 0,
      cur = 0;
    const allDays = weeks.flat().filter(Boolean);
    allDays.forEach((d) => {
      if (d.hasLog) {
        cur++;
        best = Math.max(best, cur);
      } else cur = 0;
    });
    return best;
  })();

  const CELL = 11; // px per cell
  const GAP = 2; // px gap

  function cellColor(day) {
    if (!day || !day.hasLog) return "#f0ede6";
    const intensity = day.vol / maxVol;
    if (intensity < 0.25) return "#ffd4c2";
    if (intensity < 0.5) return "#ff9f7a";
    if (intensity < 0.75) return "#ff6b35";
    return "#c8410d";
  }

  return (
    <div style={{ marginTop: 14 }}>
      {/* Mini stats row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        {[
          { label: "This year", value: yearSessions, unit: "sessions" },
          { label: "Longest streak", value: longestStreak, unit: "days" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: "#f4f2ed",
              borderRadius: 12,
              padding: "0.6rem 0.8rem",
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 3,
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#1a1a1a",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {s.value}{" "}
              <span style={{ fontSize: 11, fontWeight: 400, color: "#aaa" }}>
                {s.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Scrollable grid */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 4,
          position: "relative",
        }}
      >
        {/* Month labels */}
        <div
          style={{
            display: "flex",
            marginBottom: 4,
            marginLeft: 0,
            minWidth: weeks.length * (CELL + GAP),
          }}
        >
          {monthLabels.map(({ wi, label }) => (
            <div
              key={wi}
              style={{
                position: "absolute",
                left: wi * (CELL + GAP),
                fontSize: 9,
                fontWeight: 700,
                color: "#bbb",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                top: 0,
              }}
            >
              {label}
            </div>
          ))}
          {/* Spacer for month labels */}
          <div style={{ height: 14, width: weeks.length * (CELL + GAP) }} />
        </div>

        {/* Cell grid */}
        <div style={{ display: "flex", gap: GAP, position: "relative" }}>
          {weeks.map((week, wi) => (
            <div
              key={wi}
              style={{ display: "flex", flexDirection: "column", gap: GAP }}
            >
              {week.map((day, di) => (
                <div
                  key={di}
                  onMouseEnter={() =>
                    day?.hasLog && setTooltip({ day, wi, di })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 3,
                    background: cellColor(day),
                    opacity: day === null ? 0 : 1,
                    cursor: day?.hasLog ? "pointer" : "default",
                    transition: "transform 0.1s",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            marginTop: 8,
            background: "#1a1a1a",
            color: "#fafaf8",
            borderRadius: 10,
            padding: "0.5rem 0.8rem",
            fontSize: 12,
            fontWeight: 600,
            display: "inline-flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span>📅</span>
          <span>
            {new Date(tooltip.day.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span style={{ color: "#ff6b35" }}>·</span>
          <span>{tooltip.day.vol.toLocaleString()} lbs</span>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginTop: 10,
          justifyContent: "flex-end",
        }}
      >
        {/* <span style={{ fontSize: 9, color: "#bbb", fontWeight: 600 }}>
          Less
        </span>
        {["#f0ede6", "#ffd4c2", "#ff9f7a", "#ff6b35", "#c8410d"].map((c) => (
          <div
            key={c}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: 3,
              background: c,
            }}
          />
        ))}
        <span style={{ fontSize: 9, color: "#bbb", fontWeight: 600 }}>
          More
        </span> */}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #e8e5de",
        borderRadius: 20,
        padding: "1.25rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, action, onAction }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0.65rem",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#aaa",
        }}
      >
        {children}
      </p>
      {action && (
        <button
          onClick={onAction}
          style={{
            fontSize: 12,
            color: "#ff6b35",
            background: "none",
            border: "none",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function SkeletonCard({ height = 90 }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e5de",
        borderRadius: 20,
        height,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(232,229,222,0.5) 50%, transparent 100%)",
          animation: "shimmer 1.4s infinite",
        }}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vis, setVis] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const chartRef = useRef(null);

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
    if (session && !session.user?.hasIntro) {
      router.replace("/v1/StartersIntro");
      return;
    }
  }, [status, session, router]);

  // Fetch tracking data
  useEffect(() => {
    if (status !== "authenticated") return;
    async function load() {
      try {
        // Fetch all logs for the year chart (no limit)
        const res = await fetch("/api/tracking?limit=400");
        const json = await res.json();
        if (json.success) setLogs(json.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setTimeout(() => setVis(true), 40);
      }
    }
    load();
  }, [status]);

  // Animate chart height open/close
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartOpen) {
      chartRef.current.style.maxHeight = chartRef.current.scrollHeight + "px";
      chartRef.current.style.opacity = "1";
    } else {
      chartRef.current.style.maxHeight = "0px";
      chartRef.current.style.opacity = "0";
    }
  }, [chartOpen]);

  if (status === "loading" || (session && !session.user?.hasIntro)) return null;

  const firstName = session?.user?.name?.split(" ")[0] ?? "Athlete";
  const weekDays = getWeekActivity(logs);
  const streakCount = weekDays.filter((d) => d.active).length;

  // Week volume
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekVolume = logs
    .filter((l) => new Date(l.date) >= weekStart)
    .reduce((s, l) => s + totalVol(l), 0);

  // Personal bests
  const bests = {};
  logs.forEach((log) => {
    log.exercises.forEach((ex) => {
      const top = Math.max(...ex.sets.map((s) => s.weight));
      if (!bests[ex.name] || top > bests[ex.name]) bests[ex.name] = top;
    });
  });
  const topBests = Object.entries(bests)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Volume delta
  let volDelta = null;
  if (logs.length >= 2) {
    const delta = totalVol(logs[0]) - totalVol(logs[1]);
    const pct = Math.round(Math.abs((delta / (totalVol(logs[1]) || 1)) * 100));
    volDelta = { up: delta >= 0, pct };
  }

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        ::-webkit-scrollbar { display: none; }
        button { cursor: pointer; }
      `}</style>

      {/* ── Sticky header ── */}
      <header style={S.header}>
        <div>
          <p style={S.greeting}>Good {getGreeting()}</p>
          <h1 style={S.name}>{firstName} 👋</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={S.iconBtn}
            onClick={() => router.push("/v1/tracking")}
            title="Log workout"
          >
            <span style={{ fontSize: 18 }}>➕</span>
          </button>
          <a href="/v1/profile">
            <ProfilePicture size={40} />
          </a>
        </div>
      </header>

      {/* ── Body ── */}
      <main
        style={{
          ...S.main,
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}
      >
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonCard height={116} />
            <SkeletonCard height={130} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <SkeletonCard height={88} />
              <SkeletonCard height={88} />
              <SkeletonCard height={88} />
              <SkeletonCard height={88} />
            </div>
            <SkeletonCard height={100} />
            <SkeletonCard height={72} />
            <SkeletonCard height={72} />
          </div>
        ) : (
          <>
            {/* ── Week activity card (tappable → year chart) ── */}
            <Card
              style={{ marginBottom: 10 }}
              onClick={() => setChartOpen((o) => !o)}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.1rem",
                }}
              >
                <div>
                  <p style={S.eyebrow}>This week</p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 5,
                      marginTop: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: "#1a1a1a",
                        letterSpacing: "-0.05em",
                      }}
                    >
                      {streakCount}
                    </span>
                    <span
                      style={{ fontSize: 13, color: "#bbb", fontWeight: 400 }}
                    >
                      / 7 sessions
                    </span>
                  </div>
                  {weekVolume > 0 && (
                    <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                      {weekVolume.toLocaleString()} lbs lifted
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: streakCount >= 3 ? "#ff6b35" : "#bbb",
                      background:
                        streakCount >= 3 ? "rgba(255,107,53,0.09)" : "#f4f2ed",
                      padding: "0.28rem 0.7rem",
                      borderRadius: 99,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {streakCount >= 5
                      ? "🔥 On fire"
                      : streakCount >= 3
                        ? "⚡ Good week"
                        : "💪 Keep going"}
                  </span>
                  {/* Expand indicator */}
                </div>
              </div>

              {/* 7-day dots */}
              <div style={{ display: "flex", gap: 5 }}>
                {weekDays.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: 9,
                        background: d.active ? "#1a1a1a" : "#f4f2ed",
                        border:
                          d.today && !d.active ? "2px solid #ff6b35" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {d.active && (
                        <span
                          style={{
                            color: d.today ? "#ff6b35" : "#fff",
                            fontWeight: 800,
                            fontSize: 11,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: d.today ? "#ff6b35" : "#ccc",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── Animated year chart panel ── */}
              <div
                ref={chartRef}
                onClick={(e) => e.stopPropagation()} // prevent card toggle when interacting with chart
                style={{
                  maxHeight: 0,
                  opacity: 0,
                  overflow: "hidden",
                  transition:
                    "max-height 0.45s cubic-bezier(.22,1,.36,1), opacity 0.35s ease",
                }}
              >
                <div
                  style={{
                    borderTop: "1px solid #e8e5de",
                    marginTop: "1rem",
                    paddingTop: "1rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#aaa",
                      marginBottom: 2,
                    }}
                  >
                    Past year
                  </p>
                  <YearContributionChart logs={logs} />
                </div>
              </div>
              <span
                className="w-full justify-end   "
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  marginTop: "10px",
                  color: "#ccc",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "color 0.2s",
                }}
              >
                {chartOpen ? "▲ Hide" : "▼ Year view"}
              </span>
            </Card>

            {/* ── Personal bests ── */}
            {topBests.length > 0 && (
              <>
                <SectionLabel>Personal bests</SectionLabel>
                <Card style={{ marginBottom: 10, padding: "1rem 1.25rem" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {topBests.map(([name, weight], i) => (
                      <div
                        key={name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            background: i === 0 ? "#1a1a1a" : "#f4f2ed",
                            border: "1px solid #e8e5de",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {["🥇", "🥈", "🥉"][i]}
                        </div>
                        <p
                          style={{
                            flex: 1,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1a1a1a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {name}
                        </p>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#1a1a1a",
                            letterSpacing: "-0.03em",
                            flexShrink: 0,
                          }}
                        >
                          {weight}{" "}
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 400,
                              color: "#aaa",
                            }}
                          >
                            lbs
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ── Recent workouts ── */}
            <SectionLabel
              action="View all →"
              onAction={() => router.push("/v1/tracking")}
            >
              Recent workouts
            </SectionLabel>

            {logs.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
                <p style={{ fontSize: 28, marginBottom: 10 }}>🏋️</p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: 6,
                  }}
                >
                  No workouts yet
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#aaa",
                    lineHeight: 1.7,
                    marginBottom: "1.25rem",
                  }}
                >
                  Head to the tracking page to log your first session.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/v1/tracking");
                  }}
                  style={S.ctaBtn}
                >
                  Log a workout →
                </button>
              </Card>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {logs.slice(0, 5).map((log, i) => {
                  const vol = totalVol(log);
                  const sets = totalSets(log);
                  const date = new Date(log.date);
                  return (
                    <Card
                      key={log._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "1rem 1.1rem",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          background: i === 0 ? "#1a1a1a" : "#f4f2ed",
                          border: "1px solid #e8e5de",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            color: i === 0 ? "rgba(255,255,255,0.45)" : "#ccc",
                          }}
                        >
                          {date
                            .toLocaleDateString("en-US", { month: "short" })
                            .toUpperCase()}
                        </span>
                        <span
                          style={{
                            fontSize: 17,
                            fontWeight: 800,
                            lineHeight: 1.1,
                            color: i === 0 ? "#fff" : "#1a1a1a",
                          }}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1a1a1a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {log.exercises.map((e) => e.name).join(", ")}
                        </p>
                        <p
                          style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}
                        >
                          {sets} sets · {vol.toLocaleString()} lbs
                        </p>
                      </div>
                      {i === 0 ? (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "#ff6b35",
                            background: "rgba(255,107,53,0.1)",
                            borderRadius: 99,
                            padding: "0.22rem 0.55rem",
                            flexShrink: 0,
                          }}
                        >
                          Latest
                        </span>
                      ) : log.notes ? (
                        <span style={{ fontSize: 15, flexShrink: 0 }}>📝</span>
                      ) : null}
                    </Card>
                  );
                })}
                <button
                  onClick={() => router.push("/v1/tracking")}
                  style={S.ctaBtn}
                >
                  Log today's workout →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#fafaf8",
    minHeight: "100dvh",
    maxWidth: 430,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.2rem 1.25rem 0.8rem",
    position: "sticky",
    top: 0,
    background: "rgba(250,250,248,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(232,229,222,0.5)",
    zIndex: 10,
  },
  greeting: { fontSize: 12, color: "#aaa", fontWeight: 400 },
  name: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.04em",
    lineHeight: 1.1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "#fff",
    border: "1px solid #e8e5de",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  main: {
    padding: "1rem 1.25rem 2rem",
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#aaa",
  },
  ctaBtn: {
    width: "100%",
    padding: "0.9rem",
    background: "#1a1a1a",
    color: "#fafaf8",
    border: "none",
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: "0.01em",
    marginTop: 4,
    cursor: "pointer",
  },
};
