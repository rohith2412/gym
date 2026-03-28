"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginButton from "@/components/LoginButton";

const features = [
  {
    icon: "⚡",
    title: "AI Training Plans",
    desc: "Every session designed around your body, your goals, your schedule.",
  },
  {
    icon: "📊",
    title: "Progress Analytics",
    desc: "See every gain. Track strength, endurance, and body composition over time.",
  },
  {
    icon: "🎯",
    title: "Goal-First Coaching",
    desc: "Whether it's fat loss, muscle, or performance — your plan is built backwards from the result.",
  },
  {
    icon: "🔄",
    title: "Adaptive Workouts",
    desc: "Your plan updates weekly based on how your body responds. Always optimal.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    sub: "Forever",
    perks: ["AI workout plan", "Basic tracking", "3 goals"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    sub: "per month",
    perks: [
      "Everything in Starter",
      "Adaptive weekly updates",
      "Nutrition guidance",
      "Unlimited goals",
      "Priority support",
    ],
    cta: "Start 7-day trial",
    highlight: true,
  },
  {
    name: "Elite",
    price: "$29",
    sub: "per month",
    perks: [
      "Everything in Pro",
      "1-on-1 coach access",
      "Video form review",
      "Custom meal plans",
    ],
    cta: "Go Elite",
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Jordan M.",
    result: "−18 kg in 4 months",
    quote:
      "I've tried every app. This is the only one that actually adapts to me.",
    initials: "JM",
  },
  {
    name: "Priya K.",
    result: "+8 kg muscle",
    quote:
      "The AI knew when to push me and when to back off. Felt like a real coach.",
    initials: "PK",
  },
  {
    name: "Alex R.",
    result: "First powerlifting meet",
    quote: "Went from zero to competing in 6 months. Completely unreal.",
    initials: "AR",
  },
];

const stats = [
  { n: "50K+", label: "Athletes" },
  { n: "94%", label: "Hit goals" },
  { n: "2M+", label: "Workouts" },
  { n: "4.9★", label: "Rating" },
];

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [vis, setVis] = useState(new Set());

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) =>
            e.isIntersecting &&
            setVis((p) => new Set([...p, e.target.dataset.s])),
        ),
      { threshold: 0.1 },
    );
    document.querySelectorAll("[data-s]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const r = (id, delay = 0) => ({
    opacity: vis.has(id) ? 1 : 0,
    transform: vis.has(id) ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.7s ${delay}s cubic-bezier(.22,1,.36,1), transform 0.7s ${delay}s cubic-bezier(.22,1,.36,1)`,
  });

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        a { text-decoration: none; }
        .nav-link:hover { color: #1a1a1a !important; }
        .hover-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .hover-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.09) !important; }
        .btn-dark:hover { background: #111 !important; }
        .btn-orange:hover { background: #e55a25 !important; }
        .btn-outline:hover { background: #f5f4f0 !important; }
      `}</style>

      <nav style={{ ...S.nav, ...(scrolled ? S.navScrolled : {}) }}>
        <div style={S.logo}>APEX</div>

        <button
          className="btn-dark"
          style={S.navCta}
          onClick={() => router.push("/intro")}
        >
          Start free
        </button>
      </nav>

      <section style={S.hero}>
        <div style={S.glow} />

        <div style={S.heroBadge}>
          <span style={S.greenDot} />
          Trusted by 50,000+ athletes worldwide
        </div>

        <h1 style={S.h1}>
          The gym
          <br />
          in your
          <br />
          <span style={{ color: "#ff6b35" }}>pocket.</span>
        </h1>

        <p style={S.heroSub}>
          AI-powered training that adapts to your body, your life, and your
          goals - from day one to your best ever.
        </p>

        <div style={S.heroBtns}>
          <button className="btn-dark" style={S.btnDark}>
            <LoginButton />
          </button>
        </div>

        <p style={S.disclaimer}>
          No credit card. No commitment. Cancel anytime.
        </p>

        <div style={S.statsStrip}>
          {stats.map((st, i) => (
            <div
              key={i}
              style={{
                ...S.statCell,
                ...(i < stats.length - 1
                  ? { borderRight: "1px solid #e8e5de" }
                  : {}),
              }}
            >
              <span style={S.statN}>{st.n}</span>
              <span style={S.statL}>{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={S.tickerOuter}>
        <div style={S.tickerInner}>
          {[...Array(2)].flatMap((_, rep) =>
            [
              "STRENGTH",
              "FAT LOSS",
              "MUSCLE GAIN",
              "PERFORMANCE",
              "RECOVERY",
              "CONSISTENCY",
            ].map((w, i) => (
              <span key={`${rep}-${i}`} style={S.tickerItem}>
                {w} <span style={{ color: "#d4d0c8" }}>—</span>
              </span>
            )),
          )}
        </div>
      </div>

      <section id="features" style={S.sec} data-s="feat">
        <div style={{ ...S.secHead, ...r("feat") }}>
          <p style={S.eyebrow}>Why Apex</p>
          <h2 style={S.h2}>
            Everything you need.
            <br />
            Nothing you don&#39;t.
          </h2>
        </div>
        <div style={S.featGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              className="hover-card"
              data-s={`f${i}`}
              style={{ ...S.featCard, ...r(`f${i}`, i * 0.09) }}
            >
              <div style={S.featIcon}>{f.icon}</div>
              <h3 style={S.featTitle}>{f.title}</h3>
              <p style={S.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={S.howOuter} data-s="how">
        <div style={{ ...S.howCard, ...r("how") }}>
          <div>
            <p style={{ ...S.eyebrow, color: "#ff6b35" }}>How it works</p>
            <h2
              style={{
                ...S.h2,
                color: "#fafaf8",
                fontSize: "clamp(1.8rem,7vw,2.6rem)",
                marginBottom: "1rem",
              }}
            >
              Answer 7 questions.
              <br />
              Get your plan instantly.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(250,250,248,0.5)",
                lineHeight: 1.8,
                fontWeight: 300,
              }}
            >
              Tell us your body, goals, and schedule. Our AI builds a fully
              personalised training plan in seconds — then refines it every
              week.
            </p>
            <button
              className="btn-orange"
              style={S.btnOrange}
              onClick={() => router.push("/intro")}
            >
              Take the quiz →
            </button>
          </div>

          <div style={S.stepsCol}>
            {[
              "Answer 7 quick questions",
              "AI generates your plan",
              "Train & log your sessions",
              "Plan adapts every week",
            ].map((step, i) => (
              <div key={i} style={S.stepRow}>
                <div style={S.stepNum}>{i + 1}</div>
                <span style={S.stepText}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={S.sec} data-s="price">
        <div style={{ ...S.secHead, ...r("price") }}>
          <p style={S.eyebrow}>Pricing</p>
          <h2 style={S.h2}>Simple, honest pricing.</h2>
        </div>
        <div style={S.pricingCol}>
          {plans.map((pl, i) => (
            <div
              key={i}
              className="hover-card"
              data-s={`p${i}`}
              style={{
                ...S.planCard,
                ...(pl.highlight ? S.planHL : {}),
                ...r(`p${i}`, i * 0.1),
              }}
            >
              {pl.highlight && <div style={S.planBadge}>Most popular</div>}
              <div style={S.planName}>{pl.name}</div>
              <div style={S.planPrice}>
                {pl.price}
                <span style={S.planPriceSub}> / {pl.sub}</span>
              </div>
              <div style={S.planLine} />
              <ul style={S.planPerks}>
                {pl.perks.map((p, j) => (
                  <li key={j} style={S.perk}>
                    <span
                      style={{
                        ...S.check,
                        color: pl.highlight ? "#ff6b35" : "#22c55e",
                      }}
                    >
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <button
                className={pl.highlight ? "btn-dark" : "btn-outline"}
                style={{
                  ...S.planBtn,
                  background: pl.highlight ? "#1a1a1a" : "transparent",
                  color: pl.highlight ? "#fafaf8" : "#1a1a1a",
                  border: pl.highlight ? "none" : "1.5px solid #d4d0c8",
                }}
                onClick={() => router.push("/intro")}
              >
                {pl.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section
        id="results"
        style={{ ...S.sec, background: "#f4f2ed" }}
        data-s="testi"
      >
        <div style={{ ...S.secHead, ...r("testi") }}>
          <p style={S.eyebrow}>Real results</p>
          <h2 style={S.h2}>People are showing up.</h2>
        </div>
        <div style={S.testiCol}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="hover-card"
              data-s={`t${i}`}
              style={{ ...S.testiCard, ...r(`t${i}`, i * 0.1) }}
            >
              <p style={S.testiQ}>&ldquo;{t.quote}&rdquo;</p>
              <div style={S.testiRow}>
                <div style={S.testiAv}>{t.initials}</div>
                <div>
                  <div style={S.testiName}>{t.name}</div>
                  <div style={S.testiResult}>{t.result}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={S.finalOuter} data-s="final">
        <div style={{ ...S.finalInner, ...r("final") }}>
          <p style={{ ...S.eyebrow, color: "rgba(250,250,248,0.4)" }}>
            Start today
          </p>
          <h2 style={S.finalH2}>
            Your best body
            <br />
            is a plan away.
          </h2>
          <button
            className="btn-orange"
            style={{
              ...S.btnOrange,
              fontSize: 16,
              maxWidth: 300,
              padding: "1.1rem 2rem",
            }}
            onClick={() => router.push("/intro")}
          >
            Build my free plan →
          </button>
          <p
            style={{
              fontSize: 12,
              color: "rgba(250,250,248,0.25)",
              marginTop: "0.75rem",
            }}
          >
            Free forever · No credit card · Takes 60 seconds
          </p>
        </div>
      </section>

      <footer style={S.footer}>
        <div style={S.footerLogo}>APEX</div>
        <p style={S.footerSub}>© 2025 Apex Fitness. All rights reserved.</p>
      </footer>
    </div>
  );
}

const S = {
  root: {
    background: "#fafaf8",
    color: "#1a1a1a",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    overflowX: "hidden",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.25rem",
    height: 60,
    transition: "all 0.3s ease",
  },
  navScrolled: {
    background: "rgba(250,250,248,0.9)",
    backdropFilter: "blur(16px)",
    borderBottom: "0.5px solid #e8e5de",
  },
  logo: {
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "#1a1a1a",
  },
  navMid: {
    display: "flex",
    gap: "2rem",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  },
  navLink: {
    fontSize: 13,
    color: "#888",
    letterSpacing: "0.01em",
    transition: "color 0.15s",
  },
  navCta: {
    background: "#1a1a1a",
    color: "#fafaf8",
    border: "none",
    borderRadius: 99,
    padding: "0.45rem 1.2rem",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    transition: "background 0.15s",
  },
  hero: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "8rem 1.25rem 4rem",
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -140,
    right: -140,
    width: 500,
    height: 500,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 65%)",
    pointerEvents: "none",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #e8e5de",
    borderRadius: 99,
    padding: "0.35rem 0.9rem",
    fontSize: 12,
    color: "#555",
    marginBottom: "1.5rem",
    width: "fit-content",
    animation: "heroIn 0.7s ease both",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    flexShrink: 0,
    boxShadow: "0 0 0 3px rgba(34,197,94,0.18)",
  },
  h1: {
    fontSize: "clamp(3rem, 15vw, 5.5rem)",
    fontWeight: 800,
    lineHeight: 1.0,
    letterSpacing: "-0.035em",
    color: "#1a1a1a",
    animation: "heroIn 0.7s 0.1s ease both",
  },
  heroSub: {
    fontSize: 15,
    color: "#888",
    lineHeight: 1.75,
    fontWeight: 300,
    maxWidth: 340,
    marginTop: "1.5rem",
    animation: "heroIn 0.7s 0.2s ease both",
  },
  heroBtns: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: "2rem",
    animation: "heroIn 0.7s 0.3s ease both",
  },
  btnDark: {
    background: "#1a1a1a",
    color: "#fafaf8",
    border: "none",
    borderRadius: 14,
    padding: "1rem 1.75rem",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "inherit",
    width: "100%",
    maxWidth: 340,
    letterSpacing: "0.01em",
    transition: "background 0.15s",
  },
  btnOutline: {
    background: "transparent",
    color: "#1a1a1a",
    border: "1.5px solid #d4d0c8",
    borderRadius: 14,
    padding: "0.95rem 1.75rem",
    fontSize: 15,
    fontWeight: 500,
    fontFamily: "inherit",
    width: "100%",
    maxWidth: 340,
    transition: "background 0.15s",
  },
  btnOrange: {
    background: "#ff6b35",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "1rem 1.75rem",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "inherit",
    width: "100%",
    maxWidth: 340,
    letterSpacing: "0.01em",
    marginTop: "1.75rem",
    transition: "background 0.15s",
  },
  disclaimer: {
    fontSize: 11,
    color: "#bbb",
    marginTop: "0.75rem",
    animation: "heroIn 0.7s 0.4s ease both",
  },
  statsStrip: {
    display: "flex",
    marginTop: "3rem",
    border: "1px solid #e8e5de",
    borderRadius: 16,
    overflow: "hidden",
    background: "#fff",
    animation: "heroIn 0.7s 0.5s ease both",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  statCell: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1rem 0.5rem",
    gap: 3,
  },
  statN: {
    fontSize: 19,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.03em",
  },
  statL: {
    fontSize: 10,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    textAlign: "center",
  },
  tickerOuter: {
    overflow: "hidden",
    background: "#f0ede6",
    borderTop: "1px solid #e8e5de",
    borderBottom: "1px solid #e8e5de",
    padding: "0.7rem 0",
  },
  tickerInner: {
    display: "flex",
    whiteSpace: "nowrap",
    animation: "ticker 22s linear infinite",
    width: "max-content",
  },
  tickerItem: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: "#bbb",
    padding: "0 1.25rem",
    textTransform: "uppercase",
  },
  sec: { padding: "5rem 1.25rem" },
  secHead: { marginBottom: "2.5rem" },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#ff6b35",
    marginBottom: "0.6rem",
  },
  h2: {
    fontSize: "clamp(1.9rem,8vw,3rem)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    color: "#1a1a1a",
  },
  featGrid: { display: "flex", flexDirection: "column", gap: 10 },
  featCard: {
    background: "#fff",
    border: "1px solid #e8e5de",
    borderRadius: 18,
    padding: "1.5rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  featIcon: {
    width: 46,
    height: 46,
    background: "#fafaf8",
    border: "1px solid #e8e5de",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    marginBottom: "1rem",
  },
  featTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 6,
  },
  featDesc: { fontSize: 13, color: "#888", lineHeight: 1.7, fontWeight: 300 },
  howOuter: { padding: "0 1.25rem 5rem" },
  howCard: {
    background: "#1a1a1a",
    borderRadius: 24,
    padding: "2.5rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "2.5rem",
  },
  stepsCol: { display: "flex", flexDirection: "column", gap: 10 },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "0.9rem 1rem",
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#ff6b35",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  stepText: { fontSize: 13, color: "rgba(250,250,248,0.7)", fontWeight: 400 },
  pricingCol: { display: "flex", flexDirection: "column", gap: 12 },
  planCard: {
    background: "#fff",
    border: "1px solid #e8e5de",
    borderRadius: 18,
    padding: "1.75rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    position: "relative",
  },
  planHL: {
    border: "2px solid #1a1a1a",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  planBadge: {
    position: "absolute",
    top: -13,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1a1a1a",
    color: "#fafaf8",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.07em",
    padding: "0.3rem 1rem",
    borderRadius: 99,
    whiteSpace: "nowrap",
  },
  planName: {
    fontSize: 12,
    fontWeight: 700,
    color: "#aaa",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
  },
  planPrice: {
    fontSize: 38,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.04em",
    lineHeight: 1,
  },
  planPriceSub: { fontSize: 14, fontWeight: 300, color: "#aaa" },
  planLine: { height: 1, background: "#e8e5de", margin: "1.25rem 0" },
  planPerks: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 9,
    marginBottom: "1.5rem",
  },
  perk: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    fontSize: 13,
    color: "#555",
    lineHeight: 1.5,
  },
  check: { fontWeight: 700, flexShrink: 0, marginTop: 1 },
  planBtn: {
    width: "100%",
    padding: "0.9rem",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "inherit",
    letterSpacing: "0.01em",
    transition: "opacity 0.15s, background 0.15s",
  },
  testiCol: { display: "flex", flexDirection: "column", gap: 10 },
  testiCard: {
    background: "#fff",
    border: "1px solid #e8e5de",
    borderRadius: 18,
    padding: "1.5rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  testiQ: { fontSize: 14, color: "#333", lineHeight: 1.8, fontWeight: 300 },
  testiRow: { display: "flex", alignItems: "center", gap: 12 },
  testiAv: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "#f0ede6",
    border: "1px solid #e8e5de",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#666",
    flexShrink: 0,
  },
  testiName: { fontSize: 13, fontWeight: 700, color: "#1a1a1a" },
  testiResult: {
    fontSize: 12,
    color: "#ff6b35",
    marginTop: 2,
    fontWeight: 500,
  },
  finalOuter: { background: "#1a1a1a", padding: "5rem 1.25rem" },
  finalInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  finalH2: {
    fontSize: "clamp(2.2rem,10vw,4rem)",
    fontWeight: 800,
    color: "#fafaf8",
    letterSpacing: "-0.035em",
    lineHeight: 1.05,
    marginBottom: "2rem",
  },
  footer: {
    background: "#f4f2ed",
    borderTop: "1px solid #e8e5de",
    padding: "2rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  footerLogo: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "#ccc",
  },
  footerSub: { fontSize: 11, color: "#bbb" },
};
