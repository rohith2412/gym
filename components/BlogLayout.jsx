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
        background: "#fff",
        minHeight: "100dvh",
        maxWidth: 620,
        margin: "0 auto",
        padding: "0 1.5rem 5rem",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem 0 3rem",
          borderBottom: "1px solid #f0f0f0",
          marginBottom: "3rem",
        }}
      >
        <Link href="/v1/blog" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#111",
            }}
          >
            PocketGym <span style={{ color: "#999", fontWeight: 400 }}>blog</span>
          </span>
        </Link>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111",
            textDecoration: "none",
            padding: "0.4rem 0.9rem",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
          }}
        >
          Get the app
        </a>
      </nav>

      <article>{children}</article>

      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          marginTop: "4rem",
          paddingTop: "2.5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#111",
            marginBottom: 6,
          }}
        >
          PocketGym
        </p>
        <p
          style={{
            fontSize: 14,
            color: "#888",
            lineHeight: 1.6,
            maxWidth: 340,
            margin: "0 auto 1.25rem",
          }}
        >
          Photo-based meal tracking, workout logging, and progress all in one free app.
        </p>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "0.7rem 1.5rem",
            background: "#111",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Download — free on iPhone
        </a>
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link
          href="/v1/blog"
          style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}
        >
          All articles
        </Link>
      </div>
    </div>
  );
}
