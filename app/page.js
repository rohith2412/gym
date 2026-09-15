"use client";

import Image from "next/image";

/**
 * iOS app landing page.
 *
 * Single-purpose surface — logo + name + one-line pitch + a big download
 * button that deep-links to the App Store. Everything else the site used
 * to show has been removed per request.
 */

const APP_STORE_URL =
  "https://apps.apple.com/nz/app/pocketgym-ai-fitness-tracker/id6765536420";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(1200px 800px at 50% 0%, #f4f7f1 0%, #ffffff 60%)",
        color: "#0a0a0a",
        padding: "48px 24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          <Image
            src="/pocketgym-icon.png"
            alt="PocketGym"
            width={128}
            height={128}
            priority
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>

        <h1
          style={{
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: -1.5,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          PocketGym
        </h1>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.5,
            color: "rgba(10,10,10,0.65)",
            margin: 0,
            maxWidth: 380,
          }}
        >
          The whole picture — training, food, and recovery — in one app that
          fits in your pocket. Completely free.
        </p>

        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 28px",
            borderRadius: 999,
            background: "#0a0a0a",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: -0.2,
            marginTop: 8,
            boxShadow: "0 12px 30px rgba(10,10,10,0.28)",
            transition: "transform 120ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 384 512"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9M255.4 96.6C284.4 62.4 281.7 31.3 281 20 253.6 21.5 224 38.5 207.1 59.4c-18.6 22.3-29.5 49.9-27.1 79.7 30.4 2.3 58.2-14 75.4-42.4"/>
          </svg>
          Download on the App Store
        </a>

        <p
          style={{
            fontSize: 13,
            color: "rgba(10,10,10,0.45)",
            margin: 0,
            marginTop: 4,
          }}
        >
          Free · No subscription · iPhone
        </p>
      </div>
    </main>
  );
}
