"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { useV2Theme } from "../ThemeProvider";
import { EditBodyModal } from "./EditBodyModal";

const APP_STORE_URL =
  "https://apps.apple.com/nz/app/pocketgym-ai-fitness-tracker/id6765536420";

export default function ProfilePageV2() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useV2Theme();
  const [signingOut, setSigningOut] = useState(false);
  const [intro, setIntro] = useState(null);
  const [showEditBody, setShowEditBody] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/v2/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user-intro")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json.data) setIntro(json.data);
      })
      .catch(() => {});
  }, [status]);

  if (status === "loading") return null;

  const name = session?.user?.name || session?.user?.email || "";
  const email = session?.user?.email;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-6 py-10 transition-colors">
      <div className="w-full max-w-sm mx-auto pb-10">
        <Link
          href="/v2/home"
          className="text-[13px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
        >
          ← Back
        </Link>

        {/* Account */}
        <div className="flex items-center gap-3 mt-6 mb-10">
          {session?.user?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-lg font-bold">
              {(name || "?")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xl font-bold tracking-tight truncate">{name || "Your account"}</p>
            {email && name !== email && (
              <p className="text-sm text-neutral-500 truncate">{email}</p>
            )}
          </div>
        </div>

        {/* Appearance */}
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Appearance
        </p>
        <div className="flex border border-neutral-300 dark:border-neutral-700 mb-10">
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

        {/* Body & goal -- lets you fix whatever you entered during
            onboarding (weight/height/goal). Same PATCH /api/user-intro
            call the onboarding flow itself uses, so a correction here
            immediately recalculates your calorie/macro targets. */}
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Body &amp; goal
        </p>
        <button
          onClick={() => setShowEditBody(true)}
          className="flex items-center justify-between w-full border border-neutral-300 dark:border-neutral-700 rounded-2xl px-4 py-3.5 mb-10 text-left hover:border-black dark:hover:border-white transition-colors"
        >
          <div className="flex gap-5">
            <div>
              <p className="text-[11px] text-neutral-500">Weight</p>
              <p className="text-sm font-bold">{intro?.weight != null ? `${intro.weight} kg` : "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-500">Height</p>
              <p className="text-sm font-bold">{intro?.height != null ? `${intro.height} cm` : "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-500">Goal</p>
              <p className="text-sm font-bold capitalize">{intro?.fitnessGoal || "—"}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-neutral-400 flex-shrink-0" />
        </button>

        {/* Get the app */}
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Get the app
        </p>
        <div className="mb-10">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-black dark:bg-white text-white dark:text-black rounded-xl py-3 hover:opacity-90 transition-opacity"
          >
            <AppleGlyph size={17} />
            <span className="flex flex-col items-start leading-none">
              <span className="text-[9px] tracking-wide">Download on the</span>
              <span className="text-[15px] font-semibold -mt-0.5">App Store</span>
            </span>
          </a>
        </div>

        {/* Legal / more */}
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          More
        </p>
        <div className="border border-neutral-300 dark:border-neutral-700 rounded-2xl overflow-hidden mb-10">
          <a
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
          >
            Privacy policy
            <ChevronRight size={16} className="text-neutral-400" />
          </a>
          <a
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3.5 text-sm border-t border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
          >
            Terms of service
            <ChevronRight size={16} className="text-neutral-400" />
          </a>
        </div>

        {/* Sign out */}
        <button
          onClick={async () => {
            setSigningOut(true);
            await signOut({ callbackUrl: "/v2/login" });
          }}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-500 rounded-2xl py-3.5 text-sm font-semibold hover:bg-red-500/10 transition-colors disabled:opacity-40"
        >
          <LogOut size={16} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>

      {showEditBody && (
        <EditBodyModal
          intro={intro}
          onClose={() => setShowEditBody(false)}
          onSaved={(next) => {
            setIntro(next);
            setShowEditBody(false);
          }}
        />
      )}
    </div>
  );
}

function AppleGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-233-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  );
}
