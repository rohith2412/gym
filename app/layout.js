// app/layout.jsx — server component (no "use client")
// metadata lives here, interactive logic moved to ClientLayout

import ClientLayout from "./ClientLayout";
import "./globals.css";
import { Ubuntu } from "next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  metadataBase: new URL("https://yourpocketgym.com"), // ← your real domain
  title: {
    default: "YourPocketGym — AI Fitness & Nutrition Tracker",
    template: "%s | YourPocketGym",
  },
  description:
    "YourPocketGym is your AI-powered fitness companion. Track workouts, log meals with a photo, and hit your goals faster.",
  keywords: "fitness tracker, workout tracker, calorie tracker, macro tracker, ai fitness app",
  verification: {
    google: "9ba5b7bea102f189",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={ubuntu.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}