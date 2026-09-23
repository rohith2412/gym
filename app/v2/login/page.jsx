"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * v2's login page. Google + email/password. Dark, minimal, editorial
 * theme -- deliberately breaking from v1's light card + orange-accent
 * look. No boxed card, no color beyond white/gray/black; the only
 * saturated color on the page is the reserved red for errors.
 *
 * Light/dark are both real here (toggled from /v2/profile, see
 * app/v2/ThemeProvider.jsx) -- base classes are the light-mode look,
 * `dark:` variants are the dark-mode override.
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
  const outlineBtnClass =
    "w-full border border-neutral-300 dark:border-neutral-700 py-3.5 text-sm font-medium text-black dark:text-white hover:border-black dark:hover:border-white transition-colors";
  const solidBtnClass =
    "w-full bg-black dark:bg-white text-white dark:text-black py-3.5 text-sm font-semibold disabled:opacity-40 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors";
  const backBtnClass =
    "text-[13px] text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 py-1 mt-1 text-left transition-colors";

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center px-6 transition-colors">
      <div className="w-full max-w-sm">
        <p className="text-sm text-neutral-500 mb-3">Welcome back</p>
        <h1 className="text-4xl font-bold tracking-tight mb-10">
          Your Pocket Gym
        </h1>

        {mode === "main" && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/v2/home" })}
              className={`flex items-center justify-center gap-3 ${outlineBtnClass}`}
            >
              <img src="/Googlelogo.svg" alt="" className="h-4 w-4" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-xs text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={outlineBtnClass}
            >
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
          <form onSubmit={handleCredentialLogin} className="flex flex-col gap-3">
            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className={inputClass}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <button type="submit" disabled={loading} className={`${solidBtnClass} mt-3`}>
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
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <input
              className={inputClass}
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className={inputClass}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <button type="submit" disabled={loading} className={`${solidBtnClass} mt-3`}>
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

        <p className="text-[11px] text-neutral-500 dark:text-neutral-600 mt-10 leading-relaxed">
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
