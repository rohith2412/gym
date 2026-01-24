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

  return (
    <div className="flex flex-col">
      <h2
        className=""
        style={{ fontFamily: "Ubuntu, sans-serif" }}
      >
        Welcome,
      </h2>

      <h1 className="text-xl">{session.user.name}</h1>
    </div>
  );
};

export default Welcome;
