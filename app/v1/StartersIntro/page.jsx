"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const TOTAL_STEPS = 7;

const stepProgress = [14, 28, 42, 57, 71, 85, 100];

export default function IntroPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    age: 25,
    height: 170,
    weight: 70,
    gender: "",
    fitnessGoal: "",
    experienceLevel: "",
    workoutDaysPerWeek: 0,
  });
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (session?.user?.hasIntro) {
      router.replace("/v1/dashboard");
    }
  }, [status, session, router]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const toggleDay = (i) => {
    const updated = selectedDays.includes(i)
      ? selectedDays.filter((d) => d !== i)
      : [...selectedDays, i];
    setSelectedDays(updated);
    set("workoutDaysPerWeek", updated.length);
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        await update(); // refresh session so hasIntro becomes true
        setTimeout(() => router.push("/v1/dashboard"), 2000);
      } else {
        alert("Something went wrong: " + data.error);
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || session?.user?.hasIntro) {
    return null;
  }

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const summaryLabels = {
    gender: { male: "♂ Male", female: "♀ Female", other: "◎ Other" },
    fitnessGoal: {
      "lose fat": "🔥 Lose fat",
      "gain muscle": "💪 Gain muscle",
      strength: "🏋️ Strength",
    },
    experienceLevel: {
      beginner: "🌱 Beginner",
      intermediate: "⚡ Intermediate",
      advanced: "🎯 Advanced",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${stepProgress[step - 1]}%`,
            }}
          />
        </div>

        {/* Done screen */}
        {done ? (
          <div style={styles.doneWrap}>
            <div style={styles.doneIcon}>✓</div>
            <h2 style={styles.doneTitle}>All set!</h2>
            <p style={styles.doneSub}>Redirecting to your dashboard…</p>
            <div style={styles.chips}>
              {[
                summaryLabels.gender[form.gender],
                `${form.age} yrs`,
                `${form.height} cm`,
                `${form.weight} kg`,
                summaryLabels.fitnessGoal[form.fitnessGoal],
                summaryLabels.experienceLevel[form.experienceLevel],
                `${form.workoutDaysPerWeek}×/week`,
              ].map((label, i) => (
                <span key={i} style={styles.chip}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Gender */}
            {step === 1 && (
              <div style={styles.stepWrap}>
                <p style={styles.stepLabel}>Step 1 of {TOTAL_STEPS}</p>
                <h1 style={styles.question}>What's your biological sex?</h1>
                <div style={styles.optionGrid}>
                  {[
                    { val: "male", icon: "♂", label: "Male" },
                    { val: "female", icon: "♀", label: "Female" },
                    { val: "other", icon: "◎", label: "Other" },
                  ].map((o) => (
                    <button
                      key={o.val}
                      style={{
                        ...styles.optionBtn,
                        ...(form.gender === o.val ? styles.optionSelected : {}),
                      }}
                      onClick={() => set("gender", o.val)}
                    >
                      <span style={styles.optionIcon}>{o.icon}</span>
                      <span style={styles.optionLabel}>{o.label}</span>
                    </button>
                  ))}
                </div>
                <div style={styles.navRow}>
                  <div />
                  <button
                    style={{
                      ...styles.btnNext,
                      ...(form.gender ? {} : styles.btnDisabled),
                    }}
                    disabled={!form.gender}
                    onClick={next}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Age */}
            {step === 2 && (
              <div style={styles.stepWrap}>
                <p style={styles.stepLabel}>Step 2 of {TOTAL_STEPS}</p>
                <h1 style={styles.question}>How old are you?</h1>
                <div style={styles.numRow}>
                  <div>
                    <div style={styles.bigNumber}>{form.age}</div>
                    <span style={styles.numUnit}>years old</span>
                  </div>
                  <div style={styles.stepperCol}>
                    <button
                      style={styles.stepperBtn}
                      onClick={() => set("age", Math.min(99, form.age + 1))}
                    >
                      +
                    </button>
                    <button
                      style={styles.stepperBtn}
                      onClick={() => set("age", Math.max(10, form.age - 1))}
                    >
                      −
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={99}
                  value={form.age}
                  style={styles.slider}
                  onChange={(e) => set("age", parseInt(e.target.value))}
                />
                <div style={styles.rangeLabels}>
                  <span>10</span>
                  <span>99</span>
                </div>
                <div style={styles.navRow}>
                  <button style={styles.btnBack} onClick={back}>
                    Back
                  </button>
                  <button style={styles.btnNext} onClick={next}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Height */}
            {step === 3 && (
              <div style={styles.stepWrap}>
                <p style={styles.stepLabel}>Step 3 of {TOTAL_STEPS}</p>
                <h1 style={styles.question}>How tall are you?</h1>
                <div style={styles.numRow}>
                  <div>
                    <div style={styles.bigNumber}>{form.height}</div>
                    <span style={styles.numUnit}>centimeters</span>
                  </div>
                  <div style={styles.stepperCol}>
                    <button
                      style={styles.stepperBtn}
                      onClick={() =>
                        set("height", Math.min(250, form.height + 1))
                      }
                    >
                      +
                    </button>
                    <button
                      style={styles.stepperBtn}
                      onClick={() =>
                        set("height", Math.max(100, form.height - 1))
                      }
                    >
                      −
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={100}
                  max={250}
                  value={form.height}
                  style={styles.slider}
                  onChange={(e) => set("height", parseInt(e.target.value))}
                />
                <div style={styles.rangeLabels}>
                  <span>100 cm</span>
                  <span>250 cm</span>
                </div>
                <div style={styles.navRow}>
                  <button style={styles.btnBack} onClick={back}>
                    Back
                  </button>
                  <button style={styles.btnNext} onClick={next}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Weight */}
            {step === 4 && (
              <div style={styles.stepWrap}>
                <p style={styles.stepLabel}>Step 4 of {TOTAL_STEPS}</p>
                <h1 style={styles.question}>What's your current weight?</h1>
                <div style={styles.numRow}>
                  <div>
                    <div style={styles.bigNumber}>{form.weight}</div>
                    <span style={styles.numUnit}>kilograms</span>
                  </div>
                  <div style={styles.stepperCol}>
                    <button
                      style={styles.stepperBtn}
                      onClick={() =>
                        set("weight", Math.min(200, form.weight + 1))
                      }
                    >
                      +
                    </button>
                    <button
                      style={styles.stepperBtn}
                      onClick={() =>
                        set("weight", Math.max(30, form.weight - 1))
                      }
                    >
                      −
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={30}
                  max={200}
                  value={form.weight}
                  style={styles.slider}
                  onChange={(e) => set("weight", parseInt(e.target.value))}
                />
                <div style={styles.rangeLabels}>
                  <span>30 kg</span>
                  <span>200 kg</span>
                </div>
                <div style={styles.navRow}>
                  <button style={styles.btnBack} onClick={back}>
                    Back
                  </button>
                  <button style={styles.btnNext} onClick={next}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Fitness Goal */}
            {step === 5 && (
              <div style={styles.stepWrap}>
                <p style={styles.stepLabel}>Step 5 of {TOTAL_STEPS}</p>
                <h1 style={styles.question}>What's your main goal?</h1>
                <div style={styles.optionGrid}>
                  {[
                    {
                      val: "lose fat",
                      icon: "🔥",
                      label: "Lose fat",
                      sub: "Burn calories, slim down",
                    },
                    {
                      val: "gain muscle",
                      icon: "💪",
                      label: "Gain muscle",
                      sub: "Build mass and size",
                    },
                    {
                      val: "strength",
                      icon: "🏋️",
                      label: "Strength",
                      sub: "Lift heavier, get stronger",
                    },
                  ].map((o) => (
                    <button
                      key={o.val}
                      style={{
                        ...styles.optionBtn,
                        ...(form.fitnessGoal === o.val
                          ? styles.optionSelected
                          : {}),
                      }}
                      onClick={() => set("fitnessGoal", o.val)}
                    >
                      <span style={styles.optionIcon}>{o.icon}</span>
                      <span style={styles.optionLabel}>{o.label}</span>
                      <span style={styles.optionSub}>{o.sub}</span>
                    </button>
                  ))}
                </div>
                <div style={styles.navRow}>
                  <button style={styles.btnBack} onClick={back}>
                    Back
                  </button>
                  <button
                    style={{
                      ...styles.btnNext,
                      ...(form.fitnessGoal ? {} : styles.btnDisabled),
                    }}
                    disabled={!form.fitnessGoal}
                    onClick={next}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Experience */}
            {step === 6 && (
              <div style={styles.stepWrap}>
                <p style={styles.stepLabel}>Step 6 of {TOTAL_STEPS}</p>
                <h1 style={styles.question}>What's your experience level?</h1>
                <div style={styles.optionGrid}>
                  {[
                    {
                      val: "beginner",
                      icon: "🌱",
                      label: "Beginner",
                      sub: "Under 1 year",
                    },
                    {
                      val: "intermediate",
                      icon: "⚡",
                      label: "Intermediate",
                      sub: "1–3 years",
                    },
                    {
                      val: "advanced",
                      icon: "🎯",
                      label: "Advanced",
                      sub: "3+ years",
                    },
                  ].map((o) => (
                    <button
                      key={o.val}
                      style={{
                        ...styles.optionBtn,
                        ...(form.experienceLevel === o.val
                          ? styles.optionSelected
                          : {}),
                      }}
                      onClick={() => set("experienceLevel", o.val)}
                    >
                      <span style={styles.optionIcon}>{o.icon}</span>
                      <span style={styles.optionLabel}>{o.label}</span>
                      <span style={styles.optionSub}>{o.sub}</span>
                    </button>
                  ))}
                </div>
                <div style={styles.navRow}>
                  <button style={styles.btnBack} onClick={back}>
                    Back
                  </button>
                  <button
                    style={{
                      ...styles.btnNext,
                      ...(form.experienceLevel ? {} : styles.btnDisabled),
                    }}
                    disabled={!form.experienceLevel}
                    onClick={next}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Workout Days */}
            {step === 7 && (
              <div style={styles.stepWrap}>
                <p style={styles.stepLabel}>Step 7 of {TOTAL_STEPS}</p>
                <h1 style={styles.question}>
                  How many days per week can you train?
                </h1>
                <div style={styles.daysGrid}>
                  {dayLabels.map((d, i) => (
                    <button
                      key={i}
                      style={{
                        ...styles.dayBtn,
                        ...(selectedDays.includes(i) ? styles.daySelected : {}),
                      }}
                      onClick={() => toggleDay(i)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p style={styles.daysHint}>
                  {selectedDays.length > 0
                    ? `${selectedDays.length} day${selectedDays.length > 1 ? "s" : ""} selected`
                    : "Tap to select your training days"}
                </p>
                <div style={styles.navRow}>
                  <button style={styles.btnBack} onClick={back}>
                    Back
                  </button>
                  <button
                    style={{
                      ...styles.btnNext,
                      ...(selectedDays.length === 0 ? styles.btnDisabled : {}),
                      ...(loading ? styles.btnDisabled : {}),
                    }}
                    disabled={selectedDays.length === 0 || loading}
                    onClick={submit}
                  >
                    {loading ? "Saving…" : "Let's go →"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f4f0",
    padding: "1rem",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: 20,
    padding: "2rem 1.75rem",
    width: "100%",
    maxWidth: 440,
    minHeight: 520,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 24px rgba(0,0,0,0.07)",
  },
  progressTrack: {
    height: 2,
    background: "#e8e6e0",
    borderRadius: 99,
    marginBottom: "2rem",
  },
  progressFill: {
    height: "100%",
    background: "#1a1a1a",
    borderRadius: 99,
    transition: "width 0.45s cubic-bezier(.77,0,.18,1)",
  },
  stepWrap: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    animation: "fadeUp 0.35s ease",
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#999",
    marginBottom: 8,
  },
  question: {
    fontSize: "clamp(1.4rem, 5vw, 1.9rem)",
    fontWeight: 700,
    color: "#1a1a1a",
    lineHeight: 1.2,
    marginBottom: "1.75rem",
    letterSpacing: "-0.02em",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 10,
    flex: 1,
  },
  optionBtn: {
    background: "#f7f6f2",
    border: "1.5px solid #e8e6e0",
    borderRadius: 14,
    padding: "1rem 0.8rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
    textAlign: "left",
    transition: "all 0.15s ease",
  },
  optionSelected: {
    border: "1.5px solid #1a1a1a",
    background: "#ffffff",
    boxShadow: "0 0 0 1px #1a1a1a",
  },
  optionIcon: { fontSize: 20 },
  optionLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#1a1a1a",
    display: "block",
  },
  optionSub: {
    fontSize: 11,
    color: "#999",
    display: "block",
  },
  numRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: "0.5rem",
  },
  bigNumber: {
    fontSize: "3.5rem",
    fontWeight: 800,
    color: "#1a1a1a",
    lineHeight: 1,
    letterSpacing: "-0.03em",
  },
  numUnit: {
    fontSize: "0.9rem",
    color: "#999",
    marginTop: 6,
    display: "block",
  },
  stepperCol: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1.5px solid #e8e6e0",
    background: "#f7f6f2",
    cursor: "pointer",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1a1a1a",
    fontWeight: 300,
    lineHeight: 1,
  },
  slider: {
    width: "100%",
    margin: "1rem 0 0.25rem",
    accentColor: "#1a1a1a",
    cursor: "pointer",
  },
  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#aaa",
    marginBottom: "0.25rem",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 8,
    margin: "0.5rem 0 1rem",
  },
  dayBtn: {
    border: "1.5px solid #e8e6e0",
    background: "#f7f6f2",
    borderRadius: 10,
    padding: "0.75rem 0.25rem",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    color: "#999",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  daySelected: {
    background: "#1a1a1a",
    color: "#ffffff",
    borderColor: "#1a1a1a",
  },
  daysHint: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: "0.5rem",
  },
  navRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "1.5rem",
    gap: 10,
  },
  btnBack: {
    background: "none",
    border: "1.5px solid #e8e6e0",
    borderRadius: 10,
    padding: "0.65rem 1.1rem",
    fontSize: 14,
    color: "#999",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnNext: {
    background: "#1a1a1a",
    color: "#ffffff",
    border: "none",
    borderRadius: 10,
    padding: "0.7rem 1.6rem",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    flex: 1,
    maxWidth: 200,
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  btnDisabled: {
    opacity: 0.3,
    cursor: "not-allowed",
  },
  doneWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    textAlign: "center",
    gap: "0.75rem",
  },
  doneIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#f7f6f2",
    border: "1.5px solid #e8e6e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: "1.7rem",
    fontWeight: 700,
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },
  doneSub: {
    fontSize: 14,
    color: "#aaa",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 8,
  },
  chip: {
    fontSize: 12,
    padding: "4px 12px",
    borderRadius: 99,
    background: "#f7f6f2",
    border: "1px solid #e8e6e0",
    color: "#666",
  },
};