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
    <div className="min-h-screen flex flex-col">
      <Background />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-7 space-y-4 pb-24">
        {/* Main Title Card */}
        <div className={specialGothic.className}>
          <div className="relative rounded-md py-8 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-300 to-gray-300">
            {/* Noise overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[70]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                mixBlendMode: "overlay",
              }}
            />
            <div className="relative grid justify-center text-center leading-[0.85] text-8xl tracking-tight">
              <span className="text-gray-900">Lets</span>
              <span className="text-gray-900">Track</span>
              <span className="text-gray-900">Gym</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-3">
          {/* Feature 1 */}
          <div className="relative rounded-md px-5 py-6 flex items-center overflow-hidden bg-gradient-to-br from-orange-400 to-orange-500">
            <div
              className="pointer-events-none absolute inset-0 opacity-[70]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                mixBlendMode: "overlay",
              }}
            />
            <p
              className="relative text-sm opacity-80 leading-relaxed"
              style={{ fontFamily: "Ubuntu, sans-serif" }}
            >
              A minimalist fitness app built to record the maximum weight you
              lifted for any exercise - no workouts, no reps, no noise.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="relative rounded-md px-5 py-6 flex items-center overflow-hidden bg-gradient-to-br from-green-400 to-green-500">
            <div
              className="pointer-events-none absolute inset-0 opacity-[70]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                mixBlendMode: "overlay",
              }}
            />
            <p
              className="relative text-sm opacity-80 leading-relaxed"
              style={{ fontFamily: "Ubuntu, sans-serif" }}
            >
              Watch your strength grow over time. Each lift is stored and easy to
              compare - personal bests at a glance.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="relative rounded-md px-5 py-6 flex items-center overflow-hidden bg-gradient-to-br from-red-400 to-red-500">
            <div
              className="pointer-events-none absolute inset-0 opacity-[70]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                mixBlendMode: "overlay",
              }}
            />
            <p
              className="relative text-sm opacity-80 leading-relaxed"
              style={{ fontFamily: "Ubuntu, sans-serif" }}
            >
              Celebrate your PRs with friends - or keep it private. Your strength,
              your record.
            </p>
          </div>
        </div>
      </div>

      {/* Login Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6">
        <LoginButton />
      </div>
    </div>
  );
}