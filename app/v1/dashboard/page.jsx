"use client";
import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
    <div className="relative">
     

      <div className="pt-5">
        <Welcome />
      </div>
       {/* <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className=""
      >
        Logout
      </button> */}
    </div>
  );
};

export default Page;
