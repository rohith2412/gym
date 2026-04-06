// app/v1/pricing/page.jsx  (or wherever your routing lives)
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const FEATURES_FREE = [
  "Workout tracker (unlimited logs)",
  "7-day streak view",
  "Year contribution chart",
  "Personal bests tracking",
];

const FEATURES_PRO = [
  "Everything in Free",
  "AI-powered weekly training plans",
  "AI personal trainer chat",
  "Nutrition & meal photo analysis",
  "AI protein recipe finder",
  "Recipe library (100+ recipes)",
  "Saved training plans",
  "Progress drill-down analytics",
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [loading,    setLoading]    = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const success  = searchParams.get("success")  === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/"); return; }
    if (status !== "authenticated")   return;
    fetch("/api/user-intro")
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.isSubscribed) setSubscribed(true); })
      .finally(() => setCheckingStatus(false));
  }, [status]);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (json.success) window.location.href = json.url;
      else alert("Error: " + json.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: "#fafaf8", minHeight: "100dvh",
      maxWidth: 430, margin: "0 auto",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <header style={{
        padding: "1.2rem 1.25rem 0.8rem",
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0,
        background: "rgba(250,250,248,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(232,229,222,0.5)",
        zIndex: 10,
      }}>
        <button
          onClick={() => router.back()}
          style={{ width: 36, height: 36, border: "1px solid #e8e5de", background: "#fff", borderRadius: 10, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a" }}
        >←</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" }}>Upgrade to Pro</h1>
      </header>

      <main style={{ padding: "1.25rem 1.25rem 3rem", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Success / canceled banners */}
        {success && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 14, padding: "1rem 1.1rem", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>You're subscribed!</p>
              <p style={{ fontSize: 12, color: "#16a34a", opacity: 0.8, marginTop: 2 }}>All Pro features are now unlocked. Enjoy!</p>
            </div>
          </div>
        )}
        {canceled && (
          <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 14, padding: "1rem 1.1rem" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#d97706" }}>Payment canceled — you can try again any time.</p>
          </div>
        )}

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "1.5rem 0 0.5rem" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em", lineHeight: 1.2, marginBottom: 8 }}>
            Your pocket gym,<br />fully unlocked
          </h2>
          <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7 }}>
            Everything you need to train smarter, eat better, and hit your goals — powered by AI.
          </p>
        </div>

        {/* Price card */}
        <div style={{ background: "#1a1a1a", borderRadius: 24, padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,107,53,0.15)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(99,102,241,0.1)" }} />

          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ff6b35", background: "rgba(255,107,53,0.15)", borderRadius: 99, padding: "0.25rem 0.7rem", display: "inline-block", marginBottom: 12 }}>
            Pro Plan
          </span>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-0.06em", lineHeight: 1 }}>$9</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>.99 / month</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>Cancel anytime. No hidden fees.</p>

          {checkingStatus ? (
            <div style={{ height: 50, background: "rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : subscribed ? (
            <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 14, padding: "0.9rem", textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>✓ You're on Pro</p>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                width: "100%", padding: "1rem",
                background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#ff6b35,#f59e0b)",
                border: "none", borderRadius: 14,
                fontSize: 15, fontWeight: 700, color: "#fff",
                fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Redirecting to Stripe…
                </>
              ) : "✨ Start Pro — $9.99/mo"}
            </button>
          )}
        </div>

        {/* What's included */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>What's included</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FEATURES_PRO.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#fff", border: "1px solid #e8e5de", borderRadius: 14 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,107,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#ff6b35", fontWeight: 800, flexShrink: 0 }}>✓</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Free tier */}
        <div style={{ background: "#f4f2ed", borderRadius: 20, padding: "1.1rem 1.25rem" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Always free</p>
          {FEATURES_FREE.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < FEATURES_FREE.length - 1 ? 8 : 0 }}>
              <span style={{ fontSize: 12, color: "#bbb" }}>✓</span>
              <p style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{f}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", lineHeight: 1.6 }}>
          Secured by Stripe. You can cancel at any time from your profile page.
        </p>
      </main>
    </div>
  );
}