"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const WHITELISTED_EMAILS = [
  "demo1@gmail.com",
  "review@yourpocketgym.com", // Google reviewer account
];

export default function PaywallOverlay() {
  const router = useRouter();
  const { data: session } = useSession();

  // bypass paywall for whitelisted emails
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
        <div style={S.root}>
          <span style={S.logoText}>
            <span style={{ color: "#1a1a1a" }}>Your</span>
            <span style={{ color: "#ff6b35" }}>Pocket</span>
            <span style={{ color: "#1a1a1a" }}>Gym</span>
            <span>🔒</span>
          </span>
        </div>
        <h2 style={{
          fontSize: 15, fontWeight: 800, color: "#1a1a1a",
          letterSpacing: "-0.04em", lineHeight: 1.2, marginBottom: 8,
        }}>
          Pro feature
        </h2>
        <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Upgrade to Pro to unlock AI training plans, calories tracking and recipe finder.
        </p>

        <button
          onClick={() => router.push("/v1/pricing")}
          style={{
            background: "#e55a25",
            width: "100%", padding: "1rem",
            border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 700, color: "#fff",
            fontFamily: "inherit", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Upgrade to Pro
        </button>

        <p style={{ fontSize: 12, color: "#bbb" }}>Tracking is always free. Cancel anytime.</p>
      </div>
    </div>
  );
}

const S = {
  root: { marginBottom: "5px" },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.035em",
  },
};
//nutrition tracking, recipe finder and more