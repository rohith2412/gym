"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Welcome from "@/components/Welcome";
import Background from "@/components/Background";

const Page = () => {
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

  return (
    <div className="">
      <div className="pt-5">
        <Welcome />
      </div>
      
     
{/*     
      <div className="h-screen gap-8 grid w-screen p-4">
        <div className="flex gap-8">
          <div className="flex border w-full items-center justify-center">Chest</div>
          <div className="flex border w-full items-center justify-center">Shoulders</div>
        </div>
        <div className="flex gap-8">
          <div className="flex border w-full items-center justify-center">Back</div>
          <div className="flex border w-full items-center justify-center">Arms</div>
        </div>
        <div className="flex gap-8">
          <div className="flex border w-full items-center justify-center">Triceps</div>
          <div className="flex border w-full items-center justify-center">Forearms</div>
        </div>
        <div className="flex gap-8">
          <div className="flex border w-full items-center justify-center">Core/Abs</div>
          <div className="flex border w-full items-center justify-center">Legs</div>
        </div>

      </div> */}

    </div>
  );
};

export default Page;
