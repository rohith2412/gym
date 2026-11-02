import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const APP_STORE_URL =
  "https://apps.apple.com/nz/app/pocketgym-ai-fitness-tracker/id6765536420";

export default function BlogLayout({ children }) {
  return (
    <div
      className={jakarta.className}
      style={{
        background: "#fafaf8",
        minHeight: "100dvh",
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 1.25rem 4rem",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 0 2rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: "#1a1a1a",
            }}
          >
            Your<span style={{ color: "#ff6b35" }}>Pocket</span>Gym
          </span>
        </Link>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#ff6b35",
            textDecoration: "none",
            padding: "0.4rem 1rem",
            border: "1px solid rgba(255,107,53,0.3)",
            borderRadius: 99,
          }}
        >
          Get the app →
        </a>
      </nav>

      <article>{children}</article>

      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          borderRadius: 20,
          padding: "2rem 1.75rem",
          textAlign: "center",
          marginTop: "3rem",
        }}
      >
        <p
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Track it all in one place
        </p>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6,
            maxWidth: 400,
            margin: "0 auto 1.5rem",
          }}
        >
          Snap a photo of your meal. Log your sets. Watch the numbers move.
          PocketGym handles the busywork so you can focus on showing up.
        </p>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "0.9rem 2rem",
            background: "#ff6b35",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            boxShadow: "0 4px 20px rgba(255,107,53,0.3)",
          }}
        >
          Download PocketGym — free
        </a>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            marginTop: 10,
          }}
        >
          No subscription · iPhone
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link
          href="/v1/blog"
          style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}
        >
          ← All articles
        </Link>
      </div>
    </div>
  );
}
