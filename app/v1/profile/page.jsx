"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcBmi = (weight, height) => {
  if (!weight || !height) return null;
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
};

const bmiCategory = (val) => {
  const n = parseFloat(val);
  if (n < 18.5) return { label: "Underweight", color: "#60a5fa" };
  if (n < 25)   return { label: "Healthy",     color: "#22c55e" };
  if (n < 30)   return { label: "Overweight",  color: "#f59e0b" };
  return               { label: "Obese",        color: "#ef4444" };
};

const GOAL_MAP = {
  "lose fat":    { icon: "🔥", label: "Lose fat"    },
  "gain muscle": { icon: "💪", label: "Gain muscle" },
  "strength":    { icon: "🏋️", label: "Strength"    },
};

const EXP_MAP = {
  beginner:     { icon: "🌱", label: "Beginner"     },
  intermediate: { icon: "⚡", label: "Intermediate" },
  advanced:     { icon: "🎯", label: "Advanced"     },
};

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 68 }) {
  const [err, setErr] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        referrerPolicy="no-referrer"
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", display: "block", flexShrink: 0,
          border: "2px solid #e8e5de",
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#1a1a1a", color: "#fff", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8e5de",
      borderRadius: 20,
      padding: "1.1rem 1.25rem",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: "#aaa", margin: "0 0 0.65rem",
    }}>
      {children}
    </p>
  );
}

// ── Edit bottom sheet ─────────────────────────────────────────────────────────
function EditSheet({ intro, onClose, onSaved }) {
  const [form, setForm] = useState({ ...intro });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onSaved(form); onClose(); }
      else alert("Save failed: " + data.error);
    } finally {
      setSaving(false);
    }
  };

  const SliderField = ({ label, field, min, max, unit }) => (
    <div style={e.group}>
      <div style={e.groupTop}>
        <span style={e.groupLabel}>{label}</span>
        <span style={e.groupVal}>{form[field]} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={form[field]}
        style={e.slider}
        onChange={(ev) => set(field, parseInt(ev.target.value))}
      />
      <div style={e.rangeRow}><span>{min}</span><span>{max}</span></div>
    </div>
  );

  const Chips = ({ label, field, options }) => (
    <div style={e.group}>
      <span style={e.groupLabel}>{label}</span>
      <div style={e.chips}>
        {options.map((o) => (
          <button
            key={o.val}
            style={{ ...e.chip, ...(form[field] === o.val ? e.chipActive : {}) }}
            onClick={() => set(field, o.val)}
          >
            {o.icon && <span style={{ marginRight: 5 }}>{o.icon}</span>}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={e.overlay} onClick={onClose}>
      <div style={e.sheet} onClick={(ev) => ev.stopPropagation()}>
        <div style={e.handle} />
        <div style={e.head}>
          <span style={e.headTitle}>Edit profile</span>
          <button style={e.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={e.body}>
          <Chips label="Biological sex" field="gender" options={[
            { val: "male",   icon: "♂", label: "Male"   },
            { val: "female", icon: "♀", label: "Female" },
            { val: "other",  icon: "◎", label: "Other"  },
          ]} />
          <SliderField label="Age"    field="age"    min={10}  max={99}  unit="yrs" />
          <SliderField label="Height" field="height" min={100} max={250} unit="cm"  />
          <SliderField label="Weight" field="weight" min={30}  max={200} unit="kg"  />
          <Chips label="Main goal" field="fitnessGoal" options={[
            { val: "lose fat",    icon: "🔥", label: "Lose fat"    },
            { val: "gain muscle", icon: "💪", label: "Gain muscle" },
            { val: "strength",    icon: "🏋️", label: "Strength"    },
          ]} />
          <Chips label="Experience" field="experienceLevel" options={[
            { val: "beginner",     icon: "🌱", label: "Beginner"     },
            { val: "intermediate", icon: "⚡", label: "Intermediate" },
            { val: "advanced",     icon: "🎯", label: "Advanced"     },
          ]} />
          <div style={e.group}>
            <span style={e.groupLabel}>Days per week</span>
            <div style={e.daysRow}>
              {[1,2,3,4,5,6,7].map((n) => (
                <button
                  key={n}
                  style={{ ...e.dayBtn, ...(form.workoutDaysPerWeek === n ? e.dayBtnActive : {}) }}
                  onClick={() => set("workoutDaysPerWeek", n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            style={{ ...e.saveBtn, ...(saving ? e.saveBtnOff : {}) }}
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

const e = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    zIndex: 100, display: "flex", alignItems: "flex-end",
  },
  sheet: {
    width: "100%", maxWidth: 430, margin: "0 auto",
    background: "#fff", borderRadius: "22px 22px 0 0",
    maxHeight: "90vh", display: "flex", flexDirection: "column",
    animation: "slideUp 0.28s cubic-bezier(.32,1.2,.64,1)",
  },
  handle: {
    width: 36, height: 4, background: "#e8e5de",
    borderRadius: 99, margin: "12px auto 0", flexShrink: 0,
  },
  head: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px 12px", borderBottom: "1px solid #e8e5de", flexShrink: 0,
  },
  headTitle: {
    fontSize: 16, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em",
  },
  closeBtn: {
    border: "none", background: "none", fontSize: 14, color: "#bbb",
    cursor: "pointer", fontFamily: "inherit", padding: "4px 8px",
  },
  body: {
    overflowY: "auto", padding: "18px 20px 48px",
    display: "flex", flexDirection: "column", gap: 22,
  },
  group: { display: "flex", flexDirection: "column", gap: 8 },
  groupTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  groupLabel: {
    fontSize: 10, fontWeight: 700, color: "#aaa",
    letterSpacing: "0.12em", textTransform: "uppercase",
  },
  groupVal: { fontSize: 15, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" },
  slider: { width: "100%", accentColor: "#1a1a1a", cursor: "pointer" },
  rangeRow: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#ccc" },
  chips: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    display: "flex", alignItems: "center", padding: "8px 14px",
    borderRadius: 99, border: "1.5px solid #e8e5de", background: "#fafaf8",
    fontSize: 13, fontWeight: 500, color: "#555", cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.12s",
  },
  chipActive: { background: "#1a1a1a", borderColor: "#1a1a1a", color: "#fff" },
  daysRow: { display: "flex", gap: 7 },
  dayBtn: {
    flex: 1, padding: "9px 0", border: "1.5px solid #e8e5de",
    borderRadius: 10, background: "#fafaf8", fontSize: 13, fontWeight: 600,
    color: "#aaa", cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
  },
  dayBtnActive: { background: "#1a1a1a", borderColor: "#1a1a1a", color: "#fff" },
  saveBtn: {
    background: "#1a1a1a", color: "#fafaf8", border: "none", borderRadius: 14,
    padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", letterSpacing: "0.01em",
  },
  saveBtnOff: { opacity: 0.35, cursor: "not-allowed" },
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [intro, setIntro]               = useState(null);
  const [loadingIntro, setLoadingIntro] = useState(true);
  const [workoutStats, setWorkoutStats] = useState({ sessions: 0, totalVol: 0, topExercise: "—" });
  const [showEdit, setShowEdit]         = useState(false);
  const [signingOut, setSigningOut]     = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/user-intro")
      .then((r) => r.json())
      .then((d) => { if (d.success) setIntro(d.data); })
      .catch(() => {})
      .finally(() => setLoadingIntro(false));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/tracking?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        const logs = d.data;
        const sessions = logs.length;
        const totalVol = logs.reduce((sum, log) =>
          sum + log.exercises.reduce((s2, ex) =>
            s2 + ex.sets.reduce((s3, set) => s3 + set.reps * set.weight, 0), 0), 0);
        const freq = {};
        logs.forEach((log) =>
          log.exercises.forEach((ex) => { freq[ex.name] = (freq[ex.name] || 0) + 1; })
        );
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
        setWorkoutStats({ sessions, totalVol, topExercise: top ? top[0] : "—" });
      })
      .catch(() => {});
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || loadingIntro) {
    return (
      <div style={S.root}>
        <style>{GLOBAL_STYLES}</style>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={S.spinner} />
        </div>
      </div>
    );
  }

  const user    = session?.user;
  const bmiVal  = intro ? calcBmi(intro.weight, intro.height) : null;
  const bmiInfo = bmiVal ? bmiCategory(bmiVal) : null;
  const goal    = intro?.fitnessGoal     ? GOAL_MAP[intro.fitnessGoal]     : null;
  const exp     = intro?.experienceLevel ? EXP_MAP[intro.experienceLevel]  : null;

  return (
    <div style={S.root}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Sticky header ── */}
      <header style={S.header}>
        <button style={S.backBtn} onClick={() => router.back()}>←</button>
        <span style={S.headerTitle}>Profile</span>
        <div style={{ width: 36 }} />
      </header>

      <main style={S.main}>

        {/* ── Hero ── */}
        <Card style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <Avatar src={user?.photo || user?.image} name={user?.name} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={S.heroName}>{user?.name ?? "Athlete"}</h1>
            <p style={S.heroEmail}>{user?.email}</p>
            <div style={S.heroPills}>
              {intro?.gender && (
                <span style={S.pill}>
                  {intro.gender === "male" ? "♂" : intro.gender === "female" ? "♀" : "◎"} {intro.gender}
                </span>
              )}
              {intro?.age && <span style={S.pill}>{intro.age} yrs</span>}
              {intro?.workoutDaysPerWeek > 0 && (
                <span style={S.pill}>{intro.workoutDaysPerWeek}×/wk</span>
              )}
            </div>
          </div>
        </Card>

        {/* ── Activity stats ── */}
        {workoutStats.sessions > 0 && (
          <>
            <SectionLabel>Activity</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <Card style={{ padding: "1rem 1.1rem" }}>
                <span style={S.statIcon}>🏋️</span>
                <p style={S.statValue}>{workoutStats.sessions}</p>
                <p style={S.statLabel}>Workouts logged</p>
              </Card>
              <Card style={{ padding: "1rem 1.1rem" }}>
                <span style={S.statIcon}>📈</span>
                <p style={S.statValue}>
                  {workoutStats.totalVol >= 1000
                    ? `${(workoutStats.totalVol / 1000).toFixed(1)}t`
                    : `${workoutStats.totalVol}`}
                </p>
                <p style={S.statLabel}>Total volume</p>
              </Card>
            </div>
            <Card style={{ marginBottom: 10, padding: "1rem 1.25rem" }}>
              <p style={S.statLabel}>Top exercise</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginTop: 4 }}>
                {workoutStats.topExercise}
              </p>
            </Card>
          </>
        )}

        {/* ── Body stats ── */}
        {intro && (
          <>
            <SectionLabel>Body</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <Card style={{ padding: "1rem 1.1rem" }}>
                <p style={S.statLabel}>Height</p>
                <p style={S.statValue}>{intro.height} <span style={S.statUnit}>cm</span></p>
              </Card>
              <Card style={{ padding: "1rem 1.1rem" }}>
                <p style={S.statLabel}>Weight</p>
                <p style={S.statValue}>{intro.weight} <span style={S.statUnit}>kg</span></p>
              </Card>
            </div>

            {bmiVal && bmiInfo && (
              <Card style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={S.statLabel}>BMI</p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 9px",
                    borderRadius: 99,
                    background: bmiInfo.color + "18",
                    color: bmiInfo.color,
                    letterSpacing: "0.05em",
                  }}>
                    {bmiInfo.label}
                  </span>
                </div>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.05em", lineHeight: 1, marginBottom: 10 }}>
                  {bmiVal}
                </p>
                {/* BMI bar */}
                <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "visible", position: "relative", gap: 2 }}>
                  {[
                    { w: 22, color: "#93c5fd" },
                    { w: 40, color: "#86efac" },
                    { w: 22, color: "#fcd34d" },
                    { w: 16, color: "#fca5a5" },
                  ].map((seg, i) => (
                    <div key={i} style={{ flex: seg.w, height: "100%", background: seg.color, opacity: 0.5, borderRadius: 99 }} />
                  ))}
                  <div style={{
                    position: "absolute",
                    left: `${Math.min(96, Math.max(2, ((parseFloat(bmiVal) - 10) / 30) * 100))}%`,
                    top: "50%", transform: "translate(-50%, -50%)",
                    width: 12, height: 12, borderRadius: "50%",
                    background: bmiInfo.color,
                    border: "2px solid #fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#ccc", marginTop: 5 }}>
                  <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── Training profile ── */}
        {intro && (goal || exp) && (
          <>
            <SectionLabel>Training</SectionLabel>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {goal && (
                <Card style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0.9rem 1rem" }}>
                  <span style={{ fontSize: 22 }}>{goal.icon}</span>
                  <div>
                    <p style={S.statLabel}>Goal</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginTop: 2 }}>{goal.label}</p>
                  </div>
                </Card>
              )}
              {exp && (
                <Card style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0.9rem 1rem" }}>
                  <span style={{ fontSize: 22 }}>{exp.icon}</span>
                  <div>
                    <p style={S.statLabel}>Level</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginTop: 2 }}>{exp.label}</p>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {/* No intro state */}
        {!intro && !loadingIntro && (
          <Card style={{ textAlign: "center", padding: "2rem 1.5rem", marginBottom: 10 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>📋</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>Profile incomplete</p>
            <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, marginBottom: "1.25rem" }}>
              Complete your fitness profile to unlock body stats and training insights.
            </p>
            <button style={S.ctaBtn} onClick={() => router.push("/v1/StartersIntro")}>
              Complete setup →
            </button>
          </Card>
        )}

        {/* ── Account ── */}
        <SectionLabel>Account</SectionLabel>
        <Card style={{ padding: 0, overflow: "hidden", marginBottom: 10 }}>
          <button style={S.menuRow} onClick={() => intro && setShowEdit(true)}>
            <span style={S.menuIcon}>✏️</span>
            <span style={S.menuLabel}>Edit fitness profile</span>
            <span style={S.menuChevron}>›</span>
          </button>
          <div style={S.menuDivider} />
          <button
            style={{ ...S.menuRow, opacity: signingOut ? 0.5 : 1 }}
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <span style={S.menuIcon}>🚪</span>
            <span style={{ ...S.menuLabel, color: "#ef4444" }}>
              {signingOut ? "Signing out…" : "Sign out"}
            </span>
            <span style={S.menuChevron}>›</span>
          </button>
        </Card>

        <p style={S.version}>APEX · v1.0</p>
      </main>

      {showEdit && intro && (
        <EditSheet
          intro={intro}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setIntro((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </div>
  );
}

// ── Global styles ─────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; margin: 0; padding: 0; }
  html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { display: none; }
  button { cursor: pointer; }
`;

// ── Styles ────────────────────────────────────────────────────────────────────
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
  spinner: {
    width: 22, height: 22, borderRadius: "50%",
    border: "2px solid #e8e5de", borderTopColor: "#1a1a1a",
    animation: "spin 0.7s linear infinite",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1.2rem 1.25rem 0.8rem",
    position: "sticky", top: 0, zIndex: 10,
    background: "rgba(250,250,248,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(232,229,222,0.5)",
  },
  backBtn: {
    width: 36, height: 36, border: "1px solid #e8e5de",
    background: "#fff", borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, color: "#1a1a1a", lineHeight: 1,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  headerTitle: {
    fontSize: 16, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em",
  },
  main: {
    padding: "1rem 1.25rem 2.5rem",
    flex: 1,
  },
  heroName: {
    fontSize: 18, fontWeight: 800, color: "#1a1a1a",
    letterSpacing: "-0.04em", lineHeight: 1.1,
  },
  heroEmail: {
    fontSize: 12, color: "#aaa", marginTop: 2, fontWeight: 400,
  },
  heroPills: { display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" },
  pill: {
    fontSize: 11, padding: "3px 9px", borderRadius: 99,
    background: "#f4f2ed", border: "1px solid #e8e5de",
    color: "#666", fontWeight: 500, textTransform: "capitalize",
  },
  statIcon: { fontSize: 18, display: "block", marginBottom: 6 },
  statValue: {
    fontSize: 22, fontWeight: 800, color: "#1a1a1a",
    letterSpacing: "-0.04em", lineHeight: 1,
  },
  statUnit: { fontSize: 11, fontWeight: 400, color: "#aaa" },
  statLabel: {
    fontSize: 11, fontWeight: 700, color: "#aaa",
    letterSpacing: "0.08em", textTransform: "uppercase",
  },
  ctaBtn: {
    width: "100%", padding: "0.85rem",
    background: "#1a1a1a", color: "#fafaf8",
    border: "none", borderRadius: 14,
    fontSize: 14, fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: "0.01em",
  },
  menuRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 12,
    padding: "1rem 1.25rem", background: "none", border: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "left",
  },
  menuIcon: { fontSize: 16, flexShrink: 0 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: 500, color: "#1a1a1a" },
  menuChevron: { fontSize: 18, color: "#ddd", fontWeight: 300 },
  menuDivider: { height: 1, background: "#e8e5de", margin: "0 1.25rem" },
  version: {
    textAlign: "center", fontSize: 10, color: "#ccc",
    fontWeight: 500, marginTop: 24, letterSpacing: "0.1em",
  },
};