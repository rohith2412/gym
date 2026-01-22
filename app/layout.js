"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Ubuntu } from "next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={ubuntu.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
