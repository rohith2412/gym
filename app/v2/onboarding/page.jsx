"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

/**
 * v2's onboarding, run once right after sign-in (see the redirect check
 * in app/v2/home/page.jsx, which sends anyone without a UserIntro doc
 * here before showing the dashboard). Same questions and order as the
 * production app's live flow (gym-ios/src/features/onboarding/
 * RegionIntroScreen.tsx's "source" step + NutritionIntroSheet.tsx's
 * weight/height/age/goal steps) -- minus the country/region step, which
 * only affects currency/units elsewhere in the app and isn't needed
 * here.
 *
 * Persists to the same backend the mobile app uses:
 *   - POST /api/user-source  { source }            (best-effort)
 *   - PATCH /api/user-intro  { weight, height, age, fitnessGoal }
 * PATCH is what actually creates the UserIntro doc that /api/
 * nutrition-goals' calculateCalories() (Mifflin-St Jeor) reads to
 * arrange calorie/protein/carb/fat targets -- nothing extra to compute
 * here, the existing endpoint already does it the moment this doc
 * exists.
 */

const SOURCES = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "app_store", label: "App Store search" },
  { value: "google", label: "Google search" },
  { value: "friend", label: "Friend or family" },
  { value: "reddit", label: "Reddit" },
  { value: "twitter", label: "X / Twitter" },
  { value: "news", label: "News article or blog" },
  { value: "other", label: "Other" },
];

const GOALS = [
  { value: "lose fat", label: "Lose fat", sub: "Calorie deficit, higher protein" },
  { value: "gain muscle", label: "Gain muscle", sub: "Slight surplus, high protein" },
  { value: "maintain", label: "Maintain", sub: "Stay where you are" },
];

const STEPS = ["source", "weight", "height", "age", "goal"];

export default function OnboardingV2() {
  const { status } = useSession();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [source, setSource] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/v2/login");
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") return null;

  const step = STEPS[stepIndex];

  const canContinue =
    (step === "source" && !!source) ||
    (step === "weight" && Number(weight) > 0) ||
    (step === "height" && Number(height) > 0) ||
    (step === "age" && Number(age) >= 10 && Number(age) < 120) ||
    (step === "goal" && !!goal);

  const goNext = async () => {
    if (!canContinue) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    setSaving(true);
    setError("");
    fetch("/api/user-source", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    }).catch(() => {});
    try {
      const res = await fetch("/api/user-intro", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: Number(weight),
          height: Number(height),
          age: Number(age),
          fitnessGoal: goal,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Couldn't save. Try again.");
        setSaving(false);
        return;
      }
      router.replace("/v2/home");
    } catch {
      setError("Something went wrong. Try again.");
      setSaving(false);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col px-6 pt-6 pb-8 transition-colors">
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goBack}
            className={`flex items-center gap-1 text-sm text-neutral-500 ${stepIndex === 0 ? "invisible" : ""}`}
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === stepIndex ? 20 : 6,
                  backgroundColor: i <= stepIndex ? "currentColor" : "transparent",
                  border: i > stepIndex ? "1px solid currentColor" : "none",
                  opacity: i <= stepIndex ? 1 : 0.25,
                }}
              />
            ))}
          </div>
          <div className="w-12" />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {step === "source" && (
            <StepShell title="How did you hear about us?" caption="Helps us know which channels people love — thanks!">
              <div className="flex flex-col gap-2">
                {SOURCES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSource(s.value)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border text-sm font-medium transition-colors ${
                      source === s.value
                        ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                        : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === "weight" && (
            <StepShell title="What's your current weight?" caption="We'll set your starting point on the weight chart.">
              <NumberInput value={weight} onChange={setWeight} unit="kg" maxLength={5} />
            </StepShell>
          )}

          {step === "height" && (
            <StepShell title="How tall are you?" caption="Height is used with your weight to calibrate calorie targets.">
              <NumberInput value={height} onChange={setHeight} unit="cm" maxLength={3} />
            </StepShell>
          )}

          {step === "age" && (
            <StepShell title="How old are you?" caption="Age affects your daily calorie burn.">
              <NumberInput value={age} onChange={setAge} unit="years" maxLength={3} />
            </StepShell>
          )}

          {step === "goal" && (
            <StepShell title="What's your goal?" caption="We'll set your macro split around this.">
              <div className="flex flex-col gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-colors ${
                      goal === g.value
                        ? "border-black dark:border-white bg-black dark:bg-white"
                        : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    <p
                      className={`text-base font-bold ${
                        goal === g.value ? "text-white dark:text-black" : "text-black dark:text-white"
                      }`}
                    >
                      {g.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        goal === g.value ? "text-white/70 dark:text-black/60" : "text-neutral-500"
                      }`}
                    >
                      {g.sub}
                    </p>
                  </button>
                ))}
              </div>
            </StepShell>
          )}
        </div>

        {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

        <button
          onClick={goNext}
          disabled={!canContinue || saving}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-full text-lg font-semibold disabled:opacity-30 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          {saving ? "Setting up…" : stepIndex === STEPS.length - 1 ? "Finish" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function StepShell({ title, caption, children }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1.5">{title}</h1>
      <p className="text-sm text-neutral-500 mb-8">{caption}</p>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, unit, maxLength }) {
  return (
    <div className="flex items-baseline justify-center gap-2 py-6">
      <input
        autoFocus
        type="text"
        inputMode="numeric"
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="0"
        className="w-40 bg-transparent text-center text-6xl font-extrabold tracking-tight outline-none placeholder-neutral-300 dark:placeholder-neutral-700"
      />
      <span className="text-lg font-semibold text-neutral-400">{unit}</span>
    </div>
  );
}
