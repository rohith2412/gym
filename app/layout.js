"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Ubuntu } from "next/font/google";
import { useState } from "react";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export default function RootLayout({ children }) {
  const MOBILE_ONLY = process.env.NEXT_PUBLIC_MOBILE_ONLY === "true";

  const [isMobile] = useState(() =>
    /iPhone|iPad|iPod|Android/i.test(
      typeof navigator === "undefined" ? "" : navigator.userAgent
    )
  );

  return (
    <html lang="en">
      <body className={ubuntu.className}>
        {MOBILE_ONLY && !isMobile ? (
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
        ) : (
          <SessionProvider>{children}</SessionProvider>
        )}
      </body>
    </html>
  );
}