"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (!session?.user?.hasIntro) {
      router.replace("/v1/StartersIntro");
    }
  }, [status, session, router]);

  if (status === "loading" || !session?.user?.hasIntro) {
    return null; 
  }

  return (
    <main>
      <h1>Dashboard</h1>
    </main>
  );
}