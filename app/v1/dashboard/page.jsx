"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Welcome from "@/components/Welcome";

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
    <div className="grid  items-start justify-start ">
      <Welcome />
      <div className=" ">
        {/* <h1 className="glass-effect text-gray-800 text-2xl border px-6 py-4 rounded-lg">
          chest
        </h1> */}
      </div>
      <div className=" m-15 h-screen gap-10 grid justify-evenly  w-screen">
        <div className="flex border w-screen   items-center ">chest</div>
        <div className="flex border w-screen   items-center ">sholder</div>
        <div className="flex border w-screen   items-center ">legs</div>
        <div className="flex border w-screen   items-center ">back</div>
        <div className="flex border w-screen   items-center ">arms</div>
      </div>
    </div>
  );
};

export default Page;
