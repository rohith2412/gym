"use client";

import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout shell
// ─────────────────────────────────────────────────────────────────────────────
function LegalShell({ title, lastUpdated, children, router }) {
  return (
    <div style={S.root}>
      <style>{GLOBAL}</style>

      <header style={S.header}>
        <button style={S.backBtn} onClick={() => router.back()}>←</button>
        <span style={S.headerTitle}>{title}</span>
        <div style={{ width: 36 }} />
      </header>

      <main style={S.main}>
        <p style={S.updated}>Last updated: {lastUpdated}</p>

        <div style={S.tabs}>
          <button
            style={{ ...S.tab, ...(title === "Terms of Service" ? S.tabActive : {}) }}
            onClick={() => router.push("/legal/terms")}
          >
            Terms
          </button>
          <button
            style={{ ...S.tab, ...(title === "Privacy Policy" ? S.tabActive : {}) }}
            onClick={() => router.push("/legal/privacy")}
          >
            Privacy
          </button>
        </div>

        <div style={S.body}>{children}</div>

        <p style={S.version}>YourPocketGym · v1.0</p>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p style={S.p}>{children}</p>;
}

function UL({ items }) {
  return (
    <ul style={S.ul}>
      {items.map((item, i) => (
        <li key={i} style={S.li}>
          <span style={S.bullet} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function SubLabel({ children }) {
  return (
    <p style={{ ...S.p, fontWeight: 700, color: "#1a1a1a", marginBottom: 6, marginTop: 14 }}>
      {children}
    </p>
  );
}

function Highlight({ children }) {
  return <div style={S.highlight}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Terms of Service
// ─────────────────────────────────────────────────────────────────────────────
export function TermsPage() {
  const router = useRouter();
  return (
    <LegalShell title="Terms of Service" lastUpdated="April 7, 2026" router={router}>

      <Highlight>
        <P>
          By using YourPocketGym you agree to these terms. Please read them carefully.
          If you do not agree, do not use the app.
        </P>
      </Highlight>

      <Section title="1. About YourPocketGym">
        <P>
          YourPocketGym ("we", "us", "our") is a fitness tracking application that helps
          you log workouts, track body metrics, log meals, and access AI-powered training
          and nutrition guidance. The app is operated as an independent product and is not
          affiliated with any gym or healthcare provider.
        </P>
      </Section>

      <Section title="2. Eligibility">
        <P>You must be at least 13 years old to use this app. By using it you confirm:</P>
        <UL items={[
          "You are 13 years of age or older.",
          "You have read and accepted these Terms.",
          "If you are under 18, a parent or guardian has reviewed and accepted these Terms on your behalf.",
        ]} />
      </Section>

      <Section title="3. Your account">
        <P>
          You are responsible for keeping your account credentials secure. You must not
          share your account with others or use another person's account.
        </P>
        <P>
          We reserve the right to suspend or terminate accounts that violate these Terms,
          engage in abuse, or are inactive for an extended period.
        </P>
      </Section>

      <Section title="4. Subscription and billing">
        <P>
          YourPocketGym offers a free tier and a Pro subscription billed monthly. By
          subscribing you authorize us to charge your payment method on a recurring basis.
        </P>
        <UL items={[
          "Subscriptions auto-renew each billing cycle unless canceled before the renewal date.",
          "You may cancel at any time via your Profile page. Access continues until the end of the current paid period.",
          "We do not offer refunds for partial billing periods.",
          "We reserve the right to change pricing with 30 days' notice.",
          "Payments are processed by Stripe. We do not store your full card details.",
        ]} />
      </Section>

      <Section title="5. Acceptable use">
        <P>You agree not to:</P>
        <UL items={[
          "Reverse-engineer, decompile, or attempt to extract the source code of the app.",
          "Use the app for any unlawful purpose or in violation of any applicable law.",
          "Scrape, crawl, or systematically download content from the app.",
          "Attempt to gain unauthorized access to any part of the app or its infrastructure.",
          "Upload or transmit malicious code or interfere with the app's operation.",
          "Resell, sublicense, or redistribute access to the app.",
        ]} />
      </Section>

      <Section title="6. Health and fitness disclaimer">
        <P>
          YourPocketGym provides general fitness and nutrition information for
          informational purposes only. Nothing in this app constitutes medical advice,
          diagnosis, or treatment.
        </P>
        <Highlight>
          <P>
            Always consult a qualified healthcare provider before starting any new
            exercise or nutrition programme, especially if you have a pre-existing medical
            condition, injury, or are pregnant. You use the app entirely at your own risk.
          </P>
        </Highlight>
        <P>
          We are not liable for any injury, health issue, or adverse outcome arising from
          workouts or meal plans logged or suggested through the app.
        </P>
      </Section>

      <Section title="7. AI-generated content">
        <P>
          Pro subscribers have access to AI-powered training suggestions, meal analysis,
          and recipe recommendations. This content is generated automatically and may not
          always be accurate or appropriate for your individual circumstances. Always apply
          your own judgment and consult a fitness or nutrition professional if in doubt.
        </P>
        <P>
          Food macro estimates generated via AI image analysis are approximations only and
          should not be relied upon for medical dietary management.
        </P>
      </Section>

      <Section title="8. User-generated content">
        <P>
          You may upload food photos for AI-powered meal analysis. By uploading images you
          confirm you have the right to share them and that they do not contain
          inappropriate content. We store these images solely to provide the meal logging
          feature and do not use them for any other purpose.
        </P>
      </Section>

      <Section title="9. Intellectual property">
        <P>
          All content, branding, and software in YourPocketGym is owned by or licensed to
          us. You may not copy, modify, or distribute any part of the app without our
          written permission. Your personal data and workout logs remain yours — we claim
          no ownership over data you input.
        </P>
      </Section>

      <Section title="10. Limitation of liability">
        <P>
          To the maximum extent permitted by law, YourPocketGym and its operators shall
          not be liable for any indirect, incidental, special, consequential, or punitive
          damages arising from your use of the app, including but not limited to loss of
          data, loss of revenue, or personal injury.
        </P>
        <P>
          Our total liability to you for any claim shall not exceed the amount you paid us
          in the 12 months preceding the claim.
        </P>
      </Section>

      <Section title="11. Termination">
        <P>
          You may stop using the app and delete your account at any time. We may suspend
          or terminate your access if you breach these Terms, with or without notice.
          Upon termination, your right to use the app ceases immediately.
        </P>
      </Section>

      <Section title="12. Changes to these terms">
        <P>
          We may update these Terms from time to time. We will notify you of material
          changes via email or an in-app notice at least 14 days before they take effect.
          Continued use of the app after the effective date constitutes acceptance.
        </P>
      </Section>

      <Section title="13. Governing law">
        <P>
          These Terms are governed by the laws of the Province of Ontario, Canada, without
          regard to its conflict of law provisions. Any disputes shall be resolved in the
          courts of Ontario.
        </P>
      </Section>

    </LegalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Privacy Policy
// ─────────────────────────────────────────────────────────────────────────────
export function PrivacyPage() {
  const router = useRouter();
  return (
    <LegalShell title="Privacy Policy" lastUpdated="April 7, 2026" router={router}>

      <Highlight>
        <P>
          We take your privacy seriously. This policy explains exactly what data we
          collect, why we collect it, and how you can control it.
        </P>
      </Highlight>

      <Section title="1. Who we are">
        <P>
          YourPocketGym is a fitness and nutrition tracking application.
        </P>
      </Section>

      <Section title="2. Data we collect">
        <P>We collect only what is necessary to provide the service:</P>

        <SubLabel>Account data</SubLabel>
        <UL items={[
          "Name and email address (via Google sign-in or email/password).",
          "Profile photo (optional, from your Google account).",
        ]} />

        <SubLabel>Body & fitness profile</SubLabel>
        <UL items={[
          "Age, height, weight, biological sex — optional, entered by you.",
          "Fitness goal (e.g. lose fat, gain muscle), experience level, workout days per week.",
        ]} />

        <SubLabel>Workout data</SubLabel>
        <UL items={[
          "Exercise names, muscle groups, sets, reps, and weight per set.",
          "Workout date, timestamp, and any personal notes you add.",
          "Saved AI-generated workout plans including exercises, sets, reps, and coaching tips.",
        ]} />

        <SubLabel>Nutrition & meal data</SubLabel>
        <UL items={[
          "Meal logs: meal type (breakfast, lunch, dinner, snack), date, and food items.",
          "Per-food macros: calories, protein, carbs, fat, and fiber.",
          "Food photos you upload for AI meal analysis (stored as image URLs).",
          "AI-generated notes attached to meal logs.",
          "Macro totals per meal and per day.",
        ]} />

        <SubLabel>Recipe data</SubLabel>
        <UL items={[
          "AI-generated recipes associated with your fitness goal and meal preferences.",
          "Recipe details: ingredients, steps, macros, dietary tags, prep and cook time.",
        ]} />

        <SubLabel>Subscription data</SubLabel>
        <UL items={[
          "Subscription status, billing period start and end dates.",
          "Stripe customer ID and subscription ID — never your full card number.",
        ]} />

        <SubLabel>Usage data</SubLabel>
        <UL items={[
          "Basic server logs: IP address, browser/device type, pages visited.",
          "Errors and crash reports to help us fix bugs.",
        ]} />
      </Section>

      <Section title="3. How we use your data">
        <UL items={[
          "To create and manage your account.",
          "To store and display your workout history, body metrics, and meal logs.",
          "To generate AI-powered training plans, meal analysis, and recipe suggestions (Pro).",
          "To calculate and display macro totals and nutrition progress.",
          "To process subscription payments via Stripe.",
          "To send transactional emails (receipts, password resets, important notices).",
          "To improve the app based on anonymised, aggregated usage patterns.",
          "To comply with legal obligations.",
        ]} />
        <P>We do not sell your data. We do not serve ads.</P>
      </Section>

      <Section title="4. Legal basis for processing (GDPR)">
        <P>If you are in the EEA or UK, we process your data under these legal bases:</P>
        <UL items={[
          "Contract — to provide the service you signed up for.",
          "Legitimate interests — to improve the app and prevent fraud.",
          "Legal obligation — to comply with applicable laws.",
          "Consent — where you have explicitly opted in (e.g. marketing emails).",
        ]} />
      </Section>

      <Section title="5. Data sharing">
        <P>We share data only with the following trusted service providers:</P>
        <UL items={[
          "Stripe — payment processing. Stripe's privacy policy applies to payment data.",
          "MongoDB Atlas — database hosting for all your personal and fitness data.",
          "Google OAuth — only if you sign in with Google; we receive your name, email, and photo.",
          "Vercel — server infrastructure and hosting.",
          "AI provider (OpenAI / Anthropic) — meal photos and prompts are sent to generate analysis and recipes. No data is retained by the provider beyond the request.",
        ]} />
        <P>
          We may disclose data if required by law, court order, or to protect the rights
          and safety of our users or the public.
        </P>
      </Section>

      <Section title="6. Food photos">
        <P>
          When you photograph a meal for AI analysis, the image is uploaded and a URL is
          stored alongside your meal log. Images are used solely to generate macro
          estimates and to display your own log back to you. We do not use food photos for
          advertising, model training, or any other purpose.
        </P>
      </Section>

      <Section title="7. Data retention">
        <P>
          We retain your data for as long as your account is active. If you delete your
          account, we delete your personal data within 30 days, except where we are
          required to retain it for legal or financial compliance purposes (e.g. billing
          records for up to 7 years).
        </P>
      </Section>

      <Section title="8. Your rights">
        <P>Depending on your location, you may have the right to:</P>
        <UL items={[
          "Access — request a copy of the data we hold about you.",
          "Correction — ask us to correct inaccurate data.",
          "Deletion — request that we delete your account and all associated data.",
          "Portability — receive your data in a machine-readable format.",
          "Restriction — ask us to stop processing your data in certain circumstances.",
          "Objection — object to processing based on legitimate interests.",
          "Withdraw consent — where processing is based on consent.",
        ]} />
      </Section>

      <Section title="9. Cookies and tracking">
        <P>
          We use only essential session cookies required for authentication and security.
          We do not use advertising cookies, third-party trackers, or analytics cookies
          that track you across other websites.
        </P>
      </Section>

      <Section title="10. Children's privacy">
        <P>
          YourPocketGym is not directed at children under 13. We do not knowingly collect
          personal data from children under 13. If you believe a child has provided us
          with personal data, please let us know and we will delete it promptly.
        </P>
      </Section>

      <Section title="11. Data security">
        <P>
          We use industry-standard security measures including HTTPS encryption, hashed
          passwords, and access-controlled databases. However, no system is 100% secure
          and we cannot guarantee absolute security.
        </P>
      </Section>

      <Section title="12. International transfers">
        <P>
          Your data may be processed outside your country of residence (e.g. on servers
          in the United States). Where we transfer data from the EEA or UK, we ensure
          appropriate safeguards are in place such as Standard Contractual Clauses.
        </P>
      </Section>

      <Section title="13. Changes to this policy">
        <P>
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes by email or in-app notice at least 14 days before they
          take effect.
        </P>
      </Section>

    </LegalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Global styles
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; margin: 0; padding: 0; }
  html, body { -webkit-font-smoothing: antialiased; background: #fafaf8; }
  ::-webkit-scrollbar { display: none; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  root: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#fafaf8", minHeight: "100dvh",
    maxWidth: 430, margin: "0 auto",
    display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1.2rem 1.25rem 0.8rem",
    position: "sticky", top: 0, zIndex: 10,
    background: "rgba(250,250,248,0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(232,229,222,0.5)",
  },
  backBtn: {
    width: 36, height: 36, border: "1px solid #e8e5de",
    background: "#fff", borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, color: "#1a1a1a", lineHeight: 1,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    cursor: "pointer",
  },
  headerTitle: { fontSize: 16, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" },
  main: { padding: "1rem 1.25rem 3rem", flex: 1 },
  updated: {
    fontSize: 11, color: "#bbb", fontWeight: 500,
    letterSpacing: "0.06em", marginBottom: "1rem",
    textTransform: "uppercase",
  },
  tabs: {
    display: "flex", gap: 6, marginBottom: "1.5rem",
    background: "#f0ede6", borderRadius: 12, padding: 4,
  },
  tab: {
    flex: 1, padding: "8px 0", border: "none", borderRadius: 9,
    background: "transparent", fontSize: 13, fontWeight: 600,
    color: "#999", cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#fff", color: "#1a1a1a",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  body: { display: "flex", flexDirection: "column", gap: 0 },
  section: {
    borderBottom: "1px solid #f0ede6",
    paddingBottom: "1.25rem",
    marginBottom: "1.25rem",
  },
  sectionTitle: {
    fontSize: 14, fontWeight: 800, color: "#1a1a1a",
    letterSpacing: "-0.02em", marginBottom: "0.6rem",
    lineHeight: 1.3,
  },
  p: {
    fontSize: 13, color: "#555", lineHeight: 1.75,
    marginBottom: "0.6rem",
  },
  ul: {
    paddingLeft: 0, listStyle: "none",
    display: "flex", flexDirection: "column", gap: 6,
    marginBottom: "0.6rem",
  },
  li: {
    fontSize: 13, color: "#555", lineHeight: 1.65,
    paddingLeft: 0, position: "relative",
    display: "flex", alignItems: "flex-start", gap: 8,
  },
  bullet: {
    display: "inline-block", width: 4, height: 4,
    borderRadius: "50%", background: "#ccc",
    flexShrink: 0, marginTop: 7,
  },
  highlight: {
    background: "#fff9f5",
    border: "1px solid rgba(255,107,53,0.18)",
    borderLeft: "3px solid #ff6b35",
    borderRadius: "0 10px 10px 0",
    padding: "0.75rem 1rem",
    marginBottom: "1.25rem",
  },
  version: {
    textAlign: "center", fontSize: 10, color: "#ccc",
    fontWeight: 500, marginTop: 32, letterSpacing: "0.1em",
  },
};