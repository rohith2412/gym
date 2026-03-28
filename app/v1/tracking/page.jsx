"use client";

import ProfilePicture from "@/components/ProfilePicture";
import { useState, useEffect, useCallback } from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const totalVol = (sets) => sets.reduce((s, x) => s + x.reps * x.weight, 0);
const maxW = (sets) =>
  sets.length ? Math.max(...sets.map((s) => s.weight)) : 0;

const EXERCISE_LIBRARY = {
  Chest: [
    "Bench Press",
    "Incline Bench Press",
    "Decline Bench Press",
    "Dumbbell Fly",
    "Cable Fly",
    "Push-Up",
    "Chest Dip",
    "Incline Dumbbell Press",
    "Pec Deck Machine",
    "Landmine Press",
  ],
  Back: [
    "Pull-Up",
    "Chin-Up",
    "Lat Pulldown",
    "Seated Cable Row",
    "Barbell Row",
    "Dumbbell Row",
    "T-Bar Row",
    "Face Pull",
    "Deadlift",
    "Romanian Deadlift",
    "Good Morning",
    "Back Extension",
  ],
  Shoulders: [
    "Overhead Press",
    "Dumbbell Shoulder Press",
    "Arnold Press",
    "Lateral Raise",
    "Front Raise",
    "Rear Delt Fly",
    "Upright Row",
    "Cable Lateral Raise",
    "Machine Shoulder Press",
    "Shrug",
  ],
  Arms: [
    "Barbell Curl",
    "Dumbbell Curl",
    "Hammer Curl",
    "Preacher Curl",
    "Cable Curl",
    "Incline Dumbbell Curl",
    "Concentration Curl",
    "Tricep Pushdown",
    "Skull Crusher",
    "Close-Grip Bench",
    "Overhead Tricep Extension",
    "Dips",
    "Diamond Push-Up",
  ],
  Legs: [
    "Squat",
    "Front Squat",
    "Leg Press",
    "Hack Squat",
    "Bulgarian Split Squat",
    "Lunge",
    "Romanian Deadlift",
    "Leg Curl",
    "Leg Extension",
    "Calf Raise",
    "Glute Bridge",
    "Hip Thrust",
    "Step-Up",
    "Sumo Deadlift",
  ],
  Core: [
    "Plank",
    "Crunch",
    "Sit-Up",
    "Leg Raise",
    "Hanging Leg Raise",
    "Ab Wheel Rollout",
    "Cable Crunch",
    "Russian Twist",
    "Bicycle Crunch",
    "Dead Bug",
    "Pallof Press",
    "Dragon Flag",
  ],
};

const MUSCLE_GROUPS = Object.keys(EXERCISE_LIBRARY);

// ─── derive per-muscle-group stats from raw logs ─────────────────────────────
function buildMuscleStats(logs) {
  const grouped = {};

  logs.forEach((log) => {
    const logId = log._id;
    const mgSeen = new Set();

    log.exercises.forEach((ex) => {
      const mg = (ex.muscleGroup || "").trim() || null;
      if (!mg) return;
      if (mgSeen.has(mg)) return;
      mgSeen.add(mg);

      const mgExercises = log.exercises.filter(
        (e) => (e.muscleGroup || "").trim() === mg,
      );
      const weights = mgExercises.flatMap((e) => e.sets.map((s) => s.weight));
      const vols = mgExercises.flatMap((e) =>
        e.sets.map((s) => s.reps * s.weight),
      );
      const best = weights.length ? Math.max(...weights) : 0;
      const vol = vols.reduce((a, b) => a + b, 0);
      const names = [...new Set(mgExercises.map((e) => e.name))];

      if (!grouped[mg]) grouped[mg] = [];
      grouped[mg].push({
        logId,
        date: log.date,
        bestWeight: best,
        totalVol: vol,
        exNames: names,
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
        delta === null
          ? null
          : delta !== 0
            ? delta > 0
            : volDelta !== null
              ? volDelta >= 0
              : null;

      const allNames = [...new Set(sessions.flatMap((s) => s.exNames))];

      return {
        mg,
        lastBest: last.bestWeight,
        delta,
        improved,
        exNames: allNames,
        sessionCount: sessions.length,
      };
    })
    .sort((a, b) => a.mg.localeCompare(b.mg));
}

// ─── MUSCLE DETAIL SHEET ──────────────────────────────────────────────────────
function MuscleDetailSheet({ mg, delta, logs, onClose }) {
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

  let tickerEl = null;
  if (delta === null) {
    tickerEl = (
      <span style={{ ...ds.ticker, ...ds.tickerNeutral }}>First session</span>
    );
  } else if (delta === 0) {
    tickerEl = (
      <span style={{ ...ds.ticker, ...ds.tickerNeutral }}>No change</span>
    );
  } else if (delta > 0) {
    tickerEl = (
      <span style={{ ...ds.ticker, ...ds.tickerUp }}>
        ▲ {delta} lbs from last
      </span>
    );
  } else {
    tickerEl = (
      <span style={{ ...ds.ticker, ...ds.tickerDown }}>
        ▼ {Math.abs(delta)} lbs from last
      </span>
    );
  }

  return (
    <div style={ds.overlay} onClick={onClose}>
      <div style={ds.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={ds.handle} />
        <div style={ds.header}>
          <span style={ds.title}>{mg}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {tickerEl}
            <button style={ds.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <div style={ds.body}>
          {allExercises.length === 0 && (
            <div style={ds.empty}>No exercises logged yet for {mg}.</div>
          )}
          {allExercises.map((ex, i) => (
            <div key={i} style={ds.exCard}>
              <div style={ds.exCardTop}>
                <span style={ds.exName}>{ex.name}</span>
                <span style={ds.exBest}>{maxW(ex.sets)} lbs max</span>
              </div>
              <div style={ds.exSets}>
                {ex.sets.map((s, j) => (
                  <div key={j} style={ds.setRow}>
                    <span style={ds.setNum}>{s.setNumber}</span>
                    <span style={ds.setDetail}>{s.reps} reps</span>
                    <span style={ds.setDetail}>× {s.weight} lbs</span>
                    <span style={ds.setVol}>
                      {(s.reps * s.weight).toLocaleString()} vol
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ds = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
  },
  sheet: {
    width: "100%",
    maxWidth: 430,
    margin: "0 auto",
    background: "#fff",
    borderRadius: "20px 20px 0 0",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    animation: "slideUp 0.25s cubic-bezier(.32,1.2,.64,1)",
  },
  handle: {
    width: 36,
    height: 4,
    background: "#e5e7eb",
    borderRadius: 99,
    margin: "12px auto 0",
    flexShrink: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px 12px",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: 400,
    color: "#111",
    fontFamily: "'DM Serif Display', serif",
  },
  closeBtn: {
    border: "none",
    background: "none",
    fontSize: 14,
    color: "#bbb",
    cursor: "pointer",
    padding: "4px 8px",
    fontFamily: "inherit",
  },
  body: {
    overflowY: "auto",
    padding: "12px 16px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  empty: {
    textAlign: "center",
    color: "#ccc",
    fontSize: 14,
    padding: "32px 0",
  },
  exCard: {
    border: "1.5px solid #f0f0f0",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#fafafa",
  },
  exCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  exName: { fontSize: 14, fontWeight: 600, color: "#111" },
  exBest: { fontSize: 12, color: "#bbb", fontWeight: 300 },
  exSets: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    borderTop: "1px solid #f0f0f0",
    paddingTop: 8,
  },
  setRow: { display: "flex", alignItems: "center", gap: 12, fontSize: 12 },
  setNum: { width: 20, color: "#ccc", fontWeight: 600 },
  setDetail: { color: "#777", fontWeight: 300 },
  setVol: { marginLeft: "auto", color: "#bbb", fontWeight: 300 },
  ticker: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 12,
    fontWeight: 500,
    padding: "3px 9px",
    borderRadius: 99,
  },
  tickerUp: { background: "#dcfce7", color: "#16a34a" },
  tickerDown: { background: "#fee2e2", color: "#dc2626" },
  tickerNeutral: { background: "#f3f4f6", color: "#9ca3af" },
};

// ─── Volume delta ticker ──────────────────────────────────────────────────────
function VolTicker({ delta, improved }) {
  if (delta === undefined || delta === null) return null;
  const up = improved;
  return (
    <span
      style={{
        ...tk.base,
        background: up ? "#dcfce7" : "#fee2e2",
        color: up ? "#16a34a" : "#dc2626",
      }}
    >
      {up ? "▲" : "▼"} {Math.abs(delta).toLocaleString()} vol
    </span>
  );
}
const tk = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    fontSize: 11,
    fontWeight: 500,
    padding: "3px 8px",
    borderRadius: 99,
    letterSpacing: "0.02em",
  },
};

// ─── PROGRESS SCREEN ──────────────────────────────────────────────────────────
function ProgressScreen({ logs }) {
  const allExercises = [
    ...new Set(logs.flatMap((l) => l.exercises.map((e) => e.name))),
  ];
  const [selected, setSelected] = useState("");
  const [data, setData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [detailMg, setDetailMg] = useState(null);
  const [detailDelta, setDetailDelta] = useState(null);

  useEffect(() => {
    if (!selected && allExercises.length) setSelected(allExercises[0]);
  }, [allExercises.length]);

  const load = useCallback(async (name) => {
    if (!name) return;
    setFetching(true);
    try {
      const res = await fetch(
        `/api/tracking/progress?exercise=${encodeURIComponent(name)}`,
      );
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (selected) load(selected);
  }, [selected, load]);

  const last = data.length ? data[data.length - 1] : null;
  const prev = data.length > 1 ? data[data.length - 2] : null;
  const maxVol = data.length ? Math.max(...data.map((d) => d.totalVolume)) : 1;

  const muscleStats = buildMuscleStats(logs);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const openDetail = (mg, delta) => {
    setDetailMg(mg);
    setDetailDelta(delta);
  };

  if (logs.length === 0) {
    return (
      <div style={p.empty}>
        <div style={p.emptyIcon}>🏋️</div>
        <p style={p.emptyTitle}>No workouts yet</p>
        <p style={p.emptySub}>
          Log your first session below to start tracking progress
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={p.wrap}>
        {/* ── Greeting ── */}
        <div style={p.greetRow}>
          <div>
            <p style={p.greetSub}>{greeting}</p>
            <h2 style={p.greetTitle}>Your progress</h2>
          </div>
          {/* <div style={p.streakBadge}>🔥 {logs.length} sessions</div> */}
        </div>

        {/* ── Muscle group list ── */}
        <p style={p.sectionLabel}>Body parts</p>
        <div style={p.muscleList}>
          {muscleStats.map(
            ({ mg, lastBest, delta, improved, exNames, sessionCount }) => (
              <button
                key={mg}
                style={p.muscleRow}
                onClick={() => openDetail(mg, delta)}
              >
                <div style={p.muscleRowLeft}>
                  <span style={p.muscleName}>{mg}</span>
                  <span style={p.muscleRowMeta}>
                    {sessionCount} session{sessionCount !== 1 ? "s" : ""} ·{" "}
                    {exNames.length} exercise{exNames.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={p.muscleRowRight}>
                  <span style={p.muscleRowBest}>
                    {lastBest}
                    <span style={p.muscleUnit}>lbs</span>
                  </span>
                  {delta === null ? (
                    <span style={{ ...p.ticker, ...p.tickerNeutral }}>1st</span>
                  ) : delta > 0 ? (
                    <span style={{ ...p.ticker, ...p.tickerUp }}>
                      ▲ {delta}
                    </span>
                  ) : delta < 0 ? (
                    <span style={{ ...p.ticker, ...p.tickerDown }}>
                      ▼ {Math.abs(delta)}
                    </span>
                  ) : (
                    <span style={{ ...p.ticker, ...p.tickerNeutral }}>— 0</span>
                  )}
                  <span style={p.chevron}>›</span>
                </div>
              </button>
            ),
          )}
        </div>

        {/* ── Exercise picker ── */}
        <p style={p.sectionLabel}>Drill down</p>
        <div style={p.pickerWrap}>
          {allExercises.map((ex) => (
            <button
              key={ex}
              style={{
                ...p.pickerBtn,
                ...(selected === ex ? p.pickerActive : {}),
              }}
              onClick={() => setSelected(ex)}
            >
              {ex}
            </button>
          ))}
        </div>

        {fetching && <div style={p.loading}>Loading…</div>}

        {!fetching && last && (
          <>
            <div style={p.heroCard}>
              <div style={p.heroLeft}>
                <span style={p.heroLabel}>Best weight</span>
                <span style={p.heroVal}>
                  {last.bestWeight}
                  <span style={p.heroUnit}>lbs</span>
                </span>
                {prev && (
                  <VolTicker
                    delta={last.bestWeight - prev.bestWeight}
                    improved={last.bestWeight >= prev.bestWeight}
                  />
                )}
              </div>
              <div style={p.heroDivider} />
              <div style={p.heroRight}>
                <span style={p.heroLabel}>Last volume</span>
                <span style={p.heroVal}>
                  {last.totalVolume.toLocaleString()}
                </span>
                <VolTicker delta={last.volumeDelta} improved={last.improved} />
              </div>
            </div>

            <div style={p.chartSection}>
              <p style={p.chartLabel}>Volume trend</p>
              <div style={p.bars}>
                {data.map((d, i) => (
                  <div key={i} style={p.barCol}>
                    <div style={p.barTrack}>
                      <div
                        style={{
                          ...p.bar,
                          height: `${Math.max(8, Math.round((d.totalVolume / maxVol) * 100))}%`,
                          background:
                            d.improved === null
                              ? "#d1d5db"
                              : d.improved
                                ? "#22c55e"
                                : "#f87171",
                        }}
                      />
                    </div>
                    <span style={p.barDate}>{fmtDate(d.date)}</span>
                  </div>
                ))}
              </div>
            </div>

            <p style={p.chartLabel}>Sessions</p>
            {[...data].reverse().map((d, i) => (
              <div key={i} style={p.sessionRow}>
                <div style={p.sessionLeft}>
                  <span style={p.sessionDate}>{fmtDate(d.date)}</span>
                  <span style={p.sessionMeta}>
                    {d.sets} sets · {d.totalReps} reps · {d.bestWeight} lbs max
                  </span>
                </div>
                <VolTicker delta={d.volumeDelta} improved={d.improved} />
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Muscle detail sheet ── */}
      {detailMg && (
        <MuscleDetailSheet
          mg={detailMg}
          delta={detailDelta}
          logs={logs}
          onClose={() => setDetailMg(null)}
        />
      )}
    </>
  );
}

const p = {
  wrap: {
    padding: "20px 16px 140px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 32px 140px",
    gap: 12,
    textAlign: "center",
  },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 400,
    color: "#111",
    margin: 0,
    fontFamily: "'DM Serif Display', serif",
  },
  emptySub: {
    fontSize: 14,
    color: "#aaa",
    margin: 0,
    lineHeight: 1.6,
    fontWeight: 300,
  },
  greetRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetSub: { fontSize: 12, color: "#aaa", margin: "0 0 2px", fontWeight: 300 },
  greetTitle: {
    fontSize: 22,
    fontWeight: 400,
    color: "#111",
    margin: 0,
    letterSpacing: "-0.02em",
    fontFamily: "'DM Serif Display', serif",
  },
  streakBadge: {
    background: "#fff7ed",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#fed7aa",
    borderRadius: 99,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 500,
    color: "#ea580c",
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 400,
    color: "#bbb",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: 0,
  },

  // ── Muscle list ──
  muscleList: { display: "flex", flexDirection: "column", gap: 6 },
  muscleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 16px",
    background: "#fafafa",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#f0f0f0",
    borderRadius: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
    width: "100%",
  },
  muscleRowLeft: { display: "flex", flexDirection: "column", gap: 3 },
  muscleRowRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  muscleName: { fontSize: 15, fontWeight: 600, color: "#111" },
  muscleRowMeta: { fontSize: 11, color: "#bbb", fontWeight: 300 },
  muscleRowBest: {
    fontSize: 22,
    fontWeight: 400,
    color: "#111",
    letterSpacing: "-0.03em",
  },
  muscleUnit: { fontSize: 11, fontWeight: 300, color: "#aaa", marginLeft: 2 },
  ticker: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 12,
    fontWeight: 500,
    padding: "3px 9px",
    borderRadius: 99,
  },
  tickerUp: { background: "#dcfce7", color: "#16a34a" },
  tickerDown: { background: "#fee2e2", color: "#dc2626" },
  tickerNeutral: { background: "#f3f4f6", color: "#9ca3af" },
  chevron: { fontSize: 14, color: "#ccc" },

  // ── Exercise drill-down ──
  pickerWrap: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 },
  pickerBtn: {
    flexShrink: 0,
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#eee",
    borderRadius: 99,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 400,
    color: "#999",
    background: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    letterSpacing: "0.02em",
  },
  pickerActive: { background: "#111", color: "#fff", borderColor: "#111" },
  loading: {
    textAlign: "center",
    color: "#ccc",
    padding: "32px 0",
    fontSize: 14,
    fontWeight: 300,
  },
  heroCard: {
    background: "#f9fafb",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#f0f0f0",
    borderRadius: 16,
    padding: "20px 18px",
    display: "flex",
    alignItems: "stretch",
  },
  heroLeft: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  heroDivider: { width: 1, background: "#eee", margin: "0 18px" },
  heroRight: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  heroLabel: {
    fontSize: 10,
    fontWeight: 400,
    color: "#aaa",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  heroVal: {
    fontSize: 34,
    fontWeight: 400,
    color: "#111",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  heroUnit: { fontSize: 13, fontWeight: 300, color: "#aaa", marginLeft: 3 },
  chartSection: { display: "flex", flexDirection: "column", gap: 8 },
  chartLabel: {
    fontSize: 10,
    fontWeight: 400,
    color: "#bbb",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    margin: 0,
  },
  bars: { display: "flex", alignItems: "flex-end", gap: 5, height: 80 },
  barCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    background: "#f3f4f6",
    borderRadius: 4,
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    transition: "height 0.5s cubic-bezier(.34,1.56,.64,1)",
  },
  barDate: {
    fontSize: 9,
    color: "#d1d5db",
    whiteSpace: "nowrap",
    fontWeight: 300,
  },
  sessionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    background: "#fafafa",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#f0f0f0",
    borderRadius: 12,
  },
  sessionLeft: { display: "flex", flexDirection: "column", gap: 2 },
  sessionDate: { fontSize: 13, fontWeight: 600, color: "#111" },
  sessionMeta: { fontSize: 11, color: "#aaa", fontWeight: 300 },
};

// ─── EXERCISE PICKER SUB-SHEET ───────────────────────────────────────────────
function ExercisePicker({ muscleGroup, alreadyAdded, onConfirm, onClose }) {
  const list = EXERCISE_LIBRARY[muscleGroup] || [];
  const [picked, setPicked] = useState([]);

  const toggle = (name) =>
    setPicked((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  return (
    <div style={ep.overlay} onClick={onClose}>
      <div style={ep.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={ep.handle} />
        <div style={ep.header}>
          <button style={ep.backBtn} onClick={onClose}>
            ← Back
          </button>
          <span style={ep.title}>{muscleGroup}</span>
          <span style={ep.count}>{picked.length} selected</span>
        </div>
        <div style={ep.list}>
          {list.map((name) => {
            const isAdded = alreadyAdded.includes(name);
            const isSel = picked.includes(name);
            return (
              <button
                key={name}
                disabled={isAdded}
                style={{
                  ...ep.row,
                  ...(isSel ? ep.rowSel : {}),
                  ...(isAdded ? ep.rowAdded : {}),
                }}
                onClick={() => !isAdded && toggle(name)}
              >
                <span style={ep.rowName}>{name}</span>
                {isAdded ? (
                  <span style={ep.addedBadge}>Added</span>
                ) : isSel ? (
                  <span style={ep.checkmark}>✓</span>
                ) : (
                  <span style={ep.plus}>＋</span>
                )}
              </button>
            );
          })}
        </div>
        <div style={ep.footer}>
          <button
            style={{
              ...ep.confirmBtn,
              ...(picked.length === 0 ? ep.confirmOff : {}),
            }}
            disabled={picked.length === 0}
            onClick={() => onConfirm(picked, muscleGroup)}
          >
            Add{" "}
            {picked.length > 0
              ? `${picked.length} exercise${picked.length > 1 ? "s" : ""}`
              : "exercises"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ep = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
  },
  sheet: {
    width: "100%",
    maxWidth: 430,
    margin: "0 auto",
    background: "#fff",
    borderRadius: "20px 20px 0 0",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    animation: "slideUp 0.25s cubic-bezier(.32,1.2,.64,1)",
  },
  handle: {
    width: 36,
    height: 4,
    background: "#e5e7eb",
    borderRadius: 99,
    margin: "12px auto 4px",
    flexShrink: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px 12px",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0,
  },
  backBtn: {
    border: "none",
    background: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#999",
    cursor: "pointer",
    fontFamily: "inherit",
    padding: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: 400,
    color: "#111",
    fontFamily: "'DM Serif Display', serif",
  },
  count: {
    fontSize: 12,
    fontWeight: 300,
    color: "#aaa",
    minWidth: 70,
    textAlign: "right",
  },
  list: { overflowY: "auto", padding: "8px 12px 8px" },
  row: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 14px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#f5f5f5",
    borderRadius: 12,
    background: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 6,
    transition: "all 0.12s",
  },
  rowSel: { background: "#111", borderColor: "#111", color: "#fff" },
  rowAdded: { opacity: 0.4, cursor: "default", background: "#fafafa" },
  rowName: {
    fontSize: 14,
    fontWeight: 500,
    color: "inherit",
    textAlign: "left",
    transition: "color 0.12s",
  },
  checkmark: { fontSize: 14, color: "#fff", fontWeight: 500 },
  plus: { fontSize: 16, color: "#ccc", fontWeight: 300 },
  addedBadge: {
    fontSize: 10,
    fontWeight: 400,
    color: "#aaa",
    letterSpacing: "0.08em",
  },
  footer: {
    padding: "12px 16px 32px",
    borderTop: "1px solid #f0f0f0",
    flexShrink: 0,
  },
  confirmBtn: {
    width: "100%",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  confirmOff: { opacity: 0.3, cursor: "not-allowed" },
};

// ─── LOG SHEET ────────────────────────────────────────────────────────────────
function LogSheet({ onClose, onSaved }) {
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
          sets: [
            ...ex.sets,
            {
              setNumber: ex.sets.length + 1,
              reps: last ? last.reps : 0,
              weight: last ? last.weight : 0,
            },
          ],
        };
      }),
    );

  const removeSet = (ei, si) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== ei
          ? ex
          : {
              ...ex,
              sets: ex.sets
                .filter((_, j) => j !== si)
                .map((s, j) => ({ ...s, setNumber: j + 1 })),
            },
      ),
    );

  const updateSet = (ei, si, field, val) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== ei
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j === si ? { ...s, [field]: Number(val) } : s,
              ),
            },
      ),
    );

  const onPickerConfirm = (names, mg) => {
    const newCards = names.map((name) => ({
      name,
      muscleGroup: mg,
      sets: [{ setNumber: 1, reps: 0, weight: 0 }],
    }));
    setExercises((prev) => [...prev, ...newCards]);
    setPickerMg(null);
  };

  const submit = async () => {
    if (!exercises.length) return alert("Add at least one exercise.");
    setSaving(true);
    try {
      // Append noon local time so the backend never shifts the date across a UTC boundary
      const offset = new Date().getTimezoneOffset();
      const sign = offset <= 0 ? "+" : "-";
      const absOffset = Math.abs(offset);
      const hh = String(Math.floor(absOffset / 60)).padStart(2, "0");
      const mm = String(absOffset % 60).padStart(2, "0");
      const dateWithTz = `${date}T12:00:00${sign}${hh}:${mm}`;

      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateWithTz, exercises, notes }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        onSaved();
        setTimeout(() => onClose(), 1600);
      } else {
        alert(data.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const alreadyAdded = exercises.map((e) => e.name);

  return (
    <>
      <div style={ls.overlay} onClick={onClose}>
        <div style={ls.sheet} onClick={(e) => e.stopPropagation()}>
          <div style={ls.handle} />
          {saved ? (
            <div style={ls.savedWrap}>
              <div style={ls.savedIcon}>✓</div>
              <p style={ls.savedText}>Workout saved!</p>
            </div>
          ) : (
            <>
              <div style={ls.sheetHeader}>
                <h2 style={ls.sheetTitle}>Log workout</h2>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={ls.dateInput}
                />
              </div>

              <div style={ls.body}>
                <div style={ls.mgSection}>
                  <p style={ls.mgLabel}>Tap a muscle group to add exercises</p>
                  <div style={ls.mgGrid}>
                    {MUSCLE_GROUPS.map((mg) => {
                      const count = exercises.filter(
                        (e) => e.muscleGroup === mg,
                      ).length;
                      return (
                        <button
                          key={mg}
                          style={{
                            ...ls.mgBtn,
                            ...(count > 0 ? ls.mgBtnActive : {}),
                          }}
                          onClick={() => setPickerMg(mg)}
                        >
                          <span style={ls.mgBtnName}>{mg}</span>
                          {count > 0 && (
                            <span style={ls.mgBtnCount}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {exercises.length === 0 && (
                  <div style={ls.emptyHint}>
                    <span style={ls.emptyHintText}>
                      No exercises yet — tap a muscle group above
                    </span>
                  </div>
                )}

                {exercises.map((ex, ei) => (
                  <div key={ei} style={ls.exCard}>
                    <div style={ls.exTopRow}>
                      <div style={ls.exMeta}>
                        <span style={ls.exMgTag}>{ex.muscleGroup}</span>
                        <span style={ls.exName}>{ex.name}</span>
                      </div>
                      <button
                        style={ls.removeBtn}
                        onClick={() =>
                          setExercises((prev) =>
                            prev.filter((_, i) => i !== ei),
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>
                    <div style={ls.setHead}>
                      <span style={ls.setHCol}>SET</span>
                      <span style={ls.setHCol}>REPS</span>
                      <span style={ls.setHCol}>LBS</span>
                      <span style={{ width: 28 }} />
                    </div>
                    {ex.sets.map((set, si) => (
                      <div key={si} style={ls.setRow}>
                        <span style={ls.setNum}>{set.setNumber}</span>
                        <input
                          type="number"
                          min={0}
                          value={set.reps || ""}
                          placeholder="0"
                          onChange={(e) =>
                            updateSet(ei, si, "reps", e.target.value)
                          }
                          style={ls.setInput}
                        />
                        <input
                          type="number"
                          min={0}
                          value={set.weight || ""}
                          placeholder="0"
                          onChange={(e) =>
                            updateSet(ei, si, "weight", e.target.value)
                          }
                          style={ls.setInput}
                        />
                        <button
                          style={ls.removeSetBtn}
                          onClick={() => removeSet(ei, si)}
                        >
                          −
                        </button>
                      </div>
                    ))}
                    <button style={ls.addSetBtn} onClick={() => addSet(ei)}>
                      + Add set
                    </button>
                  </div>
                ))}

                <textarea
                  placeholder="Notes (optional)…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={ls.notes}
                  rows={2}
                />

                <button
                  style={{ ...ls.saveBtn, ...(saving ? ls.saveBtnOff : {}) }}
                  disabled={saving}
                  onClick={submit}
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

const ls = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 50,
    display: "flex",
    alignItems: "flex-end",
  },
  sheet: {
    width: "100%",
    maxWidth: 430,
    margin: "0 auto",
    background: "#fff",
    borderRadius: "20px 20px 0 0",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    animation: "slideUp 0.3s cubic-bezier(.32,1.2,.64,1)",
  },
  handle: {
    width: 36,
    height: 4,
    background: "#e5e7eb",
    borderRadius: 99,
    margin: "12px auto 0",
    flexShrink: 0,
  },
  sheetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px 12px",
    flexShrink: 0,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 400,
    color: "#111",
    margin: 0,
    letterSpacing: "-0.01em",
    fontFamily: "'DM Serif Display', serif",
  },
  dateInput: {
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#eee",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 13,
    color: "#111",
    fontFamily: "inherit",
    outline: "none",
    background: "#fafafa",
    fontWeight: 300,
  },
  body: {
    overflowY: "auto",
    padding: "4px 16px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mgSection: { display: "flex", flexDirection: "column", gap: 10 },
  mgLabel: {
    fontSize: 11,
    fontWeight: 400,
    color: "#bbb",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    margin: 0,
  },
  mgGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  mgBtn: {
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#eee",
    borderRadius: 12,
    padding: "10px 8px",
    background: "#fafafa",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    transition: "all 0.12s",
  },
  mgBtnActive: { background: "#111", borderColor: "#111", color: "#fff" },
  mgBtnName: {
    fontSize: 12,
    fontWeight: 500,
    color: "inherit",
    pointerEvents: "none",
  },
  mgBtnCount: {
    fontSize: 10,
    fontWeight: 500,
    background: "#22c55e",
    color: "#fff",
    borderRadius: 99,
    padding: "1px 6px",
  },
  emptyHint: {
    padding: "20px",
    background: "#fafafa",
    borderRadius: 12,
    textAlign: "center",
  },
  emptyHintText: { fontSize: 13, color: "#ccc", fontWeight: 300 },
  exCard: {
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#f0f0f0",
    borderRadius: 14,
    padding: "12px 12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "#fafafa",
  },
  exTopRow: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  exMeta: { display: "flex", flexDirection: "column", gap: 2 },
  exMgTag: {
    fontSize: 9,
    fontWeight: 400,
    color: "#aaa",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  exName: { fontSize: 15, fontWeight: 600, color: "#111" },
  removeBtn: {
    border: "none",
    background: "none",
    color: "#ccc",
    fontSize: 14,
    cursor: "pointer",
    padding: 4,
    flexShrink: 0,
  },
  setHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
    borderBottom: "1px solid #eee",
  },
  setHCol: {
    flex: 1,
    fontSize: 9,
    fontWeight: 400,
    letterSpacing: "0.12em",
    color: "#ccc",
    textAlign: "center",
  },
  setRow: { display: "flex", alignItems: "center", gap: 8 },
  setNum: {
    flex: 1,
    fontSize: 12,
    color: "#bbb",
    textAlign: "center",
    fontWeight: 400,
  },
  setInput: {
    flex: 1,
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#eee",
    borderRadius: 8,
    padding: "7px 4px",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    color: "#111",
    fontFamily: "inherit",
    outline: "none",
    background: "#fff",
    width: 0,
    minWidth: 0,
    boxSizing: "border-box",
  },
  removeSetBtn: {
    width: 28,
    height: 28,
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#eee",
    borderRadius: "50%",
    background: "#fff",
    color: "#ccc",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  addSetBtn: {
    border: "none",
    background: "none",
    color: "#aaa",
    fontSize: 12,
    fontWeight: 400,
    cursor: "pointer",
    textAlign: "left",
    padding: "2px 0",
    fontFamily: "inherit",
  },
  notes: {
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#eee",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#111",
    fontFamily: "inherit",
    outline: "none",
    resize: "none",
    background: "#fafafa",
    width: "100%",
    boxSizing: "border-box",
    fontWeight: 300,
  },
  saveBtn: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  saveBtnOff: { opacity: 0.4, cursor: "not-allowed" },
  savedWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 32px",
    gap: 12,
  },
  savedIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#f0fdf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    color: "#22c55e",
  },
  savedText: {
    fontSize: 16,
    fontWeight: 400,
    color: "#111",
    margin: 0,
    fontFamily: "'DM Serif Display', serif",
  },
};

// ─── HISTORY SCREEN ───────────────────────────────────────────────────────────
function HistoryScreen({ logs, loading, onDelete, confirmDeleteId }) {
  if (loading) return <div style={h.center}>Loading…</div>;
  if (!logs.length) return <div style={h.center}>No workouts logged yet.</div>;
  return (
    <div style={h.wrap}>
      {logs.map((log) => {
        const isPending = confirmDeleteId === log._id;
        return (
          <div key={log._id} style={h.card}>
            <div style={h.cardHeader}>
              <div style={h.cardDate}>{fmtDate(log.date)}</div>
              <button
                style={{
                  ...h.deleteBtn,
                  ...(isPending ? h.deleteBtnConfirm : {}),
                }}
                onClick={() => onDelete(log._id)}
              >
                {isPending ? "Tap again to confirm" : "Delete"}
              </button>
            </div>
            {log.exercises.map((ex, i) => (
              <div key={i} style={h.exRow}>
                <span style={h.exName}>{ex.name}</span>
                <span style={h.exMeta}>
                  {ex.sets.length} sets · {maxW(ex.sets)} lbs ·{" "}
                  {totalVol(ex.sets).toLocaleString()} vol
                </span>
              </div>
            ))}
            {log.notes && <p style={h.notes}>"{log.notes}"</p>}
          </div>
        );
      })}
    </div>
  );
}

const h = {
  wrap: {
    padding: "16px 16px 140px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  center: {
    textAlign: "center",
    color: "#ccc",
    padding: "60px 20px",
    fontSize: 14,
    fontWeight: 300,
  },
  card: {
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#f0f0f0",
    borderRadius: 14,
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 7,
    background: "#fafafa",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: {
    fontSize: 13,
    fontWeight: 400,
    color: "#111",
    letterSpacing: "0.01em",
    fontFamily: "'DM Serif Display', serif",
  },
  deleteBtn: {
    border: "none",
    background: "none",
    fontSize: 12,
    color: "#f87171",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 400,
    padding: "2px 0",
    transition: "all 0.15s",
  },
  deleteBtnConfirm: { color: "#dc2626", fontWeight: 600 },
  exRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  exName: { fontSize: 14, fontWeight: 500, color: "#333" },
  exMeta: { fontSize: 11, color: "#bbb", flexShrink: 0, fontWeight: 300 },
  notes: {
    fontSize: 12,
    color: "#bbb",
    fontStyle: "italic",
    margin: "4px 0 0",
    paddingTop: 6,
    borderTop: "1px solid #f0f0f0",
    fontWeight: 300,
  },
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function TrackingPage() {
  const [tab, setTab] = useState("progress");
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const deleteLog = async (id) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000); // auto-cancel after 3s
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
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        body { margin: 0; background: #f5f5f4; }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ::-webkit-scrollbar { display: none; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      <div style={r.root}>
        <div style={r.phone}>
          <div style={r.header}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
    <h1 style={{ ...r.headerTitle, margin: 0 }}>Tracker</h1>
    <ProfilePicture size={36} />
  </div>
            <div style={r.tabRow}>
              {[
                ["progress", "Progress"],
                ["history", "History"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  style={{ ...r.tabBtn, ...(tab === key ? r.tabActive : {}) }}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={r.content}>
            {tab === "progress" && <ProgressScreen logs={logs} />}
            {tab === "history" && (
              <HistoryScreen
                logs={logs}
                loading={loadingLogs}
                onDelete={deleteLog}
                confirmDeleteId={confirmDeleteId}
              />
            )}{" "}
          </div>

          <div style={r.fab}>
            <button style={r.fabBtn} onClick={() => setShowLog(true)}>
              <span style={r.fabPlus}>＋</span>
              Log workout
            </button>
          </div>
        </div>
      </div>

      {showLog && (
        <LogSheet
          onClose={() => setShowLog(false)}
          onSaved={() => {
            fetchLogs();
          }}
        />
      )}
    </>
  );
}

const r = {
  root: {
    minHeight: "100vh",
    background: "#f5f5f4",
    display: "flex",
    justifyContent: "center",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  phone: {
    width: "100%",
    maxWidth: 430,
    background: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    padding: "52px 20px 0",
    background: "#fff",
    borderBottom: "1px solid #f0f0f0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 400,
    color: "#111",
    margin: "0 0 14px",
    letterSpacing: "-0.02em",
    fontFamily: "'DM Serif Display', serif",
  },
  tabRow: { display: "flex" },
  tabBtn: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "none",
    fontSize: 13,
    fontWeight: 400,
    color: "#bbb",
    cursor: "pointer",
    fontFamily: "inherit",
    borderBottom: "2px solid transparent",
    transition: "all 0.15s",
    letterSpacing: "0.02em",
  },
  tabActive: { color: "#111", borderBottom: "2px solid #111" },
  content: { flex: 1, overflowY: "auto" },
  fab: {
    position: "sticky",
    bottom: 0,
    padding: "12px 16px 32px",
    background: "linear-gradient(to top, #fff 60%, rgba(255,255,255,0))",
    pointerEvents: "none",
    zIndex: 9,
  },
  fabBtn: {
    width: "100%",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "15px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    pointerEvents: "all",
  },
  fabPlus: { fontSize: 20, lineHeight: 1, marginTop: -1 },
};
