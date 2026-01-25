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

  const dayNumber = today.getDate(); // 26

  return (
    <div className="mx-7 rounded-2xl bg-orange-400/80 px-6 py-4 flex items-center justify-between">
  {/* Left: Welcome text */}
  <div className="flex flex-col justify-center">
    <h2
      className="text-sm opacity-80"
      style={{ fontFamily: "Ubuntu, sans-serif" }}
    >
      Welcome
    </h2>

    <h1 className="text-xl font-semibold leading-tight">
      {session.user.name?.split(" ")[0]}

    </h1>
  </div>

  {/* Right: Date */}
  <div className="flex flex-col items-center justify-center">
    <p className="text-xs uppercase tracking-wide opacity-70">
      {monthYear}
    </p>
    <p className="text-3xl font-bold leading-none">
      {dayNumber}
    </p>
  </div>
</div>

  );
};

export default Welcome;
