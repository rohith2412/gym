"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Drumstick,
  Flame,
  Pencil,
  Pill,
  Plus,
  UtensilsCrossed,
  Wheat,
  X,
} from "lucide-react";
import { useV2Theme } from "../ThemeProvider";
import { AddFoodModal } from "./AddFoodModal";
import { EditGoalsModal } from "./EditGoalsModal";
import { FabMenu } from "./FabMenu";
import { NutrientBreakdown } from "./NutrientBreakdown";
import { WaterCard } from "./WaterCard";

/**
 * Pixel-matched port of the production mobile app's Nutrition screen
 * (gym-ios/src/features/nutrition/{NutritionScreen,components/
 * CalorieSummary,components/WeekStrip,components/NutrientBreakdown}
 * .tsx) -- same colors, same gauge/ring math, same week-strip
 * fill/streak logic, translated from react-native-svg to plain <svg>.
 * Wired to this project's own real endpoints (/api/meal-log,
 * /api/nutrition-goals), not the mobile app's API client.
 *
 * Not ported yet: AI photo/voice/barcode logging (the endpoint exists
 * at /api/nutrition-goals/photo, just not wired into this UI), editing
 * goals (pencil icon is decorative for now), and the expanded
 * vitamin/mineral groups beyond the four hero nutrients.
 */

// Exact hex values from gym-ios/src/theme/tokens.ts
const THEME = {
  dark: {
    bg: "#0a0a0a",
    surface: "#0f0f0f",
    surfaceAlt: "#1f1f1f",
    text: "#ffffff",
    textMuted: "#a1a1aa",
    textFaint: "#6b6b6b",
    border: "#2a2a2a",
  },
  light: {
    bg: "#ececec",
    surface: "#f5f5f5",
    surfaceAlt: "#e2e2e5",
    text: "#0a0a0a",
    textMuted: "#6b7280",
    textFaint: "#9ca3af",
    border: "#d4d4d8",
  },
};
const CALORIES_COLOR = "#4ADE80";
const PROTEIN = "#EF4444";
const CARBS = "#F59E0B";
const FAT = "#8B5CF6";
const DEFAULT_GOALS = { calories: 2200, protein: 150, carbs: 250, fat: 70 };
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STRIP_DAYS = 30;

function toISODay(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function entryLocalDay(e) {
  return e.localDate || toISODay(new Date(e.date));
}

const NUTRIENT_TOTAL_KEYS = [
  "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium", "satFat",
  "cholesterol", "vitaminA", "vitaminC", "vitaminD", "vitaminB12", "folate",
  "iron", "calcium", "potassium",
];

function totalsForDay(entries, iso) {
  const zero = Object.fromEntries(NUTRIENT_TOTAL_KEYS.map((k) => [k, 0]));
  return entries
    .filter((e) => entryLocalDay(e) === iso)
    .reduce((acc, e) => {
      for (const k of NUTRIENT_TOTAL_KEYS) acc[k] += e.totals?.[k] || 0;
      return acc;
    }, zero);
}

export default function HomePageV2() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useV2Theme();
  const c = THEME[theme];

  const [selectedDay, setSelectedDay] = useState(() => toISODay());
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addMode, setAddMode] = useState(null); // "scan" | "barcode" | "voice" | "manual" | null
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const photoInputRef = useRef(null);
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/v2/login");
  }, [status, router]);

  // Same gate the mobile app uses (hasRequiredIntro): weight, height,
  // age and a goal all have to be on the UserIntro doc before showing
  // the dashboard, otherwise /api/nutrition-goals has nothing to
  // calculate real calorie/macro targets from and silently falls back
  // to the hardcoded defaults.
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user-intro")
      .then((r) => r.json())
      .then((json) => {
        const intro = json?.data;
        const complete =
          json?.exists && intro?.weight != null && intro?.height != null && intro?.age != null && !!intro?.fitnessGoal;
        if (!complete) {
          router.replace("/v2/onboarding");
          return;
        }
        setIntroReady(true);
      })
      .catch(() => setIntroReady(true));
  }, [status, router]);

  const fetchGoals = () => {
    fetch("/api/nutrition-goals")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.success) setGoals((g) => ({ ...g, ...json.data.goals }));
      })
      .catch(() => {});
  };

  // Fetch the whole recent history (not per-day) -- the week strip's
  // fill/hit-goal state and the streak count both need every day's
  // totals, exactly like the mobile app's useFoodEntries() does.
  const fetchEntries = () => {
    setLoading(true);
    fetch("/api/meal-log?limit=200")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setEntries(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchGoals();
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // "Always show the latest data": refetch whenever the tab regains
  // focus/visibility -- otherwise a tab left open in the background
  // (someone logs food on their phone, then switches back to this tab
  // without reloading) would keep showing whatever was fetched at
  // mount, stale indefinitely.
  useEffect(() => {
    if (status !== "authenticated") return;
    const onFocus = () => {
      fetchGoals();
      fetchEntries();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Follow "today" across a real midnight rollover too -- if the tab
  // stays open past midnight while the user was viewing today (not a
  // day they explicitly went back to), selectedDay would otherwise
  // stay frozen on yesterday's date forever, and isToday would go
  // permanently wrong. followingTodayRef tracks intent: true whenever
  // the currently-selected day IS today, flipped false the moment they
  // tap an earlier day (see onDaySelect below) so a deliberate look at
  // the past is never yanked back.
  const followingTodayRef = useRef(true);
  const weekStripRef = useRef(null);
  const todayCellRef = useRef(null);

  // Focuses today at the right edge of the strip (not tomorrow's
  // dimmed padding slot) -- scrollIntoView aligns the actual "today"
  // cell itself, so it works regardless of the trailing future day.
  const scrollToToday = () => {
    todayCellRef.current?.scrollIntoView({ inline: "end", block: "nearest" });
  };

  useEffect(() => {
    const id = setInterval(() => {
      const now = toISODay();
      if (followingTodayRef.current) {
        setSelectedDay((prev) => {
          if (prev === now) return prev;
          // Re-scroll to show the new today, same jump-not-animate
          // behavior as the initial mount scroll below.
          requestAnimationFrame(scrollToToday);
          return now;
        });
      }
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const onDaySelect = (iso) => {
    followingTodayRef.current = iso === toISODay();
    setSelectedDay(iso);
  };

  const totals = useMemo(() => totalsForDay(entries, selectedDay), [entries, selectedDay]);
  const dayItems = useMemo(
    () =>
      entries
        .filter((e) => entryLocalDay(e) === selectedDay)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [entries, selectedDay],
  );

  const todayIso = toISODay();
  const isToday = selectedDay === todayIso;

  const logStreak = useMemo(() => {
    const logged = new Set(entries.map(entryLocalDay));
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (!logged.has(toISODay(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (logged.has(toISODay(d))) {
      n += 1;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [entries]);

  // Exact port of gym-ios's WeekStrip.tsx: one continuous scrollable
  // row of the last 30 days (not paginated by week), ending at
  // tomorrow so today isn't jammed against the edge. Opens scrolled to
  // the end -- today is what you almost always want, the past is one
  // flick away.
  const weekDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: STRIP_DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (STRIP_DAYS - 2) + i);
      const iso = toISODay(d);
      const kcal = totalsForDay(entries, iso).calories;
      return {
        iso,
        dayNum: d.getDate(),
        label: DAY_LABELS[d.getDay()],
        isToday: iso === todayIso,
        isFuture: d > today,
        isSelected: iso === selectedDay,
        logged: kcal > 0,
        hitGoal: goals.calories > 0 && kcal >= goals.calories,
      };
    });
  }, [entries, selectedDay, goals.calories, todayIso]);

  // Opens with today focused at the right edge. Jump, don't animate
  // (mobile's own comment: "an opening screen that slides itself
  // sideways reads as a glitch"). Guarded to fire once per mount, not
  // on every entries/goals refresh, so a background refetch while the
  // user has manually scrolled left through history doesn't yank their
  // view back to today mid-browse.
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (hasScrolledRef.current) return;
    if (weekDays.length === 0 || !weekStripRef.current) return;
    scrollToToday();
    hasScrolledRef.current = true;
  }, [weekDays]);

  const removeEntry = async (id) => {
    setEntries((prev) => prev.filter((e) => e._id !== id));
    await fetch(`/api/meal-log?id=${id}`, { method: "DELETE" }).catch(() => {});
  };

  const macroPagerRef = useRef(null);
  const [macroPage, setMacroPage] = useState(0);
  const onMacroPagerScroll = () => {
    const el = macroPagerRef.current;
    if (!el || el.clientWidth === 0) return;
    setMacroPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  const onMenuSelect = (key) => {
    setMenuOpen(false);
    if (key === "scan") {
      photoInputRef.current?.click();
      return;
    }
    setAddMode(key);
  };

  if (status === "loading" || status === "unauthenticated" || !introReady) return null;

  const pct = goals.calories > 0 ? totals.calories / goals.calories : 0;
  const over = totals.calories > goals.calories;
  const left = Math.round(goals.calories - totals.calories);

  return (
    <div style={{ backgroundColor: c.bg, color: c.text }} className="min-h-screen pb-32 transition-colors">
      <div className="w-full max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p style={{ color: c.textMuted }} className="text-xs">
              {isToday
                ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
                : new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
            </p>
            <h1 className="text-[28px] font-extrabold tracking-tight -mt-0.5">Nutrition</h1>
          </div>
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: c.surface, borderColor: c.border }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            >
              <Flame size={15} color="#F59E0B" fill="#F59E0B" />
              <span className="text-sm font-bold">{logStreak}</span>
            </div>
            <button onClick={() => router.push("/v2/profile")} aria-label="Profile">
              {session?.user?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.photo}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  style={{ backgroundColor: c.surfaceAlt }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                >
                  {(session?.user?.name || session?.user?.email || "?")[0].toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Week strip */}
        <div
          ref={(node) => {
            weekStripRef.current = node;
            // Callback refs fire during commit, bottom-up -- by the time
            // this (the container) runs, the today-cell's own ref below
            // has already attached, so this can scroll synchronously on
            // first mount instead of waiting for a `weekDays`-dependent
            // effect to re-fire (which only happens once the entries/
            // goals fetches resolve and give it a new array reference --
            // fast, but not instant, so a reload could briefly show the
            // strip parked at its default scrollLeft of 0 first).
            if (node && !hasScrolledRef.current && todayCellRef.current) {
              scrollToToday();
              hasScrolledRef.current = true;
            }
          }}
          className="flex gap-2.5 overflow-x-auto mb-6 -mx-1 px-1 pb-1"
        >
          {weekDays.map((d) => {
            const filled = d.logged && !d.isFuture;
            return (
              <button
                key={d.iso}
                ref={d.isToday ? todayCellRef : undefined}
                disabled={d.isFuture}
                onClick={() => onDaySelect(d.iso)}
                className="flex-shrink-0 w-[52px] flex flex-col items-center gap-1.5"
                style={{ opacity: d.isFuture ? 0.4 : 1 }}
              >
                <span
                  className="text-[11px] font-bold tracking-wide"
                  style={{ color: d.isFuture ? c.textFaint : d.isSelected ? c.text : c.textMuted }}
                >
                  {d.label}
                </span>
                <div
                  className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center"
                  style={{
                    border: filled ? "none" : `1px solid ${c.border}`,
                    backgroundColor: filled ? (d.hitGoal ? c.text : c.surfaceAlt) : "transparent",
                  }}
                >
                  <span
                    className="text-[15px]"
                    style={{
                      fontWeight: d.isToday ? 800 : 600,
                      color: filled && d.hitGoal ? c.bg : d.isFuture ? c.textMuted : c.text,
                    }}
                  >
                    {d.dayNum}
                  </span>
                </div>
                <div
                  className="w-[18px] h-[3px] rounded-full"
                  style={{ backgroundColor: d.isSelected ? c.text : "transparent" }}
                />
              </button>
            );
          })}
        </div>

        {/* Calories */}
        <button
          onClick={() => setShowEditGoals(true)}
          style={{ backgroundColor: c.surface, borderColor: c.border }}
          className="w-full border rounded-3xl p-5 flex items-center justify-between mb-3 text-left"
        >
          <div className="flex-1">
            <p style={{ color: c.textMuted }} className="text-[11px] font-bold tracking-wider">
              CALORIES
            </p>
            <p className="text-[46px] font-extrabold tracking-tighter leading-[52px] mt-0.5">
              {Math.round(totals.calories)}
            </p>
            <div className="flex items-center gap-1">
              <span style={{ color: c.textMuted }} className="text-[15px]">
                of {Math.round(goals.calories)} eaten
              </span>
              <Pencil size={13} color={c.textFaint} />
            </div>
          </div>
          <Gauge size={112} strokeWidth={10} pct={pct} color={over ? CARBS : CALORIES_COLOR} track={c.surfaceAlt}>
            <p className="text-2xl font-extrabold tracking-tight">{Math.abs(left)}</p>
            <p style={{ color: c.textMuted }} className="text-[10px] font-bold tracking-wide">
              {over ? "OVER" : "LEFT"}
            </p>
          </Gauge>
        </button>

        {/* Macros / Water -- swipeable pager, matching CalorieSummary.tsx's
            `waterPage` prop exactly: macros and water share one horizontal
            swipe (not stacked sections), with dot indicators below. */}
        <div className="mb-3">
          <div
            ref={macroPagerRef}
            onScroll={onMacroPagerScroll}
            className="flex overflow-x-auto snap-x snap-mandatory -mx-1 px-1 no-scrollbar"
          >
            <div className="flex-shrink-0 w-full snap-center pr-1">
              <div className="grid grid-cols-3 gap-2.5">
                <MacroTile c={c} label="Protein" value={totals.protein} goal={goals.protein} color={PROTEIN} Icon={Drumstick} />
                <MacroTile c={c} label="Carbs" value={totals.carbs} goal={goals.carbs} color={CARBS} Icon={Wheat} />
                <MacroTile c={c} label="Fat" value={totals.fat} goal={goals.fat} color={FAT} Icon={Pill} />
              </div>
            </div>
            <div className="flex-shrink-0 w-full snap-center pl-1">
              <WaterCard c={c} day={selectedDay} />
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-2.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === macroPage ? 16 : 6,
                  backgroundColor: i === macroPage ? c.text : c.border,
                }}
              />
            ))}
          </div>
        </div>

        {/* Nutrient breakdown -- full port with expand/collapse groups */}
        <NutrientBreakdown c={c} totals={totals} goals={goals} />

        {/* Food list */}
        <p className="text-lg font-bold mb-2.5">{isToday ? "Today's food" : "Food"}</p>

        {loading ? (
          <p style={{ color: c.textMuted }} className="text-sm">
            Loading…
          </p>
        ) : dayItems.length === 0 ? (
          <div
            style={{ backgroundColor: c.surface, borderColor: c.border }}
            className="border rounded-3xl p-8 flex flex-col items-center gap-3"
          >
            <UtensilsCrossed size={26} color={c.textMuted} />
            <p style={{ color: c.textMuted }} className="text-sm text-center">
              Nothing logged yet.
              <br />
              Tap + to add a food.
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor: c.surface, borderColor: c.border }} className="border rounded-3xl overflow-hidden">
            {dayItems.map((entry, i) => (
              <div key={entry._id} style={i > 0 ? { borderTopColor: c.border } : undefined} className={i > 0 ? "border-t" : ""}>
                <FoodRow c={c} entry={entry} onDelete={() => removeEntry(entry._id)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB + hidden photo input -- the "Scan a photo" menu item triggers
          this input directly (mirrors mobile's camera launch on tap), then
          AddFoodModal opens straight into its "scan" mode once a file is
          picked. */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) {
            setPendingPhoto(file);
            setAddMode("scan");
          }
        }}
      />
      <button
        onClick={() => setMenuOpen((v) => !v)}
        style={{ backgroundColor: c.text, color: c.bg }}
        className="fixed bottom-8 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        aria-label="Add food"
      >
        <Plus
          size={26}
          style={{
            transform: menuOpen ? "rotate(135deg)" : "rotate(0deg)",
            transition: `transform ${menuOpen ? 220 : 160}ms ${menuOpen ? "cubic-bezier(0.16,1,0.3,1)" : "cubic-bezier(0.4,0,1,1)"}`,
          }}
        />
      </button>

      <FabMenu c={c} open={menuOpen} onClose={() => setMenuOpen(false)} onSelect={onMenuSelect} />

      {addMode && (
        <AddFoodModal
          initialMode={addMode}
          file={pendingPhoto}
          localDate={selectedDay}
          onClose={() => {
            setAddMode(null);
            setPendingPhoto(null);
          }}
          onSaved={(doc) => {
            setEntries((prev) => [doc, ...prev]);
            setAddMode(null);
            setPendingPhoto(null);
          }}
        />
      )}

      {showEditGoals && (
        <EditGoalsModal
          goals={goals}
          onClose={() => setShowEditGoals(false)}
          onSaved={(next) => {
            setGoals((g) => ({ ...g, ...next }));
            setShowEditGoals(false);
          }}
        />
      )}
    </div>
  );
}

function Gauge({ size, strokeWidth, pct, color, track, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const SWEEP = 0.75; // 270°
  const arc = circ * SWEEP;
  const target = Math.min(1, Math.max(0, pct));
  const dashoffset = arc * (1 - target);

  return (
    <div style={{ width: size, height: size, position: "relative" }} className="flex items-center justify-center">
      <svg width={size} height={size} style={{ position: "absolute", transform: "rotate(135deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${arc} ${circ}`}
        />
        {target > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${arc} ${circ}`}
            strokeDashoffset={dashoffset}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)" }}
          />
        )}
      </svg>
      <div className="flex flex-col items-center">{children}</div>
    </div>
  );
}

function MacroTile({ c, label, value, goal, color, Icon }) {
  const pct = goal > 0 ? value / goal : 0;
  const left = Math.max(0, Math.round(goal - value));
  return (
    <div style={{ backgroundColor: c.surface, borderColor: c.border }} className="border rounded-2xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Icon size={14} color={color} />
        <span style={{ color: c.textMuted }} className="text-[11px] font-bold tracking-wide uppercase">
          {label}
        </span>
      </div>
      <p className="text-[22px] font-extrabold tracking-tight">
        {Math.round(value)}
        <span style={{ color: c.textFaint }} className="text-xs font-semibold">
          /{Math.round(goal)}g
        </span>
      </p>
      <div style={{ backgroundColor: c.surfaceAlt }} className="h-1.5 rounded-full overflow-hidden">
        <div
          style={{ width: `${Math.min(1, Math.max(0, pct)) * 100}%`, backgroundColor: color, transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }}
          className="h-full rounded-full"
        />
      </div>
      <span style={{ color: c.textFaint }} className="text-[10px]">
        {left}g left
      </span>
    </div>
  );
}

function FoodRow({ c, entry, onDelete }) {
  const name = entry.foods?.[0]?.name || "Food";
  const time = new Date(entry.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <div className="flex items-center gap-3 p-4">
      {entry.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.imageUrl}
          alt=""
          className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div style={{ backgroundColor: c.surfaceAlt }} className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed size={18} color={c.textMuted} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold truncate">{name}</p>
          <span style={{ color: c.textFaint }} className="text-xs flex-shrink-0">
            {time}
          </span>
        </div>
        <p style={{ color: c.textMuted }} className="text-xs mt-0.5">
          P {Math.round(entry.totals?.protein || 0)}g · C {Math.round(entry.totals?.carbs || 0)}g · F{" "}
          {Math.round(entry.totals?.fat || 0)}g
        </p>
      </div>
      <p className="text-sm font-bold flex-shrink-0">{Math.round(entry.totals?.calories || 0)}</p>
      <button onClick={onDelete} className="flex-shrink-0" aria-label="Delete">
        <X size={16} color={c.textMuted} />
      </button>
    </div>
  );
}
