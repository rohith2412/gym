"use client";

import ProfilePicture from "@/components/ProfilePicture";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const totalVol = (sets) => sets.reduce((s, x) => s + x.reps * x.weight, 0);
const maxW = (sets) =>
  sets.length ? Math.max(...sets.map((s) => s.weight)) : 0;

const EXERCISE_LIBRARY = {
  Chest: [
    "Bench Press", "Incline Bench Press", "Decline Bench Press",
    "Dumbbell Fly", "Cable Fly", "Push-Up", "Chest Dip",
    "Incline Dumbbell Press", "Pec Deck Machine", "Landmine Press",
  ],
  Back: [
    "Pull-Up", "Chin-Up", "Lat Pulldown", "Seated Cable Row",
    "Barbell Row", "Dumbbell Row", "T-Bar Row", "Face Pull",
    "Deadlift", "Romanian Deadlift", "Good Morning", "Back Extension",
  ],
  Shoulders: [
    "Overhead Press", "Dumbbell Shoulder Press", "Arnold Press",
    "Lateral Raise", "Front Raise", "Rear Delt Fly", "Upright Row",
    "Cable Lateral Raise", "Machine Shoulder Press", "Shrug",
  ],
  Arms: [
    "Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Preacher Curl",
    "Cable Curl", "Incline Dumbbell Curl", "Concentration Curl",
    "Tricep Pushdown", "Skull Crusher", "Close-Grip Bench",
    "Overhead Tricep Extension", "Dips", "Diamond Push-Up",
  ],
  Legs: [
    "Squat", "Front Squat", "Leg Press", "Hack Squat",
    "Bulgarian Split Squat", "Lunge", "Romanian Deadlift",
    "Leg Curl", "Leg Extension", "Calf Raise", "Glute Bridge",
    "Hip Thrust", "Step-Up", "Sumo Deadlift",
  ],
  Core: [
    "Plank", "Crunch", "Sit-Up", "Leg Raise", "Hanging Leg Raise",
    "Ab Wheel Rollout", "Cable Crunch", "Russian Twist",
    "Bicycle Crunch", "Dead Bug", "Pallof Press", "Dragon Flag",
  ],
};

const MUSCLE_GROUPS = Object.keys(EXERCISE_LIBRARY);

// ─── Body scroll lock ─────────────────────────────────────────────────────────
// Ref-counted so nested sheets don't fight each other.
const scrollLockCount = { n: 0 };
const scrollLockSavedY = { y: 0 };

function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    if (scrollLockCount.n === 0) {
      scrollLockSavedY.y = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollLockSavedY.y}px`;
      document.body.style.width = "100%";
    }
    scrollLockCount.n++;
    return () => {
      scrollLockCount.n--;
      if (scrollLockCount.n === 0) {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollLockSavedY.y);
      }
    };
  }, [active]);
}

// ─── derive per-muscle-group stats ───────────────────────────────────────────
function buildMuscleStats(logs) {
  const grouped = {};
  logs.forEach((log) => {
    const mgSeen = new Set();
    log.exercises.forEach((ex) => {
      const mg = (ex.muscleGroup || "").trim() || null;
      if (!mg || mgSeen.has(mg)) return;
      mgSeen.add(mg);
      const mgExercises = log.exercises.filter(
        (e) => (e.muscleGroup || "").trim() === mg
      );
      const weights = mgExercises.flatMap((e) => e.sets.map((s) => s.weight));
      const vols = mgExercises.flatMap((e) =>
        e.sets.map((s) => s.reps * s.weight)
      );
      const best = weights.length ? Math.max(...weights) : 0;
      const vol = vols.reduce((a, b) => a + b, 0);
      const names = [...new Set(mgExercises.map((e) => e.name))];
      if (!grouped[mg]) grouped[mg] = [];
      grouped[mg].push({
        logId: log._id, date: log.date,
        bestWeight: best, totalVol: vol, exNames: names,
      });
    });
  });

  return Object.entries(grouped)
    .map(([mg, sessions]) => {
      const last = sessions[0];
      const prev = sessions[1] || null;
      const delta = prev !== null ? last.bestWeight - prev.bestWeight : null;
      const volDelta = prev !== null ? last.totalVol - prev.totalVol : null;
      const improved =
        delta === null ? null
        : delta !== 0 ? delta > 0
        : volDelta !== null ? volDelta >= 0
        : null;
      const allNames = [...new Set(sessions.flatMap((s) => s.exNames))];
      return { mg, lastBest: last.bestWeight, delta, improved, exNames: allNames, sessionCount: sessions.length };
    })
    .sort((a, b) => a.mg.localeCompare(b.mg));
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #e8e5de",
        borderRadius: 20,
        padding: "1.1rem 1.25rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, style = {} }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: "#aaa", margin: "0 0 0.5rem",
      ...style,
    }}>
      {children}
    </p>
  );
}

function DeltaBadge({ delta, neutral }) {
  if (delta === null || delta === undefined)
    return <span style={{ ...B.base, ...B.neutral }}>1st</span>;
  if (neutral || delta === 0)
    return <span style={{ ...B.base, ...B.neutral }}>— 0</span>;
  const up = delta > 0;
  return (
    <span style={{ ...B.base, ...(up ? B.up : B.down) }}>
      {up ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}
const B = {
  base: { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 },
  up:   { background: "rgba(34,197,94,0.1)", color: "#16a34a" },
  down: { background: "rgba(244,63,94,0.09)", color: "#f43f5e" },
  neutral: { background: "#f4f2ed", color: "#aaa" },
};

// ─── Shared overlay / sheet styles ───────────────────────────────────────────
const OVERLAY = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 9999,
  display: "flex", alignItems: "flex-end",
};

const PANEL = {
  width: "100%", maxWidth: 430, margin: "0 auto",
  background: "#fafaf8",
  borderRadius: "20px 20px 0 0",
  maxHeight: "92dvh",
  display: "flex", flexDirection: "column",
  animation: "slideUp 0.28s cubic-bezier(.32,1.2,.64,1)",
};

const HANDLE = {
  width: 36, height: 4, background: "#e8e5de",
  borderRadius: 99, margin: "12px auto 0",
  flexShrink: 0,
};

const NUM_INPUT = {
  flex: 1,
  border: "1px solid #e8e5de",
  borderRadius: 10,
  padding: "8px 4px",
  fontSize: 16,
  fontWeight: 800,
  textAlign: "center",
  color: "#1a1a1a",
  fontFamily: "inherit",
  outline: "none",
  background: "#fafaf8",
  width: 0,
  minWidth: 0,
  WebkitAppearance: "none",
  MozAppearance: "textfield",
  touchAction: "manipulation",
};

// ─── MUSCLE DETAIL SHEET ──────────────────────────────────────────────────────
function MuscleDetailSheet({ mg, delta, logs, onClose }) {
  useScrollLock(true);
  const allExercises = [];
  const seen = new Set();
  logs.forEach((log) => {
    log.exercises.forEach((ex) => {
      if ((ex.muscleGroup || "").trim() === mg && !seen.has(ex.name)) {
        seen.add(ex.name);
        allExercises.push(ex);
      }
    });
  });

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={PANEL} onClick={(e) => e.stopPropagation()}>
        <div style={HANDLE} />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px 12px", borderBottom: "1px solid #e8e5de", flexShrink: 0,
        }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" }}>{mg}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <DeltaBadge delta={delta} />
            <button
              onClick={onClose}
              style={{ border: "none", background: "none", fontSize: 15, color: "#bbb", cursor: "pointer", padding: "4px 8px" }}
            >✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "12px 16px 48px", display: "flex", flexDirection: "column", gap: 8 }}>
          {allExercises.length === 0 && (
            <p style={{ textAlign: "center", color: "#ccc", fontSize: 14, padding: "32px 0" }}>
              No exercises logged yet for {mg}.
            </p>
          )}
          {allExercises.map((ex, i) => (
            <Card key={i} style={{ padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{ex.name}</span>
                <span style={{ fontSize: 12, color: "#aaa" }}>{maxW(ex.sets)} lbs max</span>
              </div>
              <div style={{ borderTop: "1px solid #e8e5de", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {ex.sets.map((s, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
                    <span style={{ width: 20, color: "#ccc", fontWeight: 700, textAlign: "center" }}>{s.setNumber}</span>
                    <span style={{ color: "#777" }}>{s.reps} reps</span>
                    <span style={{ color: "#777" }}>× {s.weight} lbs</span>
                    <span style={{ marginLeft: "auto", color: "#bbb" }}>{(s.reps * s.weight).toLocaleString()} vol</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PROGRESS SCREEN ──────────────────────────────────────────────────────────
function ProgressScreen({ logs, onDetailSheetChange }) {
  const allExercises = [...new Set(logs.flatMap((l) => l.exercises.map((e) => e.name)))];
  const [selected, setSelected] = useState("");
  const [data, setData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [detailMg, setDetailMg] = useState(null);
  const [detailDelta, setDetailDelta] = useState(null);

  const openDetail = (mg, delta) => {
    setDetailMg(mg);
    setDetailDelta(delta);
    onDetailSheetChange?.(true);
  };

  const closeDetail = () => {
    setDetailMg(null);
    onDetailSheetChange?.(false);
  };

  useEffect(() => {
    if (!selected && allExercises.length) setSelected(allExercises[0]);
  }, [allExercises.length]);

  const load = useCallback(async (name) => {
    if (!name) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/tracking/progress?exercise=${encodeURIComponent(name)}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally { setFetching(false); }
  }, []);

  useEffect(() => { if (selected) load(selected); }, [selected, load]);

  const last = data.length ? data[data.length - 1] : null;
  const prev = data.length > 1 ? data[data.length - 2] : null;
  const maxVol = data.length ? Math.max(...data.map((d) => d.totalVolume)) : 1;
  const muscleStats = buildMuscleStats(logs);

  if (logs.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px 140px", gap: 12, textAlign: "center" }}>
        <span style={{ fontSize: 36 }}>🏋️</span>
        <p style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em", margin: 0 }}>No workouts yet</p>
        <p style={{ fontSize: 13, color: "#aaa", margin: 0, lineHeight: 1.7 }}>Log your first session to start tracking progress</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "1rem 1.25rem 140px", display: "flex", flexDirection: "column", gap: 14 }}>

        <SectionLabel>Body parts</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {muscleStats.map(({ mg, lastBest, delta, exNames, sessionCount }) => (
            <Card
              key={mg}
              onClick={() => openDetail(mg, delta)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 1.1rem" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{mg}</span>
                <span style={{ fontSize: 11, color: "#aaa" }}>
                  {sessionCount} session{sessionCount !== 1 ? "s" : ""} · {exNames.length} exercise{exNames.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em" }}>
                  {lastBest}<span style={{ fontSize: 11, fontWeight: 400, color: "#aaa", marginLeft: 2 }}>lbs</span>
                </span>
                <DeltaBadge delta={delta} />
                <span style={{ fontSize: 14, color: "#ccc" }}>›</span>
              </div>
            </Card>
          ))}
        </div>

        <SectionLabel style={{ marginTop: 6 }}>Drill down</SectionLabel>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
          {allExercises.map((ex) => (
            <button
              key={ex}
              onClick={() => setSelected(ex)}
              style={{
                flexShrink: 0, borderRadius: 99, padding: "7px 14px",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", whiteSpace: "nowrap",
                border: selected === ex ? "none" : "1px solid #e8e5de",
                background: selected === ex ? "#1a1a1a" : "#fff",
                color: selected === ex ? "#fff" : "#aaa",
                letterSpacing: "0.02em",
                touchAction: "manipulation",
              }}
            >
              {ex}
            </button>
          ))}
        </div>

        {fetching && (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: 13, padding: "20px 0" }}>Loading…</p>
        )}

        {!fetching && last && (
          <>
            <Card style={{ display: "flex", alignItems: "stretch", padding: "1.25rem" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", margin: 0 }}>Best weight</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.05em", lineHeight: 1, margin: 0 }}>
                  {last.bestWeight}<span style={{ fontSize: 13, fontWeight: 400, color: "#aaa", marginLeft: 4 }}>lbs</span>
                </p>
                {prev && <DeltaBadge delta={last.bestWeight - prev.bestWeight} />}
              </div>
              <div style={{ width: 1, background: "#e8e5de", margin: "0 1.1rem" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", margin: 0 }}>Last volume</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.05em", lineHeight: 1, margin: 0 }}>
                  {last.totalVolume.toLocaleString()}
                </p>
                <DeltaBadge delta={last.volumeDelta} neutral={last.improved === null} />
              </div>
            </Card>

            <SectionLabel>Volume trend</SectionLabel>
            <Card style={{ padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 80 }}>
                {data.map((d, i) => {
                  const isLast = i === data.length - 1;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                      <div style={{
                        width: "100%", borderRadius: 5,
                        background: isLast ? "#ff6b35"
                          : d.improved ? "rgba(34,197,94,0.5)"
                          : d.improved === false ? "rgba(244,63,94,0.4)"
                          : "#e8e5de",
                        height: `${Math.max((d.totalVolume / maxVol) * 100, 8)}%`,
                        transition: "height 0.4s ease",
                      }} />
                      <span style={{ fontSize: 9, color: isLast ? "#ff6b35" : "#ccc", fontWeight: 700 }}>
                        {fmtDate(d.date).slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <SectionLabel>Sessions</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...data].reverse().map((d, i) => (
                <Card key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.9rem 1.1rem" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13,
                    background: i === data.length - 1 ? "#1a1a1a" : "#f4f2ed",
                    border: "1px solid #e8e5de",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.06em", color: i === data.length - 1 ? "rgba(255,255,255,0.45)" : "#ccc" }}>
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                    </span>
                    <span style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.1, color: i === data.length - 1 ? "#fff" : "#1a1a1a" }}>
                      {new Date(d.date).getDate()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                      {d.sets} sets · {d.totalReps} reps · {d.bestWeight} lbs max
                    </p>
                    <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>
                      {d.totalVolume.toLocaleString()} lbs total
                    </p>
                  </div>
                  <DeltaBadge delta={d.volumeDelta} neutral={d.improved === null} />
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {detailMg && (
        <MuscleDetailSheet mg={detailMg} delta={detailDelta} logs={logs} onClose={closeDetail} />
      )}
    </>
  );
}

// ─── EXERCISE PICKER SHEET ────────────────────────────────────────────────────
// NOTE: No useScrollLock here — LogSheet already holds the lock.
// Adding a second lock caused the body position to reset on picker close.
function ExercisePicker({ muscleGroup, alreadyAdded, onConfirm, onClose }) {
  const list = EXERCISE_LIBRARY[muscleGroup] || [];
  const [picked, setPicked] = useState([]);
  const toggle = (name) =>
    setPicked((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  return (
    // zIndex 10000 — one layer above LogSheet (9999)
    <div style={{ ...OVERLAY, zIndex: 10000 }} onClick={onClose}>
      <div style={PANEL} onClick={(e) => e.stopPropagation()}>
        <div style={HANDLE} />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px 12px", borderBottom: "1px solid #e8e5de", flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", fontSize: 13, fontWeight: 700, color: "#aaa", cursor: "pointer", fontFamily: "inherit", padding: 0, touchAction: "manipulation" }}
          >← Back</button>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" }}>{muscleGroup}</span>
          <span style={{ fontSize: 12, color: "#aaa", minWidth: 70, textAlign: "right" }}>{picked.length} selected</span>
        </div>
        <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "8px 12px", flex: 1 }}>
          {list.map((name) => {
            const isAdded = alreadyAdded.includes(name);
            const isSel = picked.includes(name);
            return (
              <button
                key={name}
                disabled={isAdded}
                onClick={() => !isAdded && toggle(name)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 14px", borderRadius: 14, marginBottom: 6,
                  cursor: isAdded ? "default" : "pointer",
                  fontFamily: "inherit",
                  background: isSel ? "#1a1a1a" : "#fff",
                  border: `1px solid ${isSel ? "#1a1a1a" : "#e8e5de"}`,
                  opacity: isAdded ? 0.4 : 1,
                  touchAction: "manipulation",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: isSel ? "#fff" : "#1a1a1a" }}>{name}</span>
                {isAdded
                  ? <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em" }}>Added</span>
                  : isSel
                  ? <span style={{ fontSize: 16, color: "#ff6b35", fontWeight: 800 }}>✓</span>
                  : <span style={{ fontSize: 20, color: "#ccc", lineHeight: 1 }}>+</span>
                }
              </button>
            );
          })}
        </div>
        <div style={{ padding: "12px 16px 36px", borderTop: "1px solid #e8e5de", flexShrink: 0 }}>
          <button
            disabled={picked.length === 0}
            onClick={() => onConfirm(picked, muscleGroup)}
            style={{
              width: "100%", background: "#1a1a1a", color: "#fafaf8",
              border: "none", borderRadius: 14, padding: "15px",
              fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              opacity: picked.length === 0 ? 0.3 : 1,
              letterSpacing: "0.01em",
              touchAction: "manipulation",
            }}
          >
            Add {picked.length > 0 ? `${picked.length} exercise${picked.length > 1 ? "s" : ""}` : "exercises"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOG SHEET ────────────────────────────────────────────────────────────────
function LogSheet({ onClose, onSaved }) {
  useScrollLock(true);
  const [exercises, setExercises] = useState([]);
  const [notes, setNotes] = useState("");
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [date, setDate] = useState(localDate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pickerMg, setPickerMg] = useState(null);

  const addSet = (ei) =>
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== ei) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { setNumber: ex.sets.length + 1, reps: last ? last.reps : 0, weight: last ? last.weight : 0 }],
        };
      })
    );

  const removeSet = (ei, si) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== ei ? ex : {
          ...ex,
          sets: ex.sets.filter((_, j) => j !== si).map((s, j) => ({ ...s, setNumber: j + 1 })),
        }
      )
    );

  const updateSet = (ei, si, field, val) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== ei ? ex : {
          ...ex,
          sets: ex.sets.map((s, j) => j === si ? { ...s, [field]: Number(val) } : s),
        }
      )
    );

  const onPickerConfirm = (names, mg) => {
    setExercises((prev) => [
      ...prev,
      ...names.map((name) => ({ name, muscleGroup: mg, sets: [{ setNumber: 1, reps: 0, weight: 0 }] })),
    ]);
    setPickerMg(null);
  };

  const submit = async () => {
    if (!exercises.length) return alert("Add at least one exercise.");
    setSaving(true);
    try {
      const offset = new Date().getTimezoneOffset();
      const sign = offset <= 0 ? "+" : "-";
      const abs = Math.abs(offset);
      const hh = String(Math.floor(abs / 60)).padStart(2, "0");
      const mm = String(abs % 60).padStart(2, "0");
      const dateWithTz = `${date}T12:00:00${sign}${hh}:${mm}`;
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateWithTz, exercises, notes }),
      });
      const json = await res.json();
      if (json.success) { setSaved(true); onSaved(); setTimeout(() => onClose(), 1600); }
      else alert(json.error);
    } finally { setSaving(false); }
  };

  const alreadyAdded = exercises.map((e) => e.name);

  return (
    <>
      <div style={OVERLAY} onClick={onClose}>
        <div style={PANEL} onClick={(e) => e.stopPropagation()}>
          <div style={HANDLE} />

          {saved ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#22c55e" }}>✓</div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", margin: 0, letterSpacing: "-0.03em" }}>Workout saved!</p>
            </div>
          ) : (
            <>
              {/* ── Sheet header ── */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 18px 12px", borderBottom: "1px solid #e8e5de", flexShrink: 0,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", margin: 0, letterSpacing: "-0.04em" }}>
                  Log workout
                </h2>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    border: "1px solid #e8e5de", borderRadius: 10,
                    padding: "6px 10px",
                    fontSize: 16,
                    transform: "scale(0.82)",
                    transformOrigin: "right center",
                    color: "#1a1a1a", fontFamily: "inherit",
                    outline: "none", background: "#f4f2ed", fontWeight: 700,
                    touchAction: "manipulation",
                  }}
                />
              </div>

              {/* ── Scrollable body ── */}
              <div style={{
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                padding: "1rem 1.25rem 48px",
                display: "flex", flexDirection: "column", gap: 12,
                flex: 1,
              }}>
                {/* Muscle group grid */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", margin: "0 0 0.6rem" }}>
                    Select muscle group
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {MUSCLE_GROUPS.map((mg) => {
                      const count = exercises.filter((e) => e.muscleGroup === mg).length;
                      return (
                        <button
                          key={mg}
                          onClick={() => setPickerMg(mg)}
                          style={{
                            border: `1px solid ${count > 0 ? "#1a1a1a" : "#e8e5de"}`,
                            borderRadius: 14, padding: "10px 8px",
                            background: count > 0 ? "#1a1a1a" : "#fff",
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                            touchAction: "manipulation",
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700, color: count > 0 ? "#fff" : "#1a1a1a" }}>{mg}</span>
                          {count > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: "#ff6b35", color: "#fff", borderRadius: 99, padding: "1px 7px" }}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {exercises.length === 0 && (
                  <Card style={{ textAlign: "center", padding: "1.4rem" }}>
                    <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
                      No exercises yet — tap a muscle group above
                    </p>
                  </Card>
                )}

                {/* Exercise cards */}
                {exercises.map((ex, ei) => (
                  <Card key={ei} style={{ padding: "1rem 1.1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ff6b35", margin: "0 0 2px" }}>
                          {ex.muscleGroup}
                        </p>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", margin: 0, letterSpacing: "-0.03em" }}>
                          {ex.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setExercises((prev) => prev.filter((_, i) => i !== ei))}
                        style={{ border: "none", background: "none", color: "#ccc", fontSize: 16, cursor: "pointer", padding: "4px 8px", touchAction: "manipulation" }}
                      >✕</button>
                    </div>

                    {/* Col headers */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 6, borderBottom: "1px solid #e8e5de", marginBottom: 6 }}>
                      {["SET", "REPS", "LBS"].map((lbl) => (
                        <span key={lbl} style={{ flex: 1, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#ccc", textAlign: "center" }}>{lbl}</span>
                      ))}
                      <span style={{ width: 32 }} />
                    </div>

                    {ex.sets.map((set, si) => (
                      <div key={si} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ flex: 1, fontSize: 13, color: "#bbb", textAlign: "center", fontWeight: 700 }}>{set.setNumber}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min={0}
                          value={set.reps || ""}
                          placeholder="0"
                          onChange={(e) => updateSet(ei, si, "reps", e.target.value)}
                          style={NUM_INPUT}
                        />
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          min={0}
                          value={set.weight || ""}
                          placeholder="0"
                          onChange={(e) => updateSet(ei, si, "weight", e.target.value)}
                          style={NUM_INPUT}
                        />
                        <button
                          onClick={() => removeSet(ei, si)}
                          style={{
                            width: 32, height: 32, border: "1px solid #e8e5de",
                            borderRadius: "50%", background: "#fff", color: "#bbb",
                            fontSize: 18, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, touchAction: "manipulation",
                          }}
                        >−</button>
                      </div>
                    ))}

                    <button
                      onClick={() => addSet(ei)}
                      style={{ border: "none", background: "none", color: "#ff6b35", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "6px 0", fontFamily: "inherit", touchAction: "manipulation" }}
                    >+ Add set</button>
                  </Card>
                ))}

                <textarea
                  placeholder="Notes (optional)…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  style={{
                    border: "1px solid #e8e5de", borderRadius: 14,
                    padding: "12px 14px",
                    fontSize: 16,
                    color: "#1a1a1a", fontFamily: "inherit",
                    outline: "none", resize: "none",
                    background: "#fff", width: "100%", boxSizing: "border-box",
                  }}
                />

                <button
                  disabled={saving}
                  onClick={submit}
                  style={{
                    width: "100%", padding: "0.95rem",
                    background: "#1a1a1a", color: "#fafaf8",
                    border: "none", borderRadius: 14,
                    fontSize: 15, fontWeight: 700, fontFamily: "inherit",
                    letterSpacing: "0.01em",
                    opacity: saving ? 0.4 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                    touchAction: "manipulation",
                  }}
                >
                  {saving
                    ? "Saving…"
                    : `Save workout${exercises.length > 0 ? ` · ${exercises.length} exercise${exercises.length > 1 ? "s" : ""}` : ""}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {pickerMg && (
        <ExercisePicker
          muscleGroup={pickerMg}
          alreadyAdded={alreadyAdded}
          onConfirm={onPickerConfirm}
          onClose={() => setPickerMg(null)}
        />
      )}
    </>
  );
}

// ─── HISTORY SCREEN ───────────────────────────────────────────────────────────
function HistoryScreen({ logs, loading, onDelete, confirmDeleteId }) {
  if (loading)
    return <p style={{ textAlign: "center", color: "#aaa", padding: "60px 20px", fontSize: 13 }}>Loading…</p>;

  if (!logs.length)
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 32px", gap: 12, textAlign: "center" }}>
        <span style={{ fontSize: 36 }}>📋</span>
        <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", margin: 0 }}>No workouts logged yet</p>
        <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>Your history will appear here</p>
      </div>
    );

  return (
    <div style={{ padding: "1rem 1.25rem 140px", display: "flex", flexDirection: "column", gap: 8 }}>
      {logs.map((log) => {
        const isPending = confirmDeleteId === log._id;
        const date = new Date(log.date);
        return (
          <Card key={log._id} style={{ padding: "1rem 1.1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: "#1a1a1a",
                  border: "1px solid #e8e5de",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.06em", color: "rgba(255,255,255,0.45)" }}>
                    {date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1, color: "#fff" }}>{date.getDate()}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a", margin: 0, letterSpacing: "-0.03em" }}>
                  {date.toLocaleDateString("en-US", { weekday: "long" })}
                </p>
              </div>
              <button
                onClick={() => onDelete(log._id)}
                style={{
                  border: "none", fontSize: 11, fontWeight: 700,
                  color: isPending ? "#f43f5e" : "#ccc",
                  cursor: "pointer", fontFamily: "inherit",
                  padding: "4px 10px", borderRadius: 8,
                  background: isPending ? "rgba(244,63,94,0.08)" : "transparent",
                  transition: "all 0.15s",
                  touchAction: "manipulation",
                }}
              >
                {isPending ? "Confirm?" : "Delete"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {log.exercises.map((ex, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ex.name}
                  </span>
                  <span style={{ fontSize: 11, color: "#aaa", flexShrink: 0 }}>
                    {ex.sets.length} sets · {maxW(ex.sets)} lbs · {totalVol(ex.sets).toLocaleString()} vol
                  </span>
                </div>
              ))}
            </div>

            {log.notes && (
              <p style={{ fontSize: 12, color: "#aaa", fontStyle: "italic", margin: "8px 0 0", paddingTop: 8, borderTop: "1px solid #e8e5de" }}>
                "{log.notes}"
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function TrackingPage() {
  const [tab, setTab] = useState("progress");
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const deleteLog = async (id) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    await fetch(`/api/tracking?id=${id}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    fetchLogs();
  };

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/tracking");
      const json = await res.json();
      if (json.success) setLogs(json.data);
    } finally { setLoadingLogs(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { -webkit-tap-highlight-color: transparent; box-sizing: border-box; margin: 0; padding: 0; }
        html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        ::-webkit-scrollbar { display: none; }
        input, select, textarea { font-size: 16px !important; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        button { font-family: inherit; }
      `}</style>

      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#fafaf8",
        minHeight: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* ── Sticky header ── */}
        <header style={{
          padding: "1.2rem 1.25rem 0",
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(250,250,248,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(232,229,222,0.5)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
            <div>
              <p style={{ fontSize: 12, color: "#aaa", fontWeight: 400, marginBottom: 2 }}>Your workouts</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em", lineHeight: 1.1 }}>Tracker</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setShowLog(true)}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "#fff", border: "1px solid #e8e5de",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", fontSize: 18,
                  touchAction: "manipulation",
                }}
                title="Log workout"
              >
                ➕
              </button>
              <a href="/v1/profile">
                <ProfilePicture size={40} />
              </a>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {[["progress", "Progress"], ["history", "History"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: "0.6rem 0", border: "none", background: "none",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  letterSpacing: "0.01em", transition: "color 0.15s",
                  color: tab === key ? "#1a1a1a" : "#aaa",
                  borderBottom: `2px solid ${tab === key ? "#ff6b35" : "transparent"}`,
                  touchAction: "manipulation",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* ── Content ── */}
        <main style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {tab === "progress" && <ProgressScreen logs={logs} onDetailSheetChange={setDetailSheetOpen} />}
          {tab === "history" && (
            <HistoryScreen logs={logs} loading={loadingLogs} onDelete={deleteLog} confirmDeleteId={confirmDeleteId} />
          )}
        </main>

        {/* ── FAB — hidden when any sheet is open so it never bleeds through overlays ── */}
        {!showLog && !detailSheetOpen && (
        <div style={{
          position: "sticky", bottom: 0,
          padding: "0.75rem 1.25rem 2rem",
          background: "linear-gradient(to top, rgba(250,250,248,1) 60%, rgba(250,250,248,0))",
          pointerEvents: "none",
        }}>
          <button
            onClick={() => setShowLog(true)}
            style={{
              width: "100%", padding: "0.9rem",
              background: "#1a1a1a", color: "#fafaf8",
              border: "none", borderRadius: 14,
              fontSize: 15, fontWeight: 700,
              letterSpacing: "0.01em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              pointerEvents: "all",
              touchAction: "manipulation",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span>
            Log workout
          </button>
        </div>
        )}
      </div>

      {showLog && <LogSheet onClose={() => setShowLog(false)} onSaved={fetchLogs} />}
    </>
  );
}