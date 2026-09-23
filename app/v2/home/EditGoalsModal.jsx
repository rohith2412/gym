"use client";

import { useState } from "react";

/**
 * PATCHes the real /api/nutrition-goals endpoint (customCalories/
 * customProtein/etc overrides on the UserIntro doc). GET on that same
 * endpoint 404s until a UserIntro record exists (onboarding hasn't
 * been ported to v2 yet), so this modal seeds its fields from whatever
 * goals are already showing on screen rather than re-fetching.
 */
export function EditGoalsModal({ goals, onClose, onSaved }) {
  const [calories, setCalories] = useState(String(Math.round(goals.calories)));
  const [protein, setProtein] = useState(String(Math.round(goals.protein)));
  const [carbs, setCarbs] = useState(String(Math.round(goals.carbs)));
  const [fat, setFat] = useState(String(Math.round(goals.fat)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/nutrition-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: Number(calories) || goals.calories,
          protein: Number(protein) || goals.protein,
          carbs: Number(carbs) || goals.carbs,
          fat: Number(fat) || goals.fat,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Couldn't save");
        setSaving(false);
        return;
      }
      onSaved({
        calories: Number(calories) || goals.calories,
        protein: Number(protein) || goals.protein,
        carbs: Number(carbs) || goals.carbs,
        fat: Number(fat) || goals.fat,
      });
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-3 text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 outline-none focus:border-black dark:focus:border-white transition-colors";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-sm bg-white dark:bg-black text-black dark:text-white p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-sm text-neutral-500">
            Cancel
          </button>
          <p className="text-sm font-bold">Edit goals</p>
          <button onClick={save} disabled={saving} className="text-sm font-bold disabled:opacity-30">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Calories" value={calories} onChange={setCalories} className={inputClass} />
          <Field label="Protein (g)" value={protein} onChange={setProtein} className={inputClass} />
          <Field label="Carbs (g)" value={carbs} onChange={setCarbs} className={inputClass} />
          <Field label="Fat (g)" value={fat} onChange={setFat} className={inputClass} />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, className }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">{label}</span>
      <input
        className={className}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
