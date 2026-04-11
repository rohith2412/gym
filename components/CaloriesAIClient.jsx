"use client";

import { useState, useRef, useEffect } from "react";
import { signIn, useSession }          from "next-auth/react";
import { useRouter }                   from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return Math.round(n ?? 0); }
function mealEmoji(type) {
  return { breakfast: "🥞", lunch: "🥗", dinner: "🍜", snack: "🫐" }[type] ?? "🍽️";
}

// ─── Login modal ────────────────────────────────────────────────────────────── dashboard start
function LoginModal({ onClose }) {
  return (
    <>
      <div style={{
        position: "fixed", inset: 0, zIndex: 50,
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        background: "rgba(250,250,248,0.7)",
      }} onClick={onClose} />
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "#fff",
        borderRadius: "28px 28px 0 0",
        padding: "2rem 1.75rem 3rem",
        zIndex: 60,
        boxShadow: "0 -8px 60px rgba(0,0,0,0.12)",
        animation: "slideUp 0.32s cubic-bezier(.32,1.2,.64,1)",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e0ddd6", margin: "0 auto 1.75rem" }} />
        
         <h1 className="flex w-full justify-center items-center"
          style={{
            fontSize: "22px",
            fontWeight: "400",
            marginBottom: "8px",
          }}
        >
          Welcome 👋
        </h1>
        <div className="w-full justify-center flex" style={S.root}>
          <span style={S.logoText}>
            <span style={{ color: "#1a1a1a" }}>Your</span>
            <span style={{ color: "#ff6b35" }}>Pocket</span>
            <span style={{ color: "#1a1a1a" }}>Gym</span>
          </span>
        </div>
        {/* <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em", textAlign: "center", marginBottom: 8 }}>
          Try free - once
        </h2> */}
        <p style={{ fontSize: 14, color: "#aaa", textAlign: "center", lineHeight: 1.6, marginBottom: "0.5rem" }}>
          Sign in with Google to snap a photo and get instant calories + macros. No credit card, no commitment.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/v1/blog/caloriesAI" })}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 10,
            padding: "0.9rem 1rem",
            background: "#fff",  cursor: "pointer",
            fontSize: 15, fontWeight: 700, color: "#1a1a1a",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          marginBottom: 12,
          }}
        >
          <img src="/Googlelogo.svg" alt="" />
          
        </button>
        <p style={{ fontSize: 11, color: "#ccc", textAlign: "center", lineHeight: 1.5 }}>
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </>
  );
}

// ─── CalAI Tool ───────────────────────────────────────────────────────────────
function CalAITool({ onResult }) {
  const fileRef = useRef(null);
  const [preview,  setPreview]  = useState(null);
  const [base64,   setBase64]   = useState(null);
  const [mealType, setMealType] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const MEAL_TYPES = [
    { key: "breakfast", label: "Breakfast", emoji: "🥞" },
    { key: "lunch",     label: "Lunch",     emoji: "🥗" },
    { key: "dinner",    label: "Dinner",    emoji: "🍜" },
    { key: "snack",     label: "Snack",     emoji: "🫐" },
  ];

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { setPreview(e.target.result); setBase64(e.target.result); };
    reader.readAsDataURL(file);
  }

  async function analyse() {
    if (!base64 || !mealType) return;
    setLoading(true); setError(null);
    try {
      await fetch("/api/free-trial", { method: "POST" });
      const res  = await fetch("/api/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mealType }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Analysis failed");
      onResult(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e5de", borderRadius: 24, padding: "1.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>
        Your free analysis
      </p>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          height: 200, borderRadius: 16,
          border: preview ? "none" : "2px dashed #e0ddd6",
          background: preview ? "transparent" : "#f4f2ed",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden", marginBottom: "1rem",
          position: "relative",
        }}
      >
        {preview ? (
          <img src={preview} alt="meal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📸</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#bbb" }}>Tap to upload your meal photo</p>
            <p style={{ fontSize: 12, color: "#ccc", marginTop: 4 }}>AI will detect every food item</p>
          </div>
        )}
        {preview && (
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(null); setBase64(null); }}
            style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: 99, width: 28, height: 28, fontSize: 14, cursor: "pointer" }}
          >✕</button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>
        What meal is this?
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.25rem" }}>
        {MEAL_TYPES.map((t) => (
          <button key={t.key} onClick={() => setMealType(t.key)} style={{
            padding: "0.7rem", borderRadius: 12, border: "1px solid",
            borderColor: mealType === t.key ? "#1a1a1a" : "#e8e5de",
            background: mealType === t.key ? "#1a1a1a" : "#fff",
            color: mealType === t.key ? "#fafaf8" : "#1a1a1a",
            fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span style={{ fontSize: 16 }}>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {error && <p style={{ fontSize: 12, color: "#e53e3e", marginBottom: 10, fontWeight: 600 }}>⚠️ {error}</p>}

      <button
        onClick={analyse}
        disabled={!base64 || !mealType || loading}
        style={{
          width: "100%", padding: "1rem",
          background: "#1a1a1a", color: "#fafaf8",
          border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          opacity: (!base64 || !mealType || loading) ? 0.4 : 1,
          cursor: (!base64 || !mealType || loading) ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {loading ? (
          <>
            <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
            Analysing with AI…
          </>
        ) : "✨ Analyse my meal - free"}
      </button>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({ result, onContinue }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e5de", borderRadius: 24, padding: "1.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
        <span style={{ fontSize: 28 }}>{mealEmoji(result.mealType)}</span>
        <div>
          <p style={{ fontSize: 12, color: "#aaa", fontWeight: 500, textTransform: "capitalize" }}>{result.mealType}</p>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em" }}>
            {fmt(result.totals?.calories)} <span style={{ fontSize: 14, fontWeight: 400, color: "#bbb" }}>kcal</span>
          </h3>
        </div>
        {/* <span style={{ marginLeft: "auto", fontSize: 24, background: "rgba(34,197,94,0.1)", padding: "0.5rem", borderRadius: 12 }}>✅</span> */}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
        {[
          { label: "Protein", value: result.totals?.protein, color: "#ff6b35", bg: "rgba(255,107,53,0.08)" },
          { label: "Carbs",   value: result.totals?.carbs,   color: "#1a1a1a", bg: "#f4f2ed" },
          { label: "Fat",     value: result.totals?.fat,     color: "#666",    bg: "#f4f2ed" },
        ].map((m) => (
          <div key={m.label} style={{ flex: 1, background: m.bg, borderRadius: 12, padding: "0.6rem 0.5rem", textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: m.color, letterSpacing: "-0.03em" }}>{fmt(m.value)}<span style={{ fontSize: 10, color: "#aaa" }}>g</span></p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>Detected</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1.5rem" }}>
        {result.foods?.map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.8rem", background: "#f4f2ed", borderRadius: 10 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{f.name}</p>
              <p style={{ fontSize: 11, color: "#aaa" }}>{f.portion}</p>
            </div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>{fmt(f.macros?.calories)} <span style={{ fontSize: 10, fontWeight: 400, color: "#bbb" }}>kcal</span></p>
          </div>
        ))}
      </div>

      {result.aiNotes && (
        <p style={{ fontSize: 12, color: "#aaa", fontStyle: "italic", lineHeight: 1.6, marginBottom: "1.25rem" }}>💡 {result.aiNotes}</p>
      )}

      <div style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", borderRadius: 16, padding: "1.25rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>🔥 Log every meal like this</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: "1rem" }}>
          Track calories, protein, carbs & fat daily. See your week at a glance. Reach your goals faster.
        </p>
        <button
          onClick={onContinue}
          style={{
            width: "100%", padding: "0.8rem",
            background: "#ff6b35", color: "#fff",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer",
          }}
        >
          Track more calories  →
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CaloriesAIClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showLogin,    setShowLogin]    = useState(false);
  const [trialUsed,    setTrialUsed]    = useState(false);
  const [trialChecked, setTrialChecked] = useState(false);
  const [result,       setResult]       = useState(null);
  const [toolVisible,  setToolVisible]  = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/free-trial")
      .then((r) => r.json())
      .then((json) => {
        setTrialUsed(json.used);
        setTrialChecked(true);
        if (json.used) {
        router.replace("/v1/caloriesAI"); // ← redirect immediately
      } else {
        setToolVisible(true);
      }

      });
  }, [status]);

  function handleTryFree() {
    if (status === "authenticated") {
      if (trialUsed) { router.push("/v1/tracking"); return; }
      setToolVisible(true);
    } else {
      setShowLogin(true);
    }
  }

  function handleResult(data) {
    setResult(data);
    setToolVisible(false);
  }

  const isLoading = status === "loading" || (status === "authenticated" && !trialChecked);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
        @keyframes slideUp { from { transform: translateY(100%) translateX(-50%); opacity: 0; } to { transform: translateY(0) translateX(-50%); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>

      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fafaf8", minHeight: "100dvh", maxWidth: 680, margin: "0 auto", padding: "0 1.25rem 4rem" }}>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 0 2rem" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.035em", color: "#1a1a1a" }}>
              Your<span style={{ color: "#ff6b35" }}>Pocket</span>Gym
            </span>
          </a>
          {status === "authenticated" ? (
            <a href="/v1/tracking" style={{ fontSize: 13, fontWeight: 700, color: "#ff6b35", textDecoration: "none", padding: "0.4rem 1rem", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 99 }}>
              Track more →
            </a>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", background: "none", border: "1px solid #e8e5de", borderRadius: 99, padding: "0.4rem 1rem", cursor: "pointer", fontFamily: "inherit" }}>
              Sign in
            </button>
          )}
        </nav>

        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "3rem", animation: "fadeIn 0.5s ease" }}>
          {/* <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 99, padding: "0.35rem 0.9rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: 12 }}>✨</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6b35", letterSpacing: "0.04em" }}>AI-POWERED · FREE TO TRY</span>
          </div> */}
          <h1 style={{ fontSize: "clamp(28px, 6vw, 44px)", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "1rem" }}>
            Snap a photo.<br />Get <span style={{ color: "#ff6b35" }}>instant calories</span>.
          </h1>
          <p style={{ fontSize: 16, color: "#888", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 2rem" }}>
            The fastest AI calorie tracker. No manual logging - just photograph your meal and our AI detects every food item with calories, protein, carbs and fat in seconds.
          </p>
          {!toolVisible && !result && (
            <>
              <button
                onClick={handleTryFree}
                style={{ padding: "1rem 2.5rem", background: "#1a1a1a", color: "#fafaf8", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer", letterSpacing: "0.01em", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
              >
                {isLoading ? "Loading…" : trialUsed ? "Go to dashboard →" : "📸 Try it free - snap a meal"}
              </button>
              <p style={{ fontSize: 12, color: "#ccc", marginTop: 10 }}>No credit card · Takes 5 seconds</p>
            </>
          )}
        </section>

        {/* SEO content - hidden once tool or result is showing */}
        {!toolVisible && !result && (
          <>
            {/* How it works */}
            <section style={{ marginBottom: "3rem" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: "1.25rem", textAlign: "center" }}>How it works</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { emoji: "📸", title: "Snap a photo",   desc: "Take a picture of any meal, snack or drink" },
                  { emoji: "🤖", title: "AI analyses it", desc: "GPT-4o Vision detects every food item instantly" },
                  { emoji: "📊", title: "Get macros",     desc: "Calories, protein, carbs and fat in seconds" },
                ].map((s) => (
                  <div key={s.title} style={{ background: "#fff", border: "1px solid #e8e5de", borderRadius: 20, padding: "1.25rem 1rem", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>{s.title}</p>
                    <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            <section style={{ marginBottom: "3rem" }}>
              <div style={{ background: "#fff", border: "1px solid #e8e5de", borderRadius: 24, padding: "1.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>The smarter way to track calories</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { icon: "⚡", title: "Instant results",    desc: "Full nutritional breakdown in under 10 seconds" },
                    { icon: "🎯", title: "High accuracy",      desc: "AI-powered portion estimation across thousands of foods" },
                    { icon: "📱", title: "Works on any meal",  desc: "Restaurant food, home cooking, packaged snacks - anything" },
                    { icon: "💪", title: "Macro-focused",      desc: "Protein, carbs, fat and fiber - not just calories" },
                    { icon: "📈", title: "Track over time",    desc: "See your daily and weekly nutrition at a glance" },
                  ].map((f) => (
                    <div key={f.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{f.title}</p>
                        <p style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section style={{ marginBottom: "3rem" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>Frequently asked questions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { q: "How accurate is the AI calorie tracker?",      a: "Our AI uses GPT-4o Vision, which achieves high accuracy on common foods. Estimates may vary on mixed dishes or non-standard portions - the AI flags lower-confidence items." },
                  { q: "Do I need to manually enter portion sizes?",    a: "No. The AI estimates portion sizes from the photo automatically. You can see each item's portion guess in the breakdown." },
                  { q: "What foods can it recognise?",                  a: "The AI recognises thousands of foods including restaurant meals, fast food, home cooking, packaged goods and ethnic cuisines from around the world." },
                  { q: "Is this better than MyFitnessPal?",            a: "For photo-based logging yes - no manual search, no barcode scanning. Just snap and go. For long-term tracking we combine it with a full dashboard so you never lose sight of your daily goals." },
                ].map((faq, i) => (
                  <details key={i} style={{ background: "#fff", border: "1px solid #e8e5de", borderRadius: 16, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <summary style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {faq.q} <span style={{ color: "#ccc", fontSize: 18, flexShrink: 0, marginLeft: 8 }}>+</span>
                    </summary>
                    <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65, marginTop: 10 }}>{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Bottom CTA */}
            <div style={{ textAlign: "center", padding: "1rem 0 2rem" }}>
              <button
                onClick={handleTryFree}
                style={{ padding: "1rem 2.5rem", background: "#ff6b35", color: "#fff", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 20px rgba(255,107,53,0.3)" }}
              >
                📸 Try it now - it's free
              </button>
              <p style={{ fontSize: 12, color: "#ccc", marginTop: 10 }}>Takes 5 seconds · No credit card</p>
            </div>
          </>
        )}

        {/* Tool */}
        {toolVisible && !result && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <CalAITool onResult={handleResult} />
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <ResultCard result={result} onContinue={() => router.push("/v1/tracking")} />
          </div>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}

const S = {
  root: {
    marginBottom: "20px",
  },
  logoText: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.035em",
  },
};
