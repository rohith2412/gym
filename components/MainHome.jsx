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
    <div className="">
      <Background />

      <div className={specialGothic.className}>
        <div className="relative mx-7 rounded-md py-4 flex items-center justify-between overflow-hidden bg-gradient-to-br from-gray-300 to-gray-300">
          {/* BIG noise overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[70]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "overlay",
            }}
          />
          <div className="grid justify-start pt-10 pb-5 pl-2 leading-[0.8] text-7xl -space-y-1 tracking-tight">
            <span className="text-gray-900">Lets</span>
            <span className="text-gray-900 ">Track</span>
            <span className="text-gray-900">Gym</span>
          </div>
        </div>
      </div>

      <div className="pt-15">
        <div className="relative mx-7  rounded-md px-6 py-4 flex items-center justify-between overflow-hidden bg-gradient-to-br   to-red-500">
          {/* BIG noise overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[70]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "overlay",
            }}
          />
          <h4
            className="text-sm opacity-70"
            style={{ fontFamily: "Ubuntu, sans-serif" }}
          >
            Celebrate your PRs with friends - or keep it private. Your strength,
            your record.
          </h4>
        </div>
        <div className="relative mx-7  rounded-md px-6 py-4 flex items-center justify-between overflow-hidden bg-gradient-to-br   to-green-500">
          {/* BIG noise overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[70]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "overlay",
            }}
          />
          <h4
            className="text-sm opacity-70"
            style={{ fontFamily: "Ubuntu, sans-serif" }}
          >
            Watch your strength grow over time. Each lift is stored and easy to
            compare - personal bests at a glance.
          </h4>
        </div>
        <div className="relative mx-7  rounded-md px-6 py-4 flex items-center justify-between overflow-hidden bg-gradient-to-br   to-orange-500">
          {/* BIG noise overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[70]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "overlay",
            }}
          />
          <h4
            className="text-sm opacity-70"
            style={{ fontFamily: "Ubuntu, sans-serif" }}
          >
            A minimalist fitness app built to record the maximum weight you’ve
            lifted for any exercise - no workouts, no reps, no noise.
          </h4>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6">
        <LoginButton />
      </div>
    </div>
  );
}
