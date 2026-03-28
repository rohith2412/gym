"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
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
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", border: "2px solid #f0f0f0", display: "block",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#111", color: "#fff", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 600, letterSpacing: "-0.02em",
      fontFamily: "'DM Serif Display', serif",
    }}>
      {initials}
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function Tile({ label, value, unit, accent }) {
  return (
    <div style={s.tile}>
      <span style={s.tileLabel}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
        <span style={{ ...s.tileValue, ...(accent ? { color: accent } : {}) }}>
          {value}
        </span>
        {unit && <span style={s.tileUnit}>{unit}</span>}
      </div>
    </div>
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
    background: "#fff", borderRadius: "20px 20px 0 0",
    maxHeight: "90vh", display: "flex", flexDirection: "column",
    animation: "slideUp 0.28s cubic-bezier(.32,1.2,.64,1)",
  },
  handle: {
    width: 36, height: 4, background: "#e5e7eb",
    borderRadius: 99, margin: "12px auto 0", flexShrink: 0,
  },
  head: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px 12px", borderBottom: "1px solid #f0f0f0", flexShrink: 0,
  },
  headTitle: { fontSize: 17, fontWeight: 400, color: "#111", fontFamily: "'DM Serif Display', serif" },
  closeBtn: { border: "none", background: "none", fontSize: 14, color: "#bbb", cursor: "pointer", fontFamily: "inherit", padding: "4px 8px" },
  body: { overflowY: "auto", padding: "18px 20px 48px", display: "flex", flexDirection: "column", gap: 22 },
  group: { display: "flex", flexDirection: "column", gap: 8 },
  groupTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  groupLabel: { fontSize: 10, fontWeight: 400, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase" },
  groupVal: { fontSize: 15, fontWeight: 600, color: "#111" },
  slider: { width: "100%", accentColor: "#111", cursor: "pointer" },
  rangeRow: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#ccc" },
  chips: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    display: "flex", alignItems: "center", padding: "8px 14px",
    borderRadius: 99, border: "1.5px solid #eee", background: "#fafafa",
    fontSize: 13, fontWeight: 400, color: "#555", cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.12s",
  },
  chipActive: { background: "#111", borderColor: "#111", color: "#fff" },
  daysRow: { display: "flex", gap: 7 },
  dayBtn: {
    flex: 1, padding: "9px 0", border: "1.5px solid #eee",
    borderRadius: 10, background: "#fafafa", fontSize: 13, fontWeight: 500,
    color: "#aaa", cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
  },
  dayBtnActive: { background: "#111", borderColor: "#111", color: "#fff" },
  saveBtn: {
    background: "#111", color: "#fff", border: "none", borderRadius: 12,
    padding: "14px", fontSize: 15, fontWeight: 500, cursor: "pointer",
    fontFamily: "inherit", marginTop: 4,
  },
  saveBtnOff: { opacity: 0.35, cursor: "not-allowed" },
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [intro, setIntro]             = useState(null);
  const [loadingIntro, setLoadingIntro] = useState(true);
  const [workoutStats, setWorkoutStats] = useState({ sessions: 0, totalVol: 0, topExercise: "—" });
  const [showEdit, setShowEdit]       = useState(false);
  const [signingOut, setSigningOut]   = useState(false);

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  // Fetch intro
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/user-intro")
      .then((r) => r.json())
      .then((d) => { if (d.success) setIntro(d.data); })
      .catch(() => {})
      .finally(() => setLoadingIntro(false));
  }, [session?.user?.id]);

  // Fetch workout stats from existing tracking API
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
        // Most-logged exercise
        const freq = {};
        logs.forEach((log) =>
          log.exercises.forEach((ex) => { freq[ex.name] = (freq[ex.name] || 0) + 1; })
        );
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
        // Most-trained muscle group
        const mgFreq = {};
        logs.forEach((log) =>
          log.exercises.forEach((ex) => {
            if (ex.muscleGroup) mgFreq[ex.muscleGroup] = (mgFreq[ex.muscleGroup] || 0) + 1;
          })
        );
        const topMg = Object.entries(mgFreq).sort((a, b) => b[1] - a[1])[0];
        setWorkoutStats({
          sessions,
          totalVol,
          topExercise: top ? top[0] : "—",
          topMuscle: topMg ? topMg[0] : "—",
        });
      })
      .catch(() => {});
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  // Loading state
  if (status === "loading" || loadingIntro) {
    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <div style={s.root}>
          <div style={s.phone}>
            <div style={s.loadWrap}>
              <div style={s.loadSpinner} />
            </div>
          </div>
        </div>
      </>
    );
  }

  const user = session?.user;
  const bmiVal = intro ? calcBmi(intro.weight, intro.height) : null;
  const bmiInfo = bmiVal ? bmiCategory(bmiVal) : null;
  const goal = intro?.fitnessGoal ? GOAL_MAP[intro.fitnessGoal] : null;
  const exp  = intro?.experienceLevel ? EXP_MAP[intro.experienceLevel] : null;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div style={s.root}>
        <div style={s.phone}>

          {/* ── Sticky header ── */}
          <div style={s.header}>
            <button style={s.backBtn} onClick={() => router.back()}>←</button>
            <span style={s.headerTitle}>Profile</span>
            <button
              style={s.editHeaderBtn}
              onClick={() => intro && setShowEdit(true)}
            >
              Edit
            </button>
          </div>

          <div style={s.scroll}>

            {/* ── Hero ── */}
            <div style={s.hero}>
              <Avatar
                src={user?.photo || user?.image}
                name={user?.name}
                size={68}
              />
              <div style={s.heroRight}>
                <h1 style={s.heroName}>{user?.name ?? "Athlete"}</h1>
                <p style={s.heroEmail}>{user?.email}</p>
                <div style={s.heroPills}>
                  {intro?.gender && (
                    <span style={s.pill}>
                      {intro.gender === "male" ? "♂" : intro.gender === "female" ? "♀" : "◎"}
                      {" "}{intro.gender}
                    </span>
                  )}
                  {intro?.age && <span style={s.pill}>{intro.age} yrs</span>}
                  {intro?.workoutDaysPerWeek > 0 && (
                    <span style={s.pill}>{intro.workoutDaysPerWeek}×/wk</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Activity stats ── */}
            <div style={s.section}>
              <p style={s.sectionLabel}>Activity</p>
              <div style={s.tileRow}>
                <Tile label="Sessions" value={workoutStats.sessions} />
                <Tile
                  label="Total volume"
                  value={workoutStats.totalVol >= 1000
                    ? (workoutStats.totalVol / 1000).toFixed(1) + "k"
                    : workoutStats.totalVol}
                  unit="lbs"
                />
              </div>
              <div style={s.wideTile}>
                <span style={s.tileLabel}>Top exercise</span>
                <span style={{ ...s.tileValue, fontSize: 16, marginTop: 5, display: "block" }}>
                  {workoutStats.topExercise}
                </span>
              </div>
              {workoutStats.topMuscle && workoutStats.topMuscle !== "—" && (
                <div style={s.wideTile}>
                  <span style={s.tileLabel}>Most trained</span>
                  <span style={{ ...s.tileValue, fontSize: 16, marginTop: 5, display: "block" }}>
                    {workoutStats.topMuscle}
                  </span>
                </div>
              )}
            </div>

            {/* ── Body stats ── */}
            {intro && (
              <div style={s.section}>
                <p style={s.sectionLabel}>Body</p>
                <div style={s.tileRow}>
                  <Tile label="Height" value={intro.height} unit="cm" />
                  <Tile label="Weight" value={intro.weight} unit="kg" />
                </div>

                {bmiVal && bmiInfo && (
                  <div style={s.wideTile}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={s.tileLabel}>BMI</span>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "2px 9px",
                        borderRadius: 99,
                        background: bmiInfo.color + "20",
                        color: bmiInfo.color,
                      }}>
                        {bmiInfo.label}
                      </span>
                    </div>
                    <span style={{ ...s.tileValue, marginTop: 4, display: "block" }}>
                      {bmiVal}
                    </span>
                    {/* BMI bar */}
                    <div style={s.bmiBar}>
                      {[
                        { w: 22, color: "#93c5fd" },  // < 18.5 (underweight)
                        { w: 40, color: "#86efac" },  // 18.5-25 (healthy)
                        { w: 22, color: "#fcd34d" },  // 25-30 (overweight)
                        { w: 16, color: "#fca5a5" },  // > 30 (obese)
                      ].map((seg, i) => (
                        <div key={i} style={{ flex: seg.w, height: "100%", background: seg.color, opacity: 0.5 }} />
                      ))}
                      <div style={{
                        position: "absolute",
                        left: `${Math.min(96, Math.max(2, ((parseFloat(bmiVal) - 10) / 30) * 100))}%`,
                        top: "50%", transform: "translate(-50%, -50%)",
                        width: 12, height: 12, borderRadius: "50%",
                        background: bmiInfo.color,
                        border: "2px solid #fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        transition: "left 0.4s ease",
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#ccc", marginTop: 4 }}>
                      <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Training profile ── */}
            {intro && (goal || exp) && (
              <div style={s.section}>
                <p style={s.sectionLabel}>Training</p>
                <div style={s.badgeRow}>
                  {goal && (
                    <div style={s.badge}>
                      <span style={s.badgeIcon}>{goal.icon}</span>
                      <span style={s.badgeLabel}>{goal.label}</span>
                    </div>
                  )}
                  {exp && (
                    <div style={s.badge}>
                      <span style={s.badgeIcon}>{exp.icon}</span>
                      <span style={s.badgeLabel}>{exp.label}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No intro state */}
            {!intro && !loadingIntro && (
              <div style={s.section}>
                <div style={s.emptyCard}>
                  <p style={s.emptyText}>Complete your fitness profile to unlock body stats and training insights.</p>
                  <button style={s.emptyBtn} onClick={() => router.push("/v1/StartersIntro")}>
                    Complete setup →
                  </button>
                </div>
              </div>
            )}

            {/* ── Account ── */}
            <div style={s.section}>
              <p style={s.sectionLabel}>Account</p>
              <div style={s.menuCard}>
                <button style={s.menuRow} onClick={() => intro && setShowEdit(true)}>
                  <span style={s.menuIcon}>✏️</span>
                  <span style={s.menuRowLabel}>Edit fitness profile</span>
                  <span style={s.menuChevron}>›</span>
                </button>
                <div style={s.menuDivider} />
                <button style={s.menuRow} onClick={() => router.push("/v1/tracking")}>
                  <span style={s.menuIcon}>📊</span>
                  <span style={s.menuRowLabel}>View progress</span>
                  <span style={s.menuChevron}>›</span>
                </button>
                <div style={s.menuDivider} />
                <button
                  style={{ ...s.menuRow, opacity: signingOut ? 0.5 : 1 }}
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <span style={s.menuIcon}>🚪</span>
                  <span style={{ ...s.menuRowLabel, color: "#ef4444" }}>
                    {signingOut ? "Signing out…" : "Sign out"}
                  </span>
                  <span style={s.menuChevron}>›</span>
                </button>
              </div>
            </div>

            <p style={s.versionText}>APEX · v1.0</p>
          </div>
        </div>
      </div>

      {showEdit && intro && (
        <EditSheet
          intro={intro}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setIntro((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </>
  );
}

// ── Global styles ─────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  body { margin: 0; background: #f5f5f4; }
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  ::-webkit-scrollbar { display: none; }
`;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  root: {
    minHeight: "100vh", background: "#f5f5f4",
    display: "flex", justifyContent: "center",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  phone: {
    width: "100%", maxWidth: 430, background: "#fff",
    minHeight: "100vh", display: "flex", flexDirection: "column",
  },
  loadWrap: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
  },
  loadSpinner: {
    width: 22, height: 22, borderRadius: "50%",
    border: "2px solid #f0f0f0", borderTopColor: "#111",
    animation: "spin 0.7s linear infinite",
  },

  // Header
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "52px 20px 14px",
    background: "#fff", borderBottom: "1px solid #f0f0f0",
    position: "sticky", top: 0, zIndex: 10,
  },
  backBtn: {
    border: "none", background: "none", fontSize: 20, color: "#111",
    cursor: "pointer", padding: "4px 8px 4px 0", fontFamily: "inherit", lineHeight: 1,
  },
  headerTitle: {
    fontSize: 17, fontWeight: 400, color: "#111",
    fontFamily: "'DM Serif Display', serif",
  },
  editHeaderBtn: {
    border: "none", background: "none", fontSize: 14, fontWeight: 500,
    color: "#111", cursor: "pointer", fontFamily: "inherit", padding: "4px 0 4px 8px",
  },

  scroll: { overflowY: "auto", paddingBottom: 48, animation: "fadeIn 0.3s ease" },

  // Hero card
  hero: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "22px 20px 18px", borderBottom: "1px solid #f5f5f5",
  },
  heroRight: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  heroName: {
    fontSize: 20, fontWeight: 400, color: "#111", margin: 0,
    letterSpacing: "-0.02em", fontFamily: "'DM Serif Display', serif",
  },
  heroEmail: { fontSize: 12, color: "#aaa", margin: 0, fontWeight: 300 },
  heroPills: { display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" },
  pill: {
    fontSize: 11, padding: "3px 9px", borderRadius: 99,
    background: "#f5f5f5", color: "#666", fontWeight: 400,
    textTransform: "capitalize",
  },

  // Sections
  section: { padding: "18px 16px 0", display: "flex", flexDirection: "column", gap: 10 },
  sectionLabel: {
    fontSize: 10, fontWeight: 400, color: "#bbb",
    letterSpacing: "0.12em", textTransform: "uppercase", margin: 0,
  },

  // Tiles
  tileRow: { display: "flex", gap: 10 },
  tile: {
    flex: 1, background: "#fafafa",
    border: "1.5px solid #f0f0f0", borderRadius: 14,
    padding: "14px 16px",
  },
  wideTile: {
    background: "#fafafa", border: "1.5px solid #f0f0f0",
    borderRadius: 14, padding: "14px 16px",
  },
  tileLabel: {
    fontSize: 10, fontWeight: 400, color: "#bbb",
    letterSpacing: "0.1em", textTransform: "uppercase",
  },
  tileValue: {
    fontSize: 28, fontWeight: 400, color: "#111",
    letterSpacing: "-0.03em", lineHeight: 1,
    fontFamily: "'DM Serif Display', serif",
  },
  tileUnit: { fontSize: 11, fontWeight: 300, color: "#aaa" },

  // BMI bar
  bmiBar: {
    display: "flex", height: 6, borderRadius: 99,
    overflow: "visible", position: "relative",
    marginTop: 10, gap: 2,
  },

  // Training badges
  badgeRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  badge: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 16px", background: "#fafafa",
    border: "1.5px solid #f0f0f0", borderRadius: 14,
  },
  badgeIcon: { fontSize: 18 },
  badgeLabel: { fontSize: 14, fontWeight: 500, color: "#111" },

  // Empty state
  emptyCard: {
    background: "#fafafa", border: "1.5px solid #f0f0f0",
    borderRadius: 14, padding: "22px 20px", textAlign: "center",
    display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#aaa", margin: 0, fontWeight: 300, lineHeight: 1.6 },
  emptyBtn: {
    background: "#111", color: "#fff", border: "none",
    borderRadius: 10, padding: "10px 20px", fontSize: 13,
    fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
  },

  // Menu card
  menuCard: {
    background: "#fafafa", border: "1.5px solid #f0f0f0",
    borderRadius: 14, overflow: "hidden",
  },
  menuRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 12,
    padding: "15px 16px", background: "none", border: "none",
    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
  },
  menuIcon: { fontSize: 16, flexShrink: 0 },
  menuRowLabel: { flex: 1, fontSize: 14, fontWeight: 400, color: "#111" },
  menuChevron: { fontSize: 16, color: "#ddd" },
  menuDivider: { height: 1, background: "#f0f0f0", margin: "0 16px" },

  versionText: {
    textAlign: "center", fontSize: 10, color: "#ddd",
    fontWeight: 300, marginTop: 28, letterSpacing: "0.1em",
    paddingBottom: 16,
  },
};