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
    <div>
      <Background />

      <div className={specialGothic.className}>
        <div className="grid justify-start text-7xl pt-15 pl-8 leading-none tracking-tight">
          <span className="text-white/50">Lets</span>
          <span className="text-white/70">Track</span>
          <span className="text-white">Gym</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6">
        <LoginButton />
      </div>
    </div>
  );
}
