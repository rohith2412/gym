"use client";

import { useEffect, useState } from "react";
import { Plus, Undo2 } from "lucide-react";

/**
 * Port of gym-ios's WaterCard + WaterLogSheet, wired to the real
 * /api/water endpoint (day->ml map, add/set modes). The daily goal is
 * local-only here too, same as mobile -- it's never synced to the
 * server on either platform (see storage.ts: loadWaterGoal/
 * saveWaterGoal are AsyncStorage-only). Uses localStorage as the web
 * equivalent of that same local-only behavior.
 */

const WATER_GOAL_ML = 3000;
const BLUE_LIGHT = "#7DD3FC";
const BLUE_DARK = "#0284C7";
const GOAL_KEY = "v2-water-goal-ml";

function L(ml) {
  const liters = ml / 1000;
  return liters < 1 ? liters.toFixed(2) : liters.toFixed(1);
}

export function WaterCard({ c, day }) {
  const [water, setWater] = useState({});
  const [goalMl, setGoalMl] = useState(WATER_GOAL_ML);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(GOAL_KEY));
    if (stored > 0) setGoalMl(stored);
    fetch("/api/water")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setWater(json.data);
      })
      .catch(() => {});
  }, []);

  const ml = water[day] ?? 0;
  const pct = Math.min(1, ml / goalMl);

  const addWater = async (delta) => {
    const next = Math.max(0, ml + delta);
    setWater((w) => ({ ...w, [day]: next }));
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, ml: delta, mode: "add" }),
      });
      const json = await res.json();
      if (json?.success) setWater((w) => ({ ...w, [day]: json.data.ml }));
    } catch {}
  };

  const saveGoal = (nextMl) => {
    setGoalMl(nextMl);
    window.localStorage.setItem(GOAL_KEY, String(nextMl));
  };

  return (
    <>
      <button
        onClick={() => setShowLog(true)}
        style={{ backgroundColor: c.surfaceAlt }}
        className="w-full h-[70px] rounded-[18px] overflow-hidden relative"
      >
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
          style={{
            width: `${pct * 100}%`,
            background: `linear-gradient(180deg, ${BLUE_LIGHT}, ${BLUE_DARK})`,
          }}
        />
        <div className="absolute inset-0 flex items-center px-4">
          <div className="flex-1 text-left">
            <p className="text-xl font-extrabold tracking-tight" style={{ color: pct > 0.15 ? "#ffffff" : c.text }}>
              {L(ml)}
              <span
                className="text-xs font-semibold"
                style={{ color: pct > 0.15 ? "rgba(255,255,255,0.75)" : c.textMuted }}
              >
                {" "}L
              </span>
            </p>
            <p
              className="text-[10px] font-bold tracking-wide mt-0.5"
              style={{ color: pct > 0.15 ? "rgba(255,255,255,0.75)" : c.textMuted }}
            >
              {Math.round(pct * 100)}% · GOAL {(goalMl / 1000).toFixed(1)} L
            </p>
          </div>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowLog(true);
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[46px] h-[46px] rounded-full bg-white flex items-center justify-center shadow-lg"
        >
          <Plus size={22} color={BLUE_DARK} />
        </div>
      </button>

      {showLog && (
        <WaterLogSheet
          c={c}
          ml={ml}
          goalMl={goalMl}
          onClose={() => setShowLog(false)}
          onAdd={addWater}
          onSaveGoal={saveGoal}
        />
      )}
    </>
  );
}

const QUICK = [
  { ml: 250, label: "+0.25L" },
  { ml: 500, label: "+0.5L" },
  { ml: 1000, label: "+1L" },
];

function WaterLogSheet({ c, ml, goalMl, onClose, onAdd, onSaveGoal }) {
  const pct = Math.min(1, ml / goalMl);
  const [goalInput, setGoalInput] = useState((goalMl / 1000).toString());

  const commitGoal = () => {
    const liters = parseFloat(goalInput || "0") || WATER_GOAL_ML / 1000;
    const clamped = Math.max(0.5, Math.min(10, liters));
    const nextMl = Math.round(clamped * 1000);
    if (nextMl !== goalMl) onSaveGoal(nextMl);
    setGoalInput(clamped.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        style={{ backgroundColor: c.bg, color: c.text }}
        className="w-full sm:max-w-sm p-6 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ color: c.textMuted }} className="text-xs font-bold tracking-wider mb-1">
          WATER
        </p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-extrabold tracking-tight">{L(ml)}</span>
          <span style={{ color: c.textMuted }} className="text-sm">
            / {L(goalMl)} L · {Math.round(pct * 100)}%
          </span>
        </div>

        <div style={{ backgroundColor: c.surfaceAlt }} className="h-2 rounded-full overflow-hidden mb-6">
          <div
            style={{ width: `${pct * 100}%`, backgroundColor: "#38BDF8" }}
            className="h-full rounded-full transition-all"
          />
        </div>

        <p style={{ color: c.textMuted }} className="text-xs font-semibold mb-2">
          ADD
        </p>
        <div className="flex gap-2 mb-2">
          {QUICK.map((q) => (
            <button
              key={q.ml}
              onClick={() => onAdd(q.ml)}
              className="flex-1 h-[52px] rounded-2xl bg-[#38BDF8] text-white font-bold text-sm"
            >
              {q.label}
            </button>
          ))}
        </div>
        {ml > 0 && (
          <button
            onClick={() => onAdd(-Math.min(ml, 250))}
            style={{ color: c.textMuted }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs"
          >
            <Undo2 size={16} />
            Undo last 0.25 L
          </button>
        )}

        <p style={{ color: c.textMuted }} className="text-xs font-semibold mb-2 mt-6">
          DAILY GOAL
        </p>
        <div
          style={{ backgroundColor: c.surfaceAlt }}
          className="flex items-center rounded-2xl px-4 h-[52px]"
        >
          <input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value.replace(/[^0-9.]/g, ""))}
            onBlur={commitGoal}
            inputMode="decimal"
            className="flex-1 bg-transparent text-2xl font-extrabold outline-none"
            style={{ color: c.text }}
          />
          <span style={{ color: c.textMuted }} className="text-sm">
            L / day
          </span>
        </div>

        <button onClick={onClose} className="text-xs mt-6" style={{ color: c.textMuted }}>
          Done
        </button>
      </div>
    </div>
  );
}
