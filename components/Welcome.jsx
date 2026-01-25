"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Welcome = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!session) return null;

  const today = new Date();

  const monthYear = today.toLocaleDateString("en-US", {
    month: "short",
  });

  const dayNumber = today.getDate();

  return (
    <div
      className="relative mx-7 rounded-2xl px-6 py-4 flex items-center justify-between overflow-hidden
  bg-gradient-to-br from-black via-orange-900/90 to-orange-500"
    >
      {/* BIG noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[70]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }}
      />

      {/* Left: Welcome */}
      <div className="relative flex flex-col justify-center text-white">
        <h2
          className="text-sm opacity-70"
          style={{ fontFamily: "Ubuntu, sans-serif" }}
        >
          Welcome
        </h2>

        <h1 className="text-xl font-semibold leading-tight">
          {session.user.name?.split(" ")[0]}
        </h1>
      </div>

      {/* Right: Date */}
      <div className="relative flex flex-col items-center justify-center text-white">
        <p className="text-xs uppercase tracking-wide opacity-60">
          {monthYear}
        </p>
        <p className="text-3xl font-bold leading-none">{dayNumber}</p>
      </div>
    </div>
  );
};

export default Welcome;
