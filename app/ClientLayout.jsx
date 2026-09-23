"use client";

import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Dock from "@/components/Dock";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // v2 is a clean break from the old frontend -- no Dock, no mobile-only
  // wall, no v1 chrome of any kind. v2 pages own their entire screen.
  const isV2 = pathname.startsWith("/v2");

  const MOBILE_ONLY = process.env.NEXT_PUBLIC_MOBILE_ONLY === "true";

  const [isMobile] = useState(() =>
    /iPhone|iPad|iPod|Android/i.test(
      typeof navigator === "undefined" ? "" : navigator.userAgent
    )
  );

  // 🚫 Hide Dock on specific routes
  const hideDock =
    isV2 ||
    [
      "/",
      "/v1/blog/caloriesAI",
      "/v1/StartersIntro",
      "/v1/login",
      "/v1/pricing",
      "/v1/profile",
      "/legal/terms",
      "/legal/privacy",
      "/support",
    ].includes(pathname);

  // 📱 Mobile-only gate
  if (MOBILE_ONLY && !isMobile && !isV2) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        Please open this website on a mobile device 📱
      </div>
    );
  }

  return (
    <SessionProvider>
      {children}
      {!hideDock && <Dock />} {/* 👈 Dock control here */}
    </SessionProvider>
  );
}