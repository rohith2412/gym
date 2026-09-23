"use client";

import { useState } from "react";

const GOALS = [
  { value: "lose fat", label: "Lose fat", sub: "Calorie deficit, higher protein" },
  { value: "gain muscle", label: "Gain muscle", sub: "Slight surplus, high protein" },
  { value: "maintain", label: "Maintain", sub: "Stay where you are" },
];

/**
 * Lets a user revisit the same three onboarding answers
 * (app/v2/onboarding/page.jsx) later from Profile -- same PATCH
 * /api/user-intro endpoint, so editing here immediately changes the
 * calorie/macro targets calculateCalories() produces on /v2/home
 * (weight and goal both feed directly into that formula).
 */
export function EditBodyModal({ intro, onClose, onSaved }) {
  const [weight, setWeight] = useState(intro?.weight != null ? String(intro.weight) : "");
  const [height, setHeight] = useState(intro?.height != null ? String(intro.height) : "");
  const [goal, setGoal] = useState(intro?.fitnessGoal || "maintain");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = Number(weight) > 0 && Number(height) > 0 && !!goal;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user-intro", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: Number(weight),
          height: Number(height),
          fitnessGoal: goal,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Couldn't save");
        setSaving(false);
        return;
      }
      onSaved(json.data);
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-3 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-sm bg-white dark:bg-black text-black dark:text-white p-6 max-h-[85vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-sm text-neutral-500">
            Cancel
          </button>
          <p className="text-sm font-bold">Body &amp; goal</p>
          <button onClick={save} disabled={!canSave || saving} className="text-sm font-bold disabled:opacity-30">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Weight (kg)</span>
            <input
              className={inputClass}
              inputMode="numeric"
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Height (cm)</span>
            <input
              className={inputClass}
              inputMode="numeric"
              value={height}
              onChange={(e) => setHeight(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </label>
        </div>

        <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-2">Goal</p>
        <div className="flex flex-col gap-2 mb-4">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`w-full text-left px-4 py-3 rounded-2xl border transition-colors ${
                goal === g.value
                  ? "border-black dark:border-white bg-black dark:bg-white"
                  : "border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white"
              }`}
            >
              <p className={`text-sm font-bold ${goal === g.value ? "text-white dark:text-black" : ""}`}>
                {g.label}
              </p>
              <p className={`text-xs mt-0.5 ${goal === g.value ? "text-white/70 dark:text-black/60" : "text-neutral-500"}`}>
                {g.sub}
              </p>
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
