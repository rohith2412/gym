// app/v1/blog/caloriesAI/page.jsx
// Server component — exports metadata + renders the client component

import CaloriesAIClient from "@/components/CaloriesAIClient";

export const metadata = {
  title: "AI Calorie Tracker — Snap a Photo, Get Instant Macros | YourPocketGym",
  description:
    "The fastest AI calorie counter. Just take a photo of your meal and get instant calories, protein, carbs and fat. No manual logging. Try it free — no credit card needed.",
  keywords:
    "ai calorie tracker, photo calorie counter, calorie calculator, macro tracker, food tracker ai, instant calorie count",
  openGraph: {
    title: "AI Calorie Tracker — Snap a Photo, Get Instant Macros",
    description:
      "Take a photo of any meal and get instant nutritional breakdown powered by AI. Try free.",
    type: "website",
  },
};


export default function CaloriesAIPage() {
  return <CaloriesAIClient />;
}