// app/layout.js

import ClientLayout from "./ClientLayout";
import "./globals.css";
import { Ubuntu } from "next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },

  metadataBase: new URL("https://www.yourpocketgym.com/"),
  title: {
    default: "YourPocketGym - AI Fitness & Nutrition Tracker",
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
  alternates: {
    canonical: "https://www.yourpocketgym.com/",
  },
  openGraph: {
    title: "YourPocketGym - AI Fitness & Nutrition Tracker",
    description:
      "Track workouts, log meals with a photo, and hit your fitness goals faster with AI.",
    url: "https://www.yourpocketgym.com/",
    siteName: "YourPocketGym",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YourPocketGym - AI Fitness & Nutrition Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YourPocketGym - AI Fitness & Nutrition Tracker",
    description:
      "Track workouts, log meals with a photo, and hit your fitness goals faster with AI.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "9ba5b7bea102f189",
  },
  robots: {
    index: true,
    follow: true,
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