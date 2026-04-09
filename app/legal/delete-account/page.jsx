export default function DeleteAccountPage() {
  return (
    <div style={{
      maxWidth: 600, margin: "0 auto", padding: "3rem 1.5rem",
      fontFamily: "system-ui, sans-serif", color: "#1a1a1a",
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        Delete Your Account
      </h1>
      <p style={{ color: "#888", marginBottom: "2rem", fontSize: 14 }}>
        YourPocketGym — Account Deletion Request
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
        How to delete your account
      </h2>
      <ol style={{ paddingLeft: 20, lineHeight: 2, fontSize: 14, color: "#444" }}>
        <li>Email us at <a href="mailto:rohithra75@gmail.com">rohithra75@gmail.com</a></li>
        <li>Use the subject line: <strong>Delete My Account</strong></li>
        <li>Include the email address associated with your account</li>
        <li>We will process your request within 7 days</li>
      </ol>

      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "2rem 0 8px" }}>
        What data gets deleted
      </h2>
      <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: 14, color: "#444" }}>
        <li>Your account and profile information</li>
        <li>All saved workout plans</li>
        <li>Fitness goals and tracking data</li>
        <li>Nutrition and health data</li>
      </ul>

      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "2rem 0 8px" }}>
        What data is retained
      </h2>
      <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: 14, color: "#444" }}>
        <li>Billing records may be retained for up to 7 years for legal and tax purposes</li>
      </ul>
    </div>
  );
}