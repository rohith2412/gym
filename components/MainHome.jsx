"use client";

import { Special_Gothic_Expanded_One } from "next/font/google";
import Background from "@/components/Background";
import LoginButton from "@/components/LoginButton";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const specialGothic = Special_Gothic_Expanded_One({
  weight: "400",
  subsets: ["latin"],
});

export default function MainHome() {
  const { status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/v1/dashboard");
    }
  }, [status, router]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Background />

      {/* Main Content - All on screen */}
      <div className="flex-1 flex flex-col justify-between px-5 py-8">
        {/* Hero Section */}
        <div className="space-y-4">
          {/* Main Title Card */}
          <div className={specialGothic.className}>
            <div className="relative rounded-2xl py-10 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
              {/* Noise overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                  mixBlendMode: "overlay",
                }}
              />
              <div className="relative text-start pl-5 leading-[0.9] text-6xl tracking-tighter">
                <span className="block text-gray-900">Lets</span>
                <span className="block text-gray-900">Track</span>
                <span className="block text-gray-900">Gym</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-2.5">
            {/* Feature 1 */}
            <div className="relative rounded-xl px-4 py-4 overflow-hidden bg-gradient-to-br from-orange-400 to-orange-500">
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                  mixBlendMode: "overlay",
                }}
              />
              <p
                className="relative text-sm text-white leading-relaxed"
                style={{ fontFamily: "Ubuntu, sans-serif" }}
              >
                Record your max lifts. No workouts, no reps, just pure strength.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative rounded-xl px-4 py-4 overflow-hidden bg-gradient-to-br from-green-400 to-green-500">
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                  mixBlendMode: "overlay",
                }}
              />
              <p
                className="relative text-sm text-white leading-relaxed"
                style={{ fontFamily: "Ubuntu, sans-serif" }}
              >
                Track progress over time. Personal bests at a glance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative rounded-xl px-4 py-4 overflow-hidden bg-gradient-to-br from-red-400 to-red-500">
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                  mixBlendMode: "overlay",
                }}
              />
              <p
                className="relative text-sm text-white leading-relaxed"
                style={{ fontFamily: "Ubuntu, sans-serif" }}
              >
                Share PRs with friends or keep them private. Your choice.
              </p>
            </div>
          </div>
        </div>

        {/* Login Button - Static at bottom */}
        <div className="pt-6">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}