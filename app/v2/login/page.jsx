"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";

/**
 * v2's login page. Google + email/password. Dark, minimal, editorial
 * theme -- deliberately breaking from v1's light card + orange-accent
 * look, but sharing the same rounded-2xl card language the rest of v2
 * (home/profile) already uses, so this no longer looks like a
 * different, unfinished app.
 *
 * Light/dark are both real here (toggled from /v2/profile, see
 * app/v2/ThemeProvider.jsx) -- base classes are the light-mode look,
 * `dark:` variants are the dark-mode override.
 *
 * The Google button follows Google's own Sign-In branding guidelines
 * (https://developers.google.com/identity/branding-guidelines): the
 * real multicolor "G" mark (not a cropped screenshot of a whole pill
 * button, which is what the old /Googlelogo.svg asset actually was --
 * a pre-baked 189x40 button graphic being squeezed into a 16x16 icon
 * slot), a neutral white/dark-surface button, and Google-spec border
 * colors in each mode.
 *
 * Doesn't touch "/" or v1's own login; this is a parallel entry point
 * sharing the same NextAuth backend
 * (app/api/auth/[...nextauth]/route.js), so a session started here or
 * on v1 is the same session either way.
 */
export default function LoginPageV2() {
  const { data: session } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState("main"); // "main" | "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) router.replace("/v2/home");
  }, [session, router]);

  const handleCredentialLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.replace("/v2/home");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      const login = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      setLoading(false);
      if (login?.error) {
        setError("Registered but login failed. Try logging in.");
        setMode("login");
      } else {
        router.replace("/v2/home");
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-3 text-sm text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 outline-none focus:border-black dark:focus:border-white transition-colors";
  const solidBtnClass =
    "w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-full text-lg font-semibold disabled:opacity-40 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors";
  const outlineBtnClass =
    "w-full border border-neutral-300 dark:border-neutral-700 py-4 rounded-full text-lg font-medium text-black dark:text-white hover:border-black dark:hover:border-white transition-colors";
  const backBtnClass =
    "text-[13px] text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 py-1 mt-1 text-left transition-colors";

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center px-6 transition-colors">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pocketgym-icon.png" alt="" className="w-14 h-14 rounded-[16px] shadow-sm" />
          <h1 className="text-2xl font-bold tracking-tight leading-tight">
            Free AI Calorie Tracker
          </h1>
        </div>

        {mode === "main" && (
          <div className="flex flex-col gap-3">
            <GoogleSignInButton onClick={() => signIn("google", { callbackUrl: "/v2/home" })} />

            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex items-center justify-center gap-2 ${outlineBtnClass}`}
            >
              <Mail size={20} />
              Continue with email
            </button>

            <button
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={solidBtnClass}
            >
              Create an account
            </button>
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleCredentialLogin} className="flex flex-col gap-4">
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} className={inputClass} required />
            <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} className={inputClass} required />
            {error && <p className="text-xs text-red-500 -mt-1">{error}</p>}
            <button type="submit" disabled={loading} className={`${solidBtnClass} mt-2`}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("main");
                setError("");
              }}
              className={backBtnClass}
            >
              ← Back
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Field label="Full name" type="text" value={form.name} onChange={(v) => setForm({ ...form, name: v })} className={inputClass} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} className={inputClass} required />
            <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} className={inputClass} required />
            {error && <p className="text-xs text-red-500 -mt-1">{error}</p>}
            <button type="submit" disabled={loading} className={`${solidBtnClass} mt-2`}>
              {loading ? "Creating account…" : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("main");
                setError("");
              }}
              className={backBtnClass}
            >
              ← Back
            </button>
          </form>
        )}

        <p className="text-[11px] text-neutral-500 dark:text-neutral-600 mt-10 leading-relaxed text-center">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-neutral-800 dark:hover:text-neutral-400">
            Terms
          </Link>{" "}
          &{" "}
          <Link href="/legal/privacy" className="underline hover:text-neutral-800 dark:hover:text-neutral-400">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, className, required }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">{label}</span>
      <input
        className={className}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}

/**
 * Google's neutral-style Sign-In button, built to spec: real "G" mark
 * (Google's official four-color logo, not a cropped local asset),
 * Roboto-weight label, and the border colors Google's guidelines call
 * for in light/dark ("Google Sans"/Roboto isn't loaded app-wide here,
 * so this falls back to the app's own font stack at medium weight,
 * which reads the same at this size).
 */
function GoogleSignInButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-lg font-medium transition-colors
        bg-white text-[#1F1F1F] border border-[#747775] hover:bg-[#F7F8F8]
        dark:bg-[#131314] dark:text-[#E3E3E3] dark:border-[#8E918F] dark:hover:bg-[#1E1F20]"
    >
      <GoogleGlyph size={22} />
      Continue with Google
    </button>
  );
}

function GoogleGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}
