"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useV2Theme } from "../ThemeProvider";

export default function ProfilePageV2() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useV2Theme();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/v2/login");
  }, [status, router]);

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-6 py-10 transition-colors">
      <div className="w-full max-w-sm mx-auto">
        <Link
          href="/v2/home"
          className="text-[13px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mt-6 mb-1">
          Profile
        </h1>
        <p className="text-sm text-neutral-500 mb-10">
          {session?.user?.name || session?.user?.email}
        </p>

        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Appearance
        </p>

        <div className="flex border border-neutral-300 dark:border-neutral-700">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              theme === "light"
                ? "bg-black text-white"
                : "text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 py-3 text-sm font-medium border-l border-neutral-300 dark:border-neutral-700 transition-colors ${
              theme === "dark"
                ? "bg-white text-black"
                : "text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
