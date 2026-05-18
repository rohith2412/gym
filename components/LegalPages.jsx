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
    <LegalShell title="Terms of Service" lastUpdated="May 2025" router={router}>

      <Highlight>
        <P>
          By downloading or using Your Pocket Gym, you agree to be bound by these Terms of Service.
          If you do not agree, do not use the app.
        </P>
      </Highlight>

      <Section title="1. Description of Service">
        <P>Your Pocket Gym provides:</P>
        <UL items={[
          "Workout logging and progress tracking",
          "AI-generated workout plans",
          "Nutrition scanning via camera",
          "AI-generated recipes based on your ingredients",
          "An AI personal trainer chat assistant",
        ]} />
      </Section>

      <Section title="2. AI Disclaimer">
        <P>
          The AI trainer, recipe suggestions, workout plans, and food analysis are for
          informational purposes only. They are not a substitute for professional medical,
          nutritional, or fitness advice.
        </P>
        <Highlight>
          <P>
            Always consult a qualified professional before starting a new exercise program
            or making significant dietary changes. Results vary and are not guaranteed.
          </P>
        </Highlight>
      </Section>

      <Section title="3. Health &amp; Safety">
        <P>
          Exercise involves risk of injury. You assume full responsibility for your use of
          this app and any physical activity you undertake as a result. Your Pocket Gym is
          not liable for any injury, illness, or health complication arising from use of the app.
        </P>
      </Section>

      <Section title="4. Camera &amp; Photos">
        <P>
          The nutrition scanner uses your device camera and photo library solely to analyze
          food for calorie and macro estimation. Images are processed to generate nutritional
          data and are not stored on our servers.
        </P>
      </Section>

      <Section title="5. User Accounts">
        <P>
          You are responsible for maintaining the confidentiality of your account credentials.
          You agree to provide accurate information and to notify us immediately of any
          unauthorized use of your account.
        </P>
      </Section>

      <Section title="6. Prohibited Conduct">
        <P>You agree not to:</P>
        <UL items={[
          "Reverse engineer or attempt to extract source code",
          "Use the app for any unlawful purpose",
          "Share your account with others",
          "Attempt to disrupt or compromise our servers or services",
        ]} />
      </Section>

      <Section title="7. Data &amp; Account Deletion">
        <P>
          You may delete your account at any time from Profile → Delete Account. This
          permanently removes all your data from our servers including workout logs, meal
          logs, recipes, and profile information.
        </P>
      </Section>

      <Section title="8. Intellectual Property">
        <P>
          All content, design, and code within Your Pocket Gym is owned by or licensed to
          us. You may not reproduce, distribute, or create derivative works without our
          express written permission.
        </P>
      </Section>

      <Section title="9. Limitation of Liability">
        <P>
          To the fullest extent permitted by law, Your Pocket Gym and its developers are
          not liable for any indirect, incidental, special, or consequential damages
          arising from your use of the app.
        </P>
      </Section>

      <Section title="10. Changes to Terms">
        <P>
          We may update these terms from time to time. Continued use of the app after
          changes are posted constitutes your acceptance of the updated terms.
        </P>
      </Section>

      <Section title="11. Contact">
        <P>
          If you have questions about these terms, contact us at{" "}
          <a href="mailto:support@yourpocketgym.com" style={{ color: "#e8380d", fontWeight: 500 }}>
            support@yourpocketgym.com
          </a>
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
    <LegalShell title="Privacy Policy" lastUpdated="May 18, 2025" router={router}>

      <Highlight>
        <P>
          Your Pocket Gym ("we", "us", or "our") is committed to protecting your privacy.
          This policy explains what data we collect across all features of the app, how we
          use it, and your rights over it.
        </P>
      </Highlight>

      <Section title="1. Information We Collect">
        <P>We collect the following information when you use Your Pocket Gym:</P>

        <SubLabel>Account Information</SubLabel>
        <UL items={[
          "Name and email address when you register",
          "Password (stored as a secure hash — we never store plain-text passwords)",
          "If you use Google Sign-In: your name and email from Google",
        ]} />

        <SubLabel>Fitness Profile</SubLabel>
        <UL items={[
          "Age, height, weight, biological sex",
          "Fitness goal (e.g. lose fat, gain muscle, strength)",
          "Experience level and workout days per week",
        ]} />

        <SubLabel>Workout Data</SubLabel>
        <UL items={[
          "Exercises logged, sets, reps, and weights",
          "Workout dates and session history",
        ]} />

        <SubLabel>Nutrition Data</SubLabel>
        <UL items={[
          "Meal logs including calorie and macro estimates",
          "Food photos you take or select for AI analysis",
          "Daily nutrition goals you set",
        ]} />

        <SubLabel>AI Trainer Conversations</SubLabel>
        <UL items={[
          "Messages you send to the AI Trainer are transmitted to our AI service to generate responses",
          "Conversation history may be stored to maintain context within a session",
        ]} />

        <SubLabel>Recipe Requests</SubLabel>
        <UL items={[
          "Ingredients and meal preferences you select when generating recipes are sent to our AI service",
        ]} />
      </Section>

      <Section title="2. How We Use Your Information">
        <P>We use your data to:</P>
        <UL items={[
          "Provide and personalise the app experience",
          "Generate AI workout plans based on your fitness profile, equipment, and goals",
          "Analyse food photos to estimate calories and macros",
          "Generate recipe suggestions based on your selected ingredients and dietary goals",
          "Display your workout history, volume tracking, and progress stats",
          "Calculate BMI and personalised nutrition goals from your profile",
          "Respond to your messages in the AI Trainer feature",
        ]} />
      </Section>

      <Section title="3. AI Features &amp; Data Processing">
        <SubLabel>AI Trainer (Chat)</SubLabel>
        <P>
          Messages you type are sent to our AI service to generate fitness coaching
          responses. Chat history may be retained temporarily to maintain conversation context.
        </P>
        <SubLabel>Food Photo Analysis</SubLabel>
        <P>
          Photos you take or select are transmitted securely to our AI service to estimate
          the nutritional content of your meal. Photos are processed and are not permanently
          stored on our servers after analysis.
        </P>
        <SubLabel>Recipe Generation</SubLabel>
        <P>
          Ingredients and meal preferences you select are sent to our AI service to generate
          recipe suggestions. No photos are involved in this feature.
        </P>
        <SubLabel>Workout Plan Generation</SubLabel>
        <P>
          Your fitness profile (goal, experience level, equipment, focus area) is sent to our
          AI service to generate personalised workout plans.
        </P>
        <P>All AI-generated content is for informational purposes only and may not be 100% accurate.</P>
      </Section>

      <Section title="4. Google Sign-In">
        <P>
          If you choose to sign in with Google, we receive your name and email address from
          Google. We do not receive or store your Google password. Your use of Google Sign-In
          is also governed by Google's Privacy Policy at{" "}
          <a href="https://policies.google.com/privacy" style={{ color: "#e8380d", fontWeight: 500 }}>
            policies.google.com/privacy
          </a>.
        </P>
      </Section>

      <Section title="5. Camera &amp; Photo Library Access">
        <P>
          The App requests camera and photo library access solely for the food photo analysis
          feature in Nutrition Tracking. We do not access your camera or photos for any other
          purpose. Photos are transmitted securely and are not stored after AI analysis is complete.
        </P>
      </Section>

      <Section title="6. Data Sharing">
        <P>We do not sell your personal information. We share data only with:</P>
        <UL items={[
          "AI service providers — to power the AI Trainer, food analysis, recipe generation, and workout plan features",
          "Google — for authentication if you use Google Sign-In",
        ]} />
        <P>
          All third-party providers are bound by data processing agreements and may not use
          your data for their own purposes.
        </P>
      </Section>

      <Section title="7. Data Storage &amp; Security">
        <P>Your data is stored on secure servers. We use:</P>
        <UL items={[
          "HTTPS encryption for all data transmitted between the app and our servers",
          "Secure token-based authentication (JWT)",
          "Hashed password storage",
        ]} />
        <P>
          We retain your data for as long as your account is active. Workout logs, meal logs,
          and fitness profile data are deleted when you delete your account.
        </P>
      </Section>

      <Section title="8. Your Rights &amp; Account Deletion">
        <P>You have the right to:</P>
        <UL items={[
          "Access the data we hold about you",
          "Correct inaccurate data via the profile edit screen",
          "Delete your account and all associated data",
        ]} />
        <P>
          To delete your account, tap "Delete Account" on the Profile screen or email us at{" "}
          <a href="mailto:privacy@yourpocketgym.com" style={{ color: "#e8380d", fontWeight: 500 }}>
            privacy@yourpocketgym.com
          </a>. Account deletion is processed within 30 days.
        </P>
      </Section>

      <Section title="9. Children's Privacy">
        <P>
          Your Pocket Gym is not intended for children under the age of 13. We do not
          knowingly collect personal information from children under 13. If you believe a
          child has provided us with personal information, please contact us immediately.
        </P>
      </Section>

      <Section title="10. Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes through the app. Continued use of the app after changes are
          posted constitutes your acceptance of the updated policy.
        </P>
      </Section>

      <Section title="11. Contact">
        <P>
          For privacy-related questions or requests:{" "}
          <a href="mailto:privacy@yourpocketgym.com" style={{ color: "#e8380d", fontWeight: 500 }}>
            privacy@yourpocketgym.com
          </a>
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