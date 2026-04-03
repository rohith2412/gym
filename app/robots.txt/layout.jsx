// ADD THIS to your existing app/layout.jsx
// Paste the metadata export at the top of the file (before the layout function)

export const metadata = {
  metadataBase: new URL("https://yourpocketgym.com"), // ← your real domain
  title: {
    default: "YourPocketGym — AI Fitness & Nutrition Tracker",
    template: "%s | YourPocketGym",  // page titles become "Page Name | YourPocketGym"
  },
  description:
    "YourPocketGym is your AI-powered fitness companion. Track workouts, log meals with a photo, and hit your goals faster.",
  keywords: "fitness tracker, workout tracker, calorie tracker, macro tracker, ai fitness app",
  authors: [{ name: "YourPocketGym" }],
  creator: "YourPocketGym",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourpocketgym.com",
    siteName: "YourPocketGym",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@yourpocketgym", // ← your Twitter handle if you have one
  },
  robots: {
    index: true,
    follow: true,
  },
};