"use client";

import { useRouter } from "next/navigation";

const SUPPORT_EMAIL = "rohithra75@gmail.com";

const FAQ = [
  {
    q: "Can I use PocketGym on multiple devices?",
    a: "Yes. Log in with the same account on any device and your data will sync automatically.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your data is stored securely and never sold to third parties. See our Privacy Policy for full details.",
  },
  {
    q: "How do I delete my account?",
    a: "Open the app, go to Profile → Delete Account. This permanently removes all your data.",
  },
  {
    q: "The AI scan isn't working — what should I do?",
    a: "Make sure you've allowed camera access in your iPhone Settings. If the issue persists, contact us at support@yourpocketgym.com.",
  },
];

export default function SupportPage() {
  const router = useRouter();

  return (
    <div style={S.root}>
      <style>{GLOBAL}</style>

      <header style={S.header}>
        <button style={S.backBtn} onClick={() => router.back()}>←</button>
        <span style={S.headerTitle}>Support</span>
        <div style={{ width: 36 }} />
      </header>

      <main style={S.main}>

        <p style={S.updated}>We usually respond within 24 hours.</p>

        {/* Cards */}
        <div style={S.body}>

          <div style={S.section}>
            <h2 style={S.sectionTitle}>Contact Us</h2>
            <div style={S.card}>
              <p style={S.cardLabel}>Email Support</p>
              <p style={S.p}>Send us a message and we'll get back to you as soon as possible.</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} style={S.emailBtn}>
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          <div style={S.section}>
            <h2 style={S.sectionTitle}>Account</h2>
            <div style={S.card}>
              <p style={S.cardLabel}>Delete Your Account</p>
              <p style={S.p}>
                You can permanently delete your account and all data from inside the app, or{" "}
                <a href="/legal/delete-account" style={S.inlineLink}>request deletion here</a>.
              </p>
            </div>
          </div>

          <div style={S.section}>
            <h2 style={S.sectionTitle}>Legal</h2>
            <div style={S.card}>
              <p style={S.p}>
                <a href="/legal/terms" style={S.inlineLink}>Terms of Service</a>
                {"  ·  "}
                <a href="/legal/privacy" style={S.inlineLink}>Privacy Policy</a>
              </p>
            </div>
          </div>

          <div style={S.section}>
            <h2 style={S.sectionTitle}>Common Questions</h2>
            {FAQ.map((item, i) => (
              <div key={i} style={{ ...S.card, marginBottom: i < FAQ.length - 1 ? 10 : 0 }}>
                <p style={S.cardLabel}>{item.q}</p>
                <p style={S.p}>{item.a}</p>
              </div>
            ))}
          </div>

        </div>

        <p style={S.version}>YourPocketGym · v1.0</p>
      </main>
    </div>
  );
}

const GLOBAL = `
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; margin: 0; padding: 0; }
  html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
  a { text-decoration: none; }
`;

const S = {
  root: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#fafaf8", minHeight: "100dvh",
  },
  header: {
    position: "sticky", top: 0,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px",
    background: "rgba(250,250,248,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    zIndex: 10,
  },
  backBtn: {
    width: 36, height: 36,
    background: "#fff", borderRadius: 10,
    border: "1px solid #e8e5de",
    fontSize: 18, color: "#1a1a1a", lineHeight: 1,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" },

  main: {
    maxWidth: 560, margin: "0 auto",
    padding: "20px 20px 64px",
    display: "flex", flexDirection: "column", gap: 4,
  },

  updated: { fontSize: 11, color: "#bbb", fontWeight: 500, marginBottom: 16 },

  body: { display: "flex", flexDirection: "column", gap: 24 },

  section: { display: "flex", flexDirection: "column", gap: 10 },

  sectionTitle: { fontSize: 14, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.01em" },

  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "16px 18px",
    border: "1px solid rgba(0,0,0,0.06)",
    display: "flex", flexDirection: "column", gap: 6,
  },

  cardLabel: { fontSize: 13, fontWeight: 700, color: "#1a1a1a" },

  p: { fontSize: 13, color: "#555", lineHeight: 1.75 },

  emailBtn: {
    display: "inline-block",
    marginTop: 4,
    background: "#0e0e0e",
    color: "#fff",
    fontSize: 13, fontWeight: 600,
    padding: "10px 16px",
    borderRadius: 10,
    letterSpacing: -0.2,
    alignSelf: "flex-start",
  },

  inlineLink: { color: "#e8380d", fontWeight: 500 },

  version: { textAlign: "center", fontSize: 10, color: "#ccc", marginTop: 16 },
};
