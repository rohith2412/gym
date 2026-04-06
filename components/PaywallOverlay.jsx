// components/PaywallOverlay.jsx
"use client";

import { useRouter } from "next/navigation";

export default function PaywallOverlay() {
  const router = useRouter();

  return (
    <div style={{
      position: "fixed", inset: 0,
      zIndex: 50,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem",
    }}>
      {/* Frosted glass blur layer */}
      <div style={{
        position: "absolute", inset: 0,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(250,250,248,0.75)",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        background: "#fff", border: "1px solid #e8e5de",
        borderRadius: 24, padding: "2rem 1.75rem",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        textAlign: "center", maxWidth: 340, width: "100%",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{
          fontSize: 22, fontWeight: 800, color: "#1a1a1a",
          letterSpacing: "-0.04em", lineHeight: 1.2, marginBottom: 8,
        }}>
          Pro feature
        </h2>
        <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Upgrade to Pro to unlock AI training plans, nutrition tracking, recipe finder and more.
        </p>

        <button
          onClick={() => router.push("/v1/pricing")}
          style={{
            width: "100%", padding: "0.95rem",
            background: "linear-gradient(135deg,#ff6b35,#f59e0b)",
            color: "#fff", border: "none", borderRadius: 14,
            fontSize: 15, fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: "pointer", marginBottom: 10,
          }}
        >
          ✨ Upgrade to Pro — $9.99/mo
        </button>

        <p style={{ fontSize: 12, color: "#bbb" }}>Tracking is always free. Cancel anytime.</p>
      </div>
    </div>
  );
}