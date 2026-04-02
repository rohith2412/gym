"use client";

import { useSession } from "next-auth/react";
import { useRouter }  from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import ProfilePicture from "@/components/ProfilePicture";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toLocalISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function todayISO() {
  return toLocalISO();
}
function sumMacros(logs) {
  const t = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  logs.forEach((l) => {
    t.calories += l.totals?.calories || 0;
    t.protein  += l.totals?.protein  || 0;
    t.carbs    += l.totals?.carbs    || 0;
    t.fat      += l.totals?.fat      || 0;
    t.fiber    += l.totals?.fiber    || 0;
  });
  return t;
}
function round1(n) { return Math.round(n * 10) / 10; }
function fmt(n) { return Math.round(n); }
function mealEmoji(type) {
  return { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" }[type] ?? "🍽️";
}
function timeStr(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ─── Macro ring (small SVG) ───────────────────────────────────────────────────
function MacroRing({ value, max, color, label, unit = "g", size = 68 }) {
  const r   = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = max > 0 ? Math.min(value / max, 1) : 0;
  const dash = pct * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0ede6" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          fill="#1a1a1a" fontFamily="'Plus Jakarta Sans', sans-serif"
          fontSize={13} fontWeight={800}
          style={{ transform: "rotate(90deg)", transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {fmt(value)}
        </text>
      </svg>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </p>
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}>
        {children}
      </p>
      {action && (
        <button onClick={onAction} style={{ fontSize: 12, color: "#ff6b35", background: "none", border: "none", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          {action}
        </button>
      )}
    </div>
  );
}

function SkeletonCard({ height = 90 }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e5de", borderRadius: 20, height, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(232,229,222,0.5) 50%, transparent 100%)", animation: "shimmer 1.4s infinite" }} />
    </div>
  );
}

// ─── Upload / Camera sheet ────────────────────────────────────────────────────
function LogSheet({ onClose, onSuccess }) {
  const fileRef      = useRef(null);
  const [preview, setPreview]     = useState(null);
  const [base64,  setBase64]      = useState(null);
  const [mealType, setMealType]   = useState("snack");
  const [loading, setLoading]     = useState(false);
  const [error,   setError]       = useState(null);

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!base64) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/meal-log", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ image: base64, mealType }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Unknown error");
      onSuccess(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40, backdropFilter: "blur(3px)" }} />

      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: "#fafaf8",
        borderRadius: "24px 24px 0 0",
        padding: "1.5rem 1.25rem 2.5rem",
        zIndex: 50, boxShadow: "0 -4px 40px rgba(0,0,0,0.12)",
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e0ddd6", margin: "0 auto 1.25rem" }} />

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
          Log a meal
        </h2>

        {/* Photo upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            height: 180, borderRadius: 16,
            border: preview ? "none" : "2px dashed #e0ddd6",
            background: preview ? "transparent" : "#f4f2ed",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", overflow: "hidden", marginBottom: "1rem",
            position: "relative",
          }}
        >
          {preview ? (
            <img src={preview} alt="meal" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} />
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📷</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#bbb" }}>Tap to upload or take a photo</p>
            </div>
          )}
          {preview && (
            <button
              onClick={(e) => { e.stopPropagation(); setPreview(null); setBase64(null); }}
              style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: 99, width: 28, height: 28, fontSize: 14, cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>
        <input
          ref={fileRef} type="file" accept="image/*" capture="environment"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Meal type selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem" }}>
          {MEAL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setMealType(t)}
              style={{
                flex: 1, padding: "0.5rem 0", borderRadius: 10, border: "1px solid",
                borderColor: mealType === t ? "#1a1a1a" : "#e8e5de",
                background: mealType === t ? "#1a1a1a" : "#fff",
                color: mealType === t ? "#fafaf8" : "#aaa",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "capitalize", fontFamily: "inherit", cursor: "pointer",
              }}
            >
              {mealEmoji(t)} {t}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 12, color: "#e53e3e", marginBottom: 10, fontWeight: 600 }}>
            ⚠️ {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={!base64 || loading}
          style={{
            ...S.ctaBtn,
            opacity: (!base64 || loading) ? 0.5 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Analysing with AI…
            </>
          ) : (
            "✨ Analyse & log meal"
          )}
        </button>
      </div>
    </>
  );
}

// ─── Result sheet (shown after AI analysis) ───────────────────────────────────
function ResultSheet({ log, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40, backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: "#fafaf8",
        borderRadius: "24px 24px 0 0",
        padding: "1.5rem 1.25rem 2.5rem",
        zIndex: 50, boxShadow: "0 -4px 40px rgba(0,0,0,0.12)",
        maxHeight: "80dvh", overflowY: "auto",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e0ddd6", margin: "0 auto 1.25rem" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
          <span style={{ fontSize: 24 }}>{mealEmoji(log.mealType)}</span>
          <div>
            <p style={{ fontSize: 12, color: "#aaa", fontWeight: 500, textTransform: "capitalize" }}>{log.mealType}</p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" }}>
              {fmt(log.totals?.calories ?? 0)} kcal
            </h2>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 22, background: "#f0ede6", padding: "0.4rem", borderRadius: 10 }}>✅</span>
        </div>

        {/* Macro row */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1.25rem", padding: "1rem", background: "#f4f2ed", borderRadius: 16 }}>
          {[
            { label: "Protein", value: log.totals?.protein, color: "#ff6b35" },
            { label: "Carbs",   value: log.totals?.carbs,   color: "#1a1a1a" },
            { label: "Fat",     value: log.totals?.fat,     color: "#bbb" },
          ].map((m) => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: m.color, letterSpacing: "-0.04em" }}>{fmt(m.value ?? 0)}<span style={{ fontSize: 10, fontWeight: 400, color: "#aaa" }}>g</span></p>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.08em", textTransform: "uppercase" }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Food items */}
        <SectionLabel>Detected foods</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.25rem" }}>
          {log.foods.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#fff", border: "1px solid #e8e5de", borderRadius: 14 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{f.name}</p>
                <p style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{f.portion}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>{fmt(f.macros?.calories ?? 0)}</p>
                <p style={{ fontSize: 10, color: "#bbb" }}>kcal</p>
              </div>
              {f.confidence < 0.7 && (
                <span style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", borderRadius: 99, padding: "0.2rem 0.5rem" }}>~est</span>
              )}
            </div>
          ))}
        </div>

        {log.aiNotes && (
          <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6, marginBottom: "1.25rem", fontStyle: "italic" }}>
            💡 {log.aiNotes}
          </p>
        )}

        <button onClick={onClose} style={S.ctaBtn}>Done</button>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NutritionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [vis,       setVis]       = useState(false);
  const [showLog,   setShowLog]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [selDate,   setSelDate]   = useState(todayISO());

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.replace("/"); return; }
    if (session && !session.user?.hasIntro) { router.replace("/v1/StartersIntro"); return; }
  }, [status, session, router]);

  // Fetch logs for selected date
  const fetchLogs = useCallback(async (date) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/meal-log?date=${date}`);
      const json = await res.json();
      if (json.success) setLogs(json.data ?? []);
    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
      setTimeout(() => setVis(true), 40);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchLogs(selDate);
  }, [status, selDate, fetchLogs]);

  if (status === "loading" || (session && !session.user?.hasIntro)) return null;

  const firstName  = session?.user?.name?.split(" ")[0] ?? "Athlete";
  const todayTotals = sumMacros(logs);
  const isToday    = selDate === todayISO();

  // Goals (you can make these dynamic / from user intro later)
  const GOALS = { calories: 2200, protein: 160, carbs: 250, fat: 70 };

  function handleSuccess(newLog) {
    setShowLog(false);
    setResult(newLog);
    // Optimistic prepend
    if (toLocalISO(new Date(newLog.date)) === selDate) {
      setLogs((prev) => [newLog, ...prev]);
    }
  }

  async function handleDelete(id) {
    await fetch(`/api/meal-log?id=${id}`, { method: "DELETE" });
    setLogs((prev) => prev.filter((l) => l._id !== id));
  }

  // ── Date nav helpers ──
  function shiftDate(days) {
    const d = new Date(selDate);
    d.setDate(d.getDate() + days);
    const iso = toLocalISO(d);
    if (iso <= todayISO()) {
      setSelDate(iso);
      setVis(false);
    }
  }
  function dateLabel() {
    if (selDate === todayISO()) return "Today";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (selDate === toLocalISO(yesterday)) return "Yesterday";
    return new Date(selDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const calPct = Math.min((todayTotals.calories / GOALS.calories) * 100, 100);

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
        button { cursor: pointer; }
      `}</style>

      {/* ── Sticky header ── */}
      <header style={S.header}>
        <div>
          <p style={S.greeting}>Good {getGreeting()}</p>
          <h1 style={S.name}>{firstName} 🥗</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={S.iconBtn}
            onClick={() => setShowLog(true)}
            title="Log meal"
          >
            <span style={{ fontSize: 18 }}>➕</span>
          </button>
          <a href="/v1/profile">
            <ProfilePicture size={40} />
          </a>
        </div>
      </header>

      {/* ── Body ── */}
      <main style={{ ...S.main, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.45s ease, transform 0.45s ease" }}>

        {/* ── Date navigator ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={() => shiftDate(-1)} style={S.navBtn}>‹</button>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>{dateLabel()}</p>
          <button onClick={() => shiftDate(1)} style={{ ...S.navBtn, opacity: selDate === todayISO() ? 0.25 : 1 }} disabled={selDate === todayISO()}>›</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonCard height={160} />
            <SkeletonCard height={100} />
            <SkeletonCard height={80} />
            <SkeletonCard height={80} />
          </div>
        ) : (
          <>
            {/* ── Calorie summary card ── */}
            <Card style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <p style={S.eyebrow}>Calories {isToday ? "today" : dateLabel().toLowerCase()}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 3 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.05em" }}>
                      {fmt(todayTotals.calories)}
                    </span>
                    <span style={{ fontSize: 13, color: "#bbb" }}>/ {GOALS.calories} kcal</span>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: calPct >= 90 ? "#e53e3e" : calPct >= 60 ? "#ff6b35" : "#bbb",
                  background: calPct >= 90 ? "rgba(229,62,62,0.08)" : calPct >= 60 ? "rgba(255,107,53,0.09)" : "#f4f2ed",
                  padding: "0.28rem 0.7rem", borderRadius: 99, letterSpacing: "0.04em",
                }}>
                  {calPct >= 90 ? "🔥 Near limit" : calPct >= 60 ? "⚡ On track" : "💪 Keep eating"}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, background: "#f0ede6", borderRadius: 99, overflow: "hidden", marginBottom: "1.25rem" }}>
                <div style={{ height: "100%", width: `${calPct}%`, background: calPct >= 90 ? "#e53e3e" : "#ff6b35", borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>

              {/* Macro rings */}
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <MacroRing value={round1(todayTotals.protein)} max={GOALS.protein} color="#ff6b35" label="Protein" />
                <MacroRing value={round1(todayTotals.carbs)}   max={GOALS.carbs}   color="#1a1a1a" label="Carbs"   />
                <MacroRing value={round1(todayTotals.fat)}     max={GOALS.fat}     color="#aaa"    label="Fat"     />
                <MacroRing value={round1(todayTotals.fiber)}   max={30}            color="#4ade80" label="Fiber"   />
              </div>
            </Card>

            {/* ── Meal log ── */}
            <SectionLabel>Meals logged</SectionLabel>

            {logs.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "2.5rem 1.5rem", marginBottom: 10 }}>
                <p style={{ fontSize: 28, marginBottom: 10 }}>🍽️</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>
                  {isToday ? "No meals logged yet" : "No meals on this day"}
                </p>
                <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                  {isToday ? "Take a photo of your next meal to track calories and macros automatically." : "Nothing was logged here."}
                </p>
                {isToday && (
                  <button onClick={() => setShowLog(true)} style={S.ctaBtn}>
                    📷 Log a meal →
                  </button>
                )}
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                {logs.map((log, i) => {
                  const cals = fmt(log.totals?.calories ?? 0);
                  const prot = fmt(log.totals?.protein  ?? 0);
                  return (
                    <Card
                      key={log._id}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.9rem 1rem" }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 13,
                        background: i === 0 ? "#1a1a1a" : "#f4f2ed",
                        border: "1px solid #e8e5de",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, flexShrink: 0,
                      }}>
                        {mealEmoji(log.mealType)}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", textTransform: "capitalize" }}>
                          {log.mealType}
                        </p>
                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {log.foods.map((f) => f.name).join(", ")}
                        </p>
                        <p style={{ fontSize: 10, color: "#ccc", marginTop: 2 }}>
                          {timeStr(log.date)}
                        </p>
                      </div>

                      {/* Calories */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" }}>{cals}</p>
                        <p style={{ fontSize: 10, color: "#bbb" }}>kcal</p>
                        <p style={{ fontSize: 10, color: "#ff6b35", marginTop: 2 }}>{prot}g protein</p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(log._id); }}
                        style={{ background: "none", border: "none", color: "#ddd", fontSize: 16, padding: "0.2rem", flexShrink: 0 }}
                      >
                        ✕
                      </button>
                    </Card>
                  );
                })}

                {isToday && (
                  <button onClick={() => setShowLog(true)} style={{ ...S.ctaBtn, marginTop: 4 }}>
                    📷 Log another meal →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Sheets ── */}
      {showLog && <LogSheet onClose={() => setShowLog(false)} onSuccess={handleSuccess} />}
      {result   && <ResultSheet log={result} onClose={() => setResult(null)} />}
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
  name: { fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em", lineHeight: 1.1 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    background: "#fff", border: "1px solid #e8e5de",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  main: { padding: "1rem 1.25rem 2rem", flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" },
  ctaBtn: {
    width: "100%", padding: "0.9rem",
    background: "#1a1a1a", color: "#fafaf8",
    border: "none", borderRadius: 14,
    fontSize: 14, fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: "0.01em", cursor: "pointer",
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 10,
    background: "#fff", border: "1px solid #e8e5de",
    fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
    color: "#1a1a1a", cursor: "pointer",
  },
};