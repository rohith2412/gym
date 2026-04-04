"use client";

import ProfilePicture from "@/components/ProfilePicture";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const GOALS = [
  { key: "muscle gain", emoji: "💪", label: "Muscle Gain",  color: "#ff6b35", bg: "rgba(255,107,53,0.1)" },
  { key: "fat loss",    emoji: "🔥", label: "Fat Loss",     color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
  { key: "maintenance", emoji: "⚖️", label: "Maintenance",  color: "#888",    bg: "#f4f2ed"              },
  { key: "weight gain", emoji: "📈", label: "Weight Gain",  color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
];
const MEAL_TYPES = [
  { key: "breakfast", emoji: "🥞", label: "Breakfast" },
  { key: "lunch",     emoji: "🥗", label: "Lunch"     },
  { key: "dinner",    emoji: "🍜", label: "Dinner"    },
  { key: "snack",     emoji: "🫐", label: "Snack"     },
  { key: "smoothie",  emoji: "🥤", label: "Smoothie"  },
];

// Preset ingredient categories
const INGREDIENT_CATEGORIES = [
  {
    label: "🥩 Protein",
    items: ["Chicken breast","Chicken thighs","Ground beef","Ground turkey","Steak","Pork","Bacon","Salmon","Tuna","Shrimp","Eggs","Egg whites","Tofu","Tempeh","Sardines","Mackerel","Cod","Tilapia"],
  },
  {
    label: "🥛 Dairy & Alternatives",
    items: ["Greek yogurt","Cottage cheese","Milk","Cheddar","Feta","Mozzarella","Ricotta","Cream cheese","Butter","Parmesan","Almond milk","Coconut milk","Oat milk"],
  },
  {
    label: "🫘 Legumes & Grains",
    items: ["Black beans","Chickpeas","Lentils","Edamame","Oats","Brown rice","White rice","Whole wheat pasta","Penne","Bread","Tortilla","Quinoa"],
  },
  {
    label: "🥦 Vegetables",
    items: ["Spinach","Broccoli","Kale","Avocado","Sweet potato","Bell peppers","Zucchini","Cauliflower","Asparagus","Mushrooms","Cherry tomatoes","Cucumber","Onion","Garlic","Carrot","Celery","Cabbage","Bok choy"],
  },
  {
    label: "🍌 Fruit",
    items: ["Banana","Strawberries","Blueberries","Mango","Apple","Lemon","Lime","Orange","Raspberries","Pineapple"],
  },
  {
    label: "🥜 Nuts, Seeds & Oils",
    items: ["Peanut butter","Almond butter","Almonds","Walnuts","Chia seeds","Flaxseeds","Sesame seeds","Olive oil","Coconut oil","Hemp seeds"],
  },
  {
    label: "🧂 Pantry",
    items: ["Soy sauce","Hot sauce","Honey","Protein powder","Whey protein","Canned tomatoes","Chicken stock","Miso paste","Tahini","Salsa"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return Math.round(n ?? 0); }
function totalTime(r) { return (r.prepTime || 0) + (r.cookTime || 0); }
function goalMeta(key) { return GOALS.find((g) => g.key === key) || { color: "#aaa", bg: "#f4f2ed" }; }

// ─── Primitives ───────────────────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", border: "1px solid #e8e5de",
      borderRadius: 20, padding: "1.25rem",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      cursor: onClick ? "pointer" : undefined, ...style,
    }}>{children}</div>
  );
}
function Label({ children, style = {} }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: "0.5rem", ...style }}>{children}</p>;
}
function Skeleton({ height = 80 }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e5de", borderRadius: 20, height, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent 0%,rgba(232,229,222,0.5) 50%,transparent 100%)", animation: "shimmer 1.4s infinite" }} />
    </div>
  );
}

// ─── Macro bar ────────────────────────────────────────────────────────────────
function MacroBar({ label, value, max, color, unit = "g" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#1a1a1a" }}>{fmt(value)}{unit}</span>
      </div>
      <div style={{ height: 6, background: "#f0ede6", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Recipe detail ────────────────────────────────────────────────────────────
function RecipeDetail({ recipe, onBack, onRegenerate, isGenerating }) {
  const [tab, setTab] = useState("ingredients");
  const meta = goalMeta(recipe.goal);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn 0.4s ease" }}>

      {/* Action row */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "0.7rem", background: "#fff", border: "1px solid #e8e5de", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "inherit", cursor: "pointer" }}>← Back</button>
        <button onClick={onRegenerate} disabled={isGenerating} style={{ flex: 1, padding: "0.7rem", background: "#fff", border: "1px solid #e8e5de", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#ff6b35", fontFamily: "inherit", cursor: "pointer", opacity: isGenerating ? 0.5 : 1 }}>
          {isGenerating ? "…" : "🔄 Try another"}
        </button>
      </div>

      {/* Header */}
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1rem" }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "#f4f2ed", border: "1px solid #e8e5de", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
            {recipe.emoji || "🍽️"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
              {recipe.goal && (
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: meta.color, background: meta.bg, borderRadius: 99, padding: "0.2rem 0.6rem" }}>
                  {recipe.goal}
                </span>
              )}
              {recipe.mealType && (
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", background: "#f4f2ed", borderRadius: 99, padding: "0.2rem 0.6rem" }}>
                  {recipe.mealType}
                </span>
              )}
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", background: "#f4f2ed", borderRadius: 99, padding: "0.2rem 0.6rem" }}>
                {recipe.difficulty}
              </span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.2 }}>{recipe.name}</h2>
          </div>
        </div>

        {/* Time row */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
          {[
            { emoji: "⏱️", label: "Prep",     val: `${recipe.prepTime}m` },
            { emoji: "🔥", label: "Cook",     val: `${recipe.cookTime}m` },
            { emoji: "⏰", label: "Total",    val: `${totalTime(recipe)}m` },
            { emoji: "🍽️", label: "Servings", val: recipe.servings },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "#f4f2ed", borderRadius: 12, padding: "0.55rem 0.3rem", textAlign: "center" }}>
              <p style={{ fontSize: 14 }}>{s.emoji}</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>{s.val}</p>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Calorie hero */}
        <div style={{ background: "#1a1a1a", borderRadius: 14, padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Calories</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {fmt(recipe.macros?.calories)}<span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 3 }}>kcal</span>
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Protein", val: recipe.macros?.protein, color: "#ff6b35" },
                { label: "Carbs",   val: recipe.macros?.carbs,   color: "#fff" },
                { label: "Fat",     val: recipe.macros?.fat,     color: "rgba(255,255,255,0.5)" },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: m.color, letterSpacing: "-0.03em" }}>{fmt(m.val)}<span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>g</span></p>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>
          <MacroBar label="Fiber"       value={recipe.macros?.fiber}       max={40}   color="#4ade80" />
          <MacroBar label="Sugar"       value={recipe.macros?.sugar}       max={50}   color="#fb923c" />
          <MacroBar label="Sodium"      value={recipe.macros?.sodium}      max={2300} color="#60a5fa" unit="mg" />
          <MacroBar label="Cholesterol" value={recipe.macros?.cholesterol} max={300}  color="#e879f9" unit="mg" />
        </div>

        {/* Protein sources */}
        {recipe.proteinSources?.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {recipe.proteinSources.map((s, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "#ff6b35", background: "rgba(255,107,53,0.08)", borderRadius: 99, padding: "0.25rem 0.7rem" }}>💪 {s}</span>
            ))}
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#f4f2ed", borderRadius: 14, padding: 4, gap: 4 }}>
        {["ingredients", "steps"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "0.6rem", borderRadius: 10, border: "none",
            background: tab === t ? "#fff" : "transparent",
            fontSize: 13, fontWeight: 700, color: tab === t ? "#1a1a1a" : "#aaa",
            fontFamily: "inherit", cursor: "pointer",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
            textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>

      {/* Ingredients */}
      {tab === "ingredients" && (
        <Card style={{ padding: "1rem 1.25rem", animation: "fadeIn 0.25s ease" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recipe.ingredients?.map((ing, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < recipe.ingredients.length - 1 ? 8 : 0, borderBottom: i < recipe.ingredients.length - 1 ? "1px solid #f0ede8" : "none" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{ing.item}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#aaa", flexShrink: 0, marginLeft: 12 }}>{ing.amount}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Steps */}
      {tab === "steps" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.25s ease" }}>
          {recipe.steps?.map((step, i) => (
            <Card key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "0.9rem 1.1rem" }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.6, paddingTop: 3 }}>{step}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Tip */}
      {recipe.tip && (
        <Card style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.15)" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#ff6b35", marginBottom: 4 }}>💡 Pro tip</p>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{recipe.tip}</p>
        </Card>
      )}
    </div>
  );
}

// ─── Library card (compact) ───────────────────────────────────────────────────
function LibraryCard({ recipe, onClick }) {
  const meta = goalMeta(recipe.goal);
  return (
    <Card onClick={onClick} style={{ padding: "0.9rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: "#f4f2ed", border: "1px solid #e8e5de", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {recipe.emoji || "🍽️"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{recipe.name}</p>
        <div style={{ display: "flex", gap: 5, marginTop: 3, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: meta.color }}>{fmt(recipe.macros?.protein)}g protein</span>
          <span style={{ fontSize: 10, color: "#ccc" }}>·</span>
          <span style={{ fontSize: 10, color: "#aaa" }}>{fmt(recipe.macros?.calories)} kcal</span>
          <span style={{ fontSize: 10, color: "#ccc" }}>·</span>
          <span style={{ fontSize: 10, color: "#aaa" }}>{totalTime(recipe)}m</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: "#ccc", flexShrink: 0 }}>›</span>
    </Card>
  );
}

// ─── Ingredient chip ──────────────────────────────────────────────────────────
function IngChip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: "0.35rem 0.8rem", borderRadius: 99,
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      fontFamily: "inherit", whiteSpace: "nowrap",
      border: selected ? "none" : "1px solid #e8e5de",
      background: selected ? "#1a1a1a" : "#fff",
      color: selected ? "#fff" : "#555",
      transition: "all 0.12s",
    }}>{label}</button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RecipesClient() {
  const inputRef = useRef(null);

  // Tab
  const [mainTab, setMainTab] = useState("find"); // "find" | "library"

  // Ingredient state
  const [selected,    setSelected]    = useState([]);   // picked from presets
  const [customInput, setCustomInput] = useState("");   // typed ingredient
  const [openCat,     setOpenCat]     = useState(null); // expanded category index

  // Filters
  const [goal,     setGoal]     = useState(null);
  const [mealType, setMealType] = useState(null);

  // Result
  const [recipe,   setRecipe]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [source,   setSource]   = useState(null); // "db" | "ai"

  // Library
  const [libRecipes, setLibRecipes] = useState([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libGoal,    setLibGoal]    = useState("");
  const [libMeal,    setLibMeal]    = useState("");
  const [libPage,    setLibPage]    = useState(1);
  const [libPages,   setLibPages]   = useState(1);
  const [libTotal,   setLibTotal]   = useState(0);
  const [selected2,  setSelected2]  = useState(null); // selected library recipe

  const allIngredients = [...selected]; // could merge custom ones too

  function toggleIngredient(item) {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  function addCustom() {
    const val = customInput.trim();
    if (!val) return;
    if (!selected.includes(val)) setSelected((prev) => [...prev, val]);
    setCustomInput("");
    inputRef.current?.focus();
  }

  function handleCustomKey(e) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCustom(); }
  }

  async function findRecipe(forceNew = false) {
    if (selected.length === 0) return;
    setLoading(true); setError(null); setRecipe(null); setSource(null);
    try {
      const res  = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: selected, goal, mealType, forceNew }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed");
      setRecipe(json.data);
      setSource(json.source);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Library fetch
  const fetchLibrary = useCallback(async (page = 1) => {
    setLibLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (libGoal) params.set("goal", libGoal);
      if (libMeal) params.set("mealType", libMeal);
      const res  = await fetch(`/api/recipes?${params}`);
      const json = await res.json();
      if (json.success) {
        setLibRecipes(json.data);
        setLibTotal(json.total);
        setLibPages(json.pages);
        setLibPage(page);
      }
    } finally { setLibLoading(false); }
  }, [libGoal, libMeal]);

  useEffect(() => {
    if (mainTab === "library") fetchLibrary(1);
  }, [mainTab, libGoal, libMeal, fetchLibrary]);

  const canFind = selected.length > 0 && !loading;
  const isShowingDetail = recipe || selected2;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { display: none; }
        button { cursor: pointer; }
        input:focus { outline: none; }
      `}</style>

      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fafaf8", minHeight: "100dvh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <header style={{ padding: "1.2rem 1.25rem 0", position: "sticky", top: 0, background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(232,229,222,0.5)", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
            <div>
              <p style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>AI-powered</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em", lineHeight: 1.1 }}>Protein Recipes 💪</h1>

            </div>
            <a href="/v1/profile"><ProfilePicture size={40} /></a>
            {isShowingDetail && (
              <button
                onClick={() => { setRecipe(null); setSelected2(null); }}
                style={{ fontSize: 12, fontWeight: 700, color: "#ff6b35", background: "rgba(255,107,53,0.08)", border: "none", borderRadius: 99, padding: "0.4rem 1rem", fontFamily: "inherit" }}
              >
                ← Back
              </button>
            )}
          </div>
          {!isShowingDetail && (
            <div style={{ display: "flex", gap: 4 }}>
              {[["find", "🔍 Find by ingredients"], ["library", "📚 Library"]].map(([key, label]) => (
                <button key={key} onClick={() => setMainTab(key)} style={{
                  flex: 1, padding: "0.6rem 0", border: "none", background: "none",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  color: mainTab === key ? "#1a1a1a" : "#aaa",
                  borderBottom: `2px solid ${mainTab === key ? "#ff6b35" : "transparent"}`,
                }}>{label}</button>
              ))}
            </div>
          )}
        </header>

        <main style={{ padding: "1rem 1.25rem 2rem", flex: 1 }}>

          {/* ══ DETAIL VIEW ══ */}
          {recipe && (
            <RecipeDetail
              recipe={recipe}
              onBack={() => setRecipe(null)}
              onRegenerate={() => findRecipe(true)}
              isGenerating={loading}
            />
          )}
          {selected2 && !recipe && (
            <RecipeDetail
              recipe={selected2}
              onBack={() => setSelected2(null)}
              onRegenerate={() => {}}
              isGenerating={false}
            />
          )}

          {/* ══ FIND TAB ══ */}
          {!isShowingDetail && mainTab === "find" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "fadeIn 0.35s ease" }}>

              {/* Selected ingredients display */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <Label style={{ marginBottom: 0 }}>
                    Your ingredients {selected.length > 0 && `(${selected.length})`}
                  </Label>
                  {selected.length > 0 && (
                    <button onClick={() => setSelected([])} style={{ fontSize: 11, fontWeight: 700, color: "#f43f5e", background: "rgba(244,63,94,0.08)", border: "none", borderRadius: 99, padding: "0.25rem 0.6rem", fontFamily: "inherit" }}>
                      Clear all
                    </button>
                  )}
                </div>

                {selected.length === 0 ? (
                  <div style={{ background: "#f4f2ed", borderRadius: 16, padding: "1.25rem", textAlign: "center" }}>
                    <p style={{ fontSize: 24, marginBottom: 6 }}>🧺</p>
                    <p style={{ fontSize: 13, color: "#bbb", fontWeight: 500 }}>Pick ingredients below or type your own</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, background: "#f4f2ed", borderRadius: 16, padding: "0.75rem" }}>
                    {selected.map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleIngredient(item)}
                        style={{
                          padding: "0.3rem 0.75rem", borderRadius: 99,
                          background: "#1a1a1a", color: "#fff",
                          border: "none", fontSize: 12, fontWeight: 700,
                          fontFamily: "inherit", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                        }}
                      >
                        {item} <span style={{ opacity: 0.5, fontSize: 10 }}>✕</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom input */}
              <div>
                <Label>Type a custom ingredient</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    ref={inputRef}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={handleCustomKey}
                    placeholder="e.g. halloumi, tempeh…"
                    style={{
                      flex: 1, padding: "0.7rem 1rem",
                      border: "1px solid #e8e5de", borderRadius: 12,
                      fontSize: 14, fontFamily: "inherit", color: "#1a1a1a",
                      background: "#fff",
                    }}
                  />
                  <button
                    onClick={addCustom}
                    disabled={!customInput.trim()}
                    style={{
                      padding: "0.7rem 1rem", borderRadius: 12,
                      background: customInput.trim() ? "#1a1a1a" : "#f4f2ed",
                      color: customInput.trim() ? "#fff" : "#bbb",
                      border: "none", fontSize: 13, fontWeight: 700,
                      fontFamily: "inherit",
                    }}
                  >Add</button>
                </div>
                <p style={{ fontSize: 11, color: "#ccc", marginTop: 5 }}>Press Enter or comma to add quickly</p>
              </div>

              {/* Preset categories */}
              <div>
                <Label>Or pick from common ingredients</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {INGREDIENT_CATEGORIES.map((cat, ci) => (
                    <div key={ci} style={{ background: "#fff", border: "1px solid #e8e5de", borderRadius: 16, overflow: "hidden" }}>
                      {/* Category header */}
                      <button
                        onClick={() => setOpenCat(openCat === ci ? null : ci)}
                        style={{
                          width: "100%", padding: "0.85rem 1rem",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{cat.label}</span>
                          {/* Count selected in this category */}
                          {cat.items.filter((i) => selected.includes(i)).length > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 800, color: "#ff6b35", background: "rgba(255,107,53,0.1)", borderRadius: 99, padding: "0.15rem 0.5rem" }}>
                              {cat.items.filter((i) => selected.includes(i)).length}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 14, color: "#ccc", transform: openCat === ci ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>›</span>
                      </button>

                      {/* Ingredients */}
                      {openCat === ci && (
                        <div style={{ padding: "0 0.75rem 0.75rem", display: "flex", flexWrap: "wrap", gap: 6, borderTop: "1px solid #f0ede8" }}>
                          <div style={{ height: 8, width: "100%" }} />
                          {cat.items.map((item) => (
                            <IngChip
                              key={item}
                              label={item}
                              selected={selected.includes(item)}
                              onClick={() => toggleIngredient(item)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional filters */}
              <div>
                <Label>Goal (optional)</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {GOALS.map((g) => (
                    <button key={g.key} onClick={() => setGoal(goal === g.key ? null : g.key)} style={{
                      padding: "0.7rem 0.5rem", borderRadius: 14,
                      border: `1.5px solid ${goal === g.key ? "#1a1a1a" : "#e8e5de"}`,
                      background: goal === g.key ? "#1a1a1a" : "#fff",
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <span style={{ fontSize: 16 }}>{g.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: goal === g.key ? "#fff" : "#1a1a1a" }}>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Meal type (optional)</Label>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
                  {MEAL_TYPES.map((m) => (
                    <button key={m.key} onClick={() => setMealType(mealType === m.key ? null : m.key)} style={{
                      flexShrink: 0, padding: "0.55rem 0.9rem", borderRadius: 12,
                      border: `1.5px solid ${mealType === m.key ? "#1a1a1a" : "#e8e5de"}`,
                      background: mealType === m.key ? "#1a1a1a" : "#fff",
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <span style={{ fontSize: 15 }}>{m.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: mealType === m.key ? "#fff" : "#aaa" }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ fontSize: 12, color: "#e53e3e", fontWeight: 600 }}>⚠️ {error}</p>}

              <button
                onClick={() => findRecipe(false)}
                disabled={!canFind}
                style={{
                  width: "100%", padding: "1rem",
                  background: "#1a1a1a", color: "#fafaf8",
                  border: "none", borderRadius: 14,
                  fontSize: 15, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  opacity: canFind ? 1 : 0.4,
                  cursor: canFind ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Finding best recipe…
                  </>
                ) : `✨ Find recipe with ${selected.length || "my"} ingredient${selected.length !== 1 ? "s" : ""}`}
              </button>

              {/* Loading skeletons */}
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Skeleton height={200} />
                  <Skeleton height={140} />
                  <Skeleton height={100} />
                </div>
              )}

              {/* Source badge after result */}
              {source && recipe && (
                <p style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>
                  {source === "db" ? "⚡ Found in library instantly" : "✨ Generated by AI & saved for next time"}
                </p>
              )}
            </div>
          )}

          {/* ══ LIBRARY TAB ══ */}
          {!isShowingDetail && mainTab === "library" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.35s ease" }}>
              {/* Filters */}
              <div style={{ display: "flex", gap: 8 }}>
                <select value={libGoal} onChange={(e) => setLibGoal(e.target.value)} style={{ flex: 1, padding: "0.6rem 0.8rem", borderRadius: 12, border: "1px solid #e8e5de", background: "#fff", fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "inherit", outline: "none" }}>
                  <option value="">All goals</option>
                  {GOALS.map((g) => <option key={g.key} value={g.key}>{g.emoji} {g.label}</option>)}
                </select>
                <select value={libMeal} onChange={(e) => setLibMeal(e.target.value)} style={{ flex: 1, padding: "0.6rem 0.8rem", borderRadius: 12, border: "1px solid #e8e5de", background: "#fff", fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "inherit", outline: "none" }}>
                  <option value="">All meals</option>
                  {MEAL_TYPES.map((m) => <option key={m.key} value={m.key}>{m.emoji} {m.label}</option>)}
                </select>
              </div>

              {!libLoading && <p style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{libTotal} recipe{libTotal !== 1 ? "s" : ""} in library</p>}

              {libLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...Array(6)].map((_, i) => <Skeleton key={i} height={72} />)}
                </div>
              ) : libRecipes.length === 0 ? (
                <Card style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
                  <p style={{ fontSize: 28, marginBottom: 10 }}>📭</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>No recipes yet</p>
                  <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>Import the seed JSON into Atlas, or generate recipes from the Find tab.</p>
                </Card>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {libRecipes.map((r) => (
                    <LibraryCard key={r._id} recipe={r} onClick={() => setSelected2(r)} />
                  ))}
                </div>
              )}

              {libPages > 1 && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
                  <button onClick={() => fetchLibrary(libPage - 1)} disabled={libPage <= 1} style={{ padding: "0.5rem 1rem", borderRadius: 10, border: "1px solid #e8e5de", background: "#fff", fontSize: 13, fontWeight: 700, color: libPage <= 1 ? "#ccc" : "#1a1a1a", fontFamily: "inherit", cursor: libPage <= 1 ? "not-allowed" : "pointer" }}>← Prev</button>
                  <span style={{ fontSize: 12, color: "#aaa", display: "flex", alignItems: "center", fontWeight: 600 }}>{libPage} / {libPages}</span>
                  <button onClick={() => fetchLibrary(libPage + 1)} disabled={libPage >= libPages} style={{ padding: "0.5rem 1rem", borderRadius: 10, border: "1px solid #e8e5de", background: "#fff", fontSize: 13, fontWeight: 700, color: libPage >= libPages ? "#ccc" : "#1a1a1a", fontFamily: "inherit", cursor: libPage >= libPages ? "not-allowed" : "pointer" }}>Next →</button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </>
  );
}