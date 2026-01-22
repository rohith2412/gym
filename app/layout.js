"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="noise-bg">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
