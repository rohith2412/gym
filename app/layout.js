// app/layout.js — server component (no "use client")
// metadata lives here, interactive logic moved to ClientLayout

import ClientLayout from "./ClientLayout";
import "./globals.css";
import { Ubuntu } from "next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  metadataBase: new URL("https://yourpocketgym.com"),

  title: {
    default: "YourPocketGym — AI Fitness & Nutrition Tracker",
    template: "%s | YourPocketGym",
  },

  description:
    "YourPocketGym is your AI-powered fitness companion. Track workouts, log meals with a photo, and hit your goals faster.",

  keywords: [
    "fitness tracker",
    "workout tracker",
    "calorie tracker",
    "macro tracker",
    "ai fitness app",
  ],

  // ✅ Canonical URL — prevents duplicate content indexing
  alternates: {
    canonical: "https://yourpocketgym.com",
  },

  // ✅ Open Graph — controls how links look when shared on social media
  openGraph: {
    title: "YourPocketGym — AI Fitness & Nutrition Tracker",
    description:
      "Track workouts, log meals with a photo, and hit your fitness goals faster with AI.",
    url: "https://yourpocketgym.com",
    siteName: "YourPocketGym",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png", // ← add a 1200x630px image to your /public folder
        width: 1200,
        height: 630,
        alt: "YourPocketGym — AI Fitness & Nutrition Tracker",
      },
    ],
  },

  // ✅ Twitter / X card
  twitter: {
    card: "summary_large_image",
    title: "YourPocketGym — AI Fitness & Nutrition Tracker",
    description:
      "Track workouts, log meals with a photo, and hit your fitness goals faster with AI.",
    images: ["/og-image.png"], // ← same image as OG
  },

  // ✅ Google Search Console verification
  verification: {
    google: "9ba5b7bea102f189",
  },

  // ✅ Robots directive — tell crawlers to index public pages
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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