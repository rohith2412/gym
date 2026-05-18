"use client";

import { useRouter } from "next/navigation";

const SUPPORT_EMAIL = "rohithra75@gmail.com";

export default function SupportPage() {
  const router = useRouter();

  return (
    <div style={S.root}>
      <style>{GLOBAL}</style>

      {/* Header */}
      <header style={S.header}>
        <button style={S.backBtn} onClick={() => router.back()}>←</button>
        <span style={S.headerTitle}>Support</span>
        <div style={{ width: 36 }} />
      </header>

      <main style={S.main}>

        {/* Hero */}
        <div style={S.hero}>
          <div style={S.heroIcon}>💬</div>
          <h1 style={S.heroTitle}>How can we help?</h1>
          <p style={S.heroSub}>We usually respond within 24 hours.</p>
        </div>

        {/* Cards */}
        <div style={S.cards}>

          <div style={S.card}>
            <div style={S.cardIcon}>✉️</div>
            <div style={S.cardBody}>
              <p style={S.cardTitle}>Email Support</p>
              <p style={S.cardDesc}>Send us a message and we'll get back to you as soon as possible.</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} style={S.emailBtn}>
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardIcon}>🗑️</div>
            <div style={S.cardBody}>
              <p style={S.cardTitle}>Delete Your Account</p>
              <p style={S.cardDesc}>
                You can permanently delete your account and all data from inside the app,
                or{" "}
                <a href="/legal/delete-account" style={S.inlineLink}>request deletion here</a>.
              </p>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardIcon}>📄</div>
            <div style={S.cardBody}>
              <p style={S.cardTitle}>Legal</p>
              <p style={S.cardDesc}>
                <a href="/legal/terms" style={S.inlineLink}>Terms of Service</a>
                {" · "}
                <a href="/legal/privacy" style={S.inlineLink}>Privacy Policy</a>
              </p>
            </div>
          </div>

        </div>

        {/* Common questions */}
        <div style={S.faqSection}>
          <p style={S.faqHeading}>Common Questions</p>

          {FAQ.map((item, i) => (
            <div key={i} style={S.faqItem}>
              <p style={S.faqQ}>{item.q}</p>
              <p style={S.faqA}>{item.a}</p>
            </div>
          ))}
        </div>

        <p style={S.footer}>PocketGym · v1.0</p>
      </main>
    </div>
  );
}

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

const GLOBAL = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f7f7f5; }
  a { text-decoration: none; }
`;

const S = {
  root: {
    minHeight: "100vh",
    background: "#f7f7f5",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    position: "sticky",
    top: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "rgba(247,247,245,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    border: "none",
    background: "transparent",
    fontSize: 20,
    cursor: "pointer",
    color: "#0e0e0e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0e0e0e",
    letterSpacing: -0.3,
  },

  main: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "32px 20px 64px",
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },

  // Hero
  hero: {
    textAlign: "center",
    padding: "24px 0 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  heroIcon: { fontSize: 48 },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0e0e0e",
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(0,0,0,0.38)",
  },

  // Cards
  cards: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "18px 20px",
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  cardIcon: {
    fontSize: 24,
    flexShrink: 0,
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0e0e0e",
  },
  cardDesc: {
    fontSize: 14,
    color: "rgba(0,0,0,0.5)",
    lineHeight: 1.5,
  },
  emailBtn: {
    display: "inline-block",
    marginTop: 6,
    background: "#0e0e0e",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    padding: "10px 16px",
    borderRadius: 10,
    letterSpacing: -0.2,
  },
  inlineLink: {
    color: "#e8380d",
    fontWeight: "500",
  },

  // FAQ
  faqSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  faqHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(0,0,0,0.35)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  faqItem: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    border: "1px solid rgba(0,0,0,0.06)",
  },
  faqQ: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0e0e0e",
  },
  faqA: {
    fontSize: 14,
    color: "rgba(0,0,0,0.5)",
    lineHeight: 1.5,
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(0,0,0,0.2)",
  },
};
