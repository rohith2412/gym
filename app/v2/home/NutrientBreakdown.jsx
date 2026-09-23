"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Flame, Gem, ShieldCheck, Sun } from "lucide-react";

/**
 * Full port of gym-ios/src/features/nutrition/{nutrientMeta.ts,
 * components/NutrientBreakdown.tsx} -- same 17-nutrient metadata, same
 * hero-row-then-expand structure, same ring math, translated from
 * react-native-svg to plain <svg>.
 */

export const NUTRIENT_META = [
  { key: "calories", label: "Calories", short: "Cal", unit: "kcal", kind: "target", group: "macro", color: "#f97316" },
  { key: "protein", label: "Protein", short: "Protein", unit: "g", kind: "target", group: "macro", color: "#8b5cf6" },
  { key: "carbs", label: "Carbs", short: "Carbs", unit: "g", kind: "target", group: "macro", color: "#f59e0b" },
  { key: "fat", label: "Fat", short: "Fat", unit: "g", kind: "target", group: "macro", color: "#0ea5e9" },
  { key: "fiber", label: "Fiber", short: "Fiber", unit: "g", kind: "target", group: "essential", color: "#10b981" },
  { key: "sugar", label: "Added sugar", short: "Sugar", unit: "g", kind: "limit", group: "essential", color: "#f43f5e" },
  { key: "sodium", label: "Sodium", short: "Sodium", unit: "mg", kind: "limit", group: "essential", color: "#fb923c" },
  { key: "satFat", label: "Saturated fat", short: "Sat fat", unit: "g", kind: "limit", group: "essential", color: "#ef4444" },
  { key: "cholesterol", label: "Cholesterol", short: "Chol.", unit: "mg", kind: "limit", group: "essential", color: "#e11d48" },
  { key: "vitaminA", label: "Vitamin A", short: "A", unit: "µg", kind: "target", group: "vitamin", color: "#f59e0b" },
  { key: "vitaminC", label: "Vitamin C", short: "C", unit: "mg", kind: "target", group: "vitamin", color: "#eab308" },
  { key: "vitaminD", label: "Vitamin D", short: "D", unit: "µg", kind: "target", group: "vitamin", color: "#fde047" },
  { key: "vitaminB12", label: "Vitamin B12", short: "B12", unit: "µg", kind: "target", group: "vitamin", color: "#a855f7" },
  { key: "folate", label: "Folate", short: "Folate", unit: "µg", kind: "target", group: "vitamin", color: "#22c55e" },
  { key: "iron", label: "Iron", short: "Iron", unit: "mg", kind: "target", group: "mineral", color: "#dc2626" },
  { key: "calcium", label: "Calcium", short: "Calcium", unit: "mg", kind: "target", group: "mineral", color: "#f3f4f6" },
  { key: "potassium", label: "Potassium", short: "Potas.", unit: "mg", kind: "target", group: "mineral", color: "#38bdf8" },
];

export const DEFAULT_NUTRIENT_GOALS = {
  fiber: 28, sugar: 50, sodium: 2300, satFat: 20, cholesterol: 300,
  vitaminA: 900, vitaminC: 90, vitaminD: 20, vitaminB12: 2.4, folate: 400,
  iron: 18, calcium: 1300, potassium: 4700,
};

const GROUP_LABELS = { macro: "Macros", essential: "Essential", vitamin: "Vitamins", mineral: "Minerals" };
const GROUP_ICONS = { macro: Flame, essential: ShieldCheck, vitamin: Sun, mineral: Gem };
const HERO_KEYS = ["fiber", "sugar", "sodium", "satFat"];
const REST_GROUPS = ["essential", "vitamin", "mineral"];
const SUCCESS = "#22c55e";
const DANGER = "#f87171";

function formatValue(v, unit) {
  if (unit === "kcal" || unit === "mg" || unit === "µg") return Math.round(v).toLocaleString();
  return (Math.round(v * 10) / 10).toLocaleString();
}

function withAlpha(hex, alpha) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function Ring({ pct, color, trackColor, size = 34 }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  const dashOffset = circ * (1 - clamped);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

function ringColorFor(meta, value, goal) {
  const pct = goal > 0 ? value / goal : 0;
  const isLimit = meta.kind === "limit";
  const over = isLimit && pct > 1;
  const met = !isLimit && pct >= 1;
  return { pct, over, met, color: over ? DANGER : met ? SUCCESS : meta.color };
}

export function NutrientBreakdown({ c, totals, goals }) {
  const [showAll, setShowAll] = useState(false);

  const heroItems = useMemo(
    () => HERO_KEYS.map((k) => NUTRIENT_META.find((m) => m.key === k)),
    [],
  );

  const restGrouped = useMemo(() => {
    const out = {};
    for (const m of NUTRIENT_META) {
      if (m.group === "macro") continue;
      if (HERO_KEYS.includes(m.key)) continue;
      (out[m.group] ||= []).push(m);
    }
    return out;
  }, []);

  const goalFor = (key) => goals[key] ?? DEFAULT_NUTRIENT_GOALS[key] ?? 0;

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div
        style={{ backgroundColor: c.surface, borderColor: c.border }}
        className="border rounded-2xl px-3 py-3 flex items-center gap-1.5"
      >
        {heroItems.map((meta) => {
          const value = totals[meta.key] ?? 0;
          const goal = goalFor(meta.key);
          const { pct, over, color } = ringColorFor(meta, value, goal);
          return (
            <div key={meta.key} className="flex-1 flex flex-col items-center gap-1">
              <Ring pct={pct} color={color} trackColor={withAlpha(meta.color, 0.15)} size={30} />
              <span style={{ color: c.textMuted }} className="text-[10px] truncate w-full text-center">
                {meta.short}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: over ? DANGER : c.text }}>
                {formatValue(value, meta.unit)}
                <span style={{ color: c.textFaint }} className="text-[9px]"> {meta.unit}</span>
              </span>
            </div>
          );
        })}
        <button onClick={() => setShowAll((v) => !v)} className="pl-1">
          {showAll ? <ChevronUp size={18} color={c.textMuted} /> : <ChevronDown size={18} color={c.textMuted} />}
        </button>
      </div>

      {showAll && (
        <div className="flex flex-col gap-5">
          {REST_GROUPS.map((group) => {
            const items = restGrouped[group] ?? [];
            if (items.length === 0) return null;
            const GroupIcon = GROUP_ICONS[group];
            return (
              <div key={group} className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: c.surfaceAlt }}
                    className="w-[22px] h-[22px] rounded-md flex items-center justify-center"
                  >
                    <GroupIcon size={13} color={c.text} />
                  </div>
                  <span style={{ color: c.textMuted }} className="text-xs font-semibold">
                    {GROUP_LABELS[group].toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {items.map((meta) => {
                    const value = totals[meta.key] ?? 0;
                    const goal = goalFor(meta.key);
                    const { pct, over, color } = ringColorFor(meta, value, goal);
                    return (
                      <div
                        key={meta.key}
                        style={{ backgroundColor: c.surface, borderColor: c.border, flexBasis: "48%" }}
                        className="flex-grow border rounded-2xl p-3 flex items-center gap-2.5"
                      >
                        <Ring pct={pct} color={color} trackColor={withAlpha(meta.color, 0.15)} />
                        <div className="flex-1 min-w-0">
                          <p style={{ color: c.textMuted }} className="text-[11px] truncate">
                            {meta.short}
                          </p>
                          <p className="text-[13px] font-semibold" style={{ color: over ? DANGER : c.text }}>
                            {formatValue(value, meta.unit)}
                            <span style={{ color: c.textFaint }} className="text-[10px]">
                              {" / "}
                              {formatValue(goal, meta.unit)}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
