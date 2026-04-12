"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const WHITELISTED_EMAILS = [
  "demo1@gmail.com",
  "review@yourpocketgym.com",
];

export default function PaywallOverlay() {
  const router = useRouter();
  const { data: session } = useSession();

  if (WHITELISTED_EMAILS.includes(session?.user?.email)) {
    return null;
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      zIndex: 50,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem",
    }}>
      {/* Blur layer */}
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

        {/* Logo */}
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.035em" }}>
            <span style={{ color: "#1a1a1a" }}>Your</span>
            <span style={{ color: "#ff6b35" }}>Pocket</span>
            <span style={{ color: "#1a1a1a" }}>Gym</span>
            <span> 🔒</span>
          </span>
        </div>

        <h2 style={{
          fontSize: 15, fontWeight: 800, color: "#1a1a1a",
          letterSpacing: "-0.04em", lineHeight: 1.2, marginBottom: 16,
        }}>
          Pro feature
        </h2>

        {/* Feature list — outer centers, inner shrinks to content */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Unlimited calorie tracking",
              "Unlimited recipes",
              "Unlimited AI training plans",
              "Unlimited AI chat bots",
            ].map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#ff6b35", fontSize: 13 }}>✓</span>
                <span style={{ fontSize: 13, color: "#666" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/v1/pricing")}
          style={{
            background: "#e55a25",
            width: "100%", padding: "1rem",
            border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 700, color: "#fff",
            fontFamily: "inherit", cursor: "pointer",
            marginBottom: 12,
          }}
        >
          Upgrade to Pro
        </button>

        <p style={{ fontSize: 12, color: "#bbb" }}>Tracking is always free. Cancel anytime.</p>
      </div>
    </div>
  );
}