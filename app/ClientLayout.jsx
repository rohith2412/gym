// app/ClientLayout.jsx — client component
// Handles SessionProvider + mobile-only gate

"use client";

import { SessionProvider } from "next-auth/react";
import { useState } from "react";

export default function ClientLayout({ children }) {
  const MOBILE_ONLY = process.env.NEXT_PUBLIC_MOBILE_ONLY === "true";

  const [isMobile] = useState(() =>
    /iPhone|iPad|iPod|Android/i.test(
      typeof navigator === "undefined" ? "" : navigator.userAgent
    )
  );

  if (MOBILE_ONLY && !isMobile) {
    return (
      <div style={{
        display: "flex", height: "100vh",
        alignItems: "center", justifyContent: "center",
        fontSize: "20px",
      }}>
        Please open this website on a mobile device 📱
      </div>
    );
  }

  return <SessionProvider>{children}</SessionProvider>;
}