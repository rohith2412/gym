"use client";

import { useSession } from "next-auth/react";
import { useRouter }  from "next/navigation";
import { useEffect, useState } from "react";

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id:      "reps",
    emoji:   "🔢",
    label:   "Rep Recorder",
    desc:    "Track sets & reps in real time",
    href:    "/v1/reps",
    premium: false,
  },
  {
    id:      "trainer",
    emoji:   "🤖",
    label:   "AI Trainer",
    desc:    "Personalised weekly workout plans",
    href:    "/v1/ai-trainer",
    premium: true,
  },
  {
    id:      "recipes",
    emoji:   "🥩",
    label:   "High-Protein Recipes",
    desc:    "AI meals matched to your macros",
    href:    "/v1/recipes",
    premium: true,
  },
  {
    id:      "calories",
    emoji:   "📸",
    label:   "Calorie Scanner",
    desc:    "Snap food → instant calorie breakdown",
    href:    "/v1/calorie-scanner",
    premium: true,
  },
];

// ─── Full-page paywall overlay ────────────────────────────────────────────────
function PaywallOverlay({ featureName, onClose, onUpgrade }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(10,10,10,0.92)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem 1.5rem",
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        width: "100%", maxWidth: 360,
        background: "#fafaf8", borderRadius: 28,
        padding: "2rem 1.5rem 1.5rem",
        textAlign: "center",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        animation: "popIn 0.25s cubic-bezier(0.34,1.4,0.64,1)",
      }}>
        {/* Lock icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: "#1a1a1a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, margin: "0 auto 1.25rem",
        }}>🔒</div>

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#ff6b35", marginBottom: 8,
        }}>Premium only</p>

        <h2 style={{
          fontSize: 22, fontWeight: 800, color: "#1a1a1a",
          letterSpacing: "-0.04em", lineHeight: 1.2, marginBottom: 10,
        }}>{featureName}</h2>

        <p style={{
          fontSize: 13, color: "#aaa", lineHeight: 1.65, marginBottom: "1.75rem",
        }}>
          This feature is only available to Premium members.
          Upgrade to unlock all AI tools and get the most out of your training.
        </p>

        <button
          onClick={onUpgrade}
          style={{
            width: "100%", padding: "0.95rem",
            background: "#1a1a1a", color: "#fff",
            border: "none", borderRadius: 14,
            fontSize: 15, fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: "pointer", marginBottom: 10,
            letterSpacing: "-0.02em",
          }}
        >⚡ Upgrade to Premium</button>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "0.75rem",
            background: "transparent", color: "#bbb",
            border: "none", borderRadius: 12,
            fontSize: 13, fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: "pointer",
          }}
        >← Go back</button>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

// ─── Main dock ────────────────────────────────────────────────────────────────
export default function FeaturesDock() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isPremium,   setIsPremium]   = useState(false);
  const [premiumLoad, setPremiumLoad] = useState(true);
  const [paywall,     setPaywall]     = useState(null); // { label } | null

  // Fetch premium status from DB via /api/user-premium
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user-premium")
      .then(r => r.json())
      .then(json => { if (json.success) setIsPremium(json.data.isPremium); })
      .finally(() => setPremiumLoad(false));
  }, [status]);

  function handleFeatureTap(feature) {
    if (feature.premium && !isPremium) {
      setPaywall({ label: feature.label });
      return;
    }
    router.push(feature.href);
  }

  if (status === "loading" || premiumLoad) return null;

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: "#fafaf8", minHeight: "100dvh",
      maxWidth: 430, margin: "0 auto",
      padding: "1.5rem 1.25rem 3rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html,body { background:#fafaf8; -webkit-font-smoothing:antialiased; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 3 }}>
          {isPremium ? "⚡ Premium" : "Free plan"}
        </p>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: "#1a1a1a",
          letterSpacing: "-0.05em", lineHeight: 1.1,
        }}>Features</h1>
      </div>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FEATURES.map((f, i) => {
          const locked = f.premium && !isPremium;
          return (
            <div
              key={f.id}
              onClick={() => handleFeatureTap(f)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#fff",
                border: "1px solid #e8e5de",
                borderRadius: 18, padding: "1rem 1.1rem",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                opacity: locked ? 0.72 : 1,
                animation: `fadeUp 0.3s ease ${i * 0.07}s both`,
                transition: "transform 0.1s",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onTouchStart={e => e.currentTarget.style.transform = "scale(0.98)"}
              onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {/* Emoji icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: locked ? "#f4f2ed" : "#1a1a1a",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 22,
                filter: locked ? "grayscale(1) opacity(0.5)" : "none",
              }}>{f.emoji}</div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14, fontWeight: 700,
                  color: locked ? "#999" : "#1a1a1a",
                  letterSpacing: "-0.02em", marginBottom: 2,
                }}>{f.label}</p>
                <p style={{ fontSize: 12, color: "#bbb", lineHeight: 1.4 }}>{f.desc}</p>
              </div>

              {/* Right indicator */}
              {locked ? (
                <span style={{
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  color: "#ff6b35",
                  background: "rgba(255,107,53,0.08)",
                  border: "1px solid rgba(255,107,53,0.2)",
                  borderRadius: 99, padding: "0.2rem 0.6rem",
                }}>🔒 Premium</span>
              ) : (
                <span style={{ fontSize: 18, color: "#ddd", flexShrink: 0 }}>›</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade nudge banner — free users only */}
      {!isPremium && (
        <div
          onClick={() => router.push("/v1/pricing")}
          style={{
            marginTop: 20, cursor: "pointer",
            background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)",
            borderRadius: 18, padding: "1rem 1.1rem",
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <span style={{ fontSize: 26 }}>⚡</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
              Unlock all AI tools
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              Trainer · Recipes · Calorie Scanner
            </p>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, color: "#fff",
            background: "#ff6b35", borderRadius: 10,
            padding: "0.4rem 0.75rem", flexShrink: 0,
          }}>Upgrade</span>
        </div>
      )}

      {/* Full-page paywall overlay */}
      {paywall && (
        <PaywallOverlay
          featureName={paywall.label}
          onClose={() => setPaywall(null)}
          onUpgrade={() => { setPaywall(null); router.push("/v1/pricing"); }}
        />
      )}
    </div>
  );
}