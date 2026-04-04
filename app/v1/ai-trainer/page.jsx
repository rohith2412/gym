// app/v1/ai-trainer/page.jsx - server component

const BASE_URL = "https://yourpocketgym.com";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "AI Personal Trainer - Personalised Workout Plans | YourPocketGym",
  description:
    "Your AI personal trainer that knows your goals, experience and schedule. Get a full weekly workout plan and chat with your coach anytime.",
  alternates: { canonical: `${BASE_URL}/v1/ai-trainer` },
};

import AITrainerClient from "./AITrainerClient";
export default function AITrainerPage() {
  return <AITrainerClient />;
}